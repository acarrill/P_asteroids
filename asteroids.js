var asteroids = [];
var player;
var bullets = [];
var score;
var playerLifes;
var gameClock = new Date();
var soundtrack;
var asteroid_boom;
var explosion = new Image(); // efecto explosión


function startGame() {

    asteroids = [];
    bullets = []; // Limpiamos arrays por si no es la primera partida

    explosion.src = "explosionLarge.png";
    if (soundtrack == undefined){
        soundtrack = new sound("soundtrack.mp3");
        soundtrack.play();
    }

    player = new DynamicElemt(70, 70, gameArea.canvas.width * 0.5, gameArea.canvas.height * 0.5);
    player.deceleration = 0;
    player.relativeAngle = 0; // Guarda el angulo de la nave respecto al canvas
    player.move = function() {
        //Control de aceleración y fricción
        acelerationControl(player);
        //Control velocidad y ángulo
        angularControl(player);
        player.relativeAngle += player.moveAngle;
        //Control movimiento a traves de margenes
        marginControl(player);
    }
    score = new TextComponent("30px", "Arial", 0, 30, "white");
    score.count = 0;
    playerLifes = new TextComponent("30px", "Arial", gameArea.canvas.width - 120, 30, "white")
    playerLifes.count = 3;
    gameArea.start();
}

var gameArea = {
    canvas:  document.getElementById("game"),
    start: function() {
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener("keydown", keyHandler, false);
        //window.addEventListener("keyup", keyHandlerOff, false); inercia
        this.updateInterval = setInterval(updateGame, 20);
        this.asteroidsInterval = setInterval(spawnAsteroids, 1000);
    },
    clear: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.updateInterval);
        clearInterval(this.asteroidsInterval);
    }
}

    //LAS SIGUIENTES FUNCIONES SE USARAN EN LOS COMPONENTES DINAMICOS DEL JUEGO

function spawnBullet(){
    var hour = new Date();
    var lastBullet = hour.getMinutes()* 60 + hour.getSeconds();
    var x = player.x;
    var y = player.y;
    var index = bullets.length;
    bullets[index] = new DynamicElemt(30, 30, x, y);
    bullets[index].gameElement.src = "bola_luz.png";
    bullets[index].speed = 11.5;
    bullets[index].moveAngle = player.relativeAngle;
    bullets[index].removeTime = lastBullet + 1;
    bullets[index].nextBullet = lastBullet + 1;
    // Giramos bala con el ángulo de la nave, luego ángulo debe ser 0
    angularControl(bullets[index]);
    bullets[index].update()
    bullets[index].moveAngle = 0; // Balas siempre línea recta

    bullets[index].move = function() { // Exclusivo de cada componente
        //Control velocidad y ángulo
        angularControl(this);
    }
}

function spawnAsteroids() {
    var maxAsterois = 16; // maximo nº de asteroides
    var x = 0;
    var y =  gameArea.canvas.height;
    if (asteroids.length <= maxAsterois) {
        // Varaible aleatoria que elige margen de salida del asteroide
        var exitMargin = Math.floor(Math.random() * 2)
        if (exitMargin == 0){ // X
            y = Math.floor(Math.random() * gameArea.canvas.height)
        }else if (exitMargin == 1) { // Y
            x = Math.floor(Math.random() * gameArea.canvas.width);
        }
        var index = asteroids.length;
        asteroids[index] = new DynamicElemt(60, 60, x, y);
        asteroids[index].gameElement.src = "asteroidLarge.png";
        asteroids[index].speed = 3.5;
        asteroids[index].moveAngle = 0.5;
        asteroids[index].move = function() { // Exclusivo de cada componente
            //Control velocidad y ángulo
            angularControl(this);
            //Control movimiento a traves de margenes
            //marginControl(this);
        }
    }
}

function angularControl(obj) { //Control de velocidad angular
    obj.angle += obj.moveAngle * Math.PI / 180;
    obj.x += obj.speed * Math.sin(obj.angle);
    obj.y -= obj.speed * Math.cos(obj.angle);
}

function acelerationControl(obj) { //Control de aceleración para la nave
    if (obj.speed <= obj.maxSpeed){
        obj.speed += obj.acceleration;
    }else{
        obj.speed = obj.maxSpeed;
    }
    if (obj.speed <= obj.minSpeed){
        obj.speed = obj.minSpeed;
    }
    /*
        Usar en caso de querer eliminar inercia espacial

    if (obj.deceleration != 0 && obj.speed <= 0){ //fricción debe parar, pero no mover hacia atrás
        obj.deceleration = 0;
        obj.speed = 0;
    } else if (obj.deceleration < 0) {
        obj.speed += obj.deceleration;
    }
    */
}

function marginControl (obj) {

    //Control movimiento a traves de margenes
    if (obj.x > gameArea.canvas.width){
        obj.x = 0;
    } else if (obj.x < 0) {
        obj.x = gameArea.canvas.width;
    } else if (obj.y > gameArea.canvas.height) {
        obj.y = 0;
    } else if (obj.y < 0) {
        obj.y = gameArea.canvas.height;
    }
}

    //LAS SIGUIENTE FUNCIONES MANEJAN LAS FLECHAS DEL TECLADO (NAVE)

