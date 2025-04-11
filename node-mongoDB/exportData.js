const mongoose = require('mongoose');
const sql = require('mssql');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/bandera1', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// SQL Server config
const sqlConfig = {
  user: 'tu_usuario_sql',
  password: 'tu_contraseña',
  database: 'NombreBaseDeDatos',
  server: 'IP_DE_TU_VM',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// MongoDB Schemas
const jugadorSchema = new mongoose.Schema({ idUsuario: Number, username: String, email: String, telefono: String, pais: String, fechaRegistro: String, nPartidas: Number, victorias: Number, derrotas: Number, muertes: Number, bajas: Number, banderasABase: Number });
const partidoSchema = new mongoose.Schema({ idPartida: Number, fecha: String, totalPuntos: Number, puntosGanador: Number, jugadores: Number, idEquipoGanador: Number, muertesTotales: Number, banderasABaseTotal: Number, espectadores: Number });
const equipoSchema = new mongoose.Schema({ idEquipo: Number, victorias: Number, totalPuntos: Number, promedioPuntos: Number, totalJugadores: Number });
const jugadorEquipoSchema = new mongoose.Schema({ idJugadorEquipo: Number, idJugador: Number, idEquipo: Number, idPartida: Number, ganada: Boolean, puntos: Number });

// Models
const Jugadores = mongoose.model('Jugadores', jugadorSchema, 'Jugadores');
const HistorialPartidas = mongoose.model('HistorialPartidas', partidoSchema, 'HistorialPartidas');
const Equipos = mongoose.model('Equipos', equipoSchema, 'Equipos');
const JugadoresEnEquipo = mongoose.model('JugadoresEnEquipo', jugadorEquipoSchema, 'JugadoresEnEquipo');

async function transferData() {
  try {
    await sql.connect(sqlConfig);

    // Jugadores
    const jugadores = await Jugadores.find();
    for (const j of jugadores) {
      await sql.query`
        INSERT INTO Jugadores (
          idUsuario, username, email, telefono, pais,
          fechaRegistro, nPartidas, victorias, derrotas,
          muertes, bajas, banderasAbase
        ) VALUES (
          ${j.idUsuario}, ${j.username}, ${j.email}, ${j.telefono}, ${j.pais},
          ${j.fechaRegistro}, ${j.nPartidas}, ${j.victorias}, ${j.derrotas},
          ${j.muertes}, ${j.bajas}, ${j.banderasABase}
        )
      `;
    }

    // Partidas
    const partidas = await HistorialPartidas.find();
    for (const p of partidas) {
      await sql.query`
        INSERT INTO HistorialPartidas (
          idPartida, fecha, totalPuntos, puntosGanador,
          jugadores, idEquipoGanador, muertesTotales,
          banderasABaseTotal, espectadores
        ) VALUES (
          ${p.idPartida}, ${p.fecha}, ${p.totalPuntos}, ${p.puntosGanador},
          ${p.jugadores}, ${p.idEquipoGanador}, ${p.muertesTotales},
          ${p.banderasABaseTotal}, ${p.espectadores}
        )
      `;
    }

    // Equipos
    const equipos = await Equipos.find();
    for (const e of equipos) {
      await sql.query`
        INSERT INTO Equipos (
          idEquipo, victorias, totalPuntos, promedioPuntos, totalJugadores
        ) VALUES (
          ${e.idEquipo}, ${e.victorias}, ${e.totalPuntos}, ${e.promedioPuntos}, ${e.totalJugadores}
        )
      `;
    }

    // Jugadores en Equipo
    const relaciones = await JugadoresEnEquipo.find();
    for (const r of relaciones) {
      await sql.query`
        INSERT INTO JugadoresEnEquipo (
          idJugadorEquipo, idJugador, idEquipo, idPartida, ganada, puntos
        ) VALUES (
          ${r.idJugadorEquipo}, ${r.idJugador}, ${r.idEquipo},
          ${r.idPartida}, ${r.ganada}, ${r.puntos}
        )
      `;
    }

    console.log('Todos los datos se transfirieron correctamente.');
    mongoose.connection.close();
    await sql.close();

  } catch (error) {
    console.error('Error durante la transferencia:', error);
  }
}

transferData();
