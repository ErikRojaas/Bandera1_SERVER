key = require('./key.js');
const Flag = require ('./flag.js')
const Timer = require('./timer.js')
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
        this.flags = [new Flag(0, 0, 0)];
        this.started = false;
        this.justStarted = false;
        this.keys = [];
        this.timer = new Timer(null, this.onFinish.bind(this), 30);
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

    update(deltaTime) {
        this.justStarted = false;
        this.timer.tick(deltaTime);
    }

    getGameState() {
        return {
            id: this.id,
            started: this.started,
            start: this.started,
            justStarted: this.justStarted,
            timer: this.timer.timeStr
        };
    }

    onFinish(timeStr) {
        this.started = !this.started;
        if (this.started) {
            this.justStarted = true;
            this.timer.reset(60);
        } else {
            this.timer.reset(30);
        }
        /*
       if (this.players.length > 1) {
           this.started = true;
       } else {
           this.started = false;
           this.justStarted
           this.timer.reset();
       }*/
    }
}

module.exports = Room;