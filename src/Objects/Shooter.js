export default class Shooter extends Phaser.GameObjects.PathFollower {
    constructor(scene, path, delay = 0, texture = 'singleEnemy') {
        const start = path.getStartPoint();
        super(scene, path, start.x, start.y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setSize(20, 20);
        this.body.setOffset(6, 6)
        this.setScale(2, 2);
        const speed = 250;
        const duration = (path.getLength() / speed) * 1000;

        this.startFollow({
            duration,
            repeat: -1,
            yoyo: true,
            rotateToPath: false,
            rotationOffset: -90
        });
    }    

    static generatePaths() {
        const paths = [];

        const path1 = new Phaser.Curves.Spline([
            0, 50,
            100, 50,
            300, 150,
            500, 50,
            700, 150,
            700, 250,
            500, 350,
            300, 250,
            100, 350,
            100, 450,
            300, 550,
            500, 450
        ]);

        const path2 = new Phaser.Curves.Spline([
            0, 50,
            700, 50,
            700, 250,
            100, 250,
            100, 450,
            700, 450
        ]);

        const path3 = new Phaser.Curves.Path(0,50)
        path3.lineTo(100, 50);
        path3.lineTo(220, 250);
        path3.lineTo(340, 50);
        path3.lineTo(460, 250);
        path3.lineTo(580, 50);
        path3.lineTo(700, 250);
        path3.lineTo(100, 250);
        path3.lineTo(220, 450);
        path3.lineTo(340, 250);
        path3.lineTo(460, 450);
        path3.lineTo(580, 250);
        path3.lineTo(700, 450);


        // Push Paths
        paths.push(path1, path2, path3);
        return paths;
    }

    static mirrorX(points) {
        return points.map(([x, y]) => [800-x, y]);
    }
}
