const { MongoClient } = require("mongodb");

// URL de conexión a MongoDB en Docker
const url = "mongodb://localhost:27017"; // Cambia localhost a host.docker.internal
const dbName = "bandera1"; 

// Conexión a MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log("Conectado a MongoDB");

    const db = client.db(dbName);

    // Crear la colección "jugadores"
    const jugadoresCollection = db.collection("jugadores");

    // Crear la colección "historialPartidas"
    const historialPartidasCollection = db.collection("historialPartidas");

    // Cerrar la conexión
    client.close();
  })
  .catch(error => {
    console.error("Error de conexión a MongoDB", error);
  });
