class gameOverW extends Phaser.Scene {
    constructor() {
        super("gameOverW");
    }

    init(data) {
        this.targetScene = data?.target || 'X';          
        this.score = (data && typeof data.score === 'number') ? data.score : 0;
}

    create() {
        //music
        this.endingMusic = this.sound.add('gameOverW');
        this.endingMusic.play();

        //add player
        let player = this.add.sprite(500, 300, 'platformer_characters');
        player.play('walk');
        player.setScale(20);
        player.setOrigin(0.5);
        player.setFlipX(true); 


        this.add.text(220, 480, "Successful Escape!!!", {
            fontSize: '64px',
            fill: '#00FF00',
            fontFamily: 'Arial',
        });

        this.add.text(20, 650, "Press SPACE to PLAY AGAIN!!!", {
            fontSize: '23px',
            fill: '#fff',
            fontFamily: 'Arial'
        });

        this.keys = this.input.keyboard.addKeys({
            restart: 'SPACE'
        });

        this.events.once('shutdown', () => {
            this.sound.stopAll();
        });
        
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.restart)) {
            this.scene.start(this.targetScene, {
                score: 0,
                timeLeft: 300
            });
        }
    }
}