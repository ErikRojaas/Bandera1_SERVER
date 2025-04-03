'use strict';
const fs = require('fs');
const Player = require('./player.js');
const Room = require('./room.js');
const Key = require ('./key.js')
const utilsWebSockets = require('./utilsWebSockets.js');

const DIRECTIONS = {
    "up":         { dx: 0, dy: -1 },
    "left":       { dx: -1, dy: 0 },
    "down":       { dx: 0, dy: 1 },
    "right":      { dx: 1, dy: 0 },
    "none":       { dx: 0, dy: 0 },
};

class GameLogic {
    
    constructor() {
        this.players = new Map();
        this.rooms = new Map();
        this.rooms.set(0, new Room(0));
        this.rooms.get(0).addKey(new Key(0, 0, 0));
    }

    // Es connecta un client/jugador
    addClient(id) {
        let { x, y } = this.getInitialPosition();
        const newPlayer = new Player(
            id,
            x, 
            y,
            DIRECTIONS["none"],
        );
        newPlayer.setRoom(this.rooms.get(0));
        this.players.set(id, newPlayer);
        utilsWebSockets.sendTo(id, JSON.stringify({
            type: "welcome",
            data: this.rooms.get(0).players.length
        }));
        return newPlayer;
    }

    // Es desconnecta un client/jugador
    removeClient(id) {
        this.players.get(id).OnDisconnect();
        this.players.delete(id);
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
        for (const player of this.players) {
            player.update(1 / fps);
        }
    }

    // Retorna l'estat del joc (sense el objecte del client amb id playerId)
    getGameState(playerId) {
        const player = this.players.get(playerId);
        const room = player.room;
        return {
            clientPlayer: player.getGameState(),
            otherPlayers: Array.from(this.players.values())
                            .filter(player => player.id !== playerId)
                            .filter(player => player.room === room)
                            .map(player => player.getGameState()),
            keys: room.keys.map(key => key.getGameState())
        };
    }

    getInitialPosition() {
        //Random
        const x = Math.floor(Math.random() * (MAP_SIZE.width - 2)) + 1;
        const y = Math.floor(Math.random() * (MAP_SIZE.height - 2)) + 1;
        return { x, y };
    }
}

module.exports = GameLogic;



