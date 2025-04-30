'use strict';
const fs = require('fs');
const Player = require('./player.js');
const Room = require('./room.js');
const Key = require ('./key.js')
const WebClient = require('./webClient.js');
const { insertPlayer, emailExists, correctCredentials, getPlayerNickname, isUserValidated } = require('./mongoUtils.js');
const nodemailer = require('nodemailer');
// Conectar a MongoDB
class GameLogic {

    MAP_SIZE = { width: 1248, height: 672 };

    constructor(ws, baseURL) {
        this.players = new Map();
        this.rooms = new Map();
        this.rooms.set(0, new Room(0));
        this.rooms.get(0).addKey(new Key(0, 100, 100));
        this.ws = ws;
        this.baseURL = baseURL;
        this.webClients = new Map();
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'o.cursor09@gmail.com',
                pass: 'ttdt zukv xgir pwxk'
            }
        });
    }

    // Es connecta un client/jugador
    addPlayer(id) {
        const targetRoom = this.rooms.get(0);
        teamId = targetRoom.getNextTeamId();
    
        const skinId = Math.floor(Math.random() * 4) + 1;
    
        const newPlayer = new Player(
            id,
            0,
            0,
            { dx: 0, dy: 0 },
            skinId,
            teamId 
        );
        newPlayer.setRoom(targetRoom);
    
        this.players.set(id, newPlayer);
    
        this.ws.sendTo(id, JSON.stringify({
            type: "playerCount",
            data: targetRoom.players.length
        }));
    
        return newPlayer;
    }
    

    // Es desconnecta un client/jugador
    removePlayer(id) {
        this.players.get(id).OnDisconnect();
        this.players.delete(id);
    }


    addWebClient(id) {
        const newWebClient = new WebClient(id);
        newWebClient.setRoom(this.rooms.get(0));
        this.webClients.set(id, newWebClient);
        return newWebClient;
    }

    removeWebClient(id) {
        this.webClients.get(id).OnDisconnect();
        this.webClients.delete(id);
    }

    // Tractar un missatge d'un client/jugador
    async handleMessage(id, msg) {
        try {
          let obj = JSON.parse(msg);
          if (!obj.type) return;
          let player = this.players.get(id);
          if (!player) return;
          let data = obj.data;
          switch (obj.type) {
            case "direction":
                const moveVector = data.direction;
                player.setMoveVector(moveVector);
                break;
            case "collect_key":
                const keyId = data.keyId;
                const room = player.room;
                if (room) {
                    room.removeKeyById(keyId);
                }
                break;
            case "login":
                const loginEmail = data.email;
                const loginPassword = data.password;
                //check credentials
                if (!await correctCredentials(loginEmail, loginPassword)) {
                    this.ws.sendTo(id, JSON.stringify({ type: "login", data: { success: false, message: "Invalid credentials" } }));
                    return;
                }
                if (!await isUserValidated(loginEmail)) {
                    this.ws.sendTo(id, JSON.stringify({ type: "login", data: { success: false, message: "Account not validated" } }));
                    return;
                }
                //set player name
                player.nickname = await getPlayerNickname(loginEmail);
                this.ws.sendTo(id, JSON.stringify({ type: "login", data: { success: true, message: "Logged in successfully" } }));
                break;
            case "register":
                const nickname = data.nickname;
                const email = data.email;
                const password = data.password;
                const phone = data.phone;
                const ip = this.ws.getClientData(id).ip;

                if (await emailExists(email)) {
                    this.ws.sendTo(id, JSON.stringify({ type: "register", data: { success: false, message: "Email already exists" } }));
                    return;
                }

                await insertPlayer(nickname, email, password, phone, ip);

                if (nickname && email && password) {
                    const mailOptions = {
                        from: 'noreply@bandera1.com',
                        to: email,
                        subject: 'Bandera1 - Confirmación de registro',
                        text: 'Hola ' + nickname + ',\n\n' +
                            'Gracias por registrarte en Bandera1.\n\n' +
                            'Para iniciar tu sesión, haz click en el siguiente enlace:\n\n' +
                            `${this.baseURL}/validate?email=` + encodeURIComponent(email)+ "&playerId=" + encodeURIComponent(id) + '\n\n' +
                            'Si no has solicitado este acceso, puedes ignorar este correo.\n\n' +
                            'Saludos,\n' +
                            'El equipo de Bandera1'
                    };
                    this.transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                }
                this.ws.sendTo(id, JSON.stringify({ type: "register", data: { success: true, message: "Account created successfully" } }));
                break;
            default:
                break;
          }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // Blucle de joc (funció que s'executa contínuament)
    updateGame(fps) {
        const deltaTime = 1.0 / fps;
        for (const player of this.players.values()) {
            player.update(deltaTime);
            const room = player.room;
            const flag = room.flags[0];
    
            // MOVIMIENTO Y COLISIONES CON KEYS
            for (let i = room.keys.length - 1; i >= 0; i--) {
                const key = room.keys[i];
                const dx = player.x - key.x;
                const dy = player.y - key.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
            
                if (distance < 20 && !player.hasKey) {
                    player.hasKey = true;
                    room.keys.splice(i, 1);
                    break; 
                }
            }
    
            // COLISION CON FLAG
            if (room.started) {
                if (!player.hasFlag && flag.collidesWith(player.x, player.y)) {
                    player.hasFlag = true;
                    flag.x = -9999;
                    flag.y = -9999;
                }
    
                if (player.hasFlag) {
                    player.points += 1 * deltaTime;
                }
            }
    
            // ELIMINAR LLAVES
            player.room.keys = player.room.keys.filter(key => !key.collected);
        }
    
        for (const room of this.rooms.values()) {
            room.update(deltaTime);
        }
    }
    
    // Retorna l'estat del joc (sense el objecte del client amb id playerId)
    getGameStateForPlayer(playerId) {
        const player = this.players.get(playerId);
        const room = player.room;
        return {
            clientPlayer: player.getGameState(),
            otherPlayers: Array.from(this.players.values())
                            .filter(player => player.id !== playerId) // not the same player
                            .filter(player => player.room === room) // same room
                            .map(player => player.getGameState()),
            keys: room.keys.map(key => key.getGameState()),
            flags: room.flags.map(flag => flag.getGameState()),
            room: room.getGameState()
        };
    }

    getGameStateForWebClient(webClientId) {
        const webClient = this.webClients.get(webClientId);
        const room = webClient.room;
        return {
            players: Array.from(this.players.values())
                            .filter(player => player.room === room) // same room
                            .map(player => player.getGameState()),
            keys: room.keys.map(key => key.getGameState()),
            flags: room.flags.map(flag => flag.getGameState()),
            room: room.getGameState()
        };
    }
}

module.exports = GameLogic;



