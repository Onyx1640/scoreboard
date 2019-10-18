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
                timerLength = timerLength + parseInt(message.length);
                if (timerLength > 0) {
                    startTimer();
                    wss.broadcast(JSON.stringify({
                        id: 'timerCount',
                        time: timerLength
                    }));
                }
                break;
            case 'addTime':
                timerLength = timerLength + message.length;
                break;
            case 'stopTimer':
                clearInterval(timer);
                timerLength = 0;
                wss.broadcast(JSON.stringify({
                    id: 'timerStop'
                }));
            case 'changeTime':
                if (timerLength > 0) {
                    timerLength = timerLength + parseInt(message.time);
                    wss.broadcast(JSON.stringify({
                        id: 'timerCount',
                        time: timerLength
                    }));
                }
                break;
            case 'setHighScore':
                wss.broadcast(JSON.stringify({
                    id: 'setHighScore',
                    score: message.score
                }));
                break;
            case 'fontSize':
                wss.broadcast(JSON.stringify({
                    id: 'fontSize',
                    size: message.size
                }));
                break;
            case 'scoreReset':
                score = 0;
                wss.broadcast(JSON.stringify({
                    id: 'newScore',
                    score: score
                }));
                break;
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