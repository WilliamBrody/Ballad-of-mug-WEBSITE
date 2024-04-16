let loc;
let levelMaps = [];
let blocks;
let coinArr = [];  
let lvl3coinArr = [];
let lvl2coinArr = [];
let mugWalk = [];
let enemyMove = [];
let enemyAttack = [];
let mugAtackImg;
let score = 0;
let mug;
let enemy;
let block;
let healthBarImg;
let bar;
let gameState = false;
let dashCooldown;
let highScore;
let reset;
let level = 0;
let onGround = true
let jump = false
let fallDist = -3
let fall = false
let ground = 400
let enemyArr = ["flamingo", "giraffe", "giraffe"];
let easyButton;
let normalButton;
let hardButton;
let enemySizeX = [120, 200, 350]
let enemySizeY = [120, 200, 350]
let damage = [
  [0.5, 1, 2.5], //flamingo
  [1, 2.5, 5], //giraffe,   
  [2, 3, 6]
]
let mode;
let mugX = [90, 525, 25];
let mugY = [350, 49, 350];
let spikeArr = [];
let spike;
let climb = true
let kickoff = false;


function setup() {
  createCanvas(600, 400);
  localStorage.setItem("highScore", 0);
  mug = new Mug(mugX[level], mugY[level]);
  dashCooldown = 0;
  reset = createButton('Reset');
  reset.position(280, 230)
  reset.mousePressed(reload);
  reset.hide()
  enemy = new Enemy(300, 400 - enemySizeY[level]);
  blocks = loadLevel(levelMaps[level]);
  bar = new healthBar();

  // coin definitions go here
  coinArr.push(new Coin(560, 290, 10));

  lvl3coinArr.push(new Coin(120, 50, 10), new Coin(500, 250, 10), new Coin(300, 150, 10), new Coin(350, 250, 10));
  lvl2coinArr.push(new Coin(560, 250, 10), new Coin(470, 150, 10), new Coin(305, 150, 10), new Coin(130, 150, 10), new Coin(390, 350, 10), new Coin(220 , 350, 10));

  easyButton = createButton('Easy')
  easyButton.position(75, 150)
  easyButton.size(100, 50)
  normalButton = createButton('Normal')
  normalButton.position(225, 150)
  normalButton.size(100, 50)
  hardButton = createButton('Hard')
  hardButton.position(375, 150)
  hardButton.size(100, 50)

  easyButton.mousePressed(easyMode)
  normalButton.mousePressed(normalMode)
  hardButton.mousePressed(hardMode)
  easyButton.show();
  normalButton.show();
  hardButton.show();

}


function preload() {
  levelMaps.push(loadStrings("level1.txt"));
  levelMaps.push(loadStrings("level2.txt"));
  levelMaps.push(loadStrings("level3.txt"));
  mugWalk.push(loadImage('mugMove/mug1.png'), loadImage('mugMove/mug2.png'), loadImage('mugMove/mug3.png'));
  enemyMove.push(loadImage(enemyArr[level] + 'Move/' + enemyArr[level] + '1.png'), loadImage(enemyArr[level] + 'Move/' + enemyArr[level] + '2.png'), loadImage(enemyArr[level] + 'Move/' + enemyArr[level] + '3.png'));
  enemyAttack.push(loadImage(enemyArr[level] + 'Attack/' + enemyArr[level] + '1.png'), loadImage(enemyArr[level] + 'Attack/' + enemyArr[level] + '2.png'));
  mugAttackImg = loadImage('mugAttack.png');
  block = loadImage('block.png');
  spike = loadImage('spike.png')
  bg = loadImage('background.png')
}

function reload() {
  if (level == 3) {
    level = 0;
    reload();
  } else {
    enemyMove = []
    enemyAttack = []
    enemyMove.push(loadImage(enemyArr[level] + 'Move/' + enemyArr[level] + '1.png'), loadImage(enemyArr[level] + 'Move/' + enemyArr[level] + '2.png'), loadImage(enemyArr[level] + 'Move/' + enemyArr[level] + '3.png'));
    enemyAttack.push(loadImage(enemyArr[level] + 'Attack/' + enemyArr[level] + '1.png'), loadImage(enemyArr[level] + 'Attack/' + enemyArr[level] + '2.png'));

    mug = new Mug(mugX[level], mugY[level]);//reset position based on level
    dashCooldown = 0;
    enemy = new Enemy(300, 400 - enemySizeY[level]);
    // print(enemySizeY[level])
    // print(400-enemySizeY[level])
    blocks = loadLevel(levelMaps[level]);
    spikeArr = loadSpikes(levelMaps[level]);
    bar = new healthBar();
    score = 0;
    if (mug.health <= 0) level = 0;
    coinArr.push(new Coin(560, 290, 10));
    reset.hide();
    gameState = true;
  }
}

