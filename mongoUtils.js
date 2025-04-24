const mongoose = require('mongoose');
const moment = require('moment-timezone');  // Importamos moment-timezone

let isConnected = false;


// Definir el esquema de partida
const partidoSchema = new mongoose.Schema({
  idPartida: { type: Number, required: true },
  fecha: { type: String, required: true },  // Fecha en formato local
  totalPuntos: { type: Number, required: true },
  puntosGanador: { type: Number, required: true },
  jugadores: { type: Number, required: true },
  idEquipoGanador: { type: Number, required: true },
  muertesTotales: { type: Number, required: true },
  banderasABaseTotal: { type: Number, required: true },
  espectadores: { type: Number, required: true }
});

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// Definir los esquemas
const jugadorSchema = new mongoose.Schema({
  idUsuario: { type: Number },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  pais: { type: String, required: true },
  fechaRegistro: { type: String, required: true },
  nPartidas: { type: Number, required: true },
  victorias: { type: Number, required: true },
  derrotas: { type: Number, required: true },
  muertes: { type: Number, required: true },
  bajas: { type: Number, required: true },
  banderasABase: { type: Number, required: true },
  validated: { type: Boolean, required: true }
});

const equipoSchema = new mongoose.Schema({
  idEquipo: { type: Number, required: true },
  victorias: { type: Number, required: true },
  totalPuntos: { type: Number, required: true },
  promedioPuntos: { type: Number, required: true },
  totalJugadores: { type: Number, required: true }
});

const jugadorEquipoSchema = new mongoose.Schema({
  idJugadorEquipo: { type: Number, required: true },
  idJugador: { type: Number, required: true },
  idEquipo: { type: Number, required: true },
  idPartida: { type: Number, required: true },
  ganada: { type: Boolean, required: true },
  puntos: { type: Number, required: true }
});

jugadorSchema.pre('save', async function (next) {
  const doc = this;
  if (doc.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'jugadorId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    doc.idUsuario = counter.seq;
  }
  next();
});

// Crear modelos con los nombres de colecciones específicas
const jugadores = mongoose.models.Jugadores || mongoose.model('Jugadores', jugadorSchema, 'Jugadores');
const historialPartida = mongoose.models.HistorialPartidas || mongoose.model('HistorialPartidas', partidoSchema, 'HistorialPartidas');
const equipos = mongoose.models.Equipos || mongoose.model('Equipos', equipoSchema, 'Equipos');
const jugadoresEnEquipo = mongoose.models.JugadoresEnEquipo || mongoose.model('JugadoresEnEquipo', jugadorEquipoSchema, 'JugadoresEnEquipo');

// Función para insertar una nueva partida
async function insertarNuevaPartida(totalPuntos, puntosGanador, jugadores, idEquipoGanador, muertesTotales, banderasABaseTotal, espectadores) {
  try {
    const count = await historialPartida.countDocuments();
    const idPartida = count + 1;

    const fechaActual = moment().tz("Europe/Madrid").format('YYYY-MM-DD HH:mm:ss');

    const nuevaPartida = new historialPartida({
      idPartida,
      fecha: fechaActual,
      totalPuntos,
      puntosGanador,
      jugadores,
      idEquipoGanador,
      muertesTotales,
      banderasABaseTotal,
      espectadores
    });

    await nuevaPartida.save();
    console.log('Partida insertada correctamente:', nuevaPartida);
  } catch (error) {
    console.error('Error al insertar la partida:', error);
  }
}

async function connectToDB() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect('mongodb://localhost:27017/bandera1');
      console.log("MongoDB connected successfully.");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1); // Exit process with failure
    }
  } else {
    console.log("MongoDB already connected or connecting.");
  }
}

async function insertPlayer(nickname, email, password) {
  const user = new jugadores({
    username: nickname,
    email: email,
    password: password,
    pais: 'España',
    fechaRegistro: new Date(),
    nPartidas: 0,
    victorias: 0,
    derrotas: 0,
    muertes: 0,
    bajas: 0,
    banderasABase: 0,
    validated: false
  });
  const result = await user.save();
  console.log('User inserted:', result);
}



async function validatePlayer(email) {
  const user = await jugadores.findOne({ email: email });
  user.validated = true;
  await user.save();
}

async function getPlayerNickname(email) {
  const user = await jugadores.findOne({ email: email });
  return user.username;
}

async function emailExists(email) {
  const user = await jugadores.findOne({ email: email });
  return user ? true : false;
}


module.exports = { emailExists, getPlayerNickname, insertarNuevaPartida, insertPlayer, validatePlayer, connectToDB };