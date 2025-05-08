import Shooter from './Shooter.js';

export default class Twin extends Shooter {
    constructor(scene, path = null, delay = 0, texture = 'twinEnemy') {
        super(scene, path, delay, texture);
    }

    shoot(bulletGroup) {
        const bullet1 = bulletGroup.create(this.x - 10, this.y + 10, 'sheet', 'laserRed01.png');
        const bullet2 = bulletGroup.create(this.x + 10, this.y + 10, 'sheet', 'laserRed01.png');
        bullet1.setVelocityY(200);
        bullet2.setVelocityY(200);
    }
}