const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27018/bandera1', { useNewUrlParser: true, useUnifiedTopology: true });


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

const partidoSchema = new mongoose.Schema({
  idPartida: { type: Number, required: true },
  fecha: { type: String, required: true },
  totalPuntos: { type: Number, required: true },
  puntosGanador: { type: Number, required: true },
  jugadores: { type: Number, required: true },
  idEquipoGanador: { type: Number, required: true },
  muertesTotales: { type: Number, required: true },
  banderasABaseTotal: { type: Number, required: true },
  espectadores: { type: Number, required: true }
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


// Insertar datos de prueba
async function insertarDatos() {
  const Jugadores = new jugadores({
    idUsuario: 1,
    username: 'player_one',
    email: 'player_one@example.com',
    telefono: '1234567890',
    pais: 'España',
    fechaRegistro: '2025-04-01 12:00:00',
    nPartidas: 50,
    victorias: 25,
    derrotas: 15,
    muertes: 30,
    bajas: 40,
    banderasABase: 10
  });

  const HistorialPartida = new historialPartida({
    idPartida: 1,
    fecha: '2025-04-10 16:00:00',
    totalPuntos: 300,
    puntosGanador: 150,
    jugadores: 10,
    idEquipoGanador: 1,
    muertesTotales: 100,
    banderasABaseTotal: 5,
    espectadores: 20
  });

  const Equipos = new equipos({
    idEquipo: 1,
    victorias: 10,
    derrotas: 5,
    totalPuntos: 2500,
    promedioPuntos: 250,
    totalJugadores: 15
  });

  const JugadoresEnEquipo = new jugadoresEnEquipo({
    idJugadorEquipo: 1,
    idJugador: 1,
    idEquipo: 1,
    idPartida: 1,
    ganada: true,
    puntos: 250
  });

  // Guardar en la base de datos
  await Jugadores.save();
  await HistorialPartida.save();
  await Equipos.save();
  await JugadoresEnEquipo.save();

  console.log('Datos insertados correctamente');
  mongoose.connection.close();
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


module.exports = { insertPlayer, validatePlayer };
