const game = new Phaser.Game(1280, 640, Phaser.AUTO, "game-area", {
  preload: preload,
  create: create,
  update: update
});

function preload() {
  // load background image
  game.load.image("bg_clouds", "assets/tiles/bg_clouds.png");

  // load object/decoration sprites
  game.load.image("burst", "assets/objects/burst.png");
  game.load.image("laserburst", "assets/objects/laserburst.png");
  game.load.image("crate", "assets/objects/crate.png");
  game.load.image("tree-00", "assets/objects/tree-00.png");

  // load actor & object spritesheets
  game.load.spritesheet("cat", "assets/actors/thecat.png", 86, 65, 37);
  game.load.spritesheet("rat", "assets/actors/rat.png", 32, 20);

  // load pickup sprites & spritesheets
  game.load.image("can", "assets/pickups/can.png");
  game.load.spritesheet("heli", "assets/pickups/heli.png", 46, 20);
  game.load.spritesheet("laser", "assets/pickups/laser.png", 26, 16);
  game.load.image("powercell", "assets/pickups/powercell.png");

  // load ui elements
  game.load.spritesheet("catlives", "assets/ui/catlives.png", 16, 16); // cat life heads
  game.load.image("nrg-bg", "assets/ui/nrg-bg.png"); // nrg bar background
  game.load.image("nrg-fill-heli", "assets/ui/nrg-fill-heli.png"); // blue heli nrg
  game.load.image("nrg-fill-laser", "assets/ui/nrg-fill-laser.png"); // red laser nrg

  // load main tilemap
  game.load.tilemap("tilemap", "assets/tiles/cattiles.json", null, Phaser.Tilemap.TILED_JSON);
  // load tile images
  game.load.image("ground_tiles", "assets/tiles/ground_tiles.png"); // Main ground tiles - DecorationLayer
  game.load.image("slope_tiles", "assets/tiles/arcade_slopes.png"); // Collision tiles - SlopeLayer
  game.load.image("bg_sky", "assets/tiles/bg_tile.png"); // Background image tile

  // load game music
  /* game.load.audio("jungle", "assets/audio/music/jungleexcessive.ogg"); */
  /* game.load.audio("forest", "assets/audio/music/forest.ogg");
  game.load.audio("featherfall", "assets/audio/music/featherfall.mp3"); */
  // load game sounds
  game.load.audio("meow", "assets/audio/ruby-meow.ogg"); // Sitting down meow
  game.load.audio("laser", "assets/audio/laser-rifle.ogg"); // Laser firing with ammo
  game.load.audio("empty", "assets/audio/empty-click.wav"); // Laser firing empty
  game.load.audio("reload", "assets/audio/reload.ogg"); // Powercell pickup
}

/** SETUP - STYLES, INITIAL VARS, ETC */

// set the default text style for messages
const textStyle = {
  font: "28px Indie Flower",
  fontWeight: "800",
  fill: "white",
  align: "center",
  stroke: "black",
  strokeThickness: "5"
};

// set initial score to 0
var score = 0;

// set initial # of lives to 9, because this is a game about a cat
//// this value keeps track of how many lives are remaining, thus var - it will be reassigned
var lives = 9;
// empty array for storing life game objects
const gameLives = [];
// set initial life to 0
var currentLife = 0;

/** LEVEL DATA */

// ledges: data for moving platforms
function ledge(posX, posY, scaleX, scaleY, moveX, moveY, maxX, minX, maxY, minY) {}
const ledges = [
  { x: 75, y: 51, scaleX: 3, scaleY: 1, moveX: false, moveY: true, maxX: 0, minX: 0, maxY: 400, minY: 85 }
];
// empty array for storing rendered moving platform game objects
const drawnLedges = [];

/** PICKUPS AKA POWERUPS */

// pickup template constructor
function pickup(
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
  spriteObj
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
}

// holds all created pickups
const allPickups = [];

// catcopter pickup
const theHeli = new pickup(
  "heli",
  false,
  { barX: 1008, barY: 50, fillX: 1011, fillY: 53, fillSprite: "nrg-fill-heli" },
  194,
  194,
  0,
  "",
  100,
  300,
  "heli",
  400,
  0.1,
  { x: 1, y: 1 },
  { name: "rotate", frames: [0, 1, 2], fps: 15, loop: true }
);
allPickups.push(theHeli);

