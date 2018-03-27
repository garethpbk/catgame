import { createTransition } from 'phaser-state-transition';

class Menu extends Phaser.State {
  /* Menu state - as it sounds, this is the game menu */
  create() {
    // Add a couple of animated sprites - a menu and a start button
    this.menuFrame = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'frame');
    this.menuFrame.anchor.setTo(0.5);
    this.menuFrame.scale.setTo(4, 4);
    this.menuFrame.animations.add('frameCycle', [0, 1, 2], 6, true);
    this.menuFrame.animations.play('frameCycle');

    this.title = this.game.add.sprite(630, 234, 'title');
    this.title.anchor.setTo(0.5);

    this.startButton = this.game.add.sprite(640, 440, 'start-button');
    this.startButton.anchor.setTo(0.5);
    this.startButton.animations.add('startButtonCycle', [0, 1, 2], 12, true);
    this.startButton.animations.play('startButtonCycle');
    //Enable input on the start button, and listen for click event
    this.startButton.inputEnabled = true;
    this.startButton.events.onInputDown.add(startMain, this);

    function startMain() {
      // Called when the start button is clicked on

      const SlideLeftOut = {
        ease: Phaser.Easing.Exponential.InOut,
        duration: 2e3,
        intro: false,
        props: {
          x: function(game) {
            return -game.width;
          }
        }
      };

      this.game.state.start('Main', SlideLeftOut);
    }
  }
}

export default Menu;
