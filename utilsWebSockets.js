// Description: WebSocket server for the app

const WebSocket = require('ws')
const { v4: uuidv4 } = require('uuid')
const url = require('url');
class UtilsWebSockets {

    init(httpServer, port) {

        // Define empty callbacks
        this.onConnection = (socket, id, req) => { }
        this.onMessage = (socket, id, obj) => { }
        this.onClose = (socket, id) => { }

        // Run WebSocket server
        this.ws = new WebSocket.Server({ server: httpServer })
        this.socketsClients = new Map()
        console.log(`Listening for WebSocket queries on ${port}`)

        // What to do when a websocket client connects
        this.ws.on('connection', (ws, req) => { this.newConnection(ws, req) });
    }

    end() {
        this.ws.close()
    }

    // A websocket client connects
    newConnection(con, req) {
        console.log("Client connected");
        const parameters = url.parse(req.url, true).query;
        const connectionType = parameters.type;
        // Generar ID únic per al client
        const id = "C" + uuidv4().substring(0, 5).toUpperCase();
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
        const metadata = { id , connectionType, ip };
        this.socketsClients.set(con, metadata);

        if (this.onConnection && typeof this.onConnection === "function") {
            this.onConnection(con, id, connectionType);
        }
    
        con.on("close", () => {
            this.closeConnection(con);
            this.socketsClients.delete(con);
        });
    
        con.on('message', (bufferedMessage) => { 
            this.newMessage(con, id, bufferedMessage);
        });
    }

    closeConnection(con) {
        if (this.onClose && typeof this.onClose === "function") {
            const metadata = this.socketsClients.get(con);
            const id = metadata.id;
            const connectionType = metadata.connectionType;
            this.onClose(con, id, connectionType)
        }
    }


    // Send a message to all websocket clients
    broadcast(msg) {
        this.ws.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg)
            }
        })
    }

    //
    sendTo(id, msg) {
        var client = this.getClient(id)
        if (client) {
            client.send(msg)
        }
    }

    // A message is received from a websocket client
    newMessage(ws, id, bufferedMessage) {
        var messageAsString = bufferedMessage.toString()
        if (this.onMessage && typeof this.onMessage === "function") {
            this.onMessage(ws, id, messageAsString)
        }
    }

    getClient(id) {
        for (let [client, metadata] of this.socketsClients.entries()) {
            if (metadata.id === id) {
                return client;
            }
        }
        return null;
    }

    getClientData(id) {
        for (let [client, metadata] of this.socketsClients.entries()) {
            if (metadata.id === id) {
                return metadata;
            }
        }
        return null;
    }

    getClientsIds() {
        let clients = [];
        this.socketsClients.forEach((value, key) => {
            clients.push(value.id);
        });
        return clients;
    }

    getClientsData() {
        let clients = [];
        for (let [client, metadata] of this.socketsClients.entries()) {
            clients.push(metadata);
        }
        return clients;
    }
}

module.exports = UtilsWebSockets