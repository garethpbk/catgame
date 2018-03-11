var game = new Phaser.Game(1280, 640, Phaser.AUTO, "game-area", {
  preload: preload,
  create: create,
  update: update
});

function preload() {
  // load background image
  game.load.image("bg_clouds", "assets/tiles/bg_clouds.png");

  // load object sprites
  game.load.image("can", "assets/objects/can.png");
  game.load.image("burst", "assets/objects/burst.png");
  game.load.image("laserburst", "assets/objects/laserburst.png");
  game.load.image("crate", "assets/objects/crate.png");
  game.load.image("powercell", "assets/objects/powercell.png");

  game.load.image("tree-00", "assets/objects/tree-00.png");

  // load actor & object spritesheets
  game.load.spritesheet("cat", "assets/actors/thecat.png", 86, 65, 37);
  game.load.spritesheet("rat", "assets/actors/rat.png", 32, 20);
  game.load.spritesheet("heli", "assets/objects/heli.png", 46, 20);
  game.load.spritesheet("laser", "assets/objects/laser.png", 26, 16);

  // load ui elements
  game.load.spritesheet("catlives", "assets/objects/catlives.png", 16, 16);
  game.load.image("nrg-bg", "assets/ui/nrg-bg.png");
  game.load.image("nrg-fill", "assets/ui/nrg-fill.png");
  game.load.image("nrg-laser-fill", "assets/ui/nrg-laser-fill.png");

  // load main tilemap
  game.load.tilemap("tilemap", "assets/tiles/cattiles.json", null, Phaser.Tilemap.TILED_JSON);
  // load tile images
  game.load.image("tiles", "assets/tiles/ground_tiles.png");
  game.load.image("bg_sky", "assets/tiles/bg_tile.png");

  // load game audio
  /* game.load.audio("jungle", "assets/audio/music/jungleexcessive.ogg"); */
  /* game.load.audio("forest", "assets/audio/music/forest.ogg");
  game.load.audio("featherfall", "assets/audio/music/featherfall.mp3"); */
  game.load.audio("meow", "assets/audio/ruby-meow.ogg");
  game.load.audio("laser", "assets/audio/laser-rifle.ogg");
  game.load.audio("empty", "assets/audio/empty-click.wav");
  game.load.audio("reload", "assets/audio/reload.ogg");
}

// ledges: data for moving platforms
var ledges = [
  /* { x: 400, y: 200, scaleX: 2, scaleY: 0.5, move: false },
    { x: 25, y: 500, scaleX: 1.25, scaleY: 0.5, move: false }, */
  { x: 75, y: 51, scaleX: 3, scaleY: 1, moveX: false, moveY: true, maxX: 0, minX: 0, maxY: 400, minY: 85 }
  /* { x: 300, y: 100, scaleX: 0.5, scaleY: 0.55, move: false },
    { x: 300, y: 400, scaleX: 0.75, scaleY: 0.45, move: false } */
];
// empty array for storing rendered moving platform game objects
var drawnLedges = [];

// rats: data for rat enemies
var rats = [{ x: 1600, y: 400, direction: "left", dead: false }, { x: 650, y: 325, direction: "right", dead: false }];
// empty array for storing rendered rat game objects
var theRats = [];

