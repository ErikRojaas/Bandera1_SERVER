const express = require('express');
const GameLogic = require('./gameLogic.js');
const webSockets = require('./utilsWebSockets.js');
const GameLoop = require('./utilsGameLoop.js');
const QRCode = require("qrcode");
const path = require("path");
const cors = require("cors");

const debug = true;
const port = process.env.PORT || 8080;

// Inicialitzar WebSockets i la lògica del joc
const ws = new webSockets();
const game = new GameLogic(ws);
let gameLoop = new GameLoop();

// Pruebas en localhost, para produccion poner url servidor
const apkUrl = `https://bandera1.ieti.site/android-debug.apk`;

// Inicialitzar servidor Express
const app = express();
app.use(cors()); 
app.use(express.static('public'));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

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

ws.onConnection = (socket, id) => {
    if (debug) console.log("WebSocket client connected: " + id);
    const player = game.addClient(id);
    // Send the id to the client
    socket.send(JSON.stringify({ 
        type: "connected",
        data: game.getGameState(player.id)
    }));
};

ws.onMessage = (socket, id, msg) => {
    if (debug) console.log(`New message from ${id}: ${msg.substring(0, 32)}...`);
    game.handleMessage(id, msg);
};

ws.onClose = (socket, id) => {
    if (debug) console.log("WebSocket client disconnected: " + id);
    game.removeClient(id);
    ws.broadcast(JSON.stringify({ type: "disconnected", from: "server" }));
};

// **Game Loop**
gameLoop.run = (fps) => {
    game.updateGame(fps);
    for (let player of game.players.values()) {
        ws.sendTo(player.id, JSON.stringify({ type: "update", data: game.getGameState(player.id) }));
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
