class Setup extends Phaser.State {
  /**
   * Setup: where we really get off the ground - much of the custom game logic is here
   * Ideally, all game logic/functions will live here, with Main being used solely for update() behavior
   *
   * In preload() we add audio and physics to the game; this was initially in create() but moved here as it's more 'background'
   *
   * In create() much of the custom game functions are set up to be triggered in Main
   *
   */
  preload() {
    /* Add audio effects to game, and what action they are tied to */
    this.game.laserRifle = this.game.add.audio('laser'); // Last fires and has NRG
    this.game.emptyClick = this.game.add.audio('empty'); // Laser fires and NRG is empty
    this.game.meowClip = this.game.add.audio('meow'); // Cat sits down
    this.game.reloadLaser = this.game.add.audio('reload'); // Powercell is picked up and NRG is not full

    /* Add and play the main background music - currently disabled */
    //this.game.music = this.game.add.audio("featherfall");
    //this.game.music.loopFull(0.5); // Loops the music and plays it at 50% volume

    /* Start ARCADE physics engine */
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    /* Add ArcadeSlopes physics plugin - allows sloped/angled collisions */
    this.game.plugins.add(Phaser.Plugin.ArcadeSlopes);
    /* Supposed to smooth out slope collision for platformer-style games?  I am not sure if it makes a difference */
    this.game.slopes.preferY = true;

    /* Just an RNG - stuck here for lack of a better place to go */
    this.game.randomNumber = (min, max) => {
      // Currently only used for randomizing borb flight paths in Main birdBehavior
      return Math.floor(Math.random() * max) + min;
    };
  }

