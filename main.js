import GameScene from './src/Scenes/GameScene.js';
import TitleScene from './src/Scenes/TitleScene.js';

let config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 1000,
    parent: 'phaser-game',
    pixelArt: true,
    scene: [TitleScene, GameScene], // use global class
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

const game = new Phaser.Game(config);