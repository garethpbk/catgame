class Preload extends Phaser.State {
  /* Preload state - Here we load all of the game assets and include a preload animation & loading bar */
  preload() {
    /**
     *  Load the cat object and sprite for showing in preload
     *
     *  Actual player sprite is loaded later in Main
     *
     *  This one is locally scoped for clarity/preference
     *
     *  Sprite is destroyed at state change so this.game.theCat works as well, does not conflict with Main this.game.theCat
     *
     */
    this.theCat = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'cat');
    this.theCat.anchor.setTo(0.5);
    /* This animation also has to be re-declared in Main for the player sprite */
    this.theCat.animations.add('right', [11, 12, 13, 14, 15, 16], 15, true);
    this.theCat.animations.play('right');

    /* Add the preloadBar sprite and set as preloadBar - scoped locally, don't need to acces it elsewhere */
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 150, 'preloadBar');
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);

    /* Add the menu graphics */
    this.game.load.spritesheet('frame', 'assets/ui/frame-sm.png', 320, 160, 3, 0, 0);
    this.game.load.spritesheet('start-button', 'assets/ui/start-button.png', 500, 100, 3, 0, 0);
    this.game.load.image('title', 'assets/ui/title.png');

    /* Load the sky & cloud background image - lives in /tiles but might move it  */
    this.game.load.image('bg_clouds', 'assets/tiles/bg_clouds.png');

    /* Load effects sprites */
    this.game.load.image('burst', 'assets/objects/burst.png'); // Appears when an enemy overlaps with the cat
    this.game.load.image('laserburst', 'assets/objects/laserburst.png'); // Appears when the laser overlaps with an enemy
    this.game.load.image('crate', 'assets/objects/crate.png'); // Decorative sprite, currently used for the moving platform texture
    this.game.load.image('tree-00', 'assets/objects/tree-00.png'); // Trees 1, 2, 3...placeholder from OpenGameArt; they're nice though
    this.game.load.image('tree-01', 'assets/objects/tree-01.png');
    this.game.load.image('tree-02', 'assets/objects/tree-02.png');

    /* Load enemy spritesheets */
    this.game.load.spritesheet('rat', 'assets/actors/rat.png', 32, 20);
    this.game.load.spritesheet('bird', 'assets/actors/bird.png', 43, 21);

    /* Load pickup & item spritesheets and images */
    this.game.load.image('can', 'assets/pickups/can.png');
    this.game.load.spritesheet('heli', 'assets/pickups/heli.png', 46, 20);
    this.game.load.spritesheet('laser', 'assets/pickups/laser.png', 26, 16); // The laser pickup & fire sprite, appears in front of cat when F pressed
    this.game.load.image('powercell', 'assets/pickups/powercell.png');

    /* Load UI elements */
    this.game.load.spritesheet('catlives', 'assets/ui/catlives.png', 16, 16); // Cat heads, used as life counters - has an alive and a dead frame
    this.game.load.image('nrg-bg', 'assets/ui/nrg-bg.png'); // NRG Bar background for heli and laser NRG bars - is grey, #383838
    this.game.load.image('nrg-fill-heli', 'assets/ui/nrg-fill-heli.png'); // NRG Bar fill for heli - is blue, #433aff
    this.game.load.image('nrg-fill-laser', 'assets/ui/nrg-fill-laser.png'); // NRG Bar fill for laser - is red, #ff1c1c

    /**
     * Load main tilemap for the game - currently there's only one, but plan is to have 3 levels, each which will have their own tilemap
     *
     * Using TILED (http://www.mapeditor.org/) to create tile layouts; it generates the JSON that's included here - HIGHLY RECOMMENDED
     */
    this.game.load.tilemap('tilemap', 'assets/tiles/cattiles.json', null, Phaser.Tilemap.TILED_JSON);
    /* Load image assets for the tiles */
    this.game.load.image('ground_tiles', 'assets/tiles/ground_tiles.png'); // Main ground tiles - DecorationLayer
    this.game.load.image('slope_tiles', 'assets/tiles/arcade_slopes.png'); // Collision tiles - SlopeLayer

    /**
     * Load game music, for the current level - plan is to have 3 music loops, one for each level
     *
     * Currently using 'Featherfall' from the Ancient Aliens (DOOM wad, not TV show) OST, by Stuart Rynn - listen to it!  Buy it!  It's great!
     * https://stuartrynn.bandcamp.com/album/doom-ancient-aliens-ost
     */
    this.game.load.audio('featherfall', 'assets/audio/music/featherfall.mp3');
    /* Load game sound effects */
    this.game.load.audio('meow', 'assets/audio/ruby-meow.ogg'); // Meow, recorded from my cat Ruby
    this.game.load.audio('laser', 'assets/audio/laser-rifle.ogg'); // Laser firing - https://opengameart.org/content/laser-rifle - a powerful boom
    this.game.load.audio('empty', 'assets/audio/empty-click.wav'); // Laser empty - https://freesound.org/people/KlawyKogut/sounds/154934/ - a click
    this.game.load.audio('reload', 'assets/audio/reload.ogg'); // Powercell pickup - https://freesound.org/people/nioczkus/sounds/396331/ - satisfying
  }

  create() {
    /* Boot <= Preload => Setup => Menu => Main => index.js */
    this.game.state.start('Setup');
  }
}

export default Preload;
