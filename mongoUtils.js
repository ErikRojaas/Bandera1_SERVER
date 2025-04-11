// utils/mongoUtils.js

const mongoose = require('mongoose');
const moment = require('moment-timezone');  // Importamos moment-timezone

// Definir el esquema de partida (si no está definido)
const partidoSchema = new mongoose.Schema({
  idPartida: { type: Number, required: true },
  fecha: { type: String, required: true },  // Aquí cambiamos a String para almacenar la fecha en formato local
  totalPuntos: { type: Number, required: true },
  puntosGanador: { type: Number, required: true },
  jugadores: { type: Number, required: true },
  idEquipoGanador: { type: Number, required: true },
  muertesTotales: { type: Number, required: true },
  banderasABaseTotal: { type: Number, required: true },
  espectadores: { type: Number, required: true }
});

// Crear el modelo de HistorialPartidas
const historialPartida = mongoose.model('HistorialPartidas', partidoSchema, 'HistorialPartidas');

// Función para insertar una nueva partida
async function insertarNuevaPartida(totalPuntos, puntosGanador, jugadores, idEquipoGanador, muertesTotales, banderasABaseTotal, espectadores) {
  try {
    // Contamos cuántas partidas existen ya
    const count = await historialPartida.countDocuments();

    // El nuevo idPartida será el count + 1
    const idPartida = count + 1;

    const fechaActual = moment().tz("Europe/Madrid").format('YYYY-MM-DD HH:mm:ss');  // Convertir a String en hora española

    // Crear el objeto de la nueva partida
    const nuevaPartida = new historialPartida({
      idPartida: idPartida,
      fecha: fechaActual,  // Ahora la fecha se almacena como un string en la hora local de España
      totalPuntos: totalPuntos,
      puntosGanador: puntosGanador,
      jugadores: jugadores,
      idEquipoGanador: idEquipoGanador,
      muertesTotales: muertesTotales,
      banderasABaseTotal: banderasABaseTotal,
      espectadores: espectadores
    });

    // Guardar la nueva partida en la base de datos
    await nuevaPartida.save();

    console.log('Partida insertada correctamente:', nuevaPartida);
  } catch (error) {
    console.error('Error al insertar la partida:', error);
  }
}

// Exportar la función para usarla en otros archivos
module.exports = { insertarNuevaPartida };
