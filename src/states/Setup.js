class Setup extends Phaser.State {
  preload() {}

  create() {
    // add audio
    this.game.laserRifle = this.game.add.audio("laser");
    this.game.emptyClick = this.game.add.audio("empty");
    this.game.meowClip = this.game.add.audio("meow");
    this.game.reloadLaser = this.game.add.audio("reload");

    // add and play the main background music
    //this.game.music = this.game.add.audio("featherfall");
    //this.game.music.loopFull(0.5);
    // start ARCADE physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    // add Arcade Slopes plugin
    this.game.plugins.add(Phaser.Plugin.ArcadeSlopes);
    // set prefer y option to true - sorta smooths out slope collisions
    this.game.slopes.preferY = true;

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

    //hold all platforms
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

    // powerup pickup template constructor
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
        msg,
        delay
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
        this.delay = delay;
      }
    }

    // holds all created powerup pickups
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
      1 * this.game.multiplier /* 36 * this.game.multiplier,
      27 * this.game.multiplier, */,
      "heli",
      400,
      0.1,
      { x: 1, y: 1 },
      { name: "rotate", frames: [0, 1, 2], fps: 15, loop: true },
      null,
      "You're now a catcopter!",
      0
    );

    // laser eyes pickup
    this.game.theLaser = new Pickup(
      "laser",
      false,
      { barX: 1008, barY: 75, fillX: 1011, fillY: 78, fillSprite: "nrg-fill-laser" },
      194,
      194,
      0,
      "",
      1 * this.game.multiplier,
      1 * this.game.multiplier,
      "laser",
      0,
      0.1,
      { x: 2, y: 3 },
      { name: "laze", frames: [0, 1, 2], fps: 15, loop: true },
      null,
      "Lazer Eyes!",
      0
    );

    this.game.allPickups.push(this.game.theHeli, this.game.theLaser);

    this.game.shootLaser = direction => {
      const laser = this.game.theLaser;
      const laserSprite = laser.spriteObj;
      const cat = this.game.theCat;
      if (this.game.time.now > laser.delay && laser.currentNrg) {
        this.game.laserRifle.play();
        laser.currentNrg -= 48.5;
        laser.nrgObj.width = laser.currentNrg;

        if (cat.direction === "right") {
          laserSprite.x = cat.x + 70;
          laserSprite.y = cat.y + 20;
          laserSprite.scale.setTo(3, 2);
          laserSprite.alpha = 1;
        }
        if (cat.direction === "left") {
          laserSprite.x = cat.x + 15;
          laserSprite.y = cat.y + 20;
          laserSprite.scale.setTo(-3, 2);
          laserSprite.alpha = 1;
        }
        this.game.add.tween(laserSprite).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 1000);
        laser.delay = this.game.time.now + 2000;
      } else if (this.game.time.now > laser.delay) {
        this.game.emptyClick.play();
        var msgX = Math.floor(cat.x + cat.width / 2);
        var msgY = Math.floor(cat.y + cat.height / 2);
        var msg = this.game.add.text(msgX, msgY, "Empty!", this.game.textStyle);
        msg.lifespan = 1500;
        laser.delay = this.game.time.now + 2000;
      }
    };

    this.game.collectPickup = (cat, pickup) => {
      const parent = pickup.parentPickup;
      if (parent === this.game.theHeli) {
        pickup.kill();
      }
      if (parent === this.game.theLaser) {
        pickup.alpha = 0;
      }
      let msgX = Math.floor(this.game.theCat.x + this.game.theCat.width / 2);
      let msgY = Math.floor(this.game.theCat.y + this.game.theCat.height / 2);
      if (!parent.have) {
        let msg = this.game.add.text(msgX, msgY, parent.msg, this.game.textStyle);
        msg.lifespan = 1500;
        parent.nrgObj.width = parent.maxNrg;
        parent.have = true;
      }
    };

    /** ITEMS - NON-POWERUP PICKUPS */

    // food can class
    class FoodCan {
      constructor(name, startX, startY, spriteObj) {
        this.name = name;
        this.startX = startX;
        this.startY = startY;
        this.spriteObj = spriteObj;
      }
    }
    // hold all food cans
    this.game.allFoodCans = [];

    this.game.foodCanOne = new FoodCan("foodCanOne", 9 * this.game.multiplier, 10 * this.game.multiplier, null);
    this.game.foodCanTwo = new FoodCan("foodCanTwo", 5 * this.game.multiplier, 27 * this.game.multiplier, null);
    this.game.foodCanThree = new FoodCan("foodCanThree", 46 * this.game.multiplier, 21 * this.game.multiplier, null);
    this.game.allFoodCans.push(this.game.foodCanOne, this.game.foodCanTwo, this.game.foodCanThree);

    // create food can items - gets called in Main
    this.game.addFoodCans = () => {
      this.game.allFoodCans.forEach(can => {
        const theCan = this.game.add.sprite(can.startX, can.startY, "can");
        this.game.physics.arcade.enable(theCan);
        this.game.slopes.enable(theCan);
        theCan.enableBody = true;
        theCan.body.gravity.y = 400;
        theCan.body.bounce.y = 0.1;
        can.spriteObj = theCan;
      });
    };

    // collects can, called when can collides with cat
    this.game.collectCan = (can, cat) => {
      can.kill();
      let msgX = Math.floor(this.game.theCat.x + this.game.theCat.width / 2);
      let msgY = Math.floor(this.game.theCat.y + this.game.theCat.height / 2);
      let msg = this.game.add.text(msgX, msgY, "Got some catfood!", this.game.textStyle);
      msg.lifespan = 1500;
      this.game.score++;
    };

    // powercell class
    class PowerCell {
      constructor(name, startX, startY, spriteObj, delay) {
        this.name = name;
        this.startX = startX;
        this.startY = startY;
        this.spriteObj = spriteObj;
        this.delay = delay;
      }
    }
    // hold all powercells
    this.game.allPowerCells = [];
    this.game.powerCellOne = new PowerCell(
      "powerCellOne",
      6 * this.game.multiplier,
      4.5 * this.game.multiplier,
      null,
      0
    );
    this.game.allPowerCells.push(this.game.powerCellOne);

    // create power cell items - gets called in Main
    this.game.addPowerCells = () => {
      this.game.allPowerCells.forEach(cell => {
        const theCell = this.game.add.sprite(cell.startX, cell.startY, "powercell");
        this.game.physics.arcade.enable(theCell);
        this.game.slopes.enable(theCell);
        theCell.enableBody = true;
        theCell.body.gravity.y = 400;
        theCell.body.bounce.y = 0.1;
        theCell.parentCell = cell;
        cell.spriteObj = theCell;
      });
    };

    // collects cell, called when cell collides with cat
    this.game.collectCell = (cell, cat) => {
      if (this.game.theLaser.have) {
        const cellParent = cell.parentCell;
        let msgX = Math.floor(this.game.theCat.x + this.game.theCat.width / 2);
        let msgY = Math.floor(this.game.theCat.y + this.game.theCat.height / 2);
        if (this.game.time.now > cellParent.delay) {
          if (this.game.theLaser.nrgObj.width === this.game.theLaser.maxNrg) {
            let msg = this.game.add.text(msgX, msgY, "Ammo full!", this.game.textStyle);
            msg.lifespan = 1500;
          }
        }
        if (this.game.theLaser.nrgObj.width != this.game.theLaser.maxNrg) {
          cell.kill();
          this.game.reloadLaser.play();
          let msg = this.game.add.text(msgX, msgY, "Got Powercell!", this.game.textStyle);
          this.game.theLaser.currentNrg = this.game.theLaser.maxNrg;
          this.game.theLaser.nrgObj.width = this.game.theLaser.maxNrg;
          msg.lifespan = 1500;
        }
        cellParent.delay = this.game.time.now + 1500;
      }
    };

    /** ACTORS - ENEMIES AND THE LIKE */
    class Rat {
      constructor(name, startX, startY, direction, dead, delay, spriteObj) {
        this.name = name;
        this.startX = startX;
        this.startY = startY;
        this.direction = direction;
        this.dead = dead;
        this.delay = delay;
        this.spriteObj = spriteObj;
      }
    }
    this.game.allRats = [];

    this.game.ratOne = new Rat("ratOne", 2 * this.game.multiplier, 11 * this.game.multiplier, "left", false, 0, null);
    this.game.ratTwo = new Rat("ratTwo", 24 * this.game.multiplier, 26 * this.game.multiplier, "right", false, 0, null);
    this.game.ratThree = new Rat(
      "ratThree",
      2 * this.game.multiplier,
      20 * this.game.multiplier,
      "left",
      false,
      0,
      null
    );
    this.game.ratFour = new Rat(
      "ratFour",
      14 * this.game.multiplier,
      24 * this.game.multiplier,
      "right",
      false,
      0,
      null
    );
    this.game.ratFive = new Rat("ratFive", 38 * this.game.multiplier, 4 * this.game.multiplier, "left", false, 0, null);
    this.game.ratSix = new Rat("ratSix", 28 * this.game.multiplier, 7 * this.game.multiplier, "right", false, 0, null);

    this.game.allRats.push(
      this.game.ratOne,
      this.game.ratTwo,
      this.game.ratThree,
      this.game.ratFour,
      this.game.ratFive,
      this.game.ratSix
    );

    this.game.addRats = () => {
      this.game.allRats.forEach(rat => {
        const theRat = this.game.add.sprite(rat.startX, rat.startY, "rat");
        this.game.physics.arcade.enable(theRat);
        this.game.slopes.enable(theRat);
        theRat.enableBody = true;
        theRat.body.gravity.y = 400;
        theRat.body.bounceY = 0.1;
        theRat.body.collideWorldBounds = true;
        theRat.animations.add("moveLeft", [0, 1, 2], 15, true);
        theRat.animations.add("moveRight", [3, 4, 5], 15, true);
        theRat.parentRat = rat;
        rat.spriteObj = theRat;
      });
    };

    this.game.killARat = (laser, rat) => {
      const parentRat = rat.parentRat;
      const parentIndex = this.game.allRats.indexOf(parentRat);
      if (laser.alpha === 1 && this.game.time.now > parentRat.delay) {
        parentRat.dead = true;
        const laserBurst = this.game.add.sprite(rat.x, rat.y, "laserburst");
        laserBurst.lifespan = 1000;
        this.game.add.tween(rat).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
        this.game.allRats.splice(parentIndex, 1);
        parentRat.delay = this.game.time.now + 1500;
      }
    };

    this.game.biteTheCat = (cat, rat) => {
      if (this.game.time.now > cat.biteDelay && rat.alpha === 1) {
        let avgX = (cat.x + rat.x) / 2;
        let burst = this.game.add.sprite(avgX, rat.y, "burst");
        burst.lifespan = 500;

        let msgX = Math.floor(cat.x + cat.width / 2);
        let msgY = Math.floor(cat.y + cat.height / 3);
        let msg = this.game.add.text(msgX, msgY, "Ouch!", this.game.textStyle);
        msg.lifespan = 500;

        if (this.game.lives > 0) {
          let thisLife = this.game.gameLives[this.game.currentLife];
          thisLife.frame = 1;
          let lifeMsg = this.game.add.text(
            cat.x,
            500,
            8 - this.game.currentLife + " lives remaining...",
            this.game.textStyle
          );
          lifeMsg.lifespan = 1500;
          this.game.currentLife++;
          this.game.lives--;
        }
        cat.biteDelay = this.game.time.now + 1500;
      }
    };

    this.game.sayMeow = direction => {
      if (this.game.time.now > this.game.theCat.meowDelay) {
        let meowX, meowY;
        if (direction === "right") {
          meowX = this.game.theCat.x + 50;
        } else if (direction === "left") {
          meowX = this.game.theCat.x - 50;
        }
        meowY = this.game.theCat.y - 25;
        const meow = this.game.add.text(meowX, meowY, "Meooow!", this.game.textStyle);
        meow.lifespan = 1000;

        this.game.meowClip.play();
        this.game.theCat.meowDelay = this.game.time.now + 1500;
      }
    };

    this.game.catIsDown = () => {
      this.game.theCat.x = 125;
      this.game.theCat.y = 0;

      if (this.game.lives > 0) {
        let thisLife = this.game.gameLives[this.game.currentLife];
        thisLife.frame = 1;
        let lifeMsg = this.game.add.text(
          this.game.theCat.x,
          500,
          8 - this.game.currentLife + " lives remaining...",
          this.game.textStyle
        );
        lifeMsg.lifespan = 1500;
        this.game.currentLife++;
        this.game.lives--;
      }
    };

    this.game.flyHeli = () => {
      if (this.game.theHeli.have && this.game.theHeli.currentNrg) {
        if (this.game.spaceKey.isDown && this.game.theCat.frame != 36) {
          this.game.theCat.isSitting = false;
          this.game.theCat.body.velocity.y = -100;
          this.game.theHeli.currentNrg--;
          this.game.theHeli.nrgObj.width = this.game.theHeliNrgRatio * this.game.theHeli.maxNrg;

          if (!this.game.keys.left.isDown && !this.game.keys.right.isDown) {
            if (this.game.theCat.direction === "left") {
              this.game.theCat.animations.play("idleHeliLeft");
            } else if (this.game.theCat.direction === "right") {
              this.game.theCat.animations.play("idleHeliRight");
            }
          }

          if (this.game.keys.left.isDown && !this.game.keys.right.isDown) {
            this.game.theCat.body.velocity.x = -120;
            this.game.theCat.animations.play("heliLeft");
          } else if (this.game.keys.right.isDown && !this.game.keys.left.isDown) {
            this.game.theCat.body.velocity.x = 120;
            this.game.theCat.animations.play("heliRight");
          }
        }
      }
    };

    this.game.heliCharge = () => {
      if (this.game.theCat.isSitting && this.game.theHeli.have) {
        if (this.game.theHeli.currentNrg <= this.game.theHeli.maxNrg) {
          this.game.theHeli.currentNrg++;
          this.game.theHeli.nrgObj.width = this.game.theHeliNrgRatio * this.game.theHeli.maxNrg;
        }
      }
    };

    // draw UI elements - cat head lives and 2 energy bars
    this.game.drawUi = () => {
      this.game.allPickups.forEach(pickup => {
        const nrgBg = this.game.add.sprite(pickup.nrgBar.barX, pickup.nrgBar.barY, "nrg-bg");
        nrgBg.fixedToCamera = true;
        nrgBg.width = 200;

        const nrgFill = this.game.add.sprite(pickup.nrgBar.fillX, pickup.nrgBar.fillY, pickup.nrgBar.fillSprite);
        nrgFill.fixedToCamera = true;
        nrgFill.width = 0;
        nrgFill.height = nrgFill.height - 6;
        pickup.nrgObj = nrgFill;
      });

      for (let i = 0; i < this.game.lives; i++) {
        const newHead = this.game.add.sprite(1000 + 25 * i, 25, "catlives");
        newHead.frame = 0;
        newHead.fixedToCamera = true;
        this.game.gameLives.push(newHead);
      }

      // add score counter and set it to follow camera
      this.game.theScore = this.game.add.text(25, 25, "Cans: " + this.game.score, this.game.textStyle);
      this.game.theScore.fixedToCamera = true;

      // add remaining rats counter and set it to follow camera
      this.game.theRemainingRats = this.game.add.text(25, 55, "Rats: " + this.game.remainingRats, this.game.textStyle);
      this.game.theRemainingRats.fixedToCamera = true;
    };

    /** CONTROLS */
    this.game.keys = this.game.input.keyboard.createCursorKeys();
    this.game.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.game.fKey = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

    this.game.sitCat = () => {
      if (this.game.theCat.body.onFloor()) {
        this.game.theCat.isSitting = true;
        this.game.theCat.animations.stop(null, false);

        if (this.game.theCat.direction === "right") {
          this.game.sayMeow("right");
          this.game.theCat.frame = 17;
        } else {
          this.game.sayMeow("left");
          this.game.theCat.frame = 8;
        }
      }
    };

    this.game.bindLaser = () => {
      if (this.game.fKey.isDown && this.game.theLaser.have) {
        if (this.game.theCat.direction === "left") {
          this.game.shootLaser("left");
        } else if (this.game.theCat.direction === "right") {
          this.game.shootLaser("right");
        }
      }
    };

    /** WIN CONDITIONS */

    this.game.cansCollected = false;
    this.game.allCansCollected = () => {
      let msgX = Math.floor(this.game.theCat.x - 150);
      let msgY = Math.floor(this.game.theCat.y - 175);
      let msg = this.game.add.text(msgX, msgY, "ALL CANS COLLECTED...", this.game.bigTextStyle);
      this.game.add.tween(msg).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 1500);
      msg.lifespan = 3500;
      this.game.cansCollected = true;
    };

    this.game.ratsDead = false;
    this.game.allRatsDead = () => {
      let msgX = Math.floor(this.game.theCat.x - 150);
      let msgY = Math.floor(this.game.theCat.y - 175);
      let msg = this.game.add.text(msgX, msgY, "ALL RATS ELIMINATED...", this.game.bigTextStyle);
      this.game.add.tween(msg).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 1500);
      msg.lifespan = 3500;
      this.game.ratsDead = true;
    };

    this.game.state.start("Main");
  }
}

export default Setup;