function easyMode() {
  easyButton.hide();
  normalButton.hide();
  hardButton.hide();
  mode = 0;
  gameState = true;
}

function normalMode() {
  easyButton.hide();
  normalButton.hide();
  hardButton.hide();
  mode = 1;
  gameState = true;
}

function hardMode() {
  easyButton.hide();
  normalButton.hide();
  hardButton.hide();
  mode = 2;
  gameState = true;
}

function draw() {


  background(220);
  if (level == 3) {
    text("          Congratulations!\n\nclick reset to restart the game", 225, 150);
    reset.show();
  }
  if (gameState && level != 3) {
    image(bg, 0, 0);
    bar.show();
    if (mug.health <= 0) gameState = false;
    if (enemy.health <= 0) coinArr[0].isAlive = false
    fill(255)
    text("Score: " + score, 10, 40);
    text("High Score: " + localStorage.getItem("highScore"), 510, 20);
    if (dashCooldown != 0) text("Dash Cooldown: " + dashCooldown, 10, 60);
    else text("Dash: Ready", 10, 60);
    if (mug.attackCooldown != 0) text("Attack Cooldown: " + mug.attackCooldown, 10, 80);
    else text("Attack: Ready", 10, 80);

    if (frameCount % 60 == 0 && dashCooldown != 0) dashCooldown -= 1;
    if (frameCount % 60 == 0 && mug.attackCooldown != 0) mug.attackCooldown -= 1;
    mug.move();
    enemy.move();
    for (let i = 0; i < blocks.length; i++) {
      block.resize(blocks[i].w, blocks[i].h);
      spike.resize(blocks[i].w, blocks[i].h)
      let drawImg = block;
      if (blocks[i].type == "Spike") drawImg = spike;
      image(drawImg, blocks[i].x, blocks[i].y);
    }
    for (let i = 0; i < coinArr.length && level != 2 && level != 1; i++) {
      coinArr[i].show();
      if (coinArr[i].bounds.collide(mug.loc.x, mug.loc.y, 50, 50) && coinArr[i].isAlive == true) {
        score += coinArr[i].pointsValue;
        coinArr[i].isAlive = false;
      }
      
    }
    if (level == 2) {
      for (let i = 0; i < lvl3coinArr.length; i++) {
        lvl3coinArr[i].show();
        if (lvl3coinArr[i].bounds.collide(mug.loc.x, mug.loc.y, 50, 50) && lvl3coinArr[i].isAlive == true) {
          score += lvl3coinArr[i].pointsValue;
          lvl3coinArr[i].isAlive = false;
        }
      }
    }
    if (level == 1) {
      for (let i = 0; i < lvl2coinArr.length; i++) {
        lvl2coinArr[i].show();
        if (lvl2coinArr[i].bounds.collide(mug.loc.x, mug.loc.y, 50, 50) && lvl2coinArr[i].isAlive == true) {
          score += lvl2coinArr[i].pointsValue;
          lvl2coinArr[i].isAlive = false;
        }
      }
    }


    mug.draw();
    enemy.draw();
    if (enemy.alive == false) {
      level++;
      if (level != 3) {
        reload();
      }
    }
  } else if (mug.health <= 0) {

    if (score > localStorage.getItem("highScore")) {
      localStorage.setItem("highScore", score);
    }
    text("Game Over", 280, 200);
    reset.show();
  }
}

function loadLevel(arr) {
  obj = [];
  let x = 0;
  let y = 0;
  let deltaX = 600 / arr[0].length;
  let deltaY = 400 / arr.length;
  for (let i = 0; i < arr.length; i++) {
    let temp = arr[i].split("");
    for (let z = 0; z < temp.length; z++) {
      if (temp[z] == "+") {
        obj.push(new Bound(x, y, deltaX, deltaY));
      } else if (temp[z] == "^") {
        obj.push(new Bound(x, y, deltaX, deltaY, "Spike"));
      }
      x += deltaX;
    }
    y += deltaY;
    x = 0;
  }
  return obj;
}

function loadSpikes(arr) {
  spikes = [];
  let x = 0;
  let y = 0;
  let deltaX = 600 / arr[0].length;
  let deltaY = 10
  for (let i = 0; i < arr.length; i++) {
    let line = arr[i].split("");
    for (let j = 0; j < line.length; j++) {
      let character = line[j];
      if (character = "^") {
        spikes.push(new Bound(x, y, deltaX, deltaY));
      }
      x += deltaX
    }
    y += deltaY
    x = 0;
  }
  return spikes;
}

