// key.js
class Key {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.collected = false;
    }

    getGameState() {
        return {
            id: this.id,
            x: this.x,
            y: this.y
        };
    }
}

module.exports = Key;
