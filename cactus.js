class Cactus{

    constructor(){

        this.randomDistance = Math.floor( random(40,80) );
        this.x = game.window_width + this.randomDistance;
        this.type = Math.floor( random(3) );
        this.collisionBoxes=[];

        switch (this.type) {
            case 0: // simple haie
                // hauteur du sprite
                this.h = 26*5;
                // position y du sprite from top of the canvas
                this.y = 440;
                // largeur du sprite
                this.w = 26*5;
                // pixel
                // le plus à gauche X
                // le plus en bas Y
                // largeur du sprite L
                // hauteur du sprite H
                // de le feuille de spite correspondant a l element
                this.img = game.sprite.get(232, 11, 26, 26);
                break;
            case 1: // haie haute
                this.h = 31*5;
                this.y = 420;
                this.w = 25*5;
                this.img = game.sprite.get(268, 6, 26, 31);
                break;
            case 2: // haie double
                this.h = 26*5;
                this.y = 440;
                this.w = 31*5;
                this.img = game.sprite.get(305, 11, 31, 26);
            break;
        }
        this.createCollisionBoxes(this.randomDistance);
    }

    update(speed){
        this.x -= speed;
    }
    createCollisionBoxes(distanceOffset){
        for (let b of new CollisionBox(this.type,distanceOffset).getCollisionBoxes()){
            this.collisionBoxes.push(b);
        }
    }
    display(){
        image(this.img, this.x, this.y, this.w, this.h);
    }
}