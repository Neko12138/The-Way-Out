class Act1Scene3 extends Phaser.Scene {
    constructor() {
        super("Act1Scene3");
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
        this.score = (data && typeof data.score === 'number') ? data.score : 0;
        this.timeLeft = (data && typeof data.timeLeft === 'number') ? data.timeLeft : 300;
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

        this.hurtSound = this.sound.add('hurt');
        this.hurtSoundPlaying = false;

        this.saveSound = this.sound.add('save');
        this.saveSoundPlaying = false;

        this.debuffSound = this.sound.add('debuff');
        this.debuffSoundPlaying = false;

        /////////////////////////////////////////////////////////////////////////////Create Object(or anything)/////////////////////////////////////////

        ///The Map
        
        this.map = this.make.tilemap({ key: "Level_3" });

        let tileset1 = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");
        let tileset2 = this.map.addTilesetImage("tilemap_packed_base", "tilemap_base");
        let tileset3 = this.map.addTilesetImage("tilemap_packed_food", "tilemap_food");
        let tileset4 = this.map.addTilesetImage("rock_packed", "tilemap_rock");

        let tilesets = [tileset1, tileset2, tileset3, tileset4];

        this.groundLayer = this.map.createLayer("Layer_1", tilesets, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.backgroundLayer = this.map.createLayer("Layer_0", tilesets, 0, 0);

        this.animatedTiles.init(this.map);    

        // BOSS creat
        this.boss = this.physics.add.sprite(10320, 215, 'boss');  
        this.boss.flipX = true;
        this.boss.setScale(0.5);                                 
        //this.boss.setVelocityX(-50);              
        this.boss.setVelocityX(-2500);                   
        this.boss.setImmovable(true);
        this.boss.body.allowGravity = false;                      
        this.boss.body.setSize(this.boss.width, this.boss.height); // 可选：根据图像大小设置碰撞箱
        

        ///Object that player can get 

        //the door !have to before set up player!
        this.door = this.map.createFromObjects("obj", {
            name: "door",
            key: "tilemap_base_sheet_2",
            frame: 44
        });
        this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);

        //save point flag
        this.SaveP1 = this.map.createFromObjects("obj", {
            name: "SP1",
            key: "tilemap_base_sheet",
            frame: 112
        });
        this.physics.world.enable(this.SaveP1, Phaser.Physics.Arcade.STATIC_BODY);
        this.saveGroup = this.add.group(this.SaveP1);


        //set up savePoint
        //下面为初始出生点
        //this.savePoint = { x: 10392, y: 348};
        //下面是测试出生点
        //this.savePoint = { x: 10027, y: 338};
        this.savePoint = { x: 427, y: 338};
        //NPC data create

        // set up NPCavatar
        this.npc = this.physics.add.staticSprite(10194, 348, 'NPC_L3').setScale(0.04);

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
                this.dialogueBox.setPosition(131, 1902);
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

        this.physics.add.overlap(my.sprite.player, this.boss, () => {
            this.sound.stopAll();
            this.scene.start('gameOverL', {
                target: 'Act1Scene3'
            });
        }, null, this);

        //item


        //save point
        this.physics.add.overlap(my.sprite.player, this.saveGroup, (player, savePoint) => {
            this.savePoint = { x: savePoint.x, y: savePoint.y };
            this.saveSound.play();
        });


        //Door
        this.physics.add.overlap(my.sprite.player, this.door, (obj1, obj2) => {
            this.sound.stopAll();
            this.scene.start('gameOverW', {
                target: 'gameStart',
                score: this.score,
            });
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

        ////////////////////////////////////////////////////////////////////////UI SETting////////////////////////////////////////////////////////////////

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


        // count down
        this.timerEvent = this.time.addEvent({
            delay: 300,
            callback: () => {
                this.score ++; 
                this.scoreText.setText('Score: ' + this.score); 
            },
            callbackScope: this,
            loop: true
        });

        // make main cameras ignore UI
        this.cameras.main.ignore(this.uiLayer);

        // create a UI camera
        this.uiCamera = this.cameras.add(0, 0, game.config.width, game.config.height);

        // make camera ignore map
        this.uiCamera.ignore(this.groundLayer);
        this.uiCamera.ignore(this.backgroundLayer);

        // make camera ignore things other than UI
        this.uiCamera.ignore(my.sprite.player);
        this.uiCamera.ignore(this.door);
        this.uiCamera.ignore(this.SaveP1);
        this.uiCamera.ignore(this.npc);
        this.uiCamera.ignore(this.dialogueBox);
        this.uiCamera.ignore(this.boss);
        this.uiCamera.ignore([my.sprite.player, my.vfx.walking, my.vfx.jumping]);
    }

    update() {
        if (this.boss.x < 495) {
            this.boss.setVelocityX(0);
        }
        //posit get (test only)
        console.log(my.sprite.player.x, my.sprite.player.y)
        //console.log('Score:', this.score);

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


        // check play if on water
        let playerBottom = my.sprite.player.getBottomCenter();
        let playerTile = this.backgroundLayer.getTileAtWorldXY(playerBottom.x, playerBottom.y + 1, true);

        //move player back to respawn
        if (playerTile && playerTile.properties.pWater) {
            my.sprite.player.setPosition(this.savePoint.x, this.savePoint.y);
            my.sprite.player.body.setVelocity(0, 0); 
        }

        
    }

}