class Mug {
  constructor(x, y) {
    this.loc = new createVector(x, y);
    this.health = 5;
    this.deltaX = 1;
    this.deltaY = 0;
    this.currentFrame = 0;
    this.originalY = this.loc.y;
    this.attacking = false;
    this.attackCooldown = 0;
  }

  move() {
    if (!this.attacking) {
      if (keyIsDown(82) && dashCooldown == 0) {  //R: dash
        let dashSpeed = 200
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].collide(this.loc.x + 200 * this.deltaX, this.loc.y, 50, 50)) {
            dashSpeed = blocks[i].x - this.loc.x*this.deltaX - 50*this.deltaX
          }
          
          if (blocks[i].y + blocks[i].h == ground && this.loc.x + 50 < blocks[i].x && this.loc.x >= blocks[i].x - 200 && this.deltaX == 1) {
            dashSpeed = blocks[i].x - this.loc.x - 52
            break
          }

          if (blocks[i].y + blocks[i].h == ground && this.loc.x > blocks[i].x + blocks[i].w && this.loc.x <= blocks[i].x + blocks[i].w + 200 && this.deltaX == -1) {
            dashSpeed = this.loc.x - blocks[i].x - blocks[i].w - 2
            break
          }

        }
        if (this.loc.x + dashSpeed*-1 < 0) dashSpeed = this.loc.x
        dashCooldown = 5;
        this.loc.x += dashSpeed * this.deltaX
      }

      if (keyIsDown(65)) {
        this.deltaX = -1;
        this.loc.x += this.deltaX;
        if (frameCount % 10 == 0) this.currentFrame += 1;
      } else if (keyIsDown(68)) {
        this.deltaX = 1;
        this.loc.x += this.deltaX;
        if (frameCount % 10 == 0) this.currentFrame += 1;
      }
    }

    // JUMP
    if (keyIsDown(32) && this.originalY == this.loc.y) {
      this.deltaY = -3;
      this.originalY = this.loc.y;
    }
    this.loc.y += this.deltaY;
    if (this.originalY - this.loc.y > 60) {
      this.deltaY = 1;
    }
    if (this.loc.y >= this.originalY && this.deltaY == 1) {
      this.deltaY = 0;
      this.loc.y = this.originalY;
    }

    // BLOCKS COLLISION
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].collide(this.loc.x, this.loc.y, 50, 50)) {
        if (blocks[i].type == "Spike") {
          this.health --;
          this.loc.x = mugX[level];
          this.loc.y = mugY[level];
          this.attacking = false
        }
        if (blocks[i].type == "Block") {

          // Y COLLISION
          if (this.loc.y + 50 >= blocks[i].y && this.deltaY != -3) {
            this.loc.y --;
            this.originalY = this.loc.y+1;
          } else if (this.loc.y <= blocks[i].y + blocks[i].h && this.deltaY == -3) {
            this.loc.y += 4;
            this.deltaY = 0;
          }

          // X COLLISION
          if (this.loc.y + 50 >= blocks[i].y)   { // prevents you from being pushed off of the block, when walking on top
            if (this.loc.x + 50 >= blocks[i].x && this.deltaX == 1) this.loc.x --;
            else if (this.loc.x <= blocks[i].x + blocks[i].w && this.deltaX == -1) this.loc.x ++;
          }
          // CLIMB
          if (keyIsDown(87)) {
            this.loc.y --;
          }
          if (keyIsDown(32)) {
            this.deltaY = -3;
            this.loc.x -= this.deltaX*5;
            this.originalY = this.loc.y;
          }
        }
      }
    }

    // RESET FRAME LOOP
    if (this.currentFrame > 2) this.currentFrame = 0;

    // GRAVITY
    if (this.loc.y < 350) this.loc.y++;

    // DOUBLE JUMP PREVENT
    if (this.loc.y == 350) this.originalY = 350;
  }

  draw() {
    push();
    if (frameCount % 60 == 0) this.attacking = false;
    mugWalk[this.currentFrame].resize(50, 50);
    mugAttackImg.resize(60, 50);
    if (this.deltaX == -1) {
      scale(-1, 1);
      if (!this.attacking) image(mugWalk[this.currentFrame], -this.loc.x - 50, this.loc.y);
      else image(mugAttackImg, -this.loc.x - 50, this.loc.y);
    } else {
      if (!this.attacking) image(mugWalk[this.currentFrame], this.loc.x, this.loc.y);
      else image(mugAttackImg, this.loc.x, this.loc.y);
    }
    if (this.attacking && frameCount % 30 == 0) {
      if (enemy.bounds.attack(this.loc.x, this.loc.y, 60, 50)) {
        enemy.health -= 2;
      }
    }
    pop();
  }
}


