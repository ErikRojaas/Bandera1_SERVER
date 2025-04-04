
class WebClient {

    constructor(id) {
        this.id = id;
        this.room = null;
    }

    setRoom(room) {
        this.room = room;
    }

    OnDisconnect() {
        // IF NECESSARY
    }

}