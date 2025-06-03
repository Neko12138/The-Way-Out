class Transfer extends Phaser.Scene {
    constructor() {
        super('Transfer'); // 场景 key 也是 transfer
    }

    init(data) {
        this.targetScene = data?.target || 'X';          
        this.locationName = data?.location || 'XXX';    
        this.score = (data && typeof data.score === 'number') ? data.score : 0;
        this.timeLeft = (data && typeof data.timeLeft === 'number') ? data.timeLeft : 300;
    }
    create() {
        const { width, height } = this.scale;

        this.player = this.add.sprite(width / 2, height / 2 - 50, 'player'); 
        this.player.setScale(10);
        this.player.play('walk'); 

        // “Heading to XXX”
        this.add.text(width / 2, height / 2 + 50, `Heading to ${this.locationName}`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // “Loading...”
        const loadingText = this.add.text(width - 20, height - 20, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(1);

        this.tweens.add({
            targets: loadingText,
            alpha: { from: 1, to: 0 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        // transit in 3s
        this.time.delayedCall(3000, () => {
            this.scene.start(this.targetScene, {
                score: this.score,
                timeLeft: this.timeLeft
            });
        });
    }
}