  create() {
    /* The tilemap uses 64x64 tiles - the multiplier is used against smaller integers to position sprites using smaller integers */
    this.game.multiplier = 64; // This seems like an inefficient way to handle this, will look for a better way

    /* Set up text styles to be used in game messages - currently 2 styles, placeholder(?)  */
    this.game.textStyle = {
      // Primary text style, used for most messages and UI
      font: '28px Indie Flower',
      fontWeight: '800',
      fill: 'white',
      align: 'center',
      stroke: 'black',
      strokeThickness: '5'
    };

    this.game.bigTextStyle = {
      // Big flashy text used when game objects are completed
      font: '48px Indie Flower',
      fontWeight: '800',
      fill: 'red',
      align: 'center',
      stroke: 'black',
      strokeThickness: '10'
    };

    /* Set initial score to 0 - currently this is tied to catfood cans picked up */
    this.game.score = 0;

    /* No rats exist yet - current object is to laser all rats */
    this.game.remainingRats = 0;

    /* Life system - set initial number of lives to 9, because this is a game about a cat */
    this.game.lives = 9; // Used to keep track of how many lives are remaining
    this.game.gameLives = []; // Empty array for storing life sprite (cat head) objects
    this.game.currentLife = 0; // Set initial life to first life - when this is lost, moves onto 1st, through 8th

    /* Level Objects are created here; currently only moving platforms */

    class Ledge {
      // Generates platforms that can move - started as static platforms, thus the Ledge name...may change to Platform
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
        // Each instance of ledge holds properties that determine its movement path - where it starts, where it goes
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

    /* Holds all game objects created from Ledge */
    this.game.allLedges = [];

    /* Ledges are all named sequentially, with an X, Y, or XY at the end to indicate which direction they move */
    this.game.ledgeOneY = new Ledge(
      'ledgeOneY',
      71 * this.game.multiplier,
      25 * this.game.multiplier,
      0,
      28 * this.game.multiplier,
      0,
      20 * this.game.multiplier,
      false,
      true,
      3,
      1,
      'crate',
      true,
      null
    );

    this.game.ledgeTwoX = new Ledge(
      'ledgeTwoX',
      135 * this.game.multiplier,
      28 * this.game.multiplier,
      143 * this.game.multiplier,
      0,
      133 * this.game.multiplier,
      0,
      true,
      false,
      3,
      1,
      'crate',
      true,
      null
    );

    this.game.ledgeThreeX = new Ledge(
      'ledgeThreeX',
      162 * this.game.multiplier,
      26 * this.game.multiplier,
      170 * this.game.multiplier,
      0,
      162 * this.game.multiplier,
      0,
      true,
      false,
      3,
      1,
      'crate',
      true,
      null
    );

    this.game.ledgeFourY = new Ledge(
      'ledgeFourY',
      172 * this.game.multiplier,
      21 * this.game.multiplier,
      0,
      27 * this.game.multiplier,
      0,
      21 * this.game.multiplier,
      false,
      true,
      2,
      1,
      'crate',
      true,
      null
    );

    this.game.ledgeFiveXY = new Ledge(
      'ledgeFiveXY',
      190 * this.game.multiplier,
      26 * this.game.multiplier,
      195 * this.game.multiplier,
      26 * this.game.multiplier,
      190 * this.game.multiplier,
      21 * this.game.multiplier,
      true,
      true,
      2,
      1,
      'crate',
      true,
      null
    );

    // Probably will continue with "ledgeTwoX, ledgeThree..." - these have to be placed by hand // Only use of this image currently - maybe placeholder, but I do like it
    this.game.allLedges.push(
      this.game.ledgeOneY,
      this.game.ledgeTwoX,
      this.game.ledgeThreeX,
      this.game.ledgeFourY,
      this.game.ledgeFiveXY
    ); // allLedges is array of game objects, not their sprites - that's this.game.allLedges[i].spriteObj in Main

    /**
     * Powerups are created here - called Pickups
     * Powerup behavior is also currently defined here, right after they're created - if more powerups are added, might separate
     */

    class Pickup {
      // All powerups share properties - if any without NRG are added, can nullify nrg properties
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
        this.have = have; // Boolean, tracks what powerups cat has acquired
        this.nrgBar = nrgBar; // Holds associated NRG bar object for the sprite, if it has one - so NRG bar is a property of associated powerup
        this.maxNrg = maxNrg; // The values of these three NRG properties are used to track NRG bar fill widths and current NRG, they're the same number
        this.currentNrg = currentNrg;
        this.nrgFill = nrgFill;
        this.nrgObj = nrgObj;
        this.startX = startX;
        this.startY = startY;
        this.sprite = sprite;
        this.gravityY = gravityY; // Powerups currently have gravity enabled
        this.bounceY = bounceY;
        this.scale = scale;
        this.animation = animation;
        this.spriteObj = spriteObj; // Purposefully separated the game object from its sprite; I like having data live in a parent and the sprite an extension of that parent
        this.msg = msg; // Text is broadcasted when cat hits the powerup
        this.delay = delay; // An internal counter for adding space between overlap/collide events
      }
    }

    /* Holds all game objects created from Pickup */
    this.game.allPickups = [];

    /* CatCopter pickup - hereafter referred to as this.game.theHeli */
    this.game.theHeli = new Pickup(
      'heli',
      false,
      { barX: 1008, barY: 50, fillX: 1011, fillY: 53, fillSprite: 'nrg-fill-heli' },
      194,
      0,
      0,
      '',
      1 * this.game.multiplier,
      1 * this.game.multiplier,
      'heli',
      400,
      0.1,
      { x: 1, y: 1 },
      { name: 'rotate', frames: [0, 1, 2], fps: 15, loop: true },
      null,
      "You're now a catcopter!",
      0
    ); // This is the data for the associated NRG sprite // 36 * this.game.multiplier // 27 * this.game.multiplier

    /* Laser Eyes pickup - hereafter referred to as this.game.theLaser */
    this.game.theLaser = new Pickup(
      'laser',
      false,
      { barX: 1008, barY: 75, fillX: 1011, fillY: 78, fillSprite: 'nrg-fill-laser' },
      194,
      194,
      0,
      '',
      1 * this.game.multiplier,
      1 * this.game.multiplier,
      'laser',
      0,
      0.1,
      { x: 2, y: 3 },
      { name: 'laze', frames: [0, 1, 2], fps: 15, loop: true },
      null,
      'Lazer Eyes!',
      0
    );

    this.game.allPickups.push(this.game.theHeli, this.game.theLaser); // Again an array of game objects, not their sprites - this.game.allPickups[i].spriteObj

    /**
     * Here begins powerup behavior - functions that are triggered by events in the update() loop in Main
     * All powerup behavior functions are here; adding the pickup sprites is not - it's in Main this.game.addPickups, wouldn't work in Setup
     */

    this.game.shootLaser = direction => {
      // When the laser fire key (F) is triggered, this runs
      const laser = this.game.theLaser; // Remember the difference between the game object and its sprite
      const laserSprite = laser.spriteObj; // Same pattern appears for everything here; .spriteObj property name is consistent
      const cat = this.game.theCat; // this.game.theCat is created in Main (sprite is directly added)
      if (this.game.time.now > laser.delay && laser.currentNrg) {
        // Two conditions: at least 2 sec have passed since last shootLaser event, and theLaser has NRG
        this.game.laserRifle.play();
        laser.currentNrg -= 48.5; // Max NRG is 194, laser takes 25% of max to fire each time - change to 200 max?
        laser.nrgObj.width = laser.currentNrg; // As mentioned, currentNrg also controls width of the sprite

        if (cat.direction === 'right') {
          /*
          * this.game.theLaser works by moving its spriteObj around - it doesn't create anything new, but repositions & changes visibility
          * There is only one this.game.theLaser object (and sprite) in the game, including the powerup and fired lasers
          */
          laserSprite.x = cat.x + 70;
          laserSprite.y = cat.y + 20;
          laserSprite.scale.setTo(3, 2); // Different scale from the powerup sprite
          laserSprite.alpha = 1; // This makes the sprite visible, its default alpha is 0
        }
        if (cat.direction === 'left') {
          laserSprite.x = cat.x + 15;
          laserSprite.y = cat.y + 20;
          laserSprite.scale.setTo(-3, 2);
          laserSprite.alpha = 1;
        }
        this.game.add.tween(laserSprite).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 1000); // Use a tween to fade the laser out after a delay
        laser.delay = this.game.time.now + 2000; // Can only trigger shootLaser once every 2 seconds - goes well with the recharge sound
      } else if (this.game.time.now > laser.delay) {
        // If no laser NRG, play an empty actions and msg - also has 2 second delay
        this.game.emptyClick.play();
        var msgX = Math.floor(cat.x + cat.width / 2);
        var msgY = Math.floor(cat.y + cat.height / 2);
        var msg = this.game.add.text(msgX, msgY, 'Empty!', this.game.textStyle);
        msg.lifespan = 1500;
        laser.delay = this.game.time.now + 2000;
      }
    };

