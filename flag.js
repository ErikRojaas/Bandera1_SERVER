class Flag {

    FLAG_SIZE = 30;

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

    colidesWith(x, y) {
        //returns if the point is within a square of FLAG_SIZE
        return (x > this.x - this.FLAG_SIZE && x < this.x + this.FLAG_SIZE && 
                y > this.y - this.FLAG_SIZE && y < this.y + this.FLAG_SIZE);
    }
}

module.exports = Flag;