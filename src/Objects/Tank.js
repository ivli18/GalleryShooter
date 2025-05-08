export default class Tank extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, delay = 0, texture = 'tankEnemy') {
        const start = path.getStartPoint();
        super(scene, path, start.x, start.y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(2, 2);
        const speed = 200;
        const duration = (path.getLength() / speed) * 1000;

        scene.time.delayedCall(delay, () => {
            this.startFollow({
                duration,
                repeat: -1,
                yoyo: true,
                rotateToPath: false,
                rotationOffset: -90
            });
        });
    }

    // Static helper to define reusable tank paths
    static generatePaths() {
        const paths = [];

        const path1 = new Phaser.Curves.Path(0, 500);
        path1.lineTo(100, 500);
        path1.lineTo(100, 900);
        path1.lineTo(300, 900);
        path1.lineTo(300, 500);
        path1.lineTo(500, 500);
        path1.lineTo(500, 900);
        path1.lineTo(700, 900);
        path1.lineTo(700, 500);

        const path2 = new Phaser.Curves.Path(0, 500);
        path2.lineTo(100, 500);
        path2.lineTo(700, 500);
        path2.lineTo(100, 500);
        path2.lineTo(700, 500);
        path2.lineTo(700, 700);
        path2.lineTo(100, 700);
        path2.lineTo(700, 700);
        path2.lineTo(100, 700);
        path2.lineTo(700, 700);

        const path3 = new Phaser.Curves.Spline([
            0, 500,
            100, 600,
            200, 500,
            300, 600,
            400, 500,
            500, 600,
            600, 500,
            700, 600
        ]);

        // Push Paths
        paths.push(path1, path2, path3);
        return paths;
    }
}