    this.game.flyHeli = () => {
      // Here is my favorite function in the game, the ability to fly your cat around
      if (this.game.theHeli.have && this.game.theHeli.currentNrg) {
        // Have to have theHeli and have NRG for it
        if (this.game.spaceKey.isDown && this.game.theCat.frame != 36) {
          // Space key held down for flight, can't fly from the initial cat frame
          this.game.theCat.isSitting = false;
          this.game.theCat.body.velocity.y = -100; // Fly upward!
          this.game.theHeli.currentNrg--; // theHeli's NRG drops while the space bar is held, as this is called in Main update()
          this.game.theHeli.nrgObj.width = this.game.theHeliNrgRatio * this.game.theHeli.maxNrg; // currentNRG / maxNRG determines where NRG bar width, so it shrinks as currentNRG decreases

          if (!this.game.keys.left.isDown && !this.game.keys.right.isDown) {
            // Play different animations depending on where the cat is when flying mode is triggered
            if (this.game.theCat.direction === 'left') {
              this.game.theCat.animations.play('idleHeliLeft');
            } else if (this.game.theCat.direction === 'right') {
              this.game.theCat.animations.play('idleHeliRight');
            }
          }

          if (this.game.keys.left.isDown && !this.game.keys.right.isDown) {
            // There is a sorta bug here where, if out of NRG, holding down space and left or right keys will not move you - normal movement relies on fly mode being inactive
            this.game.theCat.body.velocity.x = -120;
            this.game.theCat.animations.play('heliLeft');
          } else if (this.game.keys.right.isDown && !this.game.keys.left.isDown) {
            this.game.theCat.body.velocity.x = 120;
            this.game.theCat.animations.play('heliRight');
          }
        }
      }
    };

