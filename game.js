class Game {
    last_bird_x = 1350;
    speed = 12; 
    maxSpeed = 20;
    score = 0;
    highScore = 0;
    last_day_change = 1;
    window_width = 1280;
    night = false;
    collisionBoxesVisible = false;
    fpsVisible = false;
    sprite;
    imgGameOver;
    imgGameOverNight;

    constructor(start, debugged){
        this.started = start;
        this.debug = debugged;
        this.set_debug();
        this.ground = new Ground();
        this.moon = new Moon();
        this.player = new Dinosaur();
        this.cactae = [];
        this.birds = [];
        this.clouds = [];
        this.stars = [];
        this.remainingQuestions = [
            { question: "Escriba la opción correcta", answer: "b", img: "img/Pregunta1.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion1.1.jpg", "imgRetroalimentacion/Retroalimentacion1.2.jpg"] },
            { question: "Escriba la opción correcta", answer: "a", img: "img/Pregunta2.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion2.1.jpg", "imgRetroalimentacion/Retroalimentacion2.2.jpg"] },
            { question: "Escriba la opción correcta", answer: "c", img: "img/Pregunta3.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion3.1.jpg", "imgRetroalimentacion/Retroalimentacion3.2.jpg"] },
            { question: "Escriba la opción correcta", answer: "a", img: "img/Pregunta4.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion4.1.jpg", "imgRetroalimentacion/Retroalimentacion4.2.jpg"] },
            { question: "Escriba verdadero o falso", answer: "falso", img: "img/Pregunta5.jpg", retroImg: "imgRetroalimentacion/Retroalimentacion5.jpg" },
            { question: "Escriba verdadero o falso", answer: "verdadero", img: "img/Pregunta6.jpg", retroImg: "imgRetroalimentacion/Retroalimentacion6.jpg" },
            { question: "Escriba verdadero o falso", answer: "verdadero", img: "img/Pregunta7.jpg", retroImg: "imgRetroalimentacion/Retroalimentacion7.jpg" },
            { question: "Escriba verdadero o falso", answer: "verdadero", img: "img/Pregunta8.jpg", retroImg: "imgRetroalimentacion/Retroalimentacion8.jpg" }
            
        ];
        this.currentQuestion = null; // Guardar la pregunta actual
        this.playerAnswer = ""; // Respuesta del jugador
        this.questionActive = false; // Controlar si hay una pregunta activa
    }

    update() {
        if (this.player.isAlive() && this.started) {
            // Incrementar la velocidad cada 200 puntos
            if (Math.floor(this.score / 50) > Math.floor((this.score - (1 * (this.speed / 70))) / 50)) {
                this.speed += 1; // Incrementar la velocidad en 1
            }

            if (Math.floor(this.score) % 1000 == 0 && Math.floor(this.score) > this.last_day_change) {
                this.last_day_change = Math.floor(this.score);
                this.night = !this.night;
                if (this.night) {
                    this.moon.changePhase();
                }
            }
            this.score += 1 * (this.speed / 70);
            this.ground.update(Math.floor(this.speed));
            this.player.update();

            if (this.player.will_die && !this.player.living) {
                this.player.die();
                return; // Salir temprano para evitar actualizaciones adicionales
            }

            for (let cl of this.clouds) {
                cl.update(Math.floor(this.speed * 0.5));
            }

            for (let c of this.cactae) {
                c.update(Math.floor(this.speed));
                for (let cbc of c.collisionBoxes) {
                    cbc.update(Math.floor(this.speed));
                }
            }

            for (let b of this.birds) {
                b.update(Math.floor(this.speed));
                for (let cbb of b.wingDownCollisionBoxes) {
                    cbb.update(Math.floor(this.speed));
                }
                for (let cbb of b.wingUpCollisionBoxes) {
                    cbb.update(Math.floor(this.speed));
                }
            }

            if (this.night) {
                fill(255);
                this.moon.update((this.speed * 0.021));
                for (let s of this.stars) {
                    s.update((this.speed * 0.021));
                }
            } else {
                fill(32, 33, 36);
            }
            text("Score", width / 2 + 50, 50);
            text(Math.floor(this.score), width / 2 + 150, 50);

            if (this.highScore < this.score) {
                localStorage.setItem("highScore", (this.highScore = Math.floor(this.score)) + "");
            }

            text("High Score", width / 2 + 280, 50);
            text(this.highScore, width / 2 + 460, 50);

            if (!this.player.will_die) {
                this.check_collisions();
            }

            if (this.speed < this.maxSpeed) {
                this.speed += 0.001;
            }
        } else {
            this.started = false;
            this.player.doInitialJump();
            textSize(32);
            fill(32, 33, 36);
            text("Usa la barra espaciadora para iniciar y saltar ó las teclas de arriba o abajo para saltar y agacharte.", 150, 585);
        }

        if (this.fpsVisible) {
            text("Fps", 50, 50);
            text(parseFloat(frameRate()).toFixed(3), 120, 50);
        }
    }

    display(){
        if(this.started){
            this.ground.display();
            if(this.night){
                for (let s of this.stars){
                    s.display();
                }
                this.moon.display();
            }
        }
        else{
            this.ground.displayGameNotStarted();
        }
        for (let cl of this.clouds){
            cl.display();
        }
        for (let c of this.cactae){
            c.display();
            if(this.collisionBoxesVisible){
                for (let cbc of c.collisionBoxes){
                    cbc.display();
                }
            }
        }
        for (let b of this.birds){
            b.display();
            if(this.collisionBoxesVisible){
                for (let cbb of b.activeCollisionBoxes){
                    cbb.display();
                }
            }
        }
        this.player.display();
        if(this.collisionBoxesVisible){
            for (let cbp of this.player.activeCollisionBoxes){
                cbp.display();
            }
        } 
    }

    load_game(w){
        this.set_window_width(w);
        this.load_game_assets();
        this.load_ground_assets();
        this.load_player_assets();
    }
    set_window_width(w){
        this.window_width = w;
        this.ground.w = w;
        this.ground.x2 = 0-w;
        this.moon.x = w+70;
    }
    load_game_assets(){
        this.imgGameOver =  this.sprite.get(655, 15, 191, 11);
        this.imgGameOverNight =  this.sprite.get(655, 29, 191, 11);
    }
    load_player_assets(){
        this.player.img_running_1 = this.sprite.get(848, 2, 44, 47);
        this.player.img_running_2 = this.sprite.get(936, 2, 44, 47);
        this.player.img_running_3 = this.sprite.get(980, 2, 44, 47);
        this.player.img_crouching_1 = this.sprite.get(1112, 19, 59, 30); 
        this.player.img_crouching_2 = this.sprite.get(1171, 19, 59, 30);
        this.player.img_die = this.sprite.get(1068, 2, 44, 47);
        this.player.img_die_night = this.sprite.get(1024, 2, 44, 47);
        this.player.imgs [0] = this.player.img_running_1; this.player.imgs[1] = this.player.img_running_2; this.player.imgs[2] = this.player.img_running_3;
        this.player.crouching_imgs [0] = this.player.img_crouching_1;  this.player.crouching_imgs [1] = this.player.img_crouching_2;
        this.player.img = this.player.img_running_1;
    }

    load_ground_assets(){
        this.ground.img = this.sprite.get(2, 53, 1200, 13);
        this.ground.imgGameNotStarted = this.sprite.get(40, 53, 49, 13);
    }

    spawn_enemy(){
        if(Math.floor(random(10))==0){
            if(this.score>450){
                this.birds.push(new Bird());
            }
        }
        else{
            this.cactae.push(new Cactus());
        }
    }

    spawn_cloud(){
        if(Math.floor(random(1.5))==0){
            this.clouds.push(new Cloud());
        }
    }

    spawn_star(){
        if(Math.floor(random(10))==0){
            this.stars.push(new Star());
        }
    }

    spawn_entities(){
        this.spawn_enemy();
        this.spawn_cloud();
        if(this.night){
            this.spawn_star();
        }
    }

    despawn_enemy() {
        this.cactae = this.cactae.filter(c => c.x + c.w >= 0);
        this.birds = this.birds.filter(b => b.x + b.w >= 0);
    }
      
    despawn_cloud(){
        this.clouds = this.clouds.filter(cl => cl.x + cl.w >= 0);
    }

    despawn_star(){
        this.stars = this.stars.filter(s => s.x + s.w >= 0);
    }

    despawn_entities(){
        this.despawn_enemy();
        this.despawn_cloud();
        if(this.night){
            this.despawn_star();
        }
    }

    check_collisions(){
        loopCollisions:
        for (let cbp of this.player.activeCollisionBoxes){
            let p_x = cbp.x;
            let p_y = cbp.y;
            let p_w = cbp.w;
            let p_h = cbp.h;
            
            for (let c of this.cactae){

                for(let cbc of c.collisionBoxes){

                    if(p_x + p_w > cbc.x && p_x < cbc.x + cbc.w){
                
                        if (this.player.isJumping() ){
                            if(p_y+ p_h > cbc.y){
                                this.player.die(); break loopCollisions;
                            }
                        }
                        else{
                            this.player.stop_jumping = false;
                            if(c.type<3){
                                if(cbc.h!=29){
                                    this.player.die(); break loopCollisions;
                                }
                            }
                            else{
                                this.player.die(); break loopCollisions;
                            }
                        }
                    }
                }
            }

            if(this.player.isJumping()){
                for (let i = 0; i<this.birds.length; i++){
                    if(this.birds[0].x+this.birds[0].w<200 && this.birds.length>1){
                        this.last_bird_x = this.birds[1].x;
                    }
                    else{
                        this.last_bird_x = this.birds[0].x;
                    }
                }
            }
            
            for (let b of this.birds){

                for(let cbb of b.activeCollisionBoxes){

                    if(p_x + p_w > cbb.x && p_x < cbb.x + cbb.w){
               
                        if(p_y+ p_h > cbb.y && p_y < cbb.y +cbb.h){
                            this.player.stop_jumping = false;
                            this.player.x+=1;
                            this.player.die(); break loopCollisions;
                        }
                    }
                }
            }
        }
    }

    check_collisions_crouch(){
        if(this.score<30){
            this.player.stop_jump();
        }
        else{
            let e_y = 0;
            loopCactus:
            for (let c of this.cactae){
                if(!this.player.will_die){
                    for(let cbc of c.collisionBoxes){
                        if(this.player.x + this.player.w > cbc.x-this.speed && this.player.x < cbc.x-this.speed + cbc.w){
                            this.player.will_die = true;
                            e_y = cbc.y;
                            break;
                        }
                    }
                    if(this.player.will_die){
                        if(c.type<3){
                            if(c.x>280){
                                this.player.stop_jump(); this.player.x+=10;
                            }
                            else if(c.x>235){
                                this.player.stop_jump(); this.player.x+=6;
                            }
                            else if(c.x+c.w<240){
                                this.player.stop_jump(); this.player.x-=3;
                            }
                            else{
                                this.player.stop_jump(e_y+2);
                            }
                        }
                        else{
                            if(c.x>280){
                                this.player.stop_jump(); this.player.x+=10;
                            }
                            else if(c.x>250){
                                this.player.stop_jump(); this.player.x+=2;
                            }
                            else if(c.x+c.w<210){
                                this.player.stop_jump(e_y+10);
                            }
                            else if(c.x+c.w<240){
                                this.player.stop_jump();
                            }
                            else{
                                this.player.stop_jump(e_y+5);
                            }
                        }
                        break loopCactus;
                    } 
                    else{
                        this.player.stop_jump();
                    }  
                } 
            }
            loopBirds:
            for (let b of this.birds){
                if(!this.player.will_die){
                    for(let cbb of b.activeCollisionBoxes){
                        if(this.player.x + this.player.w > cbb.x-this.speed && this.player.x < cbb.x-this.speed + cbb.w){
                            if(this.player.last_jump_y < cbb.y  && this.player.x+this.player.w>this.last_bird_x ){
                                this.player.will_die = true;
                                e_y = cbb.y+10; break;
                            }
                        }
                    }
                    if(this.player.will_die){
                        if(b.x+b.w<240){
                            this.player.stop_jump(e_y+40);
                        }
                        else{
                            this.player.stop_jump(e_y);
                        }
                        break loopBirds;
                    } 
                    else{
                        this.player.stop_jump();
                    }
                }
            }
        }
    }

    getHighScore(){
        if (localStorage.getItem("highScore") !== null) {
            this.highScore = Number(localStorage.getItem("highScore"));
        }
        return this.highScore;
    }

    toggle_debug(){
        this.debug = !this.debug;
        this.set_debug();
    }

    set_debug(){
        this.collisionBoxesVisible = this.debug;
        this.fpsVisible = this.debug;
    }

    keyPressed(key){
        if (key == "UP" && this.player.isAlive() && this.started){
            if (!this.player.isCrouching()){
                this.player.jump();
            }
        }
        else if (key == "DOWN" && this.player.isAlive() && this.started){
            if(this.player.isJumping()){
                this.player.stop_jumping = true;
                this.check_collisions_crouch();
            }else{
                this.player.crouch();
            }
        }
        else if (key == "D"){
            this.toggle_debug();
        }
    }

    keyReleased(key){
        if (key == "DOWN" && this.player.isAlive() && this.started){
            this.player.stop_crouch();
        }
    } 

    resetAfterCorrectAnswer() {
        // Pausa breve para evitar actualizaciones residuales
        noLoop();

        this.resetObstaclesAfterDeath();

        // Reiniciar velocidad temporalmente
        const previousSpeed = this.speed;
        this.speed = 0;

        // Reiniciar completamente al jugador
        this.player.resetPlayer();
        this.started = true;
        this.player.will_die = false;
        this.player.living = true;

        // Pequeño delay antes de continuar
        setTimeout(() => {
            this.speed = previousSpeed * 0.8; // Reducir velocidad momentáneamente
            loop();

            // Restaurar velocidad completa después de 500ms
            setTimeout(() => {
                this.speed = previousSpeed;
            }, 500);
        }, 50);
    }

    resetObstaclesAfterDeath() {
        // Mover todos los obstáculos fuera de pantalla
        const resetPosition = -1000;
        
        for (let c of this.cactae) {
            c.x = resetPosition;
        }
        
        for (let b of this.birds) {
            b.x = resetPosition;
        }
        
        // Opcional: Reposicionar nubes para continuidad visual
        for (let i = 0; i < this.clouds.length; i++) {
            this.clouds[i].x = width + (i * 200);
        }
    }

    pauseGame() {
        if (!this.isPaused) {
            noLoop();
            this.isPaused = true;

            // Guardar la velocidad actual
            this.savedSpeed = this.speed;

            // Guardar referencia original de los eventos de teclado
            this.originalKeyPressed = window.keyPressed;
            this.originalKeyReleased = window.keyReleased;

            // Bloquear controles
            window.keyPressed = function() {};
            window.keyReleased = function() {};
        }
    }

    resumeGame() {
        if (this.isPaused) {
            // Restaurar controles
            window.keyPressed = this.originalKeyPressed;
            window.keyReleased = this.originalKeyReleased;

            // Restaurar la velocidad guardada
            this.speed = this.savedSpeed;

            this.isPaused = false;
            loop();
        }
    }

    gameOver() {
        if (this.night) {
            image(this.imgGameOverNight, ((this.window_width / 2) - 174), 350, 347, 20);
            this.player.img = this.player.img_die_night;
        } else {
            image(this.imgGameOver, ((this.window_width / 2) - 174), 350, 347, 20);
            this.player.img = this.player.img_die;
        }

        noLoop();

        // Permitir reiniciar el juego con la barra espaciadora o las teclas de flecha
        window.keyPressed = () => {
            if (key === ' ' || key === 'UP' || key === 'DOWN') {
                this.resetGame();
            }
        };
    }

    resetGame() {
        this.started = false;
        this.score = 0;
        this.player = new Dinosaur(); // Reiniciar el jugador
        this.cactae = [];
        this.birds = [];
        this.clouds = [];
        this.remainingQuestions = [
            { question: "Escriba la opción correcta", answer: "b", img: "img/Pregunta1.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion1.1.jpg", "imgRetroalimentacion/Retroalimentacion1.2.jpg"] },
            { question: "Escriba la opción correcta", answer: "a", img: "img/Pregunta2.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion2.1.jpg", "imgRetroalimentacion/Retroalimentacion2.2.jpg"] },
            { question: "Escriba la opción correcta", answer: "c", img: "img/Pregunta3.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion3.1.jpg", "imgRetroalimentacion/Retroalimentacion3.2.jpg"] },
            { question: "Escriba la opción correcta", answer: "a", img: "img/Pregunta4.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion4.1.jpg", "imgRetroalimentacion/Retroalimentacion4.2.jpg"] },
            { question: "Escriba verdadero o falso", answer: "falso", img: "img/Pregunta5.jpg", retroImg: ["imgRetroalimentacion/Retroalimentacion5.jpg"] },
            { question: "Escriba verdadero o falso", answer: "verdadero", img: "img/Pregunta6.jpg", retroImg: "imgRetroalimentacion/Retroalimentacion6.jpg" },
            { question: "Escriba verdadero o falso", answer: "verdadero", img: "img/Pregunta7.jpg", retroImg: "imgRetroalimentacion/Retroalimentacion7.jpg" },
            { question: "Escriba verdadero o falso", answer: "verdadero", img: "img/Pregunta8.jpg", retroImg: "imgRetroalimentacion/Retroalimentacion8.jpg" }
            
        ]; // Reiniciar las preguntas
        loop();
    }
}