/*
    Esta función se utilizaría en caso de querer eliminar la inercia espacial

function keyHandlerOff(event) {

    if (event.key == "ArrowUp"){
        player.deceleration = -0.08
        player.acceleration = 0;
    } else if (event.key == "ArrowDown"){
        player.deceleration = 0.6
        player.acceleration = 0;
    }else if (event.key == "ArrowLeft" || event.key == "ArrowRight"){
        player.moveAngle = 0;
    }
}
*/

function keyHandler(event) {

    switch(event.key) {
        case "ArrowUp":
            player.acceleration = 0.5;
            break;
        case "ArrowDown":
            player.acceleration = -0.5;
            break;
        case "ArrowLeft":
            player.moveAngle = -3.5;
            break;
        case "ArrowRight":
            player.moveAngle = 3.5;
            break;
        case " ":
            spawnBullet();
            var laser = new sound("laser.mp3")
            laser.play();
            break;
        default:
            console.log("Key not handled");
    }
}

    // CONSTRUCTORES

function DynamicElemt(width, height, x , y) {
    this.gameElement = new Image();
    this.gameElement.src = "nave.png";
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.acceleration = 0;
    this.speed = 0;
    this.maxSpeed = 6.5;
    this.minSpeed = -6.5;
    this.angle = 0;
    this.moveAngle = 0;
    this.update = function() {
        gameArea.ctx.save();
        gameArea.ctx.translate(this.x, this.y);
        gameArea.ctx.rotate(this.angle);
        gameArea.ctx.drawImage(this.gameElement, this.width / -2, this.height / -2, this.width, this.height);
        gameArea.ctx.restore();
    }
}

function TextComponent(size, font, x , y, color) {
    this.size = size; // en pixeles
    this.font = font;
    this.x = x;
    this.y = y;
    this.text = "";
    this.update = function() {
        gameArea.ctx.font = this.size + " " + this.font;
        gameArea.ctx.fillStyle = color;
        gameArea.ctx.fillText(this.text, this.x, this.y);
    }
}

function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }
}

    //CHOQUES Y UPDATE DEL JUEGO

function crash(whoCrash, theCrashed) {
    var myleft = whoCrash.x;
    var myright = whoCrash.x + (whoCrash.width);
    var mytop = whoCrash.y;
    var mybottom = whoCrash.y + (whoCrash.height);
    var otherleft = theCrashed.x;
    var otherright = theCrashed.x + (theCrashed.width);
    var othertop = theCrashed.y;
    var otherbottom = theCrashed.y + (theCrashed.height);
    var crash = true;
    if ((mybottom < othertop) ||
           (mytop > otherbottom) ||
           (myright < otherleft) ||
           (myleft > otherright)) {
       crash = false;
    }
    return crash;
}

function updateGame () {
    gameClock = new Date(); // Reloj del juego
    var now = gameClock.getMinutes()* 60 + gameClock.getSeconds();
    gameArea.clear();
    player.move();
    player.update();
    for (var i=0; i<bullets.length; i++){ // Colisiones bala/asteroide
        bullets[i].move();
        bullets[i].update();
        if (bullets[i].removeTime < now) {
            bullets.splice(i, 1);
        }
        for (var j=0; j<asteroids.length; j++){ //Comprobamos si se ha producido colisión
            var shooted = crash(bullets[i], asteroids[j]);
            if (shooted) {
                bullets.splice(i, 1);
                gameArea.ctx.drawImage(explosion, asteroids[j].x, asteroids[j].y, 115, 115);
                asteroid_boom = new sound("asteroid_boom.mp3"); // sonido explosion
                asteroid_boom.play();
                score.count += 20;
                asteroids.splice(j, 1)
            }
        }
    }
    for (var i=0; i<asteroids.length; i++){ //colision nave/asteroide
        asteroids[i].move();
        asteroids[i].update();
        var playerColision = crash(player, asteroids[i]);
        if (playerColision) { // si hay colisión parámetros iniciales para nave
            player.lifes -= 1;
            player.x = gameArea.canvas.width * 0.5;
            player.y = gameArea.canvas.height * 0.5;
            player.speed = 0;
            player.moveAngle = 0;
            player.acceleration = 0;
            asteroids.splice(i, 1)
            playerLifes.count -= 1;
        }
    }
    score.text = "SCORE: " + score.count;
    score.update();
    playerLifes.text = "LIFES: " + playerLifes.count;
    playerLifes.update();
    if (playerLifes.count <= 0) {
        var gameOver = new TextComponent("30px", "Arial", 200, gameArea.canvas.height*0.5, "white")
        gameOver.text = "GAME OVER";
        gameOver.update();
        gameArea.stop();
        if (window.confirm("Play again?") == true) {
            startGame();
        }
    }
}