    /* theHeli NRG bar recharges when cat is sitting - sitCat() later in this files calls heliCharge() */
    this.game.heliCharge = () => {
      if (this.game.theCat.isSitting && this.game.theHeli.have) {
        if (this.game.theHeli.currentNrg <= this.game.theHeli.maxNrg) {
          this.game.theHeli.currentNrg++; // The opposite of decreasing the bar when flying
          this.game.theHeli.nrgObj.width = this.game.theHeliNrgRatio * this.game.theHeli.maxNrg;
        }
      }
    };

    /* Is triggered when cat overlaps a powerup */
    this.game.collectPickup = (cat, pickup) => {
      const parent = pickup.parentPickup;
      // The pickup passed in is the spriteObj, so have to get access to its parent via parentPickup property - which is added to the spriteObj when it's created in Main
      if (parent === this.game.theHeli) {
        // Atm these are specific since there's only 2 powerups, probably ok to keep it this way, they are intended to be only 2 powerups
        pickup.kill(); // Can get rid of theHeli's sprite from the game, as the flight animation is in the cat's spritesheet
        this.game.theHeli.currentNrg = 194;
      }
      if (parent === this.game.theLaser) {
        pickup.alpha = 0; // theLaser doesn't move when it gets picked up, just turns invisible; gets repositioned when shootLaser() is called
      }
      let msgX = Math.floor(this.game.theCat.x + this.game.theCat.width / 2);
      let msgY = Math.floor(this.game.theCat.y + this.game.theCat.height / 2);
      if (!parent.have) {
        let msg = this.game.add.text(msgX, msgY, parent.msg, this.game.textStyle);
        // Not sure if doing msgs specifically each time like this, not just here but on all events, is the best way?  Maybe doesn't matter since the events happen infrequently
        msg.lifespan = 1500;
        parent.nrgObj.width = parent.maxNrg; // Width determined by max this time, not current
        parent.have = true; // Player now owns this pickup
      }
    };

    /* Items - non-powerup pickups - currently 2 */

    class FoodCan {
      // Each item gets its own constructor - rewrite to use one, like powerups
      constructor(name, startX, startY, spriteObj) {
        this.name = name;
        this.startX = startX;
        this.startY = startY;
        this.spriteObj = spriteObj;
      }
    }
    this.game.allFoodCans = []; // Holds all food can game objects

    /* Food currently just keeps score, intention is to have 4 food cans restore 1 life */
    this.game.foodCanOne = new FoodCan('foodCanOne', 9 * this.game.multiplier, 10 * this.game.multiplier, null);
    this.game.foodCanTwo = new FoodCan('foodCanTwo', 5 * this.game.multiplier, 27 * this.game.multiplier, null);
    this.game.foodCanThree = new FoodCan('foodCanThree', 46 * this.game.multiplier, 21 * this.game.multiplier, null);
    this.game.allFoodCans.push(this.game.foodCanOne, this.game.foodCanTwo, this.game.foodCanThree);

    /* Creates a sprite for each foodCan# game object, and pins it as a property */
    this.game.addFoodCans = () => {
      this.game.allFoodCans.map(can => {
        const theCan = this.game.add.sprite(can.startX, can.startY, 'can');
        this.game.physics.arcade.enable(theCan); // Physics need to be enabled for collision
        this.game.slopes.enable(theCan);
        theCan.enableBody = true;
        theCan.body.gravity.y = 400;
        theCan.body.bounce.y = 0.1;
        can.spriteObj = theCan;
      });
    };

    /* When the player sprite overlaps a can sprite, this function is called */
    this.game.collectCan = (can, cat) => {
      can.kill();
      let msgX = Math.floor(this.game.theCat.x + this.game.theCat.width / 2);
      let msgY = Math.floor(this.game.theCat.y + this.game.theCat.height / 2);
      let msg = this.game.add.text(msgX, msgY, 'Got some catfood!', this.game.textStyle);
      msg.lifespan = 1500;
      this.game.score++; // Currently cans are tied only to score, get 3 to trigger the msg
    };

