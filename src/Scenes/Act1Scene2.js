class Act1Scene2 extends Phaser.Scene {
    constructor() {
        super("Act1Scene2");
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
        this.Level2_keyCount = 0;
        this.Level2_keyHas = false;
        this.score = typeof my.score === 'number' ? my.score : 0;
        this.timeLeft = typeof my.timeLeft === 'number' ? my.timeLeft : 300;
        this.armUp = false;
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
        
        this.map = this.make.tilemap({ key: "Level2" });

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

        //armor
        this.armor = this.map.createFromObjects("obj", {
            name: "armor",
            key: "tilemap_base_sheet_2",
            frame: 60
        });
        this.physics.world.enable(this.armor, Phaser.Physics.Arcade.STATIC_BODY);

        //save point flag
        this.SaveP1 = this.map.createFromObjects("obj", {
            name: "SP1",
            key: "tilemap_base_sheet",
            frame: 112
        });
        this.physics.world.enable(this.SaveP1, Phaser.Physics.Arcade.STATIC_BODY);

        //H mushroom
        this.h_mushroom = this.map.createFromObjects("obj", {
            name: "H_mushroom",
            key: "tilemap_base_sheet",
            frame: 108
        });
        this.physics.world.enable(this.h_mushroom, Phaser.Physics.Arcade.STATIC_BODY);
        
        //H Enter
        this.h_Enter = this.map.createFromObjects("obj", {
            name: "Enter",
            key: "tilemap_base_sheet_2",
            frame: 41
        });
        this.physics.world.enable(this.h_Enter, Phaser.Physics.Arcade.STATIC_BODY);

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
        //下面为初始出生点
        //this.savePoint = { x: 76, y: 1932};
        //下面是测试出生点
        this.savePoint = { x: 456, y: 960};
        //NPC data create

        // set up NPCavatar
        this.npc = this.physics.add.staticSprite(185, 1932, 'NPC_L2').setScale(0.04).setFlipX(true);

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
        this.spawnEnemy(73, 1590);
        this.spawnEnemy(271, 866);
        this.spawnEnemy(355, 1230);
        this.spawnEnemy(111, 438);
        this.spawnEnemy(297, 438);
        this.spawnEnemy(342, 366);
        this.spawnEnemy(142, 366);
        this.spawnEnemy(214, 294);

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
            if (!this.armUp) {
                my.sprite.player.setPosition(this.savePoint.x, this.savePoint.y);
            }
            this.enemies.remove(enemy, true, true); 
        });

        //item
        
        //key
        this.physics.add.overlap(my.sprite.player, this.keyGroup, (obj1, obj2) => {
            obj2.destroy(); 
            this.keySound.play();

            this.Level2_keyCount++;

            if (this.Level2_keyCount >= 3) {
                this.Level2_keyHas = true;
                this.savePoint = { x: 154, y: 125};
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

        //save point
        this.physics.add.overlap(my.sprite.player, this.SaveP1, (obj1, obj2) => {
            this.savePoint = { x: obj2.x, y: obj2.y};
            if (this.savepoint1 === 0) {
                this.saveSound.play();
                this.savepoint1 = 1;
            }
            
        });

        //h enter
        this.physics.add.overlap(my.sprite.player, this.h_Enter, (obj1, obj2) => {
            //this.scene.start("Act1SceneUnknown");
            
        });

        //debuff
        this.physics.add.overlap(my.sprite.player, this.h_mushroom, (obj1, obj2) => {
            obj2.destroy(); 
            const bgText1 = this.add.text(60, 850, "↓ FAKE！", {
            fontFamily: "Arial",
            fontSize: "12px",
            color: "#FFFFFF",
            wordWrap: { width: 300 }
            }).setOrigin(0); 
        });

        //armor
        this.physics.add.overlap(my.sprite.player, this.armor, (obj1, obj2) => {
            obj2.destroy(); 
            console.log('real')
            this.armUp = true;
        });

        //Door
        this.physics.add.overlap(my.sprite.player, this.door, (obj1, obj2) => {
            if (this.Level2_keyHas) {
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

        // Timer Text 
        this.timerText = this.add.text(game.config.width - 150, 10, 'Time: 300', {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            padding: { x: 10, y: 5 },
            backgroundColor: '#00000066'
        });
        this.uiLayer.add(this.timerText);

        // count down
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);

                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.timerEvent.remove(); 
                }
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
        this.uiCamera.ignore(this.enemies);
        this.uiCamera.ignore(this.keyGroup);
        this.uiCamera.ignore(this.door);
        this.uiCamera.ignore(this.coinGroup);
        this.uiCamera.ignore(this.SaveP1);
        this.uiCamera.ignore(this.h_mushroom);
        this.uiCamera.ignore(this.h_Enter);
        this.uiCamera.ignore(this.npc);
        this.uiCamera.ignore(this.dialogueBox);
        this.uiCamera.ignore(this.armor);
        this.uiCamera.ignore([my.sprite.player, my.vfx.walking, my.vfx.jumping]);
    }

    update() {
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

        //enemy move
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