// laser eyes pickup
const theLaser = new pickup(
  "laser",
  false,
  { barX: 1008, barY: 75, fillX: 1011, fillY: 78, fillSprite: "nrg-fill-laser" },
  194,
  194,
  0,
  "",
  200,
  300,
  "laser",
  0,
  0.1,
  { x: 2, y: 3 },
  { name: "laze", frames: [0, 1, 2], fps: 15, loop: true }
);
allPickups.push(theLaser);

// create each pickup item - laser and heli
function addPickups() {
  allPickups.forEach(function(pickup) {
    const thePickup = game.add.sprite(pickup.startX, pickup.startY, pickup.sprite);
    game.physics.arcade.enable(thePickup);
    game.slopes.enable(thePickup);
    thePickup.enableBody = true;
    thePickup.scale.setTo(pickup.scale.x, pickup.scale.y);
    thePickup.body.gravity.y = pickup.gravityY;
    thePickup.body.bounce.y = pickup.bounceY;
    thePickup.animations.add(
      pickup.animation.name,
      pickup.animation.frames,
      pickup.animation.fps,
      pickup.animation.loop
    );
    thePickup.animations.play(pickup.animation.name);
    pickup.spriteObj = thePickup;
  });
}

/** ACTORS - ENEMIES AND THE LIKE */

// rats: data for rat enemies
const rats = [{ x: 1600, y: 400, direction: "left", dead: false }, { x: 650, y: 325, direction: "right", dead: false }];
// empty array for storing rendered rat game objects
const drawnRats = [];

// function to draw UI elements - lives, nrg bars
function drawUi() {
  allPickups.forEach(function(pickup) {
    const nrgBg = game.add.sprite(pickup.nrgBar.barX, pickup.nrgBar.barY, "nrg-bg");
    nrgBg.fixedToCamera = true;
    nrgBg.width = 200;

    const nrgFill = game.add.sprite(pickup.nrgBar.fillX, pickup.nrgBar.fillY, pickup.nrgBar.fillSprite);
    nrgFill.fixedToCamera = true;
    nrgFill.width = 0;
    nrgFill.height = nrgFill.height - 6;
    pickup.nrgObj = nrgFill;
  });

  // add lives counter and draw a head for each
  for (i = 0; i < lives; i++) {
    const newHead = game.add.sprite(1000 + 25 * i, 25, "catlives");
    newHead.frame = 0;
    newHead.fixedToCamera = true;
    gameLives.push(newHead);
  }
}

