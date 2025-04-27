class Player {
    constructor(id, x, y, moveVector, skinId, teamId = 0) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.moveVector = moveVector;
        this.room = null;
        this.skinId = skinId;
        this.hasKey = false;
        this.hasFlag = false;
        this.points = 0;
        this.nickname = null;
        this.teamId = teamId; // Nuevo
        this.teamName = this.getTeamNameById(teamId); // Nuevo
    }

    update(deltaTime) {
        this.x += this.moveVector.dx * deltaTime;
        this.y += this.moveVector.dy * deltaTime;
    }

    setMoveVector(moveVector) {
        this.moveVector = moveVector;
    }

    setRoom(room) {
        this.room = room;
        room.addPlayer(this);
    }

    OnDisconnect() {
        this.room.removePlayer(this);
    }

    getGameState() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            moveVector: this.moveVector,
            skinId: this.skinId,
            hasKey: this.hasKey,
            hasFlag: this.hasFlag,
            points: Math.round(this.points),
            nickname: this.nickname == null ? "Guest " + this.id : this.nickname,
            teamId: this.teamId,
            teamName: this.teamName
        };
    }

    getTeamNameById(teamId) {
        switch (teamId) {
            case 0: return "Lornwood";
            case 1: return "Vileswamp";
            case 2: return "Asharid";
            case 3: return "Ironhold";
            default: return "Unknown";
        }
    }
}

module.exports = Player;
