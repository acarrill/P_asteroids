var asteroids = [];
var player;
var bullets = [];
var score;
var playerLifes;
var gameClock = new Date();

function startGame() {

    asteroids = [];
    bullets = []; // Limpiamos arrays por si no es la primera partida

    player = new DynamicElemt(15, 15, gameArea.canvas.width * 0.5, gameArea.canvas.height * 0.5);
    player.deceleration = 0;
    player.relativeAngle = 0; // Guarda el angulo de la nave respecto al canvas
    player.move = function() { // Exclusivo de cada componente
        //Control de aceleración y fricción
        acelerationControl(player);
        //Control velocidad y ángulo
        angularControl(player);
        player.relativeAngle += player.moveAngle;
        //Control movimiento a traves de margenes
        marginControl(player);
    }
    for(var i=0; i < 4; i++){
        spawnAsteroids(4);
    }
    score = new TextComponent("30px", "30px", 0, 10, "white");
    score.count = 0;
    playerLifes = new TextComponent("30px", "30px", gameArea.canvas.width - 40, 10, "white")
    playerLifes.count = 3;
    gameArea.start();
}

var gameArea = {
    canvas:  document.getElementById("game"),
    start: function() {
        this.ctx = this.canvas.getContext('2d');
        window.addEventListener("keydown", keyHandler, true);
        window.addEventListener("keyup", keyHandlerOff, false);
        this.updateInterval = setInterval(updateGame, 20);
        this.asteroidsInterval = setInterval(spawnAsteroids, 2500);
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
    bullets[index] = new DynamicElemt(2, 2, x, y);
    bullets[index].gameElement.src = "bullet.png";
    bullets[index].speed = 3.5;
    bullets[index].moveAngle = player.relativeAngle;
    bullets[index].removeTime = lastBullet + 1;
    bullets[index].nextBullet = lastBullet + 1;
    // Giramos bala con el angulo de la nave, luego angulo debe ser 0
    angularControl(bullets[index]);
    bullets[index].update()
    bullets[index].moveAngle = 0; // Balas siempre linea recta

    bullets[index].move = function() { // Exclusivo de cada componente
        //Control velocidad y ángulo
        angularControl(this);
        //Control movimiento a traves de margenes
        marginControl(this);
    }
}

function spawnAsteroids() {
    var maxAsterois = 8; // maximo nº de asteroides
    if (asteroids.length <= maxAsterois) {
        var y = Math.floor(Math.random() * gameArea.canvas.height)
        var x = Math.floor(Math.random() * gameArea.canvas.width);
        var index = asteroids.length;
        asteroids[index] = new DynamicElemt(17, 17, x, y);
        asteroids[index].gameElement.src = "asteroidLarge.png";
        asteroids[index].speed = 1.5;
        asteroids[index].moveAngle = 0.3;
        asteroids[index].move = function() { // Exclusivo de cada componente
            //Control velocidad y ángulo
            angularControl(this);
            //Control movimiento a traves de margenes
            marginControl(this);
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
    if (obj.deceleration != 0 && obj.speed <= 0){ //fricción debe parar, pero no mover hacia atrás
        obj.deceleration = 0;
        obj.speed = 0;
    } else if (obj.deceleration < 0) {
        obj.speed += obj.deceleration;
    }
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

function keyHandlerOff(event) {

    if (event.key == "ArrowUp"){
        player.deceleration = -0.02
        player.acceleration = 0;
    } else if (event.key == "ArrowDown"){
        player.deceleration = 0.06
        player.acceleration = 0;
    }else if (event.key == "ArrowLeft" || event.key == "ArrowRight"){
        player.moveAngle = 0;
    }
}

function keyHandler(event) {

    switch(event.key) {
        case "ArrowUp":
            player.acceleration = 0.15;
            break;
        case "ArrowDown":
            player.acceleration = -0.25;
            break;
        case "ArrowLeft":
            player.moveAngle = -4;
            break;
        case "ArrowRight":
            player.moveAngle = 4;
            break;
        case " ":
            spawnBullet();
            break;
        default:
            console.log("Key not handled");
    }
}

function DynamicElemt(width, height, x , y) {
    this.gameElement = new Image();
    this.gameElement.src = "nave.png";
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.acceleration = 0;
    this.speed = 0;
    this.maxSpeed = 2.5;
    this.minSpeed = -2.5;
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

function TextComponent(width, height, x , y, color) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.text = "";
    this.update = function() {
        gameArea.ctx.font = this.width + "Arial" + this.height;
        gameArea.ctx.fillStyle = color;
        gameArea.ctx.fillText(this.text, this.x, this.y);
    }
}

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
    for (var i=0; i<bullets.length; i++){
        bullets[i].move();
        bullets[i].update();
        if (bullets[i].removeTime < now) {
            bullets.splice(i, 1);
        }
        for (var j=0; j<asteroids.length; j++){ //Comprobamos si se ha producido colisión
            var shooted = crash(bullets[i], asteroids[j]);
            if (shooted) { //METER EXPLOSION EN ASTEROIDS
                var explosion = new Image(); // efecto explosión
                explosion.src = "explosionLarge.png";
                bullets.splice(i, 1);
                gameArea.ctx.drawImage(explosion, asteroids[j].x, asteroids[j].y, 25, 25);
                score.count += 20;
                asteroids.splice(j, 1)
            }
        }
    }
    for (var i=0; i<asteroids.length; i++){
        asteroids[i].move();
        asteroids[i].update();
        var playerColision = crash(player, asteroids[i]);
        if (playerColision) { // si hay colisión nave vuelve a posición inicial
            player.lifes -= 1;
            player.x = gameArea.canvas.width * 0.5;
            player.y = gameArea.canvas.height * 0.5;
            asteroids.splice(i, 1)
            playerLifes.count -= 1;
        }
    }
    score.text = "SCORE: " + score.count;
    score.update();
    playerLifes.text = "LIFES: " + playerLifes.count;
    playerLifes.update();
    if (playerLifes.count <= 0) {
        var gameOver = new TextComponent("30px", "30px", 200, gameArea.canvas.height*0.5, "white")
        gameOver.text = "GAME OVER";
        gameOver.update();
        gameArea.stop();
        if (window.confirm("Play again?") == true) {
            startGame();
        }
    }
}
