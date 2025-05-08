import Tank from '../Objects/Tank.js';
import Shooter from '../Objects/Shooter.js';
import Twin from '../Objects/Twin.js';
import Pest from '../Objects/Pest.js';

class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("player", "PlayerShip.png");
        this.load.image("singleEnemy", "EnemySingle.png");
        this.load.image("tankEnemy", "EnemyTank.png");
        this.load.image("twinEnemy", "EnemyTwin.png");
        this.load.image("pestEnemy", "EnemyLong.png");
        this.load.atlasXML('sheet', 'sheet.png', 'sheet.xml');

        this.load.audio('laser', 'laserSmall_002.ogg');
        this.load.audio('shield', 'forceField_001.ogg');
        this.load.audio('defeat', 'explosionCrunch_003.ogg');
        this.load.audio('engine', 'spaceEngineLow_001.ogg');
        this.load.audio('explosion', 'lowFrequency_explosion_000.ogg');
    }

    init(){
        this.score = 0;
        this.isGameOver = false;
        this.lastHitTime = -1000;
        this.iFrameDuration = 500;
        this.playerHealth = 3;
        this.waveCount = 5;
        this.waveEnemiesTotal = 0;
        this.waveEnemiesAlive = 0;
        this.waveInProgress = false;
    }

    create() {
        this.player = this.physics.add.sprite(500, 900, "player").setScale(3, 3);
        this.player.body.setSize(this.player.width / 2, this.player.height / 2).setOffset(this.player.width / 4, this.player.height / 4);

        this.keys = this.input.keyboard.addKeys('A,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            padding: { top: 4, bottom: 4 }
        }).setDepth(1000);
        this.healthText = this.add.text(20, this.game.config.height - 80, `HP: ${this.playerHealth}`, {
            fontSize: '20px',
            color: '#ff0000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setDepth(1000);

        this.shield = this.physics.add.group({ runChildUpdate: true });
        this.activeShield = null;
        this.lastBlocked = -5000;

        this.shieldCooldownText = this.add.text(20, 950, 'READY', {
            fontSize: '20px',
            color: '#00ff00',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.shieldReadyShown = true;

        this.bullets = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();
        this.lastFired = 0;
        this.enemies = this.physics.add.group();

        const difficultyScale = 1;
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                this.enemies.getChildren().forEach(enemy => {
                    if (!enemy.active) return;

                    const chance = Phaser.Math.Between(0, 100);
                    if (chance < 70 * difficultyScale) return;

                    if (enemy instanceof Twin) {
                        const b1 = this.enemyBullets.create(enemy.x - 10, enemy.y + 10, 'sheet', 'laserGreen04.png');
                        const b2 = this.enemyBullets.create(enemy.x + 10, enemy.y + 10, 'sheet', 'laserGreen04.png');
                        b1.setVelocityY(300);
                        b2.setVelocityY(300);
                    } else if (enemy instanceof Shooter || enemy instanceof Pest) {
                        const b = this.enemyBullets.create(enemy.x, enemy.y + 10, 'sheet', 'laserGreen04.png');
                        b.setVelocityY(300);
                    }
                });
            }
        })

        const spawnTankWave = (count) => {
            const path = Phaser.Utils.Array.GetRandom(Tank.generatePaths());
            for (let i = 0; i < count; i++) {
                this.time.delayedCall(i * 300, () => {
                    const tank = new Tank(this, path, 0);
                    this.enemies.add(tank);
                });
            }
        };

        const spawnSingleWave = (count) => {
            const path = Phaser.Utils.Array.GetRandom(Shooter.generatePaths());
            for (let i = 0; i < count; i++) {
                this.time.delayedCall(i * 400, () => {
                    const shooter = new Shooter(this, path, 0);
                    this.enemies.add(shooter);
                });
            }
        };

        const spawnTwinWave = (count) => {
            const path = Phaser.Utils.Array.GetRandom(Shooter.generatePaths());
            for (let i = 0; i < count; i++) {
                this.time.delayedCall(i * 400, () => {
                    const twin = new Twin(this, path);
                    this.enemies.add(twin);
                });
            }
        };

        const spawnPestWave = (count) => {
            const path = Phaser.Utils.Array.GetRandom(Pest.generatePaths());
            for (let i = 0; i < count; i++) {
                this.time.delayedCall(i * 600, () => {
                    const pest = new Pest(this, path);
                    this.enemies.add(pest);
                });
            }
        };

        this.spawnRandomWave = () => {
            this.waveCount++;

            const tankAmount = 1 + Math.floor(this.waveCount / 5);
            const singleAmount = 2 + Math.floor(this.waveCount / 3);
            const twinAmount = 1 + Math.floor(this.waveCount / 4);
            const pestAmount = 2 + Math.floor(this.waveCount / 3);

            const options = [
                () => spawnTankWave(tankAmount),
                () => spawnSingleWave(singleAmount),
                () => spawnTwinWave(twinAmount),
                () => spawnPestWave(pestAmount)
            ];

            const chosen = Phaser.Utils.Array.GetRandom(options);
            chosen();

            this.waveEnemiesTotal = this.enemies.getChildren().length;
            this.waveEnemiesAlive = this.waveEnemiesTotal;
            this.waveInProgress = true;
        };

        this.spawnRandomWave();

        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            bullet.destroy();
            enemy.destroy();
            this.waveEnemiesAlive--;
            this.sound.play('explosion', { volume: 0.5 });
            this.score += 100;
            this.scoreText.setText(`Score: ${this.score}`);
        });

        this.physics.add.overlap(this.enemies, this.player, () => {
            const now = this.time.now;
            if (now - this.lastHitTime < this.iFrameDuration) return;
            this.lastHitTime = now;
            this.sound.play('defeat', { volume: 0.7 });
            this.tweens.add({
                targets: this.player,
                alpha: 0.3,
                yoyo: true,
                duration: 100,
                repeat: 2
            });
            this.playerHealth--;
            this.healthText.setText(`HP: ${this.playerHealth}`);
            if (this.playerHealth <= 0) {
                gameOver();
            }
        });

        this.physics.add.overlap(this.enemyBullets, this.player, () => {
            const now = this.time.now;
            if (now - this.lastHitTime < this.iFrameDuration) return;
            this.lastHitTime = now;
            this.sound.play('defeat', { volume: 0.7 });
            this.tweens.add({
                targets: this.player,
                alpha: 0.3,
                yoyo: true,
                duration: 100,
                repeat: 2
            });
            this.playerHealth--;
            this.healthText.setText(`HP: ${this.playerHealth}`);
            if (this.playerHealth <= 0) {
                gameOver();
            }
        });

        this.physics.add.overlap(this.enemyBullets, this.shield, (bullet, shieldInstance) => {
            bullet.destroy();
            if (shieldInstance === this.activeShield) {
                this.activeShield.destroy();
                this.activeShield = null;
                this.lastHitTime = this.time.now;
                this.tweens.add({
                    targets: this.player,
                    alpha: 0.3,
                    yoyo: true,
                    duration: 100,
                    repeat: 2
                });
            }
        });

        this.stars = this.add.group();
        this.time.addEvent({
            delay: 150,
            callback: () => this.spawnStar(),
            loop: true
        });

        this.spawnStar = function () {
            const starFrames = ['star1.png', 'star2.png'];
            const frame = Phaser.Utils.Array.GetRandom(starFrames);
            const x = Phaser.Math.Between(0, this.game.config.width);
            const y = -20;
            const star = this.add.image(x, y, 'sheet', frame);
            star.setScale(Phaser.Math.FloatBetween(0.5, 1));
            star.setAlpha(.3);
            star.setDepth(-1);
            this.stars.add(star);
            this.tweens.add({
                targets: star,
                y: this.game.config.height + 100,
                duration: Phaser.Math.Between(5000, 9000),
                onComplete: () => {
                    star.destroy();
                }
            });
        };

        const gameOver = () => {
            this.isGameOver = true;
            this.player.destroy();
            let storedHigh = parseInt(localStorage.getItem('highScore')) || 0;
            if (this.score > storedHigh) {
                localStorage.setItem('highScore', this.score);
            }
            this.scene.start('TitleScene');
            this.scene.start('TitleScene');            
            this.add.text(400, 400, 'Game Over', { fontSize: '48px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1000);
            this.add.text(400, 500, 'Click to Restart', {
                fontSize: '32px',
                color: '#0ff',
                fontStyle: 'bold'
            })
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(1000)
            .on('pointerdown', () => {
                this.scene.start('TitleScene');
            });
        };
        this.engineSound = this.sound.add('engine', {
            loop: true,
            volume: 0.15
        });
        this.engineSound.play();
    }

    update(time) {
        if (this.isGameOver) return;
        
        if (this.keys.A.isDown) {
            this.player.x -= 5;
        } else if (this.keys.D.isDown) {
            this.player.x += 5;
        }
        this.player.x = Phaser.Math.Clamp(this.player.x, this.player.displayWidth / 2, this.game.config.width - this.player.displayWidth / 2);

        if (this.activeShield) {
            this.activeShield.setPosition(this.player.x, this.player.y);
        }

        if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && time > this.lastBlocked + 5000) {
            this.lastBlocked = time;
            this.sound.play('shield');
            this.activeShield = this.shield.create(this.player.x, this.player.y - 30, 'sheet', 'shield1.png');
            this.activeShield.setDepth(1);
            this.time.delayedCall(1000, () => {
                if (this.activeShield) {
                    this.activeShield.destroy();
                    this.activeShield = null;
                }
            });
        }

        const cooldown = 5000;
        const elapsed = time - this.lastBlocked;
        const remaining = cooldown - elapsed;

        if (remaining <= 0) {
            this.shieldCooldownText.setText('READY');
            this.shieldCooldownText.setColor('#00ff00');
        } else {
            this.shieldCooldownText.setText(`BARRIER CD: ${(remaining / 1000).toFixed(1)}s`);
            this.shieldCooldownText.setColor('#888888');
        }

        if (this.spaceKey.isDown && time > this.lastFired + 400) {
            const bullet = this.bullets.create(this.player.x, this.player.y - 20, 'sheet', 'laserBlue01.png');
            bullet.setSize(8, 16).setOffset(2, 2);
            bullet.setVelocityY(-600);
            this.lastFired = time;
            this.sound.play('laser', { volume: 0.5 });
        }

        if (this.waveInProgress && this.waveEnemiesAlive <= this.waveEnemiesTotal * 0.2) {
            this.waveInProgress = false;
            this.time.delayedCall(1000, () => this.spawnRandomWave());
        }
    }
}

export default GameScene;
