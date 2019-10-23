var scoreText = document.getElementById("score");
var timerText = document.getElementById("timer");
var timerText2 = document.getElementById("timer2");
var timerLength = document.getElementById("timerLength");
var highScore = document.getElementById("highScore");
var enterHighScore = document.getElementById("enterHighScore");
var airHorn = document.getElementById("air_horn");
var fontSize = 650;
var ws = new WebSocket('ws://localhost:8081');
ws.onmessage = message => {
    console.log(message);
    message = JSON.parse(message.data);
    switch (message.id) {
        case 'newScore':
            scoreText.innerHTML = message.score;
            enterHighScore.value = message.score;
            break;
        case 'timerCount':
            try {
                timerText.innerHTML = message.time;
            } catch (error) {
                
            }
            try {
                timerText2.innerHTML = message.time;
            } catch (error) {
                
            }
            break;
        case 'timerStop':
            try {
                timerText.innerHTML = '&nbsp;';
            } catch (error) {
                
            }
            try {
                timerText2.innerHTML = '&nbsp;';
            } catch (error) {
                
            }
            break;
        case 'horn':
            try {
                airHorn.play();
            } catch (error) {
                
            }
        case 'setHighScore':
            highScore.innerHTML = message.score;
            break;
        case 'fontSize':
            fontSize = fontSize + parseInt(message.size);
            console.log(fontSize);
            try {
                timerText.style.fontSize = fontSize + "px";
            } catch (error) {
                
            }
            break;
        default:
            break;
    }
    
}
function changeScore(ammount) {
    ws.send(JSON.stringify({
        id: "score",
        score: ammount
    }));
}
function resetScore() {
    ws.send(JSON.stringify({
        id: "scoreReset"
    }));
}
function startTimer() {
    ws.send(JSON.stringify({
        id: 'startTimer',
        length: timerLength.value
    }));
}
function stopTimer() {
    ws.send(JSON.stringify({
        id: 'stopTimer'
    }));
}
function changeTime(time) {
    ws.send(JSON.stringify({
        id: 'changeTime',
        time: time
    }));
}
function setHighScore() {
    ws.send(JSON.stringify({
        id: 'setHighScore',
        score: enterHighScore.value
    }));
}
function changeFontSize(size) {
    ws.send(JSON.stringify({
        id: 'fontSize',
        size: size
    }));
}
function horn() {
    airHorn.play();
}