class Enemy {
  constructor(x, y) {
    this.loc = new createVector(x, y);
    this.deltaX = -.25;
    this.currentFrame = 0;
    this.steps = 0;
    this.attacking = true;
    this.bounds = new Bound(x, y, enemySizeX[level], enemySizeY[level]);
    this.health = 30;
    this.alive = true;
  }

  draw() {
    if (this.health <= 0 && this.alive) {
      this.alive = false;
      score += 30;
    }
    if (this.health >= 0) {
      push();

      textSize(18);
      fill(220);
      strokeWeight(1.5)
      rect(178, 85, 250, 10, 15);
      fill(255);
      text(enemyArr[level], 280, 70);
      fill(150);
      rect(178, 85, this.health * 8.3333, 9, 15);
      if (!this.attacking) {
        enemyMove[this.currentFrame].resize(enemySizeX[level], enemySizeY[level]);
        if (this.deltaX > 0) {
          scale(-1, 1);
          image(enemyMove[this.currentFrame], -this.loc.x - enemySizeX[level], this.loc.y);
        } else {
          image(enemyMove[this.currentFrame], this.loc.x, this.loc.y);
        }
      } else {
        enemyAttack[this.currentFrame].resize(enemySizeX[level], enemySizeY[level]);
        if (this.deltaX > 0) {
          scale(-1, 1);
          image(enemyAttack[this.currentFrame], -this.loc.x - enemySizeX[level], this.loc.y);
        } else {
          image(enemyAttack[this.currentFrame], this.loc.x, this.loc.y);
        }
      }
      pop();
    }
  }

  move() {
    if (!this.attacking) {
      if (this.steps == 500 || this.steps == 100) {
        this.attacking = true;
        this.currentFrame = 0
      }
      if (this.steps < 1000) {
        this.loc.x += this.deltaX;
        this.steps += 1;
        if (frameCount % 20 == 0) this.currentFrame += 1;
      } else {
        this.steps = 0;
        this.deltaX *= -1;
      }
      if (this.currentFrame > 2) {
        this.currentFrame = 0;
      }
    } else {
      this.attack();
    }
  }

  attack() {

    if (frameCount % 30 == 0) this.currentFrame += 1;
    if (this.currentFrame > 1) {
      this.currentFrame = 0;
      this.attacking = false;
    }
    if (this.currentFrame == 1) {
      //console.log('attack')
      if (this.deltaX > 0) {
        this.bounds.x = this.loc.x;
        this.bounds.y = this.loc.y;
        this.bounds.w = enemySizeX[level];
      } else {
        this.bounds.x = this.loc.x;
        this.bounds.y = this.loc.y;
        this.bounds.w = enemySizeX[level];
      }

      if (frameCount % 30 == 0 && this.bounds.attack(mug.loc.x, mug.loc.y, 50, 50)) {
  
        // print(damage[level][mode])
        mug.health -= damage[level][mode];
      }
    }
  }

}

class Bound {
  constructor(x, y, w, h, type = "Block") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type;
  }

  attack(x, y, w, h) {
      return (
        this.x <= x + w &&
        this.x + this.w >= x &&
        this.y + this.h/2 <= y &&
        this.y + this.h >= y + h
      );
    }
  

  collide(x, y, w, h) {
    let boundY = this.y;
    let boundYHeight = this.h;
    if (this.type == "Spike") {
      boundY += 73; // Adjust this value as needed
      boundYHeight -= 58;
    }
    if (w == 50 || w == 60) {
      return (
        this.x <= x + w &&
        this.x + this.w >= x &&
        boundY <= y + h &&
        boundY+ boundYHeight >= y
      );
    } else {
      return (
        this.x <= x + w &&
        this.x + this.w + 1 >= x &&
        boundY <= y + h &&
        boundY + boundYHeight >= y
      );
    }
  }
}

class healthBar {
  constructor() {
    this.x = 10;
    this.y = 10;
  }
  show() {
    fill(220);
    strokeWeight(1.5)
    rect(this.x, this.y, 100, 10, 15);
    fill(150);
    rect(this.x, this.y, mug.health * 20, 9, 15);
  }

}

class Coin {
  constructor(x, y, d) {
    this.x = x;
    this.y = y;
    this.d = d;
    this.isAlive = true;
    this.pointsValue = 10;
    this.w = this.d / 2;
    this.h = this.d / 2;
    this.bounds = new Bound(this.x, this.y, this.w, this.h);
  }

  show() {
    if (this.isAlive == true) {
      strokeWeight(3);
      fill("yellow");
      circle(this.x, this.y, this.d);
      strokeWeight(1);
      fill(125);
    }
  }
}


function mouseClicked() {
  if (mug.attackCooldown == 0) {
    mug.attacking = true;
    mug.attackCooldown = 1;
  }
}