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