function create() {
  // draw main tiling cloud background
  var bg_clouds = game.add.tileSprite(0, 0, 18048, 640, "bg_clouds");
  // set background to scroll
  bg_clouds.autoScroll(25, 0);

  // start ARCADE physics engine
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.plugins.add(Phaser.Plugin.ArcadeSlopes);
  game.slopes.preferY = true;

  //theTree = game.add.sprite(200, 150, "tree-00");
  //theTree.scale.setTo(2, 2);

  // add main tilemap
  map = game.add.tilemap("tilemap");
  // use the ground_tiles.png ('tiles') image for the tilemap
  map.addTilesetImage("ground_tiles", "ground_tiles");

  // add collision tiles
  map.addTilesetImage("arcade_slopes", "slope_tiles");
  slopeLayer = map.createLayer("SlopeLayer");
  game.slopes.convertTilemapLayer(slopeLayer, "arcadeslopes", 65);
  slopeLayer.alpha = 0;

  // draw the ground layer - contains surfaces that define the level geometry
  //groundLayer = map.createLayer("GroundLayer");
  // draw the decoration layer - things that don't have collision but are still part of terrain
  decorationLayer = map.createLayer("DecorationLayer");
  // draw the rat bounds layer - contains data to tell rats where to collide and switch direction
  ratBounds = map.createLayer("RatBounds");

  // set collision for both map layers so that it's available to define more specifically later
  //map.setCollisionBetween(1, 64, true, groundLayer);
  map.setCollisionBetween(65, 102, true, slopeLayer);
  map.setCollisionBetween(1, 64, true, ratBounds);

  // make the ratBounds tiles invisible
  ratBounds.alpha = 0;

  // set world size to match size of groundLayer
  decorationLayer.resizeWorld();

  // add and play the main background music
  //music = game.add.audio("featherfall");
  /* music.play(); */
  //music.loop = true;
  // add the meow sound effect for use later
  meowClip = game.add.audio("meow");
  // add the laser sound effect for use later
  laserRifle = game.add.audio("laser");
  // add empty gun sound effect
  emptyClick = game.add.audio("empty");
  // add reload sound effect
  reloadLaser = game.add.audio("reload");

  // add score counter and set it to follow camera
  theScore = game.add.text(25, 25, score, textStyle);
  theScore.fixedToCamera = true;

  platforms = game.add.group();
  game.physics.arcade.enable(platforms);
  platforms.enableBody = true;

  /* var ground = platforms.create(0, game.world.height - 64, 'ground_jungle');
    ground.scale.setTo(game.width / 512, 0.5);
    ground.body.immovable = true; */

  ledges.forEach(function(ledge) {
    var newLedge = platforms.create(ledge.x, ledge.y, "crate", 6);
    newLedge.scale.setTo(ledge.scaleX, ledge.scaleY);
    newLedge.body.immovable = true;
    newLedge.moveX = ledge.moveX;
    newLedge.moveY = ledge.moveY;
    newLedge.maxX = ledge.maxX;
    newLedge.minX = ledge.minX;
    newLedge.maxY = ledge.maxY;
    newLedge.minY = ledge.minY;
    drawnLedges.push(newLedge);
  });

  enemies = game.add.group();
  game.physics.arcade.enable(enemies);
  enemies.enableBody = true;

  rats.forEach(function(rat) {
    var newRat = enemies.create(rat.x, rat.y, "rat");
    newRat.body.gravity.y = 300;
    newRat.body.collideWorldBounds = true;
    newRat.animations.add("moveLeft", [0, 1, 2], 15, true);
    newRat.animations.add("moveRight", [3, 4, 5], 15, true);
    newRat.direction = rat.direction;
    game.slopes.enable(newRat);
    drawnRats.push(newRat);
  });

  theCan = game.add.sprite(500, 100, "can");
  game.physics.arcade.enable(theCan);
  game.slopes.enable(theCan);
  theCan.enableBody = true;
  theCan.body.gravity.y = 400;
  theCan.body.bounce.y = 0.5;

  theCell = game.add.sprite(400, 300, "powercell");
  game.physics.arcade.enable(theCell);
  game.slopes.enable(theCell);
  theCell.body.gravity.y = 400;

  theCat = game.add.sprite(125, game.world.height - 200, "cat");
  game.physics.arcade.enable(theCat);
  theCat.body.setSize(48, 64, 18, 0);
  game.slopes.enable(theCat);
  theCat.body.gravity.y = 400;
  theCat.body.bounce.y = 0.1;
  theCat.body.collideWorldBounds = true;
  theCat.frame = 36;

  theCat.animations.add("idleLeft", [0, 1], 5, true);
  theCat.animations.add("left", [2, 3, 4, 5, 6, 7], 15, true);
  theCat.animations.add("heliLeft", [18, 19, 20, 21, 22, 23], 10, true);
  theCat.animations.add("idleHeliLeft", [24, 25, 26], 10, true);

  theCat.animations.add("idleRight", [9, 10], 5, true);
  theCat.animations.add("right", [11, 12, 13, 14, 15, 16], 15, true);
  theCat.animations.add("heliRight", [27, 28, 29, 30, 31, 32], 10, true);
  theCat.animations.add("idleHeliRight", [33, 34, 35], 10, true);

  drawUi();
  addPickups();

  keys = game.input.keyboard.createCursorKeys();

  game.camera.follow(theCat);
}

var direction;
var cycle = true;

