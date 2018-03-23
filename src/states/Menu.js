class Menu extends Phaser.State {
  create() {
    this.menuFrame = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "frame");
    this.menuFrame.anchor.setTo(0.5);
    this.menuFrame.scale.setTo(4, 4);
    this.menuFrame.animations.add("frameCycle", [0, 1, 2], 6, true);
    this.menuFrame.animations.play("frameCycle");

    //this.game.state.start("Main");
  }
}

export default Menu;
