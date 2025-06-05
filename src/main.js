
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    width: 1024,
    height: 768,
    scene: [ ini, Load, Transfer, Act1Scene1, Act1Scene2, Act1Scene3, Act1SceneUnknown, gameOverL, gameOverW, gameStart,  ],  
    plugins: {
        scene: [
            { key: 'AnimatedTiles', plugin: window.AnimatedTiles, mapping: 'animatedTiles' }
        ]
    }
}

var cursors;
const SCALE = 2.0;
var my = {
    sprite: {},
    vfx: {}
};

const game = new Phaser.Game(config);