function update() {
  //game.debug.body(theCat);
  //slopeLayer.debug = true;

  allPickups.forEach(function(pickup) {
    game.physics.arcade.collide(pickup.spriteObj, slopeLayer);
  });
  //var catCollideGround = game.physics.arcade.collide(theCat, groundLayer);
  var catCollideSlopes = game.physics.arcade.collide(theCat, slopeLayer);
  //var ratCollideGround = game.physics.arcade.collide(drawnRats, groundLayer);
  var ratCollideSlopes = game.physics.arcade.collide(drawnRats, slopeLayer);
  //var canCollideGround = game.physics.arcade.collide(theCan, groundLayer);
  var canCollideSlopes = game.physics.arcade.collide(theCan, slopeLayer);
  //var heliCollideGround = game.physics.arcade.collide(theHeli, groundLayer);
  var heliCollideSlopes = game.physics.arcade.collide(theHeli, slopeLayer);
  //var laserCollideGround = game.physics.arcade.collide(theLaser, groundLayer);
  var laserCollideSlopes = game.physics.arcade.collide(theLaser, slopeLayer);
  //var cellCollideGround = game.physics.arcade.collide(theCell, groundLayer);
  var cellCollideSlopes = game.physics.arcade.collide(theCell, slopeLayer);

  var catCollidePlatforms = game.physics.arcade.collide(theCat, platforms);

  var ratCollideBounds = game.physics.arcade.collide(drawnRats, ratBounds);

  drawnLedges.forEach(function(ledge) {
    if (ledge.moveY) {
      if (cycle) {
        ledge.body.velocity.y += 2;
        if (ledge.y > ledge.maxY) {
          ledge.body.velocity.y = 0;
          cycle = false;
        }
      } else if (!cycle) {
        ledge.body.velocity.y -= 2;
        if (ledge.y < ledge.minY) {
          ledge.body.velocity.y = 0;
          cycle = true;
        }
      }
    }
  });

  theScore.setText(score);

  drawnRats.forEach(function(rat) {
    var bLeft = rat.body.blocked.left;
    var bRight = rat.body.blocked.right;
    var biteCat = game.physics.arcade.overlap(theCat, rat, biteTheCat, null, this);
    var killRat = game.physics.arcade.overlap(theLaser.spriteObj, rat, killARat, null, this);

    if (rat.direction === "left" && !rat.dead) {
      rat.body.velocity.x = -50;
      rat.animations.play("moveLeft");
      if (bLeft) {
        rat.direction = "right";
        rat.body.velocity.x = 50;
        rat.animations.play("moveRight");
      }
    }
    if (rat.direction === "right" && !rat.dead) {
      rat.body.velocity.x = 50;
      rat.animations.play("moveRight");
      if (bRight) {
        rat.direction = "left";
        rat.body.velocity.x = -50;
        rat.animations.play("moveLeft");
      }
    }
    if (rat.alpha === 0) {
      rat.kill();
    }
  });

  var getCan = game.physics.arcade.overlap(theCat, theCan, collectCan, null, this);
  var getHeli = game.physics.arcade.overlap(theCat, theHeli.spriteObj, collectHeli, null, this);
  var getLaser = game.physics.arcade.overlap(theCat, theLaser.spriteObj, collectLaser, null, this);
  var getCell = game.physics.arcade.overlap(theCat, theCell, collectCell, null, this);

  var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  var fKey = game.input.keyboard.addKey(Phaser.Keyboard.F);

  theCat.body.velocity.x = 0;
  if (direction === "right") {
    theCatXOffset = 16;
  } else if (direction === "left") {
    theCatXOffset = 0;
  }

  /* if (theCat.body.blocked.down && !catCollideGround) {
    catIsDown();
  } */

  if (theCat.body.y === 576) {
    catIsDown();
  }

  if (keys.left.isDown && !spaceKey.isDown) {
    isSitting = false;
    direction = "left";
    theCat.body.velocity.x = -240;
    if (theCat.body.onFloor() || theCat.body.touching.down) {
      theCat.animations.play("left");
    } else {
      theCat.frame = 2;
    }
  }
  if (!keys.left.isDown && !spaceKey.isDown && !isSitting && direction === "left") {
    theCat.animations.play("idleLeft");
  }

  if (keys.right.isDown && !spaceKey.isDown) {
    isSitting = false;
    direction = "right";
    theCat.body.velocity.x = 240;
    if (theCat.body.onFloor() || theCat.body.touching.down) {
      theCat.animations.play("right");
    } else {
      theCat.frame = 11;
    }
  }
  if (!keys.right.isDown && !spaceKey.isDown && !isSitting && direction === "right") {
    theCat.animations.play("idleRight");
  }

  if (keys.up.isDown && !isSitting) {
    if (theCat.body.onFloor() && catCollideSlopes) {
      theCat.body.velocity.y = -250;
    } else if (theCat.body.touching.down) {
      theCat.body.velocity.y = -250;
    }
  }

  var heliNrgRatio = theHeli.currentNrg / theHeli.maxNrg;

  keys.down.onDown.add(sitCat);
  if (isSitting && theHeli.have) {
    if (theHeli.currentNrg <= theHeli.maxNrg) {
      theHeli.currentNrg++;
      theHeli.nrgObj.width = heliNrgRatio * theHeli.maxNrg;
    }
  }

  if (theHeli.have && theHeli.currentNrg) {
    if (spaceKey.isDown && theCat.frame != 36) {
      isSitting = false;
      theCat.body.velocity.y = -100;
      theHeli.currentNrg--;
      theHeli.nrgObj.width = heliNrgRatio * theHeli.maxNrg;

      if (!keys.left.isDown && !keys.right.isDown) {
        if (direction === "left") {
          theCat.animations.play("idleHeliLeft");
        } else if (direction === "right") {
          theCat.animations.play("idleHeliRight");
        }
      }

      if (keys.left.isDown && !keys.right.isDown) {
        flyLeft();
      }
      if (keys.right.isDown && !keys.left.isDown) {
        flyRight();
      }
    }
  }

  if (fKey.isDown && theLaser.have) {
    if (direction === "left") {
      shootLaser("left");
    } else if (direction === "right") {
      shootLaser("right");
    }
  }
}