// set the default text style for messages
var textStyle = {
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
var lives = 9;
// empty array for storing life game objects
var gameLives = [];
// set initial life to 0
var currentLife = 0;
// set initial heli condition to false
var haveHeli = false;
// set heli NRG bar vars
var maxNrg = 194;
var currentNrg = 194;
var nrgFill;

// set initial laser condition to false
var haveLaser = false;
var maxLaserNrg = 194;
var currentLaserNrg = 194;
var laserNrgFill;

function drawUi() {
  // add NRG elements for heli
  var nrgBg = game.add.sprite(1008, 50, "nrg-bg");
  nrgBg.fixedToCamera = true;
  nrgBg.width = 200;

  nrgFill = game.add.sprite(1011, 53, "nrg-fill");
  nrgFill.fixedToCamera = true;
  nrgFill.height = nrgFill.height - 6;
  nrgFill.width = 0;

  // add NRG elements for lasdrd
  var laserNrgBg = game.add.sprite(1008, 75, "nrg-bg");
  laserNrgBg.fixedToCamera = true;
  laserNrgBg.width = 200;

  laserNrgFill = game.add.sprite(1011, 78, "nrg-laser-fill");
  laserNrgFill.fixedToCamera = true;
  laserNrgFill.height = laserNrgFill.height - 6;
  laserNrgFill.width = 0;

  // add lives counter and draw a head for each
  for (i = 0; i < lives; i++) {
    var newHead = game.add.sprite(1000 + 25 * i, 25, "catlives");
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

  theTree = game.add.sprite(200, 150, "tree-00");
  theTree.scale.setTo(2, 2);

  // add main tilemap
  map = game.add.tilemap("tilemap");
  // use the ground_tiles.png ('tiles') image for the tilemap
  map.addTilesetImage("ground_tiles", "tiles");

  // draw the ground layer - contains surfaces that define the level geometry
  groundLayer = map.createLayer("GroundLayer");
  // draw the decoration layer - things that don't have collision but are still part of terrain
  decorationLayer = map.createLayer("DecorationLayer");
  // draw the rat bounds layer - contains data to tell rats where to collide and switch direction
  ratBounds = map.createLayer("RatBounds");

  // set collision for both map layers so that it's available to define more specifically later
  map.setCollisionBetween(1, 64, true, groundLayer);
  map.setCollisionBetween(1, 64, true, ratBounds);

  // make the ratBounds tiles invisible
  ratBounds.alpha = 0;

  // set world size to match size of groundLayer
  groundLayer.resizeWorld();

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

  drawUi();

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
    theRats.push(newRat);
  });

  theCan = game.add.sprite(500, 100, "can");
  game.physics.arcade.enable(theCan);
  theCan.enableBody = true;
  theCan.body.gravity.y = 400;
  theCan.body.bounce.y = 0.5;

  theHeli = game.add.sprite(100, 300, "heli");
  game.physics.arcade.enable(theHeli);
  theHeli.enableBody = true;
  theHeli.body.gravity.y = 400;
  theHeli.body.bounce.y = 0.1;
  theHeli.animations.add("rotate", [0, 1, 2], 15, true);
  theHeli.animations.play("rotate");

  theCell = game.add.sprite(400, 300, "powercell");
  game.physics.arcade.enable(theCell);
  theCell.body.gravity.y = 400;

  theCat = game.add.sprite(125, game.world.height - 200, "cat");
  game.physics.arcade.enable(theCat);
  theCat.body.setSize(48, 64, 18, 0);
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

  theLaser = game.add.sprite(200, 300, "laser");
  game.physics.arcade.enable(theLaser);
  theLaser.enableBody = true;
  theLaser.scale.setTo(2, 3);
  theLaser.animations.add("laze", [0, 1, 2], 15, true);
  theLaser.animations.play("laze");

  keys = game.input.keyboard.createCursorKeys();

  game.camera.follow(theCat);
}

var direction;
var cycle = true;

