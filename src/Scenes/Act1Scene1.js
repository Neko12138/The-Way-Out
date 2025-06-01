class Act1Scene1 extends Phaser.Scene {
    constructor() {
        super("Act1Scene1");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 1500;
        this.DRAG = 2000;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -365;
        this.SCALE = 2;
        this.canDoubleJump = false;
        this.PARTICLE_VELOCITY = 50;
        this.hasKey = false;
        this.hasDiamond = false;
        this.hasMushroom = false;
    }

    create() {
        //music
        //this.playingMusic = this.sound.add('playing');
        //this.playingMusic.play();
        //this.playingMusic.setVolume(0.5);

        //this.bg = this.add.image(100, 150, "background_img").setOrigin(0).setScrollFactor(0);
        //this.bg.setDisplaySize(this.scale.width / 1.5, this.scale.height / 1.6);
        this.map = this.make.tilemap({ key: "platformer-map" });

        let tileset1 = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        let tileset2 = this.map.addTilesetImage("tilemap_packed_base", "tilemap_base");
        let tileset3 = this.map.addTilesetImage("tilemap_packed_food", "tilemap_food");
        let tileset4 = this.map.addTilesetImage("rock_packed", "tilemap_rock");

        let tilesets = [tileset1, tileset2, tileset3, tileset4];

        // Create a layer
        this.groundLayer = this.map.createLayer("Layer_1", tilesets, 0, 0);
        //this.groundLayer.setScale(2.0);
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.backgroundLayer = this.map.createLayer("Layer_0", tilesets, 0, 0);
        //this.backgroundLayer.setScale(2.0);



        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/8, game.config.height/4, "man").setScale(2);
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

        // cam edge
        this.cameras.main.setZoom(this.SCALE);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels * 1.0, this.map.heightInPixels * 1.0);
        this.cameras.main.startFollow(my.sprite.player, true, 0.1, 0.1);

        // world edge
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * 2.0, this.map.heightInPixels * 2.0);

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

        //sound
        this.walkSound = this.sound.add('walk');
        this.walkSoundPlaying = false;



    }

    update() {
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
            // TODO: set acceleration to 0 and have DRAG take over
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


        // check play if on water
        let playerBottom = my.sprite.player.getBottomCenter();
        let playerTile = this.backgroundLayer.getTileAtWorldXY(playerBottom.x, playerBottom.y + 1, true);

        //move player back to respawn
        if (playerTile && playerTile.properties.pWater) {
            my.sprite.player.setPosition(this.spawnPoint.x, this.spawnPoint.y);
            my.sprite.player.body.setVelocity(0, 0); 
        }


    }
}