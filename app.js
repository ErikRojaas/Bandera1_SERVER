const express = require('express');
const GameLogic = require('./gameLogic.js');
const webSockets = require('./utilsWebSockets.js');
const GameLoop = require('./utilsGameLoop.js');
const QRCode = require("qrcode");
const path = require("path");
const cors = require("cors");
const mongoose = require('mongoose');
//const { validatePlayer } = require('./node-mongoDB/CreateColections.js');

const debug = false;
const port = process.env.PORT || 8080;

// Inicialitzar WebSockets i la lògica del joc
const ws = new webSockets();
const game = new GameLogic(ws);
let gameLoop = new GameLoop();

// Pruebas en localhost, para produccion poner url servidor
const apkUrl = `https://bandera1.ieti.site/public/android-debug.apk`;

// Conexión MongoDB
mongoose.connect('mongodb://localhost:27018/bandera1', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB (bandera1)'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Definición de esquemas y modelos
const jugadorSchema = new mongoose.Schema({
  idUsuario: Number,
  username: String,
  email: String,
  telefono: String,
  pais: String,
  fechaRegistro: String,
  nPartidas: Number,
  victorias: Number,
  derrotas: Number,
  muertes: Number,
  bajas: Number,
  banderasABase: Number
});

const partidoSchema = new mongoose.Schema({
  idPartida: Number,
  fecha: String,
  totalPuntos: Number,
  puntosGanador: Number,
  jugadores: Number,
  idEquipoGanador: Number,
  muertesTotales: Number,
  banderasABaseTotal: Number,
  espectadores: Number
});

const equipoSchema = new mongoose.Schema({
  idEquipo: Number,
  victorias: Number,
  totalPuntos: Number,
  promedioPuntos: Number,
  totalJugadores: Number
});

const jugadorEquipoSchema = new mongoose.Schema({
  idJugadorEquipo: Number,
  idJugador: Number,
  idEquipo: Number,
  idPartida: Number,
  ganada: Boolean,
  puntos: Number
});

// Modelos
const Jugador = mongoose.models.Jugadores || mongoose.model('Jugadores', jugadorSchema, 'Jugadores');
const HistorialPartida = mongoose.models.HistorialPartidas || mongoose.model('HistorialPartidas', partidoSchema, 'HistorialPartidas');
const Equipo = mongoose.models.Equipos || mongoose.model('Equipos', equipoSchema, 'Equipos');
const JugadoresEnEquipo = mongoose.models.JugadoresEnEquipo || mongoose.model('JugadoresEnEquipo', jugadorEquipoSchema, 'JugadoresEnEquipo');


// Inicialitzar servidor Express
const app = express();
app.use(cors()); 
app.use(express.json());

// Public folder for static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Flutter web app - serve static files
app.use(express.static(path.join(__dirname, 'web')));

// Email validation route
/*app.get('/validate', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).send('Email parameter is required');
        }
        
        // Decode the email if it's URL-encoded
        const decodedEmail = decodeURIComponent(email);
        
        await validatePlayer(decodedEmail);
        return res.redirect('/?validated=true');
    } catch (error) {
        console.error('Error validating user:', error);
        return res.status(500).send('Error validating account');
    }
});*/

// Catch-all route for Flutter app (SPA) - Handle client-side routing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/index.html'));
});

app.get('/getDataDB', async (req, res) => {
    try {
      const jugadores = await Jugador.find();
      const partidas = await HistorialPartida.find();
      const equipos = await Equipo.find();
      const jugadoresEnEquipos = await JugadoresEnEquipo.find();
  
      res.json({
        jugadores,
        partidas,
        equipos,
        jugadoresEnEquipos
      });
    } catch (error) {
      console.error('Error al obtener datos de MongoDB:', error);
      res.status(500).json({ error: 'Error al obtener datos de la base de datos' });
    }
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
