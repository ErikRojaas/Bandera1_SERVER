const { on } = require("ws");

class Timer {
    constructor(onTick, onFinish, duration) {
        this.tickCallback = onTick;
        this.finishCallback = onFinish;
        this.duration = duration;
        this.time = duration;
        this.timeStr = this.getTimeStr(this.time);
    }

    getTimeStr(time) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    tick(deltaTime) {
        this.time -= deltaTime;
        if (this.time < 0) this.time = 0;
        this.timeStr = this.getTimeStr(this.time);
        if (this.tickCallback && typeof this.tickCallback === "function") {
            this.tickCallback(this.timeStr);
        }
        if (this.time <= 0) {
            if (this.finishCallback && typeof this.finishCallback === "function") {
                this.finishCallback(this.timeStr);
            }
        }
    }

    reset() {
        this.time = this.duration;
        this.timeStr = this.getTimeStr(this.time);
    }

    reset(duration) {
        this.duration = duration;
        this.reset();
    }

}

module.exports = Timer;