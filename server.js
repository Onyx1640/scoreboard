const WebSocket = require('ws');
const express = require('express');
var timer;
var timerLength = 0;
var wss = new WebSocket.Server({
    port: 8081
});
var score = 0;
wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(message);
        message = JSON.parse(message);
        switch (message.id) {
            case 'score':
                score = score + message.score;
                wss.broadcast(JSON.stringify({
                    id: 'newScore',
                    score: score
                }));
                break;
            case 'startTimer':
                timerLength = timerLength + message.length;
                startTimer();
                break;
            case 'addTime':
                timerLength = timerLength + message.length;
                break;
            case 'stopTimer':
                clearInterval(timer);
                timerLength = 0;
                wss.broadcast(JSON.stringify({
                    id: 'timerCount',
                    time: timerLength
                }));
            default:
                break;
        }
    });
});
function startTimer() {
    timer = setInterval(() =>{
        timerLength--;
        if(timerLength <= 0) {
            wss.broadcast(JSON.stringify({
                id: 'timerStop'
            }));
            timerLength = 0;
            clearInterval(timer);
        } else {
            wss.broadcast(JSON.stringify({
                id: 'timerCount',
                time: timerLength
            }));
        }
    }, 1000);
}
wss.broadcast = function broadcast(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        client.send(msg);
     });
 };
var app = express();
app.use('/',express.static('static'));
app.listen(8080);