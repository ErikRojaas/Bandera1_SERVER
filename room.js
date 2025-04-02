
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
    }

    addPlayer(player) {
        this.players.push(player);
        //TODO: Assign teams
        this.teams.get(player.id)[0].push(player);
    }

    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
        //TODO: Assign teams
        this.teams.get(player.id)[0].splice(this.teams.get(player.id)[0].indexOf(player), 1);
    }
}