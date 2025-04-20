const express = require('express');
const GameLogic = require('./gameLogic.js');
const webSockets = require('./utilsWebSockets.js');
const GameLoop = require('./utilsGameLoop.js');
const QRCode = require("qrcode");
const path = require("path");
const cors = require("cors");


const debug = false;
const port = process.env.PORT || 8080;

// Inicialitzar WebSockets i la lògica del joc
const ws = new webSockets();
const game = new GameLogic(ws);
let gameLoop = new GameLoop();

// Pruebas en localhost, para produccion poner url servidor
const apkUrl = `https://bandera1.ieti.site/public/android-debug.apk`;

// Inicialitzar servidor Express
const app = express();
app.use(cors()); 
app.use(express.json());

// Public folder for static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Flutter web app - serve static files
app.use(express.static(path.join(__dirname, 'web')));

// Catch-all route for Flutter app (SPA) - Handle client-side routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/index.html'));
});

// Inicialitzar servidor HTTP
const httpServer = app.listen(port, async () => {
    console.log(`Servidor HTTP escoltant a: http://localhost:${port}`);
    try {
        await QRCode.toFile(path.join(__dirname, "public", "qrcode.png"), apkUrl, {
            width: 400,
        });
        console.log("QR generado en /public/qrcode.png");
    } catch (err) {
        console.error("Error al generar el QR:", err);
    }
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
