const WebSocket = require('ws')

const socket = new WebSocket('ws://localhost:8081?type=mobile');

socket.addEventListener('open', (event) => {
    console.log('Connected to WebSocket server');

    // Send the register message when the connection is open
    const registerData = {
        type: 'register',
        data: {
            nickname: 'nick',
            email: 'oscar.anuncio.basura@gmail.com',
            password: '1234'
        }
    };

    socket.send(JSON.stringify(registerData));
});
socket.addEventListener('message', (event) => {
    console.log('Received message from server:', event.data);
});
socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
});
socket.addEventListener('close', (event) => {
    console.log('Disconnected from WebSocket server');
});
/*
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendDirections() {
    await wait(1000);
    while (true) {
        console.log("walking square");
        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: 0, dy: 100 } } }));
        await wait(1000);

        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: 0, dy: 0 } } }));
        await wait(1000);

        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: 100, dy: 0 } } }));
        await wait(1000);

        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: 0, dy: 0 } } }));
        await wait(1000);0

        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: 0, dy: -100 } } }));
        await wait(1000);

        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: 0, dy: 0 } } }));
        await wait(1000);

        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: -100, dy: 0 } } }));
        await wait(1000);

        socket.send(JSON.stringify({ type: "direction", data: { direction: { dx: 0, dy: 0 } } }));
        await wait(1000);
    }
}

sendDirections();*/