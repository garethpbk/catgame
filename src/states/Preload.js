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
    this.game.multiplier = 64;
    /** SETUP - STYLES, INITIAL VARS, ETC */

    // set the default text style for messages
    this.game.textStyle = {
      font: "28px Indie Flower",
      fontWeight: "800",
      fill: "white",
      align: "center",
      stroke: "black",
      strokeThickness: "5"
    };

    this.game.bigTextStyle = {
      font: "48px Indie Flower",
      fontWeight: "800",
      fill: "red",
      align: "center",
      stroke: "black",
      strokeThickness: "10"
    };

    // set initial score to 0
    this.game.score = 0;

    // set remaining rats to 0
    this.game.remainingRats = 0;

    // set initial # of lives to 9, because this is a game about a cat
    //// this value keeps track of how many lives are remaining, thus var - it will be reassigned
    this.game.lives = 9;
    // empty array for storing life game objects
    this.game.gameLives = [];
    // set initial life to 0
    this.game.currentLife = 0;

    /** LEVEL DATA */

    // ledge template constructor - for moving platforms
    class Ledge {
      constructor(
        name,
        startX,
        startY,
        maxX,
        maxY,
        minX,
        minY,
        moveX,
        moveY,
        scaleX,
        scaleY,
        sprite,
        cycle,
        spriteObj
      ) {
        this.name = name;
        this.startX = startX;
        this.startY = startY;
        this.maxX = maxX;
        this.maxY = maxY;
        this.minX = minX;
        this.minY = minY;
        this.moveX = moveX;
        this.moveY = moveY;
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.sprite = sprite;
        this.cycle = cycle;
        this.spriteObj = spriteObj;
      }
    }

    //hold all platform game objects
    this.game.allLedges = [];

    //first ledge
    this.game.ledgeOne = new Ledge(
      "ledgeOne",
      15 * this.game.multiplier,
      8 * this.game.multiplier,
      0,
      1450,
      0,
      700,
      false,
      true,
      3,
      1,
      "crate",
      true,
      null
    );
    this.game.allLedges.push(this.game.ledgeOne);

    /** PICKUPS AKA POWERUPS */

    // pickup template constructor
    class Pickup {
      constructor(
        name,
        have,
        nrgBar,
        maxNrg,
        currentNrg,
        nrgFill,
        nrgObj,
        startX,
        startY,
        sprite,
        gravityY,
        bounceY,
        scale,
        animation,
        spriteObj,
        msg
      ) {
        this.name = name;
        this.have = have;
        this.nrgBar = nrgBar;
        this.maxNrg = maxNrg;
        this.currentNrg = currentNrg;
        this.nrgFill = nrgFill;
        this.nrgObj = nrgObj;
        this.startX = startX;
        this.startY = startY;
        this.sprite = sprite;
        this.gravityY = gravityY;
        this.bounceY = bounceY;
        this.scale = scale;
        this.animation = animation;
        this.spriteObj = spriteObj;
        this.msg = msg;
      }
    }

    // holds all created pickups
    this.game.allPickups = [];

    // catcopter pickup
    this.game.theHeli = new Pickup(
      "heli",
      false,
      { barX: 1008, barY: 50, fillX: 1011, fillY: 53, fillSprite: "nrg-fill-heli" },
      194,
      194,
      0,
      "",
      1 * this.game.multiplier,
      1 * this.game.multiplier,
      /* 36 * this.game.multiplier,
      27 * this.game.multiplier, */
      "heli",
      400,
      0.1,
      { x: 1, y: 1 },
      { name: "rotate", frames: [0, 1, 2], fps: 15, loop: true },
      null,
      "You're now a catcopter!"
    );
    this.game.allPickups.push(this.game.theHeli);

    // laser eyes pickup
    this.game.theLaser = new Pickup(
      "laser",
      false,
      { barX: 1008, barY: 75, fillX: 1011, fillY: 78, fillSprite: "nrg-fill-laser" },
      194,
      194,
      0,
      "",
      52 * this.game.multiplier,
      2 * this.game.multiplier,
      "laser",
      0,
      0.1,
      { x: 2, y: 3 },
      { name: "laze", frames: [0, 1, 2], fps: 15, loop: true },
      null,
      "Lazer Eyes!"
    );
    this.game.allPickups.push(this.game.theLaser);

    /** CONTROLS */
    this.game.keys = this.game.input.keyboard.createCursorKeys();
    this.game.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.game.fKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

    this.game.state.start("Main");
  }
}

export default Preload;
