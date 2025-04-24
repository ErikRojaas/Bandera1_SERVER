const express = require('express');
const GameLogic = require('./gameLogic.js');
const webSockets = require('./utilsWebSockets.js');
const GameLoop = require('./utilsGameLoop.js');
const QRCode = require("qrcode");
const path = require("path");
const cors = require("cors");
const { connectToDB, getPlayerNickname, validatePlayer } = require('./mongoUtils.js');

// Connect to DB immediately
connectToDB();

const debug = false;
const port = 8080;
const baseURL = `https://bandera1.ieti.site:${port}`; // Define baseURL

// Inicialitzar WebSockets i la lògica del joc
const ws = new webSockets();
const game = new GameLogic(ws, baseURL); // Pass baseURL to GameLogic
let gameLoop = new GameLoop();

// Inicialitzar servidor Express
const app = express();
app.use(cors()); 
app.use(express.json());

// Public folder for static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Flutter web app - serve static files
app.use(express.static(path.join(__dirname, 'web')));

// Email validation route
app.get('/validate', async (req, res) => {
    try {
        const email = req.query.email;
        const playerId = req.query.playerId;
        if (!email || !playerId) {
            return res.status(400).send('Email parameter is required');
        }
        
        // Decode the email if it's URL-encoded
        const decodedEmail = decodeURIComponent(email);
        const decodedPlayerId = decodeURIComponent(playerId);
        
        await validatePlayer(decodedEmail);
        //set player name 
        const name = await getPlayerNickname(decodedEmail);
        game.players.get(decodedPlayerId).nickname = name;
    } catch (error) {
        console.error('Error validating user:', error);
        return res.status(500).send('Error validating account');
    }
});
// Catch-all route for Flutter app (SPA) - Handle client-side routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/index.html'));
});

// Inicialitzar servidor HTTP
const httpServer = app.listen(port, async () => {
    console.log(`Servidor HTTP escoltant a: http://localhost:${port}`);
});

// Gestionar WebSockets
ws.init(httpServer, port);

ws.onConnection = (socket, id, connectionType) => {
    if (connectionType === "mobile") {
        if (debug) console.log("WebSocket client(Player) connected: " + id);
        game.addPlayer(id);
    } else {
        if (debug) console.log("WebSocket client(Web) connected: " + id);
        game.addWebClient(id);
    }
};

ws.onMessage = (socket, id, msg) => {
    if (debug) console.log(`New message from ${id}: ${msg.substring(0, 32)}...`);
    game.handleMessage(id, msg);
};

ws.onClose = (socket, id, connectionType) => {
    if (debug) console.log("WebSocket client disconnected: " + id);
    if (connectionType === "mobile") {
        game.removePlayer(id);
    } else {
        game.removeWebClient(id);
    }
};

// **Game Loop**
gameLoop.run = (fps) => {
    game.updateGame(fps);
    for (let player of game.players.values()) {
        ws.sendTo(player.id, JSON.stringify({ type: "update", data: game.getGameStateForPlayer(player.id) }));
    }
    for (let webClient of game.webClients.values()) {
        ws.sendTo(webClient.id, JSON.stringify({ type: "update", data: game.getGameStateForWebClient(webClient.id) }));
    }
};
gameLoop.start();

// Gestionar el tancament del servidor
process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown() {
    console.log('Rebuda senyal de tancament, aturant el servidor...');
    httpServer.close();
    ws.end();
    gameLoop.stop();
    process.exit(0);
}
