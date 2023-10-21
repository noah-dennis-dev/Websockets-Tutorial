const express = require('express');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const WS_PORT = 8080;
const wss = new WebSocketServer({ port: WS_PORT });
wss.on('listening', () => {
    console.log(`WebSocket Server on port ${WS_PORT}`);
})

wss.on('connection', function (ws) {
    ws.on('error', () => { console.error(error) });

    ws.on('message', function (data) {
        let jsonData = JSON.parse(data);

        if (jsonData.name) {
            console.log(`${jsonData.name} has connected`);
            ws.name = jsonData.name;
            wss.clients.forEach(function (client) {
                if (client.readyState === WebSocket.OPEN && ws.name !== client.name) {
                    client.send(JSON.stringify({ announcement: `${ws.name} has joined.` }));
                }
            })
        } else {
            wss.clients.forEach(function (client) {
                if (client.readyState === WebSocket.OPEN && ws.name !== client.name) {
                    client.send(JSON.stringify({ name: ws.name, message: jsonData.message }));
                }
            })
        }
    })

    ws.on('close', function () {
        console.log(`${ws.name} has left.`)
        wss.clients.forEach(function (client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ announcement: `${ws.name} has left.` }))
            }
        })
    })
})


const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

const EXPRESS_PORT = 3000;
app.listen(EXPRESS_PORT, () => {
    console.log(`Express Server on port ${EXPRESS_PORT}`);
})