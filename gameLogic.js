'use strict';
const fs = require('fs');
const Player = require('./player.js');
const Room = require('./room.js');
const Key = require ('./key.js')
const UtilsWebSockets = require('./utilsWebSockets.js');

const DIRECTIONS = {
    "up":         { dx: 0, dy: -1 },
    "left":       { dx: -1, dy: 0 },
    "down":       { dx: 0, dy: 1 },
    "right":      { dx: 1, dy: 0 },
    "none":       { dx: 0, dy: 0 },
};

class GameLogic {

    constructor(ws) {
        this.players = new Map();
        this.rooms = new Map();
        this.rooms.set(0, new Room(0));
        this.rooms.get(0).addKey(new Key(0, 0, 0));
        this.ws = ws;

        this.webClients = new Map();
    }

    // Es connecta un client/jugador
    addPlayer(id) {
        let { x, y } = this.getInitialPosition();
        const newPlayer = new Player(
            id,
            x, 
            y,
            DIRECTIONS["none"],
        );
        newPlayer.setRoom(this.rooms.get(0));
        this.players.set(id, newPlayer);
        this.ws.sendTo(id, JSON.stringify({
            type: "welcome",
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
        webClient.setRoom(this.rooms.get(0));
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
                moveVector = DIRECTIONS[data.direction];
                if (moveVector) {
                    player.setMoveVector(moveVector);
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
            player.update(1 / fps);
        }
    }

    getInitialPosition() {
        //Random
        const x = Math.floor(Math.random() * (100)) - 50;
        const y = Math.floor(Math.random() * (100)) - 50;
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
            keys: room.keys.map(key => key.getGameState())
        };
    }

    getGameStateForWebClient(webClientId) {
        const webClient = this.webClients.get(webClientId);
        const room = webClient.room;
        return {
            players: Array.from(this.players.values())
                            .filter(player => player.room === room) // same room
                            .map(player => player.getGameState()),
            keys: room.keys.map(key => key.getGameState())
        };
    }
}

module.exports = GameLogic;



