
class Player {
    constructor(id, x, y, moveVector) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.moveVector = moveVector;
        this.room = null;
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
        };
    }
}