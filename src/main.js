
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
    scene: [ Load, Act1Scene1, gameOver, gameStart, ini ],  
    plugins: {
        scene: [
            { key: 'AnimatedTiles', plugin: window.AnimatedTiles, mapping: 'animatedTiles' }
        ]
    }
}

var cursors;
const SCALE = 2.0;
var my = {
    score: 0,
    timeLeft: 300,
    sprite: {},
    vfx: {}
};

const game = new Phaser.Game(config);