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
        this.dialogueFinished = false;
        this.savepoint1 = 0;
        this.keyCount = 0;
    }

    create() {
        ///////////////////////////////////////////////////////////////////Audio////////////////////////////////////////
        //music
        //this.playingMusic = this.sound.add('playing');
        //this.playingMusic.play();
        //this.playingMusic.setVolume(0.5);

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
        
        this.map = this.make.tilemap({ key: "Level1" });

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

        //save point flag
        this.SaveP1 = this.map.createFromObjects("obj", {
            name: "SP1",
            key: "tilemap_base_sheet",
            frame: 112
        });
        this.physics.world.enable(this.SaveP1, Phaser.Physics.Arcade.STATIC_BODY);

        //debuff mushroom
        this.b_mushroom = this.map.createFromObjects("obj", {
            name: "b_mushroom",
            key: "tilemap_base_sheet",
            frame: 128
        });
        this.physics.world.enable(this.b_mushroom, Phaser.Physics.Arcade.STATIC_BODY);

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
        this.savePoint = { x: game.config.width/8 - 55, y: game.config.height/4 + 150};

        //NPC data create

        // set up NPCavatar
        this.npc = this.physics.add.staticSprite(100, 347, 'NPC_L1').setScale(0.04).setFlipX(true);

        this.npc.body.setSize(this.npc.width * 0.04, this.npc.height * 0.04);
        this.npc.body.setOffset(290, 410); 

        // text data & status
        this.dialogue = [
            "Hellow, there [SPACE]",
            "Join The Helldiver[SPACE]",
            "Protect the Super Earth![SPACE]",
        ];
        this.dialogueIndex = 0;
        this.inDialogue = false;

        // create Text
        this.dialogueBox = this.add.text(0, 0, "", {
            fontSize: '10px',
            fill: '#ffffff',
            padding: { x: 10, y: 5 },
            wordWrap: { width: 300 }
        }).setDepth(100).setVisible(false);

        // the enemies
        this.enemies = this.physics.add.group();
        this.spawnEnemy(500, 350);

        //The player

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

        // find & set deadWater
        this.pWaterTiles = [];

        this.backgroundLayer.forEachTile(tile => {
            if (tile.properties.pWater) {
                this.pWaterTiles.push(tile);
            }
        });

        //NPC setting

        // emit dialogue
        this.physics.add.overlap(my.sprite.player, this.npc, () => {
            if (!this.inDialogue && !this.dialogueFinished) {
                this.inDialogue = true;
                this.dialogueIndex = 0;
                this.dialogueBox.setText(this.dialogue[this.dialogueIndex]);
                this.dialogueBox.setPosition(26.5, 312);
                this.dialogueBox.setVisible(true);
            }
        }, null, this);

        // space for next sentence
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.inDialogue) {
                this.dialogueIndex++;
                if (this.dialogueIndex >= this.dialogue.length) {
                    this.dialogueBox.setVisible(false);
                    this.inDialogue = false;
                    this.dialogueFinished = true; 
                } else {
                    this.dialogueBox.setText(this.dialogue[this.dialogueIndex]);
                }
            }
        });

        //enemy collision
        this.physics.add.collider(this.enemies, this.groundLayer, (enemy) => {
            if (enemy.body.blocked.left) {
                enemy.setVelocityX(50);
                enemy.setFlipX(false);
            } else if (enemy.body.blocked.right) {
                enemy.setVelocityX(-50);
                enemy.setFlipX(true);
            }
        });

        this.physics.add.overlap(my.sprite.player, this.enemies, (player, enemy) => {
            this.hurtSound.play();
            my.sprite.player.setPosition(this.savePoint.x, this.savePoint.y);
            this.enemies.remove(enemy, true, true); 
        });

        //item
        
        //key
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            obj2.destroy(); 
            this.keySound.play();

            this.keyCount++;

            if (this.keyCount >= 3) {
                this.hasKey = true;
            }
        });

        //coin
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.coinSound.play();
            this.coinSoundPlaying = true;
            obj2.destroy(); 
        });

        //save point
        this.physics.add.overlap(my.sprite.player, this.SaveP1, (obj1, obj2) => {
            this.savePoint = { x: obj2.x, y: obj2.y};
            if (this.savepoint1 === 0) {
                this.saveSound.play();
                this.savepoint1 = 1;
            }
            
        });

        //debuff
        this.physics.add.overlap(my.sprite.player, this.b_mushroom, (obj1, obj2) => {
            obj2.destroy(); 
            obj1.setPosition(this.savePoint.x, this.savePoint.y);
            my.sprite.player.body.setVelocity(0, 0); 
            this.debuffSound.play();
            this.debuffSoundPlaying = true;
        });

        //Door
        this.physics.add.overlap(my.sprite.player, this.door, (obj1, obj2) => {
            if (this.hasKey) {
                
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
            my.sprite.player.setPosition(this.savePoint.x, this.savePoint.y);
            my.sprite.player.body.setVelocity(0, 0); 
        }


        this.enemies.children.iterate((enemy) => {
            if (enemy && enemy.body) {
                if (enemy.body.blocked.left) {
                    enemy.setVelocityX(50);
                    enemy.setFlipX(false); 
                } else if (enemy.body.blocked.right) {
                    enemy.setVelocityX(-50);
                    enemy.setFlipX(true);  
                }
            }
        });

        
    }

    spawnEnemy(x, y) {
            let enemy = this.enemies.create(x, y, 'man').setScale(1.5).setCollideWorldBounds(true);
            enemy.setVelocityX(50);
            enemy.setBounce(0);
            enemy.setImmovable(true);
            enemy.setFlipX(true);
        }
}