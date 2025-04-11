key = require('./key.js');
class Room {
    constructor(id) {
        this.id = id;
        this.players = [];
        this.teams = new Map([
            [0, []],
            [1, []],
            [2, []],
            [3, []],
        ]);
        this.started = false;
        this.keys = [];
    }

    addPlayer(player) {
        this.players.push(player);
        //TODO: Assign teams
        this.teams.get(0).push(player);
    }

    addKey(key) {
        this.keys.push(key);
    }

    removeKeyById(keyId) {
        const index = this.keys.findIndex(key => key.id.toString() === keyId.toString());
        if (index !== -1) {
            this.keys.splice(index, 1);
            console.log(`Key ${keyId} removed from room ${this.id}`);
        }
    }
    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
        //TODO: Assign teams
        this.teams.get(0).splice(this.teams.get(0).indexOf(player), 1);
    }
}

module.exports = Room;