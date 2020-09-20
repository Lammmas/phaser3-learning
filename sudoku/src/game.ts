import 'phaser';

export default class Scene extends Phaser.Scene {
    constructor () {
      super('game');
    }

    preload () {
      //
    }

    create () {
      const style = { font: "bold 32px Arial", fill: "#000" };
      const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
      const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

      //  The Text is positioned at 0, 100
      const text = this.add.text(screenCenterX, screenCenterY, "Game time!", style);
      // offset so the screen's centre would be in the center of the text
      text.setOrigin(0.5);
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#FFF',
    width: 800,
    height: 600,
    scene: Scene
};

const game = new Phaser.Game(config);
