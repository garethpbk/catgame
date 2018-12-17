class Main extends Phaser.State {
  create() {
    // draw main tiling cloud background
    //this.game.bg_clouds = this.game.add.tileSprite(0, 0, 18048, 1920, 'bg_clouds');
    // set background to
    //this.game.bg_clouds.autoScroll(25, 0);

    // this.game.bg_sky_dark = this.game.add.tileSprite(0, 19 * this.game.multiplier, 18048, 768, 'bg_sky_dark');
    // this.game.bg_sky_dark.autoScroll(25, 0);
    //this.game.bg_trees_2 = this.game.add.tileSprite(0, 19 * this.game.multiplier, 18048, 768, 'bg_trees_2');
    //this.game.bg_trees = this.game.add.tileSprite(0, 19 * this.game.multiplier, 18048, 768, 'bg_trees');

    this.game.bg_water = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_water');
    this.game.bg_reflection = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_reflection');
    this.game.bg_sky_two = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_sky_two');
    //this.game.bg_sky_two.autoScroll(4, 0);
    this.game.bg_sky_one = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_sky_one');
    //this.game.bg_sky_one.autoScroll(8, 0);
    this.game.bg_island = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_island');
    this.game.bg_volcano = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_volcano');

    //this.game.bg_trees = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_trees');

    //this.game.bg_vines = this.game.add.tileSprite(0, 16 * this.game.multiplier, 18048, 1024, 'bg_vines');

    // add tree sprites
    this.game.spookyTree = this.game.add.sprite(125 * this.game.multiplier, 23 * this.game.multiplier, 'spooky-tree');
    this.game.weirdTree = this.game.add.sprite(133 * this.game.multiplier, 21 * this.game.multiplier, 'weird-tree');
    this.game.palmTree = this.game.add.sprite(4 * this.game.multiplier, 21 * this.game.multiplier, 'palm-tree');
    //this.game.theTree = this.game.add.sprite(5.5 * this.game.multiplier, 23 * this.game.multiplier, 'tree-00');
    //this.game.theTree.scale.setTo(2, 2);
    //this.game.theTree01 = this.game.add.sprite(9 * this.game.multiplier, 4 * this.game.multiplier, 'tree-01');
    //this.game.theTree01.scale.setTo(2, 2);
    this.game.theTree02 = this.game.add.sprite(29 * this.game.multiplier, 4.1 * this.game.multiplier, 'tree-02');
    this.game.theTree02.scale.setTo(2, 2);

    this.game.addFish();

    // add wave sprites
    this.game.waves = this.game.add.tileSprite(0, 29 * this.game.multiplier, 200 * 64, 64, 'waves', 0);
    this.game.waves.animations.add('wave', [0, 1], 2, true);
    this.game.waves.animations.play('wave');

    //add main tilemap
    this.map = this.game.add.tilemap('jungle-tilemap');
    // use the ground_tiles.png ('tiles') image for the tilemap
    this.map.addTilesetImage('ground_tiles', 'ground_tiles');
    this.map.addTilesetImage('custom_tiles', 'custom_tiles');

    // add collision tiles
    this.map.addTilesetImage('arcade_slopes', 'slope_tiles');
    this.slopeLayer = this.map.createLayer('SlopeLayer');
    this.game.slopes.convertTilemapLayer(this.slopeLayer, 'arcadeslopes', 73);
    this.slopeLayer.alpha = 0;

    this.backgroundLayer = this.map.createLayer('BackgroundLayer');

    // draw the decoration layer - things that don't have collision but are still part of terrain
    this.decorationLayer = this.map.createLayer('DecorationLayer');
    this.objectLayer = this.map.createLayer('ObjectLayer');
    // draw the rat bounds layer - contains data to tell rats where to collide and switch direction
    this.ratBounds = this.map.createLayer('RatBounds');

    // set collision for both map layers so that it's available to define more specifically later
    //map.setCollisionBetween(1, 64, true, groundLayer);
    this.map.setCollisionBetween(65, 102, true, this.slopeLayer);
    this.map.setCollisionBetween(1, 64, true, this.ratBounds);

    // make the ratBounds tiles invisible
    this.ratBounds.alpha = 0;

    // add metal door sprite
    this.game.facilityDoor = this.game.add.sprite(199 * this.game.multiplier, 18 * this.game.multiplier, 'metal-door');
    this.game.facilityDoor.open = false;
    this.game.facilityDoor.delay = 0;

    // set world size to match size of groundLayer
    this.decorationLayer.resizeWorld();

    /**
     * Add the most important sprite - the player character
     *
     * Distinct from this.theCat loaded in Preload (that one is wiped)
     *
     * Is used in a higher-level state (Setup) in some functions, so declared in global scope here
     */
    this.game.patty = this.game.add.sprite(128 * this.game.multiplier, 27.25 * this.game.multiplier, 'patty');
    this.game.patty.animations.add('idleLeft', [0, 1], 2, true);

    this.game.theCat = this.game.add.sprite(187 * this.game.multiplier, 25 * this.game.multiplier, 'cat');
    this.game.theCat.x = 1 * this.game.multiplier;
    this.game.theCat.y = 23 * this.game.multiplier;
    this.game.physics.arcade.enable(this.game.theCat);
    this.game.theCat.body.setSize(48, 64, 18, 0);
    this.game.slopes.enable(this.game.theCat);
    this.game.theCat.body.gravity.y = 400;
    this.game.theCat.body.bounce.y = 0.1;
    this.game.theCat.body.collideWorldBounds = true;
    this.game.theCat.frame = 36;
    this.game.theCat.direction = '';
    this.game.theCat.isSitting = false;
    this.game.theCat.meowDelay = 0;
    this.game.theCat.biteDelay = 0;

    this.game.theCat.animations.add('idleLeft', [0, 1], 5, true);
    this.game.theCat.animations.add('left', [2, 3, 4, 5, 6, 7], 15, true);
    this.game.theCat.animations.add('heliLeft', [18, 19, 20, 21, 22, 23], 10, true);
    this.game.theCat.animations.add('idleHeliLeft', [24, 25, 26], 10, true);

    this.game.theCat.animations.add('idleRight', [9, 10], 5, true);
    this.game.theCat.animations.add('right', [11, 12, 13, 14, 15, 16], 15, true);
    this.game.theCat.animations.add('heliRight', [27, 28, 29, 30, 31, 32], 10, true);
    this.game.theCat.animations.add('idleHeliRight', [33, 34, 35], 10, true);

    this.game.camera.follow(this.game.theCat);

    // create ledges - moving platforms
    this.game.addLedges = () => {
      this.game.allLedges.forEach(ledge => {
        const theLedge = this.game.add.sprite(ledge.startX, ledge.startY, ledge.sprite);
        this.game.physics.arcade.enable(theLedge);
        theLedge.enableBody = true;
        theLedge.scale.setTo(ledge.scaleX, ledge.scaleY);
        theLedge.body.immovable = true;
        ledge.spriteObj = theLedge;
      });
    };
    this.game.addLedges();

    // create each powerup pickup - laser and heli
    this.game.addPickups = () => {
      this.game.allPickups.forEach(pickup => {
        const thePickup = this.game.add.sprite(pickup.startX, pickup.startY, pickup.sprite);
        this.game.physics.arcade.enable(thePickup);
        this.game.slopes.enable(thePickup);
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
        thePickup.parentPickup = pickup;
        pickup.spriteObj = thePickup;
      });
    };

    this.game.drawUi();
    this.game.addPickups();
    this.game.addFoodCans();
    this.game.addPowerCells();
    this.game.addRats();
    this.game.addBugs();

    ///
  }

  update() {
    //this.game.debug.body(this.game.theCat);
    this.slopeLayer.debug = true;

    //this.game.bg_trees_2.tilePosition.set(-this.game.camera.x / 16, 0);
    //this.game.bg_trees.tilePosition.set(-this.game.camera.x / 64, 0);

    //this.game.bg_trees.tilePosition.set(-this.game.camera.x / 16, 0);
    //this.game.bg_vines.tilePosition.set(-this.game.camera.x / 64, 0);

    //this.game.bg_sky.tilePosition.set(-this.game.camera.x / 16, 0);
    this.game.bg_island.tilePosition.set(-this.game.camera.x / 32, 0);
    this.game.bg_reflection.tilePosition.set(-this.game.camera.x / 32, 0);
    this.game.bg_volcano.tilePosition.set(-this.game.camera.x / 32, 0);
    this.game.bg_sky_one.tilePosition.set(-this.game.camera.x / 48, 0);
    this.game.bg_sky_two.tilePosition.set(-this.game.camera.x / 40, 0);

    const catCollide = this.game.physics.arcade.collide(this.game.theCat, this.slopeLayer);

    this.game.allLedges.forEach(ledge => {
      this.game.physics.arcade.collide(ledge.spriteObj, this.game.theCat);
    });

    this.game.allPickups.forEach(pickup => {
      this.game.physics.arcade.collide(pickup.spriteObj, this.slopeLayer);
      if (!pickup.have) {
        this.game.physics.arcade.overlap(this.game.theCat, pickup.spriteObj, this.game.collectPickup, null, this);
      }
    });

    this.game.allFoodCans.forEach(can => {
      this.game.physics.arcade.collide(can.spriteObj, this.slopeLayer);
      this.game.physics.arcade.collide(can.spriteObj, this.game.theCat, this.game.collectCan, null, this);
    });

    this.game.allPowerCells.forEach(cell => {
      this.game.physics.arcade.collide(cell.spriteObj, this.slopeLayer);
      this.game.physics.arcade.overlap(cell.spriteObj, this.game.theCat, this.game.collectCell, null, this);
    });

    this.game.allRats.forEach(rat => {
      this.game.physics.arcade.collide(rat.spriteObj, this.slopeLayer);
      this.game.physics.arcade.collide(rat.spriteObj, this.ratBounds);
      this.game.physics.arcade.overlap(this.game.theCat, rat.spriteObj, this.game.biteTheCat, null, this);
      this.game.physics.arcade.overlap(this.game.theLaser.spriteObj, rat.spriteObj, this.game.killARat, null, this);
    });

    this.game.allBugs.forEach(bug => {
      this.game.physics.arcade.overlap(this.game.theCat, bug.spriteObj, this.game.biteTheCat, null, this);
      this.game.physics.arcade.overlap(this.game.theLaser.spriteObj, bug.spriteObj, this.game.killABug, null, this);
    });

    const nearDoor = () => {
      let catX = this.game.theCat.x;
      let doorX = this.game.facilityDoor.x;

      if (this.game.time.now > this.game.facilityDoor.delay) {
        if (catX > 197 * this.game.multiplier && !this.game.facilityDoor.open) {
          this.game.moveDoor('right');
        } else if (catX < 197 * this.game.multiplier && this.game.facilityDoor.open) {
          this.game.moveDoor('left');
        }
      }
    };
    nearDoor();

    const moveLedges = this.game.allLedges.forEach(ledge => {
      const ledgeSprite = ledge.spriteObj;

      if (ledge.moveY && ledge.moveX) {
        if (ledge.cycle) {
          ledgeSprite.body.velocity.x += 1;
          ledgeSprite.body.velocity.y -= 1;
          if (ledgeSprite.y < ledge.minY && ledgeSprite.x > ledge.maxX) {
            ledgeSprite.body.velocity.y = 0;
            ledgeSprite.body.velocity.x = 0;
            ledge.cycle = false;
          }
        } else if (!ledge.cycle) {
          ledgeSprite.body.velocity.x -= 1;
          ledgeSprite.body.velocity.y += 1;
          if (ledgeSprite.y > ledge.maxY && ledgeSprite.x < ledge.minX) {
            ledgeSprite.body.velocity.y = 0;
            ledgeSprite.body.velocity.x = 0;
            ledge.cycle = true;
          }
        }
      }

      if (ledge.moveY && !ledge.moveX) {
        if (ledge.cycle) {
          ledgeSprite.body.velocity.y += 2;
          if (ledgeSprite.y > ledge.maxY) {
            ledgeSprite.body.velocity.y = 0;
            ledge.cycle = false;
          }
        } else if (!ledge.cycle) {
          ledgeSprite.body.velocity.y -= 2;
          if (ledgeSprite.y < ledge.minY) {
            ledgeSprite.body.velocity.y = 0;
            ledge.cycle = true;
          }
        }
      }

      if (ledge.moveX && !ledge.moveY) {
        if (ledge.cycle) {
          ledgeSprite.body.velocity.x += 2;
          if (ledgeSprite.x > ledge.maxX) {
            ledgeSprite.body.velocity.x = 0;
            ledge.cycle = false;
          }
        } else if (!ledge.cycle) {
          ledgeSprite.body.velocity.x -= 2;
          if (ledgeSprite.x < ledge.minX) {
            ledgeSprite.body.velocity.x = 0;
            ledge.cycle = true;
          }
        }
      }
    });

    const ratBehavior = this.game.allRats.forEach(rat => {
      const ratSprite = rat.spriteObj;
      let blockedLeft = ratSprite.body.blocked.left;
      let blockedRight = ratSprite.body.blocked.right;

      if (rat.direction === 'left' && !rat.dead) {
        ratSprite.body.velocity.x = -50;
        ratSprite.animations.play('moveLeft');
        if (blockedLeft) {
          rat.direction = 'right';
          ratSprite.body.velocity.x = 50;
          ratSprite.animations.play('moveRight');
        }
      }
      if (rat.direction === 'right' && !rat.dead) {
        ratSprite.body.velocity.x = 50;
        ratSprite.animations.play('moveRight');
        if (blockedRight) {
          rat.direction = 'left';
          ratSprite.body.velocity.x = -50;
          ratSprite.animations.play('moveLeft');
        }
      }
      if (ratSprite.alpha === 0) {
        ratSprite.kill();
      }
    });

    const bugBehavior = this.game.allBugs.forEach(bug => {
      const bugSprite = bug.spriteObj;

      if (bug.cycleX) {
        bugSprite.body.velocity.x = this.game.randomNumber(150, 250);
        if (bugSprite.x > bug.endX) {
          bugSprite.body.velocity.x = 0;
          bug.cycleX = false;
        }
      }
      if (!bug.cycleX) {
        bugSprite.body.velocity.x = this.game.randomNumber(-250, -150);
        if (bugSprite.x < bug.startX) {
          bugSprite.body.velocity.x = 0;
          bug.cycleX = true;
        }
      }

      if (bug.cycleY) {
        //bugSprite.body.velocity.y = 200;
        bugSprite.body.gravity.y = this.game.randomNumber(100, 400);
        if (bugSprite.y > bug.endY) {
          //bugSprite.body.velocity.y = 0;
          bugSprite.body.gravity.y = 0;
          bug.cycleY = false;
        }
      }
      if (!bug.cycleY) {
        //bugSprite.body.velocity.y = -200;
        bugSprite.body.gravity.y = this.game.randomNumber(-400, -100);
        if (bugSprite.y < bug.startY) {
          //bugSprite.body.velocity.y = 0;
          bugSprite.body.gravity.y = 0;
          bug.cycleY = true;
        }
      }

      bugSprite.animations.play('buzz');
    });

    const fishBehavior = this.game.allFish.forEach(fish => {
      const fishSprite = fish.spriteObj;

      if (fish.cycleY) {
        fishSprite.body.velocity.y = -200;
        fishSprite.angle = 0;
        if (fishSprite.y < fish.endY) {
          fishSprite.body.velocity.y = 0;
          fish.cycleY = false;
        }
      }

      if (!fish.cycleY) {
        fishSprite.body.velocity.y = 200;
        fishSprite.angle = 180;
        if (fishSprite.y > fish.startY) {
          fishSprite.body.velocity.y = 0;
          fish.cycleY = true;
        }
      }

      fishSprite.animations.play('gulp');
    });

    this.game.theRemainingRats.setText('Rats: ' + this.game.allRats.length);

    this.game.theScore.setText('Cans: ' + this.game.score);

    this.game.patty.animations.play('idleLeft');

    this.game.theCat.body.velocity.x = 0;
    if (this.game.theCat.body.y === 1856) {
      this.game.catIsDown();
    }

    if (this.game.spaceKey.isDown && this.game.theHeli.currentNrg === 0) {
      this.game.theCat.animations.stop(null, false);
      if (this.game.theCat.direction === 'left') {
        this.game.theCat.animations.play('idleLeft');
      } else if (this.game.theCat.direction === 'right') {
        this.game.theCat.animations.play('idleRight');
      }
    }

    if (this.game.keys.left.isDown && !this.game.spaceKey.isDown) {
      this.game.theCat.isSitting = false;
      this.game.theCat.direction = 'left';
      this.game.theCat.body.velocity.x = -240;
      if (this.game.theCat.body.onFloor() || this.game.theCat.body.touching.down) {
        this.game.theCat.animations.play('left');
      } else {
        this.game.theCat.frame = 2;
      }
    }
    if (
      !this.game.keys.left.isDown &&
      !this.game.spaceKey.isDown &&
      !this.game.theCat.isSitting &&
      this.game.theCat.direction === 'left'
    ) {
      this.game.theCat.animations.play('idleLeft');
    }

    if (this.game.keys.right.isDown && !this.game.spaceKey.isDown) {
      this.game.theCat.isSitting = false;
      this.game.theCat.direction = 'right';
      this.game.theCat.body.velocity.x = 240;
      if (this.game.theCat.body.onFloor() || this.game.theCat.body.touching.down) {
        this.game.theCat.animations.play('right');
      } else {
        this.game.theCat.frame = 11;
      }
    }
    if (
      !this.game.keys.right.isDown &&
      !this.game.spaceKey.isDown &&
      !this.game.theCat.isSitting &&
      this.game.theCat.direction === 'right'
    ) {
      this.game.theCat.animations.play('idleRight');
    }

    if (this.game.keys.up.isDown && !this.game.theCat.isSitting) {
      if (this.game.theCat.body.onFloor() && catCollide) {
        this.game.theCat.body.velocity.y = -250;
      } else if (this.game.theCat.body.touching.down) {
        this.game.theCat.body.velocity.y = -250;
      }
    }

    this.game.keys.down.onDown.add(this.game.sitCat);

    this.game.theHeliNrgRatio = this.game.theHeli.currentNrg / this.game.theHeli.maxNrg;
    this.game.flyHeli();
    this.game.heliCharge();

    this.game.bindLaser();

    if (this.game.score === 3 && !this.game.cansCollected) {
      this.game.allCansCollected();
    }

    if (this.game.allRats.length === 0 && !this.game.ratsDead) {
      this.game.allRatsDead();
    }

    ///
  }

  ////
}

export default Main;