var laserDelay = 0;
function shootLaser(direction) {
  laser = theLaser.spriteObj;
  if (game.time.now > laserDelay && theLaser.currentNrg) {
    laser.alpha = 1;
    laserRifle.play();
    theLaser.currentNrg -= 48.5;
    theLaser.nrgObj.width = theLaser.currentNrg;
    if (direction === "right") {
      laser.x = theCat.x + 70;
      laser.y = theCat.y + 20;
      laser.scale.setTo(3, 2);
    }
    if (direction === "left") {
      laser.x = theCat.x + 20;
      laser.y = theCat.y + 20;
      laser.scale.setTo(-3, 2);
    }
    game.add.tween(laser).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 1000);
    laserDelay = game.time.now + 2000;
  } else if (game.time.now > laserDelay) {
    emptyClick.play();
    var msgX = Math.floor(theCat.x + theCat.width / 2);
    var msgY = Math.floor(theCat.y + theCat.height / 2);
    var msg = game.add.text(msgX, msgY, "Empty!", textStyle);
    msg.anchor.set(0.5);
    msg.lifespan = 1500;
    laserDelay = game.time.now + 2000;
  }
}

function flyLeft() {
  theCat.body.velocity.x = -120;
  theCat.animations.play("heliLeft");
}

function flyRight() {
  theCat.body.velocity.x = 120;
  theCat.animations.play("heliRight");
}

var isSitting = false;

function sitCat() {
  if (theCat.body.onFloor()) {
    isSitting = true;
    theCat.animations.stop(null, false);

    if (direction === "right") {
      sayMeow("right");
      theCat.frame = 17;
    } else {
      sayMeow("left");
      theCat.frame = 8;
    }
  }
}

var meowDelay = 0;
function sayMeow(direction) {
  if (game.time.now > meowDelay) {
    var meowStyle = textStyle;
    var meow, meowX, meowY;
    if (direction === "right") {
      meowX = theCat.x + 50;
    } else if (direction === "left") {
      meowX = theCat.x - 50;
    }
    meowY = theCat.y - 25;
    meow = game.add.text(meowX, meowY, "Meooow!", meowStyle);
    meow.lifespan = 1000;

    meowClip.play();
    meowDelay = game.time.now + 1500;
  }
}