function update() {
  /* game.debug.body(theCat); */

  var catCollideGround = game.physics.arcade.collide(theCat, groundLayer);
  var ratCollideGround = game.physics.arcade.collide(theRats, groundLayer);
  var canCollideGround = game.physics.arcade.collide(theCan, groundLayer);
  var heliCollideGround = game.physics.arcade.collide(theHeli, groundLayer);
  var laserCollideground = game.physics.arcade.collide(theLaser, groundLayer);
  var cellCollideground = game.physics.arcade.collide(theCell, groundLayer);

  var catCollidePlatforms = game.physics.arcade.collide(theCat, platforms);

  var ratCollideBounds = game.physics.arcade.collide(theRats, ratBounds);

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

  theRats.forEach(function(rat) {
    var bLeft = rat.body.blocked.left;
    var bRight = rat.body.blocked.right;
    var biteCat = game.physics.arcade.overlap(theCat, rat, biteTheCat, null, this);
    var killRat = game.physics.arcade.overlap(theLaser, rat, killARat, null, this);

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
  var getHeli = game.physics.arcade.overlap(theCat, theHeli, collectHeli, null, this);
  var getLaser = game.physics.arcade.overlap(theCat, theLaser, collectLaser, null, this);
  var getCell = game.physics.arcade.overlap(theCat, theCell, collectCell, null, this);

  var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  var fKey = game.input.keyboard.addKey(Phaser.Keyboard.F);

  theCat.body.velocity.x = 0;
  if (direction === "right") {
    theCatXOffset = 16;
  } else if (direction === "left") {
    theCatXOffset = 0;
  }

  if (theCat.body.blocked.down && !catCollideGround) {
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
    if (theCat.body.onFloor() && catCollideGround) {
      theCat.body.velocity.y = -250;
    } else if (theCat.body.touching.down) {
      theCat.body.velocity.y = -250;
    }
  }

  var nrgRatio = currentNrg / maxNrg;

  keys.down.onDown.add(sitCat);
  if (isSitting && haveHeli) {
    if (currentNrg <= maxNrg) {
      currentNrg++;
      nrgFill.width = nrgRatio * maxNrg;
    }
  }

  if (haveHeli && currentNrg) {
    if (spaceKey.isDown && theCat.frame != 36) {
      isSitting = false;
      theCat.body.velocity.y = -100;
      currentNrg--;
      nrgFill.width = nrgRatio * maxNrg;

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

  if (fKey.isDown && haveLaser) {
    if (direction === "left") {
      shootLaser("left");
    } else if (direction === "right") {
      shootLaser("right");
    }
  }
}

var laserDelay = 0;
function shootLaser(direction) {
  if (game.time.now > laserDelay && currentLaserNrg) {
    theLaser.alpha = 1;
    laserRifle.play();
    currentLaserNrg -= 48.5;
    laserNrgFill.width = currentLaserNrg;
    if (direction === "right") {
      theLaser.x = theCat.x + 70;
      theLaser.y = theCat.y + 20;
      theLaser.scale.setTo(3, 2);
      game.time.events.add(Phaser.Timer.SECOND, hideSprite, this);
    }
    if (direction === "left") {
      theLaser.x = theCat.x + 20;
      theLaser.y = theCat.y + 20;
      theLaser.scale.setTo(-3, 2);
      game.time.events.add(Phaser.Timer.SECOND, hideSprite, this);
    }
    laserDelay = game.time.now + 1000;
  } else if (game.time.now > laserDelay) {
    emptyClick.play();
    var msgX = Math.floor(theCat.x + theCat.width / 2);
    var msgY = Math.floor(theCat.y + theCat.height / 2);
    var msg = game.add.text(msgX, msgY, "Empty!", textStyle);
    msg.anchor.set(0.5);
    msg.lifespan = 1500;
    laserDelay = game.time.now + 1000;
  }
}

function hideSprite() {
  game.add.tween(theLaser).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
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
  nrgFill.width = maxNrg;
  haveHeli = true;
}

function collectLaser() {
  if (!haveLaser) {
    theLaser.x = 0;
    theLaser.y = 0;
    theLaser.alpha = 0;
    var msgX = Math.floor(theCat.x + theCat.width / 2);
    var msgY = Math.floor(theCat.y + theCat.height / 2);
    var msg = game.add.text(msgX, msgY, "Lazer Eyes!", textStyle);
    msg.anchor.set(0.5);
    msg.lifespan = 1500;
    laserNrgFill.width = maxLaserNrg;
    haveLaser = true;
  }
}

var cellDelay = 0;
function collectCell(cat, cell) {
  if (haveLaser) {
    var msgX = Math.floor(theCat.x + theCat.width / 2);
    var msgY = Math.floor(theCat.y + theCat.height / 2);
    if (game.time.now > cellDelay) {
      if (laserNrgFill.width === maxLaserNrg) {
        var msg = game.add.text(msgX, msgY, "Ammo full!", textStyle);
        msg.anchor.set(0.5);
        msg.lifespan = 1500;
      }
    }
    if (laserNrgFill.width != maxLaserNrg) {
      cell.kill();
      reloadLaser.play();
      var msg = game.add.text(msgX, msgY, "Got Powercell!", textStyle);
      currentLaserNrg = maxLaserNrg;
      laserNrgFill.width = maxLaserNrg;
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

function killARat(laser, rat) {
  rat.dead = true;
  var laserBurst = game.add.sprite(theLaser.x + 75, rat.y, "laserburst");
  laserBurst.lifespan = 500;
  game.add.tween(rat).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
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
