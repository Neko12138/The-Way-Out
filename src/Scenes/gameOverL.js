class gameOverL extends Phaser.Scene {
    constructor() {
        super("gameOverL");
    }

    init(data) {

    }

    create() {
        //music
        this.endingMusic = this.sound.add('gameOverL');
        this.endingMusic.play();

        //add player
        let player = this.add.sprite(500, 300, 'man');
        player.setScale(20);
        player.setOrigin(0.5);
        player.setFlipX(true); 

        this.add.text(450, 100, "死", {
            fontSize: '64px',
            fill: '#f00',
            fontFamily: 'Arial',
        });

        this.add.text(420, 480, "DIED", {
            fontSize: '64px',
            fill: '#f00',
            fontFamily: 'Arial',
        });

        this.add.text(20, 650, "Press SPACE to RESTART!!!", {
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
            this.scene.start("Act1Scene1", {
                score: 0,
                timeLeft: 300
            });
        }
    }
}