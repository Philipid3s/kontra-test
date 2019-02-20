/**
 * tutorial: https://github.com/straker/kontra/blob/master/examples/galaxian/js/galaxian.js
 */

kontra.init();

// load assets

kontra.assets.load(
  // tilesets
  '../imgs/roguelikeDungeon_transparent.png', '../data/marginTiles.json', '../data/rogueLikeDungeon_transparent.json',
  // sprites
  '../imgs/warrior_m.png'
).then(function() {

  let tileEngine = kontra.tileEngine(kontra.assets.data['../data/marginTiles']);

  let spriteSheet = kontra.spriteSheet({
    image: kontra.assets.images['../imgs/warrior_m.png'],
    frameWidth: 32,
    frameHeight: 36,
    animations: {
      idle: {
        frames: 7  // single frame
      },
    }
  });

  spriteSheet.createAnimations({
    // create a named animation: walk right
    walkRight: {
      frames: '3..5',  // frames 3 through 5
      frameRate: 30,
    },
    walkLeft: {
      frames: '9..11',  
      frameRate: 30,
    },
    walkUp: {
      frames: '0..2',
      frameRate: 30
    },
    walkDown: {
      frames: '6..8',
      frameRate: 30
    }
  });

  let player = kontra.sprite({
      x: 50,        // starting x,y position of the sprite
      y: 50,
      // color: 'blue',  // fill color of the sprite rectangle

      animations: spriteSheet.animations
  });
  
  let limitX = kontra.canvas.width - player.width;
  let limitY = kontra.canvas.height - player.height;

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
* Spawn a new wave of enemies (6 enemies)
*/
function spawnWave() {
    var width = 10;
    
    var x = 100;
    var y = -10;

    for (var i = 1; i <= 6; i++) {
      enemies.get({
        x: x,
        y: y,
        width: 10,
        height: 10,
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

          // randomly fire bullets
          if (Math.floor(Math.random()*101)/100 < .01) {
            enemyBullets.get({
              width: 5,
              height: 5,
              x: this.x + this.width / 2,
              y: this.y + this.height,
              dy: 2.5,

              // image: kontra.assets.images.bullet_enemy,
              color: 'orange',

              ttl: 150,
              type: 'hostile'
            });
          }
        },
      });

      x += width + 25;
    }
}

let loop = kontra.gameLoop({  // create the main game loop
    update: function() {        // update the game state
      // player.update();

      enemies.update();
      enemyBullets.update();
  
      // player.animations.idle.update();

      // wrap the sprites position when it reaches
      // the edge of the screen
      if (player.x > limitX) {
        player.x = limitX;
      }
      if (player.x < 0) {
        player.x = 0;
      }

      if (player.y > limitY) {
        player.y = limitY;
      }
      if (player.y < 0) {
        player.y = 0;
      }

      spriteSheet.animations.idle.update();
      
      if (kontra.keys.pressed('right')) {
        spriteSheet.animations.walkRight.update();
        player.x += 2;
      }
      if (kontra.keys.pressed('left')) {
        spriteSheet.animations.walkLeft.update();
        player.x -= 2;
      }
      if (kontra.keys.pressed('up')) {
        spriteSheet.animations.walkUp.update();
        player.y -= 2;
      }
      if (kontra.keys.pressed('down')) {
        spriteSheet.animations.walkDown.update();
        player.y += 2;
      }
      
      if(tileEngine.layerCollidesWith('collision', player)) {
        if (kontra.keys.pressed('right')) {
          player.x -= 2;
        }
        if (kontra.keys.pressed('left')) {
          player.x += 2;
        }
        if (kontra.keys.pressed('up')) {
          player.y += 2;
        }
        if (kontra.keys.pressed('down')) {
          player.y -= 2;
        }
      }

      // spawn a new wave of enemies
      if (enemies.getAliveObjects().length === 0) {
        spawnWave();
      }
    },
    render: function() {        // render the game state
      // background
      tileEngine.render();

      enemies.render();
      enemyBullets.render();

      if (kontra.keys.pressed('right')) {
        spriteSheet.animations.walkRight.render({x: player.x, y: player.y});
      }
      else if (kontra.keys.pressed('left')) {
        spriteSheet.animations.walkLeft.render({x: player.x, y: player.y});
      }
      else if (kontra.keys.pressed('up')){
        spriteSheet.animations.walkUp.render({x: player.x, y: player.y});
      }
      else if (kontra.keys.pressed('down')){
        spriteSheet.animations.walkDown.render({x: player.x, y: player.y});
      }
      else {
        spriteSheet.animations.idle.render({x: player.x, y: player.y});
      }
    }
});
  
loop.start();    // start the game
});