    /* Refills ammo for the laser */
    class PowerCell {
      constructor(name, startX, startY, spriteObj, delay) {
        // Try to replace with generic item constructor
        this.name = name;
        this.startX = startX;
        this.startY = startY;
        this.spriteObj = spriteObj;
        this.delay = delay;
      }
    }
    this.game.allPowerCells = []; // Hold all powercell game objects

    /* Currently only one powercell in game, will add more when level layout finshed */
    this.game.powerCellOne = new PowerCell(
      'powerCellOne',
      6 * this.game.multiplier,
      4.5 * this.game.multiplier,
      null,
      0
    ); // May need to add dynamically generated cells so that ammo never runs out (time them maybe?)
    this.game.allPowerCells.push(this.game.powerCellOne);

    /* Creates a sprite for each powercell game object and adds it ot the world */
    this.game.addPowerCells = () => {
      this.game.allPowerCells.map(cell => {
        const theCell = this.game.add.sprite(cell.startX, cell.startY, 'powercell');
        this.game.physics.arcade.enable(theCell);
        this.game.slopes.enable(theCell);
        theCell.enableBody = true;
        theCell.body.gravity.y = 400;
        theCell.body.bounce.y = 0.1;
        theCell.parentCell = cell;
        cell.spriteObj = theCell;
      });
    };

    /* When the player sprite overlaps the powercell sprite, this function is called */
    this.game.collectCell = (cell, cat) => {
      // The cell's sprite object is passed in, with player sprite
      if (this.game.theLaser.have) {
        // If don't have the laser yet, ignore the cell
        const cellParent = cell.parentCell; // Get the parent game object of the cell sprite - this holds all the cell properties
        let msgX = Math.floor(this.game.theCat.x + this.game.theCat.width / 2);
        let msgY = Math.floor(this.game.theCat.y + this.game.theCat.height / 2);
        if (this.game.time.now > cellParent.delay) {
          if (this.game.theLaser.nrgObj.width === this.game.theLaser.maxNrg) {
            let msg = this.game.add.text(msgX, msgY, 'Ammo full!', this.game.textStyle);
            msg.lifespan = 1500;
          }
        }
        if (this.game.theLaser.currentNrg != this.game.theLaser.maxNrg) {
          // Check if the laser doesn't have full ammo
          cell.kill();
          this.game.reloadLaser.play();
          let msg = this.game.add.text(msgX, msgY, 'Got Powercell!', this.game.textStyle);
          this.game.theLaser.currentNrg = this.game.theLaser.maxNrg; // Set the laser NRG to max, along with its bar width
          this.game.theLaser.nrgObj.width = this.game.theLaser.maxNrg;
          msg.lifespan = 1500;
        }
        cellParent.delay = this.game.time.now + 1500;
      }
    };

    /** Enemies!  The Rats and Borbs appear */

    class Rat {
      // Each enemy type has its own constructor - they could be merged to one but this works fine for now
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
    this.game.allRats = []; // By now this pattern should look familiar

    /* Add some rats to the game - currently six */
    this.game.ratOne = new Rat('ratOne', 2 * this.game.multiplier, 11 * this.game.multiplier, 'left', false, 0, null);
    this.game.ratTwo = new Rat('ratTwo', 24 * this.game.multiplier, 26 * this.game.multiplier, 'right', false, 0, null);
    this.game.ratThree = new Rat(
      'ratThree',
      2 * this.game.multiplier,
      20 * this.game.multiplier,
      'left',
      false,
      0,
      null
    );
    this.game.ratFour = new Rat(
      'ratFour',
      14 * this.game.multiplier,
      24 * this.game.multiplier,
      'right',
      false,
      0,
      null
    );
    this.game.ratFive = new Rat('ratFive', 38 * this.game.multiplier, 4 * this.game.multiplier, 'left', false, 0, null);
    this.game.ratSix = new Rat('ratSix', 28 * this.game.multiplier, 7 * this.game.multiplier, 'right', false, 0, null);

    this.game.allRats.push(
      this.game.ratOne,
      this.game.ratTwo,
      this.game.ratThree,
      this.game.ratFour,
      this.game.ratFive,
      this.game.ratSix
    );

