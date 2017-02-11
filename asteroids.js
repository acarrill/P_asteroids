var shapes = [];
var player;


function startGame() {
    player = new spaceShip(20, 20, gameArea.canvas.width * 0.5, gameArea.canvas.height * 0.5);
    gameArea.start();
}

var gameArea = {
    canvas:  document.getElementById("game"),
    start: function() {
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener("keydown", keyHandler, true);
        window.addEventListener("keyup", keyHandlerOff, false);
        this.interval = setInterval(updateGame, 20);
    },
    clear: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


function keyHandlerOff(event) {

    if (event.key == "ArrowUp"){
        player.deceleration = -0.06
        player.acceleration = 0;
    } else if (event.key == "ArrowDown"){
        player.deceleration = 0.06
        player.acceleration = 0;
    }else if (event.key == "ArrowLeft" || event.key == "ArrowRight"){
        player.moveAngle = 0;
    }
}

/*
function deceleration(event) {
    console.log(event)
    if (event == "ArrowUp"){
        player.speed -= 0.25;
        console.log("stop");
        if (player.speed <= 0){
            console.log("stoped");
            clearInterval(keyHandlerOff.decelerating);
        }
    }else if (event == "ArrowDown"){
        player.speed += 0.25;
        if (player.speed >= 0){
            clearInterval(keyHandlerOff.decelerating);
        }
    }
}
*/

function keyHandler(event) {

    switch(event.key) {
        case "ArrowUp":
            player.acceleration = 0.15;
            break;
        case "ArrowDown":
            player.acceleration = -0.25;
            break;
        case "ArrowLeft":
            player.moveAngle = -2.5;
            break;
        case "ArrowRight":
            player.moveAngle = 2.5;
            break;
        default:
            console.log("Key not handled");
    }
}

function spaceShip(width, height, x , y) {
    this.mySpaceShip = new Image();
    this.mySpaceShip.src = "nave.png";
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.deceleration = 0;
    this.acceleration = 0;
    this.speed = 0;
    this.maxSpeed = 2.5;
    this.minSpeed = -1.5;
    this.angle = 0;
    this.moveAngle = 0;
    this.update = function() {
        gameArea.ctx.save();
        gameArea.ctx.translate(this.x, this.y);
        gameArea.ctx.rotate(this.angle);
        gameArea.ctx.drawImage(this.mySpaceShip, this.width / -2, this.height / -2, this.width, this.height);
        gameArea.ctx.restore();
    }
    this.move = function() {
        //Control de aceleración y fricción
        if (this.speed <= this.maxSpeed){
            this.speed += this.acceleration;
        }else{
            this.speed = this.maxSpeed;
        }
        if (this.deceleration != 0 && this.speed <= 0){ //fricción debe parar, pero no mover hacia atrás
            this.deceleration = 0;
            this.speed = 0;
        } else if (this.deceleration < 0) {
            this.speed += this.deceleration;
        }
        //Control velocidad y ángulo
        this.angle += this.moveAngle * Math.PI / 180;
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);
        //Control movimiento a traves de margenes
        if (this.x > gameArea.canvas.width){
            this.x = 0;
        } else if (this.x < 0) {
            this.x = gameArea.canvas.width;
        } else if (this.y > gameArea.canvas.height) {
            this.y = 0;
        } else if (this.y < 0) {
            this.y = gameArea.canvas.height;
        }
    }
}

function asteroidsCoor() {
    var coordenates = [];
    coordenates['x'] = Math.floor(Math.random() + gameArea.canvas.width)
}

function asteroids () {

    new spaceShip(30, 30);
}

function updateGame () {
    gameArea.clear();
    player.move();
    player.update();
}
