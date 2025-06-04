class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {

        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');

        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        this.load.image("man", "man.png");
        this.load.image("man_jump", "man_fall.png");
        this.load.image("man_walk1", "man_walk1.png");
        this.load.image("man_walk2", "man_walk2.png");
        this.load.image("NPC_L1", "Level1NPC.png");
        this.load.image("NPC_L2", "Level2NPC.png");
        this.load.image("enemy", "enemy.png");
        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");
        this.load.image("tilemap_base", "tilemap_packed_base.png");
        this.load.image("tilemap_food", "tilemap_packed_food.png");
        this.load.image("tilemap_rock", "rock_packed.png");
         // Packed tilemap
        this.load.tilemapTiledJSON("Level1", "Level_1.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Level2", "Level_2.tmj");   // Tilemap in JSON
        //this.load.tilemapTiledJSON("platformer-map", "TFR_Map.tmj");   // Tilemap in JSON
        //this.load.tilemapTiledJSON("platformer-map", "TFR_Map.tmj");   // Tilemap in JSON
        

        this.load.spritesheet("tilemap_base_sheet", "tilemap_packed_base.png", {
        frameWidth: 18,
        frameHeight: 18  
        });

        this.load.spritesheet("tilemap_base_sheet_2", "tilemap_packed.png", {
        frameWidth: 18,
        frameHeight: 18  
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.audio('walk', 'walk.mp3');
        this.load.audio('key', 'key.mp3');
        this.load.audio('hurt', 'hurt.mp3');
        this.load.audio('coin', 'coin.mp3');
        this.load.audio('door', 'door.mp3');
        this.load.audio('save', 'SP.mp3');
        this.load.audio('debuff', 'mushroom.mp3');
        
        this.load.audio('L1BGM', 'L1BGM.mp3');
        this.load.audio('gameOverL', 'gameOverL.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');
        //this.load.audio('debuff', 'mushroom.mp3');

    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'man_walk1' },
                { key: 'man_walk2' }
            ],
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [{ key: 'man' }],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [{ key: 'man_jump' }],
        });

         this.scene.start("gameOverL");
    }

    update() {
    }
}