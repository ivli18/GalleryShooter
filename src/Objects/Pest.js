export default class Pest extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, delay = 0, texture = 'pestEnemy') {
        const start = path.getStartPoint();
        super(scene, path, start.x, start.y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(1.5, 1.5);
        this.body.setSize(24, 20).setOffset(6, 6);

        // Movement
        const speed = 300;
        const duration = (path.getLength() / speed) * 1000;

        this.startFollow({
            duration,
            repeat: -1,
            yoyo: true,
            rotateToPath: true,
            rotationOffset: -90
        });
    }

    static generatePaths() {
        const paths = [];
        const path1 = new Phaser.Curves.Spline([
            100, 300,
            200, 350,
            300, 300,
            400, 350,
            500, 300,
            600, 350,
            700, 300,
            700, 400,
            600, 350,
            500, 400,
            400, 350,
            300, 400,
            200, 350,
            100, 400
        ]);
    

        const path2 = new Phaser.Curves.Spline([
            100, 500,
            175, 560,
            250, 600,
            325, 560,
            400, 500,
            475, 440,
            550, 400,
            625, 440,
            700, 500,
            625, 560,
            550, 600,
            475, 560,
            400, 500,
            325, 440,
            250, 400,
            175, 440,
            100, 500
        ]);
        paths.push(path1, path2);
        return paths;
    }
}
