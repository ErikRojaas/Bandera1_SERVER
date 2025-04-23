class Player {
    constructor(id, x, y, moveVector, skinId) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.moveVector = moveVector;
        this.room = null;
        this.skinId = skinId;
        this.hasKey = false;
        this.points = 0;
        this.nickname = null;
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
            points: Math.round(this.points),
            nickname: this.nickname == null ? "Guest + "+this.id : this.nickname
        };
    }
}

module.exports = Player;