function collectCan(cat, can) {
  can.kill();
  var msgX = Math.floor(theCat.x + theCat.width / 2);
  var msgY = Math.floor(theCat.y + theCat.height / 2);
  var msg = game.add.text(msgX, msgY, "You got the food!", textStyle);
  msg.anchor.set(0.5);
  msg.lifespan = 1500;
  score++;
}

function collectHeli(cat, heli) {
  heli.kill();
  var msgX = Math.floor(theCat.x + theCat.width / 2);
  var msgY = Math.floor(theCat.y + theCat.height / 2);
  var msg = game.add.text(msgX, msgY, "You're now a CatCopter!", textStyle);
  msg.anchor.set(0.5);
  msg.lifespan = 1500;
  theHeli.nrgObj.width = theHeli.maxNrg;
  theHeli.have = true;
}

function collectLaser(cat, laser) {
  if (!theLaser.have) {
    laser.x = 0;
    laser.y = 0;
    laser.alpha = 0;
    var msgX = Math.floor(theCat.x + theCat.width / 2);
    var msgY = Math.floor(theCat.y + theCat.height / 2);
    var msg = game.add.text(msgX, msgY, "Lazer Eyes!", textStyle);
    msg.anchor.set(0.5);
    msg.lifespan = 1500;
    theLaser.nrgObj.width = theLaser.maxNrg;
    theLaser.have = true;
  }
}

var cellDelay = 0;
function collectCell(cat, cell) {
  if (theLaser.have) {
    var msgX = Math.floor(theCat.x + theCat.width / 2);
    var msgY = Math.floor(theCat.y + theCat.height / 2);
    if (game.time.now > cellDelay) {
      if (theLaser.nrgObj.width === theLaser.maxNrg) {
        var msg = game.add.text(msgX, msgY, "Ammo full!", textStyle);
        msg.anchor.set(0.5);
        msg.lifespan = 1500;
      }
    }
    if (theLaser.nrgObj.width != theLaser.maxNrg) {
      cell.kill();
      reloadLaser.play();
      var msg = game.add.text(msgX, msgY, "Got Powercell!", textStyle);
      theLaser.currentNrg = theLaser.maxNrg;
      theLaser.nrgObj.width = theLaser.maxNrg;
      msg.anchor.set(0.5);
      msg.lifespan = 1500;
    }
    cellDelay = game.time.now + 1500;
  }
}

var biteDelay = 0;
function biteTheCat(cat, rat) {
  if (game.time.now > biteDelay && rat.alpha === 1) {
    var colX = (cat.x + rat.x) / 2;
    var burst = game.add.sprite(colX, rat.y, "burst");
    burst.lifespan = 500;
    var msgX = Math.floor(theCat.x + theCat.width / 2);
    var msgY = Math.floor(theCat.y + theCat.height / 2);
    var msg = game.add.text(msgX, msgY, "Ouch!", textStyle);
    msg.anchor.set(0.5);
    msg.lifespan = 500;

    if (lives > 0) {
      var thisLife = gameLives[currentLife];
      thisLife.frame = 1;
      var lifeMsg = game.add.text(theCat.x, 500, 8 - currentLife + " lives remaining...", textStyle);
      lifeMsg.lifespan = 1500;
      currentLife++;
      lives--;
    }

    biteDelay = game.time.now + 1500;
  }
}

var burstDelay = 0;
function killARat(laser, rat) {
  rat.dead = true;
  if (game.time.now > burstDelay) {
    var laserBurst = game.add.sprite(rat.x, rat.y, "laserburst");
    laserBurst.lifespan = 1000;
  }
  game.add.tween(rat).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
  burstDelay = game.time.now + 1500;
}

function catIsDown() {
  theCat.x = 125;
  theCat.y = game.world.height - 200;
  if (lives > 0) {
    var thisLife = gameLives[currentLife];
    thisLife.frame = 1;
    var lifeMsg = game.add.text(theCat.x, 500, 8 - currentLife + " lives remaining...", textStyle);
    lifeMsg.lifespan = 1500;
    currentLife++;
    lives--;
  }
}
