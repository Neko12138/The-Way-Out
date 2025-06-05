class gameStart extends Phaser.Scene {
    constructor() {
        super("gameStart");
    }

    preload() {

    }

    create() {

        this.bgm = this.sound.add("mainPageBGM", { loop: true });
        this.bgm.play();

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        let player = this.add.sprite(550, 250, 'platformer_characters');
        player.setScale(15);
        player.setOrigin(0.5);
        player.play('idle');
        player.setFlipX(true); 

        // title
        this.titleHunt = this.add.text(centerX - 290, centerY , 'THE WAY OUT', {
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontSize: '120px',
            color: '#FFD700', 
            align: 'center'
        });
        this.titleDuck = this.add.text(centerX + 230, centerY + 160, 'by Wade Xu', {
            fontFamily: 'Arial Black, sans-serif',
            fontSize: '40px',
            color: '#FFFFFF', 
            align: 'center'
        });


        this.events.on('shutdown', () => {
            if (this.bgm && this.bgm.isPlaying) {
                this.bgm.stop();
            }
        });

        // start game
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start("Act1Scene1"); 
        });

        // "start" text
        this.add.text(centerX, centerY + 300, 'Press SPACE to Start', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        
    }
}