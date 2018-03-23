class Boot extends Phaser.State {
  /* Boot state - loads a few things, sets aspect scaling, continues to Preload */
  preload() {
    /**
     *  Loads two sprites early here for use in Preload: cat spritesheet & preloadBar
     *
     *  "cat" is also used later in Main to create the player sprite
     */

    this.game.load.spritesheet("cat", "assets/actors/thecat.png", 86, 65, 37);
    this.game.load.image("preloadBar", "assets/ui/nrg-loading.png");
  }

  create() {
    /* Keeps entire game area displayed and maintains original aspect ratio */
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    /*  Boot => Preload => Setup => Menu => Main => index.js  */
    this.game.state.start("Preload");
  }
}

export default Boot;
