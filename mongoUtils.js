const mongoose = require('mongoose');
const moment = require('moment-timezone');  // Importamos moment-timezone

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27018/bandera1', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB en puerto 27018, base de datos bandera1'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

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



// Crear el modelo
const historialPartida = mongoose.model('HistorialPartidas', partidoSchema, 'HistorialPartidas');

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

module.exports = { insertarNuevaPartida };
