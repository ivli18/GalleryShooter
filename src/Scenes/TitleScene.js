class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    preload() {
        this.load.setPath('./assets/');
        this.load.atlasXML('sheet', 'sheet.png', 'sheet.xml');
        this.load.image('player', 'PlayerShip.png');
    }

    create() {
        // STARFIELD
        this.stars = this.add.group();
        this.time.addEvent({
            delay: 75,
            callback: () => this.spawnStar(),
            loop: true
        });
 
        // TITLE TEXT
        this.add.text(400, 200, 'Invaders of\nSpace(?)', {
            fontSize: '64px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold italic',
            padding: {
                left: 40,
                right: 40
            },
            align: 'center',
            
        }).setOrigin(0.5).setDepth(1);

        this.add.text(400, 400, 'Press SPACE to Start', {
            fontSize: '32px',
            color: '#00ffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1);

        // SPACE TO START
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // HIGH SCORE
        let storedHighScore = localStorage.getItem('highScore') || 0;
        this.highScore = parseInt(storedHighScore);
        this.add.text(400, 500, `High Score: ${this.highScore}`, {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start('GameScene');
        }
    }

    spawnStar = function () {
        const starFrames = ['star1.png', 'star2.png'];
        const frame = Phaser.Utils.Array.GetRandom(starFrames);
        const x = Phaser.Math.Between(0, this.game.config.width);
        const y = -20;
        const star = this.add.image(x, y, 'sheet', frame);
        star.setScale(Phaser.Math.FloatBetween(0.5, 1));
        star.setAlpha(.7);
        star.setDepth(-1);
        this.stars.add(star);
        this.tweens.add({
            targets: star,
            y: this.game.config.height + 100,
            duration: Phaser.Math.Between(2000, 5000),
            onComplete: () => {
                star.destroy();
            }
        });
    };
}

export default TitleScene;
