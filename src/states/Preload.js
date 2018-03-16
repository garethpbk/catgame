class Preload extends Phaser.State {
  preload() {
    // load background image
    this.game.load.image("bg_clouds", "assets/tiles/bg_clouds.png");

    // load object/decoration sprites
    this.game.load.image("burst", "assets/objects/burst.png");
    this.game.load.image("laserburst", "assets/objects/laserburst.png");
    this.game.load.image("crate", "assets/objects/crate.png");
    this.game.load.image("tree-00", "assets/objects/tree-00.png");
    this.game.load.image("tree-01", "assets/objects/tree-01.png");
    this.game.load.image("tree-02", "assets/objects/tree-02.png");

    // load actor & object spritesheets
    this.game.load.spritesheet("cat", "assets/actors/thecat.png", 86, 65, 37);
    this.game.load.spritesheet("rat", "assets/actors/rat.png", 32, 20);
    this.game.load.spritesheet("bird", "assets/actors/bird.png", 43, 21);

    // load pickup sprites & spritesheets
    this.game.load.image("can", "assets/pickups/can.png");
    this.game.load.spritesheet("heli", "assets/pickups/heli.png", 46, 20);
    this.game.load.spritesheet("laser", "assets/pickups/laser.png", 26, 16);
    this.game.load.image("powercell", "assets/pickups/powercell.png");

    // load ui elements
    this.game.load.spritesheet("catlives", "assets/ui/catlives.png", 16, 16); // cat life heads
    this.game.load.image("nrg-bg", "assets/ui/nrg-bg.png"); // nrg bar background
    this.game.load.image("nrg-fill-heli", "assets/ui/nrg-fill-heli.png"); // blue heli nrg
    this.game.load.image("nrg-fill-laser", "assets/ui/nrg-fill-laser.png"); // red laser nrg

    // load main tilemap
    this.game.load.tilemap("tilemap", "assets/tiles/cattiles.json", null, Phaser.Tilemap.TILED_JSON);
    // load tile images
    this.game.load.image("ground_tiles", "assets/tiles/ground_tiles.png"); // Main ground tiles - DecorationLayer
    this.game.load.image("slope_tiles", "assets/tiles/arcade_slopes.png"); // Collision tiles - SlopeLayer
    this.game.load.image("bg_sky", "assets/tiles/bg_tile.png"); // Background image tile

    // load game music
    /* this.game.load.audio("jungle", "assets/audio/music/jungleexcessive.ogg"); */
    //this.game.load.audio("forest", "assets/audio/music/forest.ogg");
    this.game.load.audio("featherfall", "assets/audio/music/featherfall.mp3");
    // load game sounds
    this.game.load.audio("meow", "assets/audio/ruby-meow.ogg"); // Sitting down meow
    this.game.load.audio("laser", "assets/audio/laser-rifle.ogg"); // Laser firing with ammo
    this.game.load.audio("empty", "assets/audio/empty-click.wav"); // Laser firing empty
    this.game.load.audio("reload", "assets/audio/reload.ogg"); // Powercell pickup
  }

  create() {
    this.game.state.start("Setup");
  }
}

export default Preload;