    /* Add the rat sprites to the world for each rat game object, and pin to parent */
    this.game.addRats = () => {
      this.game.allRats.map(rat => {
        const theRat = this.game.add.sprite(rat.startX, rat.startY, 'rat');
        this.game.physics.arcade.enable(theRat);
        this.game.slopes.enable(theRat);
        theRat.enableBody = true;
        theRat.body.gravity.y = 400;
        theRat.body.bounceY = 0.1;
        theRat.body.collideWorldBounds = true;
        theRat.animations.add('moveLeft', [0, 1, 2], 15, true);
        theRat.animations.add('moveRight', [3, 4, 5], 15, true);
        theRat.parentRat = rat;
        rat.spriteObj = theRat;
      });
    };

    this.game.killARat = (laser, rat) => {
      // Takes in the laser sprite and the overlapped rat sprite
      const parentRat = rat.parentRat;
      const parentIndex = this.game.allRats.indexOf(parentRat); // Locate the parent rat game object in the allRats array, for deletion
      if (laser.alpha === 1 && this.game.time.now > parentRat.delay) {
        parentRat.dead = true;
        const laserBurst = this.game.add.sprite(rat.x, rat.y, 'laserburst');
        laserBurst.lifespan = 1000;
        this.game.add.tween(rat).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true); // The rat fades out to transparent over .5s
        this.game.allRats.splice(parentIndex, 1); // Remove the rat game object from the allRats array
        parentRat.delay = this.game.time.now + 1500;
      }
    };

    this.game.biteTheCat = (cat, rat) => {
      if (this.game.time.now > cat.biteDelay && rat.alpha === 1) {
        let avgX = (cat.x + rat.x) / 2;
        let burst = this.game.add.sprite(avgX, rat.y, 'burst');
        burst.lifespan = 500;

        let msgX = Math.floor(cat.x + cat.width / 2);
        let msgY = Math.floor(cat.y + cat.height / 3);
        let msg = this.game.add.text(msgX, msgY, 'Ouch!', this.game.textStyle);
        msg.lifespan = 500;

        if (this.game.lives > 0) {
          let thisLife = this.game.gameLives[this.game.currentLife];
          thisLife.frame = 1;
          let lifeMsg = this.game.add.text(
            cat.x,
            500,
            8 - this.game.currentLife + ' lives remaining...',
            this.game.textStyle
          );
          lifeMsg.lifespan = 1500;
          this.game.currentLife++;
          this.game.lives--;
        }
        cat.biteDelay = this.game.time.now + 1500;
      }
    };

    // bird class
    class Bird {
      constructor(name, startX, startY, endX, endY, cycleX, cycleY, dead, delay, spriteObj) {
        this.name = name;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.cycleX = cycleX;
        this.cycleY = cycleY;
        this.dead = dead;
        this.delay = delay;
        this.spriteObj = spriteObj;
      }
    }
    this.game.allBirds = [];

    this.game.birdOne = new Bird(
      'birdOne',
      4 * this.game.multiplier,
      1 * this.game.multiplier,
      8 * this.game.multiplier,
      4 * this.game.multiplier,
      true,
      true,
      false,
      0,
      null
    ); // startX // startY // endX // endY

    this.game.allBirds.push(this.game.birdOne);

    this.game.addBirds = () => {
      this.game.allBirds.map(bird => {
        const theBird = this.game.add.sprite(bird.startX, bird.startY, 'bird');
        this.game.physics.arcade.enable(theBird);
        this.game.slopes.enable(theBird);
        theBird.enableBody = true;
        theBird.body.collideWorldBounds = true;
        theBird.body.gravity.y = 200;
        theBird.animations.add('flap', [0, 1, 2, 3, 4, 5, 6], 15, true);
        theBird.parentBird = bird;
        theBird.scale.setTo(1.5, 1.5);
        bird.spriteObj = theBird;
      });
    };

