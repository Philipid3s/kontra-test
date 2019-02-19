kontra.init();

let sprite = kontra.sprite({
    x: 100,        // starting x,y position of the sprite
    y: 80,
    color: 'blue',  // fill color of the sprite rectangle
    width: 20,     // width and height of the sprite rectangle
    height: 20,
    // dx: 2          // move the sprite 2px to the right every frame
});
  
let limitX = kontra.canvas.width - sprite.width;
let limitY = kontra.canvas.height - sprite.height;

/**
 *  Object pools
 */ 
let enemies = kontra.pool({
    create: kontra.sprite,
    maxSize: 10
});

let enemyBullets = kontra.pool({
    create: kontra.sprite,
    maxSize: 30
});

/**
* Spawn a new wave of enemies.
*/
function spawnWave() {
    var width = 10;
    var height = 10;
    var x = 100;
    var y = -10;
    var spacer = y * 1.5;

    for (var i = 1; i <= 6; i++) {
      enemies.get({
        x: x,
        y: y,
        width: width,
        height: height,
        dy: 2,
        // image: kontra.assets.images.enemy,
        color: 'red',
        ttl: Infinity,
        leftEdge: x - 90,
        rightEdge: x + 90 + width,
        bottomEdge: y + 140,
        speed: 2,
        type: 'enemy',

        update: function() {
          this.advance();

          // change enemy velocity to move back and forth
          if (this.x <= this.leftEdge) {
            this.dx = this.speed;
          }
          else if (this.x >= this.rightEdge) {
            this.dx = -this.speed;
          }
          else if (this.y >= this.bottomEdge) {
            this.dy = 0;
            this.dx = -this.speed;
            this.y -= 5;
          }
        },
      });

      x += width + 25;

      if (i % 6 === 0) {
        x = 100;
        y += spacer;
      }
    }
}

let loop = kontra.gameLoop({  // create the main game loop
    update: function() {        // update the game state
      sprite.update();

      enemies.update();
      enemyBullets.update();
  
      // wrap the sprites position when it reaches
      // the edge of the screen
      if (sprite.x > limitX) {
        sprite.x = limitX;
      }
      if (sprite.x < 0) {
        sprite.x = 0;
      }

      if (sprite.y > limitY) {
        sprite.y = limitY;
      }
      if (sprite.y < 0) {
        sprite.y = 0;
      }

      if (kontra.keys.pressed('right')) {
          sprite.x += 2;
      }
      if (kontra.keys.pressed('left')) {
        sprite.x -= 2;
      }
      if (kontra.keys.pressed('up')) {
        sprite.y -= 2;
      }
      if (kontra.keys.pressed('down')) {
        sprite.y += 2;
      }

      // spawn a new wave of enemies
      if (enemies.getAliveObjects().length === 0) {
        spawnWave();
      }
    },
    render: function() {        // render the game state
      sprite.render();

      enemies.render();
      enemyBullets.render();
    }
});
  
loop.start();    // start the game