class Act1SceneUnknown extends Phaser.Scene {
    constructor() {
        super("Act1SceneUnknown");
    }

    init(data) {
        // variables and settings
        this.ACCELERATION = 1500;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -365;
        this.SCALE = 2;
        this.canDoubleJump = false;
        this.PARTICLE_VELOCITY = 50;
        this.dialogueFinished = false;
        this.savepoint1 = 0;
        this.LevelH_keyCount = 0;
        this.LevelH_keyHas = false;
        this.score = (data && typeof data.score === 'number') ? data.score : 0;
        this.timeLeft = (data && typeof data.timeLeft === 'number') ? data.timeLeft : 300;
    }

    create() {
        ///////////////////////////////////////////////////////////////////Audio////////////////////////////////////////
        //music
        this.playingMusic = this.sound.add('LH_BGM');
        this.playingMusic.play();
        this.playingMusic.setVolume(0.5);

        //sound
        this.walkSound = this.sound.add('walk');
        this.walkSoundPlaying = false;

        this.keySound = this.sound.add('key');
        this.keySoundPlaying = false;

        this.coinSound = this.sound.add('coin');
        this.coinSoundPlaying = false;

        this.hurtSound = this.sound.add('hurt');
        this.hurtSoundPlaying = false;

        this.saveSound = this.sound.add('save');
        this.saveSoundPlaying = false;

        this.debuffSound = this.sound.add('debuff');
        this.debuffSoundPlaying = false;

        /////////////////////////////////////////////////////////////////////////////Create Object(or anything)/////////////////////////////////////////

        ///The Map
        
        this.map = this.make.tilemap({ key: "Level_H" });

        let tileset1 = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        let tileset2 = this.map.addTilesetImage("tilemap_packed_base", "tilemap_base");
        let tileset3 = this.map.addTilesetImage("tilemap_packed_food", "tilemap_food");
        let tileset4 = this.map.addTilesetImage("rock_packed", "tilemap_rock");

        let tilesets = [tileset1, tileset2, tileset3, tileset4];

        this.groundLayer = this.map.createLayer("Layer_1", tilesets, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.backgroundLayer = this.map.createLayer("Layer_0", tilesets, 0, 0);

        this.animatedTiles.init(this.map);    

        ///Object that player can get 

        //the door !have to before set up player!
        this.door = this.map.createFromObjects("obj", {
            name: "door",
            key: "tilemap_base_sheet_2",
            frame: 28
        });
        this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);

        //key
        this.key = this.map.createFromObjects("obj", {
            name: "key",
            key: "tilemap_base_sheet",
            frame: 27
        });
        this.physics.world.enable(this.key, Phaser.Physics.Arcade.STATIC_BODY);
        this.keyGroup = this.add.group(this.key);

        //coins
        this.coins = this.map.createFromObjects("obj", {
            name: "coin",
            key: "tilemap_base_sheet",
            frame: 151
        });
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        //set up savePoint
        this.savePoint = { x: 76, y: 32};

        //NPC data create

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.savePoint.x, this.savePoint.y, "man").setScale(1.5);
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.body.setMaxVelocity(150, 500); 

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        
        this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        /////////////////////////////////////////////////////////////////////World Setting///////////////////////////////////////////////////

        // cam edge
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels * 1.0, this.map.heightInPixels * 1.0);
        this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0.1);

        // world edge
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * 2.0, this.map.heightInPixels * 2.0);

        //item
        
        //key
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            obj2.destroy(); 
            this.keySound.play();

            this.LevelH_keyCount++;

            if (this.LevelH_keyCount >= 3) {
                this.LevelH_keyHas = true;
            }

            this.score += 100; 
            this.scoreText.setText('Score: ' + this.score); 
        });

        //coin
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.coinSound.play();
            this.coinSoundPlaying = true;
            obj2.destroy(); 

            this.score += 50; 
            this.scoreText.setText('Score: ' + this.score); 
        });

        //Door
        this.physics.add.overlap(my.sprite.player, this.door, (obj1, obj2) => {
            if (this.LevelH_keyHas) {
                this.sound.stopAll();
                this.scene.start('Transfer', {
                    target: 'Act1Scene3',
                    location: 'Main Entrance',
                    score: this.score,
                    timeLeft: this.timeLeft,
                });
            }
        });

        //vfx
        my.vfx = {}; 
        
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['star_01.png', 'star_02.png' ],
            random: true, 
            scale: {start: 0.03, end: 0.06},
            maxAliveParticles: 100,
            lifespan: 150,

            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['circle_03.png' ],
            scale: {start: 0.03, end: 0.1},
            maxAliveParticles: 1,
            lifespan: 350,

            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.jumping.stop();


        ////////////////////////////////////////////////////////////////////////UI SETting///////////////////////////////////////////

        //create UI Layer
        this.uiLayer = this.add.container(0, 0);

        //Score
        this.scoreText = this.add.text(10, 10, 'Score: 0', {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: { x: 10, y: 5 },
            backgroundColor: '#00000066'
        });
        this.uiLayer.add(this.scoreText);

        // make main cameras ignore UI
        this.cameras.main.ignore(this.uiLayer);

        // create a UI camera
        this.uiCamera = this.cameras.add(0, 0, game.config.width, game.config.height);

        // make camera ignore map
        this.uiCamera.ignore(this.groundLayer);
        this.uiCamera.ignore(this.backgroundLayer);

        // make camera ignore things other than UI
        this.uiCamera.ignore(my.sprite.player);
        this.uiCamera.ignore(this.keyGroup);
        this.uiCamera.ignore(this.door);
        this.uiCamera.ignore(this.coinGroup);
        this.uiCamera.ignore([my.sprite.player, my.vfx.walking, my.vfx.jumping]);

        this.score += 1000; 
        this.scoreText.setText('Score: ' + this.score); 
    }

    update() {

        //player move
        if(cursors.left.isDown) {

            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-1, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

            if (my.sprite.player.body.blocked.down && !this.walkSoundPlaying) {
                this.walkSound.play({ loop: true });
                this.walkSoundPlaying = true;
            }

        } else if(cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-15, my.sprite.player.displayHeight/2-1, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

            if (my.sprite.player.body.blocked.down && !this.walkSoundPlaying) {
                this.walkSound.play({ loop: true });
                this.walkSoundPlaying = true;
            }

        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            if (my.sprite.player.body.blocked.down) {
                my.sprite.player.anims.play('idle');
            }
            my.vfx.walking.stop(); 
            my.vfx.jumping.stop();

            if (this.walkSoundPlaying) {
                this.walkSound.stop();
                this.walkSoundPlaying = false;
            }
        }

        // player jump
        if (my.sprite.player.body.blocked.down) {
            this.canDoubleJump = true; // reset doubleJump
        }


        if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
            if (my.sprite.player.body.blocked.down) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                my.vfx.walking.stop();  
                my.sprite.player.anims.play('jump', true);
                if (this.walkSoundPlaying) {
                    this.walkSound.stop();
                    this.walkSoundPlaying = false;
                }               
            } else if (this.canDoubleJump) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.canDoubleJump = false;
                my.vfx.jumping.emitParticleAt(my.sprite.player.x, my.sprite.player.y);
                my.vfx.walking.stop(); 
            }
        }
        
    }

}