    this.game.killABird = (laser, bird) => {
      const parentBird = bird.parentBird;
      const parentIndex = this.game.allBirds.indexOf(parentBird);
      if (laser.alpha === 1 && this.game.time.now > parentBird.delay) {
        parentBird.dead = true;
        const laserBurst = this.game.add.sprite(bird.x, bird.y, 'laserburst');
        laserBurst.lifespan = 1000;
        this.game.add.tween(bird).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true);
        this.game.allBirds.splice(parentIndex, 1);
        parentBird.delay = this.game.time.now + 1500;
      }
    };

    this.game.sayMeow = direction => {
      if (this.game.time.now > this.game.theCat.meowDelay) {
        let meowX, meowY;
        if (direction === 'right') {
          meowX = this.game.theCat.x + 50;
        } else if (direction === 'left') {
          meowX = this.game.theCat.x - 50;
        }
        meowY = this.game.theCat.y - 25;
        const meow = this.game.add.text(meowX, meowY, 'Meooow!', this.game.textStyle);
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
          8 - this.game.currentLife + ' lives remaining...',
          this.game.textStyle
        );
        lifeMsg.lifespan = 1500;
        this.game.currentLife++;
        this.game.lives--;
      }
    };

    // draw UI elements - cat head lives and 2 energy bars
    this.game.drawUi = () => {
      this.game.allPickups.map(pickup => {
        const nrgBg = this.game.add.sprite(pickup.nrgBar.barX, pickup.nrgBar.barY, 'nrg-bg');
        nrgBg.fixedToCamera = true;
        nrgBg.width = 200;

        const nrgFill = this.game.add.sprite(pickup.nrgBar.fillX, pickup.nrgBar.fillY, pickup.nrgBar.fillSprite);
        nrgFill.fixedToCamera = true;
        nrgFill.width = 0;
        nrgFill.height = nrgFill.height - 6;
        pickup.nrgObj = nrgFill;
      });

      for (let i = 0; i < this.game.lives; i++) {
        const newHead = this.game.add.sprite(1000 + 25 * i, 25, 'catlives');
        newHead.frame = 0;
        newHead.fixedToCamera = true;
        this.game.gameLives.push(newHead);
      }

      // add score counter and set it to follow camera
      this.game.theScore = this.game.add.text(25, 25, 'Cans: ' + this.game.score, this.game.textStyle);
      this.game.theScore.fixedToCamera = true;

      // add remaining rats counter and set it to follow camera
      this.game.theRemainingRats = this.game.add.text(25, 55, 'Rats: ' + this.game.remainingRats, this.game.textStyle);
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

        if (this.game.theCat.direction === 'right') {
          this.game.sayMeow('right');
          this.game.theCat.frame = 17;
        } else {
          this.game.sayMeow('left');
          this.game.theCat.frame = 8;
        }
      }
    };

    this.game.bindLaser = () => {
      if (this.game.fKey.isDown && this.game.theLaser.have) {
        if (this.game.theCat.direction === 'left') {
          this.game.shootLaser('left');
        } else if (this.game.theCat.direction === 'right') {
          this.game.shootLaser('right');
        }
      }
    };

    /** WIN CONDITIONS */

    this.game.cansCollected = false;
    this.game.allCansCollected = () => {
      let msgX = Math.floor(this.game.theCat.x - 150);
      let msgY = Math.floor(this.game.theCat.y - 175);
      let msg = this.game.add.text(msgX, msgY, 'ALL CANS COLLECTED...', this.game.bigTextStyle);
      this.game.add.tween(msg).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 1500);
      msg.lifespan = 3500;
      this.game.cansCollected = true;
    };

    this.game.ratsDead = false;
    this.game.allRatsDead = () => {
      let msgX = Math.floor(this.game.theCat.x - 150);
      let msgY = Math.floor(this.game.theCat.y - 175);
      let msg = this.game.add.text(msgX, msgY, 'ALL RATS ELIMINATED...', this.game.bigTextStyle);
      this.game.add.tween(msg).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 1500);
      msg.lifespan = 3500;
      this.game.ratsDead = true;
    };

    this.game.moveDoor = () => {
      console.log('move door');
      this.game.add.tween(this.game.facilityDoor).to({ alpha: 0 }, 2000, Phaser.Easing.Linear.None, true, 1500);
    };

    this.game.state.start('Menu');
  }
}

export default Setup;
