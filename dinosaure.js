class Dinosaur {
    constructor(){
        this.x = 200;
        this.w = 120;
        this.y = 420;
        this.h = 146;
        this.last_jump_y = 0;
        this.img_index = 0;
        this.img_crouching_index = 0;
        this.jumping = false;
        this.crouching = false;
        this.living = true;
        this.stop_jumping = false;
        this.will_die = false;
        this.jump_stage = 0;
        this.img;
        this.img_running_1;
        this.img_running_2;
        this.img_running_3;
        this.img_crouching_1;
        this.img_crouching_2;
        this.img_die;
        this.img_die_night;
        this.imgs = [];
        this.crouching_imgs = [];
        this.xPositionOfCollisionBoxes = [40, 52, 52, 56, 60, 60, 77, 68, 79];
        this.yPositionOfCollisionBoxes = [60, 72, 82, 90, 97, 102, 102, 60, 34];
        this.collisionBoxes = [];
        this.activeCollisionBoxes;
        this.crouchCollisionBoxes = [];
        this.createCollisionBoxes();
        this.createCrouchCollisionBoxes();
        this.activeCollisionBoxes = this.collisionBoxes;
    }

    f(x){
        return (-4*parseFloat(x)*(parseFloat(x)-1))*172;
    }

    update(){ 
        if(this.jumping){ 
            this.y=448-Math.floor(this.f(this.jump_stage));
            this.jump_stage += 0.03;
            this.last_jump_y = this.y;
            this.img = this.img_running_1;
         
            if(this.jump_stage>1){
                this.jumping = false;
                this.jump_stage = 0;
                this.y = 420;
            }
        }
        else if(this.crouching){
            if(frameCount%10==0 && !this.will_die){
                this.img = this.crouching_imgs[this.img_crouching_index ^= 1];
            }
        }
        else{ 
            if(frameCount%10==0){
                this.img_index++;
                if(this.img_index==3){
                    this.img_index = 0;
                }
                this.img = this.imgs[this.img_index];
            }
        }
        this.updateYCollisionBoxes();
    }

    doInitialJump(){
        if(this.jumping){
            this.y=448-Math.floor(this.f(this.jump_stage));
            this.jump_stage += 0.03;
            this.last_jump_y = this.y;
            this.img = this.img_running_1;
         
            if(this.jump_stage>1){
                this.jumping = false;
                this.jump_stage = 0;
                this.y = 420;
                game.started = true;
            }
        }
    }

    jump(){
        this.jumping = true;
    }
    die(... enemy_height) { 
        if (!this.living || this.will_die) return;
        
        this.living = false;
        this.will_die = true;
        
        this.askQuestion();
    }

    async askQuestion() {
        if (game.remainingQuestions.length === 0) {
            this.gameOver();
            return;
        }
    
        // Pausar el juego y bloquear controles
        game.pauseGame();
    
        try {
            const randomIndex = Math.floor(Math.random() * game.remainingQuestions.length);
            const selectedQuestion = game.remainingQuestions[randomIndex];
            game.remainingQuestions.splice(randomIndex, 1);
    
            // Mostrar el prompt personalizado con la imagen
            const playerAnswer = await this.showQuestionDialog(selectedQuestion);
    
            if (playerAnswer && playerAnswer.toLowerCase() === selectedQuestion.answer.toLowerCase()) {
                // Respuesta correcta: reiniciar posición y estados
                this.resetPlayer();
                game.resetAfterCorrectAnswer();
            } else {
                // Respuesta incorrecta: registrar la pregunta fallada
                preguntasFalladas.push(selectedQuestion);
                this.gameOver();
            }
        } finally {
            // Asegurarse de reanudar siempre
            if (this.living) {
                game.resumeGame();
            }
        }
    }

    showQuestionDialog(questionObj) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;

            const questionBox = document.createElement('div');
            questionBox.style = `
                background: white;
                padding: 40px; /* Aumentar el padding para hacerlo más grande */
                border-radius: 15px; /* Bordes redondeados */
                width: 600px; /* Aumentar el ancho */
                max-width: 90%;
                text-align: center;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Sombra para destacar */
            `;

            const questionText = document.createElement('h2');
            questionText.textContent = questionObj.question;
            questionText.style.marginBottom = '20px';

            const questionImage = document.createElement('img');
            questionImage.src = questionObj.img;
            questionImage.style = `
                width: 100%;
                max-height: 250px; /* Aumentar el tamaño máximo de la imagen */
                object-fit: contain;
                margin-bottom: 20px;
            `;

            const answerInput = document.createElement('input');
            answerInput.type = 'text';
            answerInput.placeholder = 'Escribe tu respuesta aquí...';
            answerInput.style = `
                width: 100%;
                padding: 15px; /* Aumentar el tamaño del campo de texto */
                margin-bottom: 20px;
                font-size: 18px; /* Texto más grande */
                border: 1px solid #ccc;
                border-radius: 5px;
            `;

            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'Responder';
            submitBtn.style = `
                padding: 15px 30px; /* Botón más grande */
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 18px; /* Texto más grande */
            `;

            // Configurar eventos
            const handleResponse = () => {
                document.body.removeChild(overlay);
                resolve(answerInput.value);
            };

            submitBtn.addEventListener('click', handleResponse);
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleResponse();
            });

            // Ensamblar elementos
            questionBox.appendChild(questionText);
            questionBox.appendChild(questionImage);
            questionBox.appendChild(answerInput);
            questionBox.appendChild(submitBtn);
            overlay.appendChild(questionBox);
            document.body.appendChild(overlay);

            // Foco automático en el input
            answerInput.focus();
        });
    }

    resetPlayer() {
        this.living = true;
        this.will_die = false;
        this.y = 420;
        this.x = 200 - 50;
        this.jump_stage = 0;
        this.jumping = false;
    }

    gameOver() {
        if (game.night) {
            image(game.imgGameOverNight, ((game.window_width / 2) - 174), 350, 347, 20);
            this.img = this.img_die_night;
        } else {
            image(game.imgGameOver, ((game.window_width / 2) - 174), 350, 347, 20);
            this.img = this.img_die;
        }
        noLoop();
    }

    stop_jump(... stop_jump_enemy_height){

        let eh = (stop_jump_enemy_height.length >= 1) ? stop_jump_enemy_height[0] : null;
         
        if(eh != null){
           this.y = eh-(this.h-5);
        }
        else{
            this.y = 420;
        }

        this.jumping = false;
        this.jump_stage = 0;
        this.crouch();
    }

    crouch(){
        
        if(this.y<=420 && !this.will_die && this.living){
            this.crouching = true;
            this.activeCollisionBoxes = this.crouchCollisionBoxes;
            this.y += 34;
            this.w = 140;
            this.h = 126;
        }
        else if (this.y<=420){
            this.crouching = true;
        }

        this.updateCrouchingImage();

    }
    
    updateCrouchingImage(){
        if(this.will_die){
            this.img = this.img_die;
        }
        else{
            this.img = this.crouching_imgs[this.img_crouching_index];
        }
    }

    stop_crouch(){
    
        if(this.y>420){
            this.crouching = false;
            this.stop_jumping = false;
            this.activeCollisionBoxes = this.collisionBoxes;
            this.y -= 34;
            this.w = 120;
            this.h = 146;
        }
       
        if(this.living){
            this.img = this.imgs[this.img_index];
        }

        this.updateYCollisionBoxes();
 
    }
    
    createCollisionBoxes(){
        for (let b of new CollisionBox(6,0).getCollisionBoxes()){
            this.collisionBoxes.push(b);
        } 
    }

    createCrouchCollisionBoxes(){
        for (let b of new CollisionBox(7,0).getCollisionBoxes()){
            this.crouchCollisionBoxes.push(b);
        } 
    }

    updateYCollisionBoxes(){
        for (let i=0; i<this.collisionBoxes.length;i++){
            this.collisionBoxes[i].y=this.y+this.yPositionOfCollisionBoxes[i];
        }
    }

    updateXYCollisionBoxes(){
        for (let i=0; i<this.collisionBoxes.length;i++){
            this.collisionBoxes[i].x=this.x+this.xPositionOfCollisionBoxes[i];
        }
        this.updateYCollisionBoxes();
    }

    display(){
        image(this.img, this.x, this.y, this.w, this.h);
    }

    isJumping(){
        return this.jumping;
    }

    isStoppingJumping(){
        return this.stop_jumping;
    }

    isCrouching(){
        return this.crouching;
    }

    isAlive(){
        return this.living;
    }

    updatePositionImmediately() {
        // Actualizar la posición sin lógica de movimiento
        this.current_frame = 0;
        this.animation_frame = 0;
        this.img = this.is_ducking ? this.img_duck : this.img_run;
    }
}
