class Flag {
    constructor(id, x, y, skinId) {
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