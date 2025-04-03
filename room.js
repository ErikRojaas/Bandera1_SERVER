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

    removeKey(key) {
        this.keys.splice(this.keys.indexOf(key), 1);
    }

    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
        //TODO: Assign teams
        this.teams.get(0).splice(this.teams.get(0).indexOf(player), 1);
    }
}

module.exports = Room;