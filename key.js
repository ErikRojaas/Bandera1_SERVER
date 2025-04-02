


class Key {
    constructor(id, x, y) {
        this.id = id;
        this.x = x; 
        this.y = y;
    }

    getGameState() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
        };
    }
}

module.exports = Key;