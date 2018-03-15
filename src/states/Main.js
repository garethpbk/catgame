class Main extends Phaser.State {
  create() {
    // draw main tiling cloud background
    this.game.bg_clouds = this.game.add.tileSprite(0, 0, 18048, 1920, "bg_clouds");
    // set background to scroll
    this.game.bg_clouds.autoScroll(25, 0);
    // start ARCADE physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.game.plugins.add(Phaser.Plugin.ArcadeSlopes);
    this.game.slopes.preferY = true;

    //add main tilemap
    this.map = this.game.add.tilemap("tilemap");
    // use the ground_tiles.png ('tiles') image for the tilemap
    this.map.addTilesetImage("ground_tiles", "ground_tiles");

    // add collision tiles
    this.map.addTilesetImage("arcade_slopes", "slope_tiles");
    this.slopeLayer = this.map.createLayer("SlopeLayer");
    this.game.slopes.convertTilemapLayer(this.slopeLayer, "arcadeslopes", 65);
    this.slopeLayer.alpha = 0;

    // draw the decoration layer - things that don't have collision but are still part of terrain
    this.decorationLayer = this.map.createLayer("DecorationLayer");
    // draw the rat bounds layer - contains data to tell rats where to collide and switch direction
    this.ratBounds = this.map.createLayer("RatBounds");

    // set collision for both map layers so that it's available to define more specifically later
    //map.setCollisionBetween(1, 64, true, groundLayer);
    this.map.setCollisionBetween(65, 102, true, this.slopeLayer);
    this.map.setCollisionBetween(1, 64, true, this.ratBounds);

    // make the ratBounds tiles invisible
    this.ratBounds.alpha = 0;

    // set world size to match size of groundLayer
    this.decorationLayer.resizeWorld();

    this.theCat = this.game.add.sprite(2 * this.game.multiplier, 1 * this.game.multiplier, "cat");
    this.game.physics.arcade.enable(this.theCat);
    this.theCat.body.setSize(48, 64, 18, 0);
    this.game.slopes.enable(this.theCat);
    this.theCat.body.gravity.y = 400;
    this.theCat.body.bounce.y = 0.1;
    this.theCat.body.collideWorldBounds = true;
    this.theCat.frame = 36;
    this.theCat.direction = "";
    this.theCat.isSitting = false;

    this.theCat.animations.add("idleLeft", [0, 1], 5, true);
    this.theCat.animations.add("left", [2, 3, 4, 5, 6, 7], 15, true);
    this.theCat.animations.add("heliLeft", [18, 19, 20, 21, 22, 23], 10, true);
    this.theCat.animations.add("idleHeliLeft", [24, 25, 26], 10, true);

    this.theCat.animations.add("idleRight", [9, 10], 5, true);
    this.theCat.animations.add("right", [11, 12, 13, 14, 15, 16], 15, true);
    this.theCat.animations.add("heliRight", [27, 28, 29, 30, 31, 32], 10, true);
    this.theCat.animations.add("idleHeliRight", [33, 34, 35], 10, true);

    this.game.camera.follow(this.theCat);

    // create each pickup item - laser and heli
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
        pickup.spriteObj = thePickup;
      });
    };
    this.game.addPickups();

    ///
  }

  update() {
    const catCollide = this.game.physics.arcade.collide(this.theCat, this.slopeLayer);

    this.game.allPickups.forEach(pickup => {
      this.game.physics.arcade.collide(pickup.spriteObj, this.slopeLayer);
    });

    this.theCat.body.velocity.x = 0;

    if (this.game.keys.left.isDown && !this.game.spaceKey.isDown) {
      this.theCat.isSitting = false;
      this.theCat.direction = "left";
      this.theCat.body.velocity.x = -240;
      if (this.theCat.body.onFloor() || this.theCat.body.touching.down) {
        this.theCat.animations.play("left");
      } else {
        this.theCat.frame = 2;
      }
    }
    if (!this.game.keys.left.isDown && !this.game.spaceKey.isDown && this.theCat.direction === "left") {
      this.theCat.animations.play("idleLeft");
    }

    if (this.game.keys.right.isDown && !this.game.spaceKey.isDown) {
      this.theCat.isSitting = false;
      this.theCat.direction = "right";
      this.theCat.body.velocity.x = 240;
      if (this.theCat.body.onFloor() || this.theCat.body.touching.down) {
        this.theCat.animations.play("right");
      } else {
        this.theCat.frame = 11;
      }
    }
    if (!this.game.keys.right.isDown && !this.game.spaceKey.isDown && this.theCat.direction === "right") {
      this.theCat.animations.play("idleRight");
    }

    if (this.game.keys.up.isDown && !this.theCat.isSitting) {
      if (this.theCat.body.onFloor() && catCollide) {
        this.theCat.body.velocity.y = -250;
      } else if (this.theCat.body.touching.down) {
        this.theCat.body.velocity.y = -250;
      }
    }

    ///
  }

  ////
}

export default Main;
