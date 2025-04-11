'use strict';
const fs = require('fs');
const Player = require('./player.js');
const Room = require('./room.js');
const Key = require ('./key.js')
const WebClient = require('./webClient.js');

class GameLogic {

    constructor(ws) {
        this.players = new Map();
        this.rooms = new Map();
        this.rooms.set(0, new Room(0));
        this.rooms.get(0).addKey(new Key(0, 50, 50));
        this.ws = ws;
        this.webClients = new Map();
    }

    // Es connecta un client/jugador
    addPlayer(id) {
        let { x, y } = this.getInitialPosition();
        const skinId = Math.floor(Math.random() * 4) + 1;
        const newPlayer = new Player(
            id,
            x, 
            y,
            {dx: 0, dy: 0},
            skinId
        );
        newPlayer.setRoom(this.rooms.get(0));
        this.players.set(id, newPlayer);
        this.ws.sendTo(id, JSON.stringify({
            type: "playerCount",
            data: this.rooms.get(0).players.length
        }));
        return newPlayer;
    }

    // Es desconnecta un client/jugador
    removePlayer(id) {
        this.players.get(id).OnDisconnect();
        this.players.delete(id);
    }


    addWebClient(id) {
        const newWebClient = new WebClient(id);
        newWebClient.setRoom(this.rooms.get(0));
        this.webClients.set(id, newWebClient);
        return newWebClient;
    }

    removeWebClient(id) {
        this.webClients.get(id).OnDisconnect();
        this.webClients.delete(id);
    }

    // Tractar un missatge d'un client/jugador
    handleMessage(id, msg) {
        try {
          let obj = JSON.parse(msg);
          if (!obj.type) return;
          let player = this.players.get(id);
          if (!player) return;
          let data = obj.data;
          switch (obj.type) {
            case "direction":
                const moveVector = data.direction;
                if (moveVector) {
                    player.setMoveVector(moveVector);
                }
                break;
            case "collect_key":
                const keyId = data.keyId;
                const room = player.room;
                if (room) {
                    room.removeKeyById(keyId);
                }
                break;
            default:
                break;
          }
        } catch (error) {}
    }

    // Blucle de joc (funció que s'executa contínuament)
    updateGame(fps) {
        for (const player of this.players.values()) {
            player.update(1.0 / fps);
            const room = player.room;
            for (let key of room.keys) {
                const dx = player.x - key.x;
                const dy = player.y - key.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < 30 && !player.hasKey) { // Umbral de colisión
                    player.hasKey = true;
                    key.collected = true;
                }
            }
    
            // Eliminar llaves recogidas
            player.room.keys = player.room.keys.filter(key => !key.collected);
        }
    }

    getInitialPosition() {
        //Random
        const x = Math.floor(Math.random() * (1000)) - 500;
        const y = Math.floor(Math.random() * (1000)) - 500;
        return { x, y };
    }

    // Retorna l'estat del joc (sense el objecte del client amb id playerId)
    getGameStateForPlayer(playerId) {
        const player = this.players.get(playerId);
        const room = player.room;
        return {
            clientPlayer: player.getGameState(),
            otherPlayers: Array.from(this.players.values())
                            .filter(player => player.id !== playerId) // not the same player
                            .filter(player => player.room === room) // same room
                            .map(player => player.getGameState()),
            keys: room.keys.map(key => key.getGameState()),
            flag: room.flag ? room.flag.getGameState() : null
        };
    }

    getGameStateForWebClient(webClientId) {
        const webClient = this.webClients.get(webClientId);
        const room = webClient.room;
        return {
            players: Array.from(this.players.values())
                            .filter(player => player.room === room) // same room
                            .map(player => player.getGameState()),
            keys: room.keys.map(key => key.getGameState()),
            flag: room.flag ? room.flag.getGameState() : null
        };
    }
}

module.exports = GameLogic;



