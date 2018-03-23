class Menu extends Phaser.State {
  create() {
    this.menuFrame = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "frame");
    this.menuFrame.anchor.setTo(0.5);
    this.menuFrame.scale.setTo(4, 4);
    this.menuFrame.animations.add("frameCycle", [0, 1, 2], 6, true);
    this.menuFrame.animations.play("frameCycle");

    this.title = this.game.add.sprite(630, 234, "title");
    this.title.anchor.setTo(0.5);

    this.startButton = this.game.add.sprite(640, 440, "start-button");
    this.startButton.anchor.setTo(0.5);
    this.startButton.animations.add("startButtonCycle", [0, 1, 2], 12, true);
    this.startButton.animations.play("startButtonCycle");
    this.startButton.inputEnabled = true;
    this.startButton.events.onInputDown.add(startMain, this);

    function startMain() {
      this.game.state.start("Main");
    }
  }
}

export default Menu;
