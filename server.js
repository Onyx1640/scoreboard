const WebSocket = require('ws');
const express = require('express');
var timer;
var timerLength = 0;
var wss = new WebSocket.Server({
    port: 8081
});
var score = 0;
var hs1 = 0;
var hs1Name = 'Name: ';
var hs2 = 0;
var hs2Name = 'Name: ';
var hs3 = 0;
var hs3Name = 'Name: ';
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
                setHighScore(message.name,message.score);
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
            wss.broadcast(JSON.stringify({
                id: 'horn'
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
function setHighScore(name,score) {
    var scoreInt = parseInt(score);
    if(scoreInt >= hs3 && score < hs2 ) {
        hs3 = scoreInt;
        hs3Name = name;
        wss.broadcast(JSON.stringify({
            id: 'setHS3',
            score: name + ": " + scoreInt
        }));
    }
    if(scoreInt > hs2 && score < hs1 ) {
        hs3 = hs2;
        hs3Name = hs2Name;
        hs2 = scoreInt;
        hs2Name = name;
        wss.broadcast(JSON.stringify({
            id: 'setHS3',
            score: hs3Name + ": " + hs3
        }));
        wss.broadcast(JSON.stringify({
            id: 'setHS2',
            score: name + ": " + scoreInt
        }));
    }
    if(scoreInt === hs2) {
        hs2Name = name;
        wss.broadcast(JSON.stringify({
            id: 'setHS2',
            score: name + ": " + scoreInt
        }));
    }
    if(scoreInt > hs1) {
        hs3 = hs2;
        hs3Name = hs2Name;
        hs2 = hs1;
        hs2Name = hs1Name;
        hs1 = scoreInt;
        hs1Name = name;
        wss.broadcast(JSON.stringify({
            id: 'setHS2',
            score: hs2Name + ": " + hs2
        }));
        wss.broadcast(JSON.stringify({
            id: 'setHS3',
            score: hs3Name + ": " + hs3
        }));
        wss.broadcast(JSON.stringify({
            id: 'setHS1',
            score: name + ": " + scoreInt
        }));
    }
    if (scoreInt === hs1) {
        hs1Name = name;
        wss.broadcast(JSON.stringify({
            id: 'setHS1',
            score: name + ": " + scoreInt
        }));
    }
    // wss.broadcast(JSON.stringify({
    //     id: 'setHighScore',
    //     score: message.score
    // }));
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