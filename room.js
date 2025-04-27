const Key = require('./key.js');
const Flag = require('./flag.js');
const Timer = require('./timer.js');
const mongoUtils = require('./mongoUtils.js');

class Room {
    constructor(id) {
        this.id = id;
        this.players = [];
        this.teams = new Map([
            [0, []], // Lornwood
            [1, []], // Vileswamp
            [2, []], // Asharid
            [3, []], // Ironhold
        ]);
        this.flags = [new Flag(0, 0, 0)];
        this.started = false;
        this.justStarted = false;
        this.keys = [];
        this.lastWiner = null;
        this.timer = new Timer(null, this.onFinish.bind(this), 30);
    }

    addPlayer(player) {
        this.players.push(player);
        if (this.teams.has(player.teamId)) {
            this.teams.get(player.teamId).push(player);
        } else {
            console.error(`Team ID ${player.teamId} no encontrado.`);
        }
    }

    removePlayer(player) {
        this.players.splice(this.players.indexOf(player), 1);
        if (this.teams.has(player.teamId)) {
            const teamPlayers = this.teams.get(player.teamId);
            const index = teamPlayers.indexOf(player);
            if (index !== -1) {
                teamPlayers.splice(index, 1);
            }
        }
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

    update(deltaTime) {
        this.justStarted = false;
        this.timer.tick(deltaTime);
    }

    getGameState() {
        return {
            id: this.id,
            started: this.started,
            justStarted: this.justStarted,
            timer: this.timer.timeStr,
            winner: this.lastWiner
        };
    }

    async onFinish(timeStr) {
        this.started = !this.started;
        if (this.started) {
            // Comienza partida
            this.justStarted = true;
            this.timer.setDuration(20); // 60 segundos de partida
        } else {
            // Termina partida
            this.timer.setDuration(10); // 30 segundos de espera para próxima partida
            let winner = "";
            let points = 0;
            let totalPoints = 0;

            for (let i = 0; i < this.players.length; i++) {
                totalPoints += this.players[i].points;
                if (this.players[i].points > points) {
                    winner = this.players[i].id;
                    points = this.players[i].points;
                }
            }

            try {
                await mongoUtils.insertarNuevaPartida(
                    totalPoints,
                    points,
                    this.players.length,
                    0,
                    0,
                    0,
                    0
                );
            } catch (err) {
                console.error('Error insertando partida en historial:', err);
            }

            // Enviar mensaje gameOver
            const winnerPlayer = this.players.find(p => p.id === winner);
            const winnerTeamId = winnerPlayer ? winnerPlayer.teamId : null;
            const winnerTeamName = this.getTeamName(winnerTeamId);

            this.players.forEach(player => {
                if (player.socket && player.socket.readyState === 1) {
                    player.socket.send(JSON.stringify({
                        type: "gameOver",
                        winner: winnerTeamName,
                        winnerId: winner
                    }));
                }
            });

            // Reset jugadores
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].points = 0;
                this.players[i].hasKey = false;
                this.players[i].hasFlag = false;
            }

            this.lastWiner = winner;

            // Resetear llaves y bandera
            this.keys = [];
            this.flags = [new Flag(0, 0, 0)];
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

    getTeamName(teamId) {
        switch (teamId) {
            case 0: return "Lornwood";
            case 1: return "Vileswamp";
            case 2: return "Asharid";
            case 3: return "Ironhold";
            default: return "Unknown";
        }
    }
}

module.exports = Room;
