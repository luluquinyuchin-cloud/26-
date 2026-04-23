let weeds = [];
let bubbles = [];

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('pointer-events', 'none'); // 設定畫布不攔截滑鼠事件，讓後方 iframe 可被操作

  let iframe = createElement('iframe');
  iframe.position(0, 0);
  iframe.size(windowWidth, windowHeight);
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('border', 'none');
  iframe.style('z-index', '-1'); // 將 iframe 設定在最底層

  let colors = ['#355070', '#6d597a', '#b56576', '#e56b6f', '#eaac8b'];
  for (let i = 0; i < 80; i++) {
    let x = map(i, 0, 79, 0, width); // 位置
    let h = random(height * 0.2, height * 0.45); // 高度
    let w = random(40, 50); // 粗細
    let speed = random(0.002, 0.005); // 搖晃頻率
    let col = color(random(colors)); // 顏色
    col.setAlpha(220);
    weeds.push(new Weed(x, h, w, speed, col));
  }
}

function draw() {
  clear(); // 每一幀清空畫布，避免半透明背景疊加
  background(168, 218, 220, 76); // 背景顏色 #a8dadc (RGB: 168, 218, 220)，透明度 0.3 (約 76)
  blendMode(BLEND);
  for (let w of weeds) {
    w.display();
  }

  // 產生氣泡：有一定機率產生新的氣泡
  if (random() < 0.05) {
    bubbles.push(new Bubble());
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}

class Weed {
  constructor(x, h, w, speed, col) {
    this.x = x;
    this.h = h;
    this.w = w;
    this.speed = speed;
    this.col = col;
    this.noiseOffset = random(1000); // 隨機噪聲偏移，避免同步搖晃
  }

  display() {
    stroke(this.col);
    strokeWeight(this.w);
    strokeCap(ROUND);
    noFill();

    beginShape();
    curveVertex(this.x, height);
    // 增加頂點密度 (50 -> 20) 讓曲線更平滑
    for (let y = height; y > height - this.h; y -= 20) {
      let progress = map(y, height, height - this.h, 0, 1);
      // 降低 y 的噪聲係數 (0.005 -> 0.002) 讓彎曲更自然平緩
      let xOffset = map(noise(y * 0.002, frameCount * this.speed + this.noiseOffset), 0, 1, -100, 100);
      curveVertex(this.x + xOffset * (progress * progress), y);
    }
    // 補上確切的頂部點
    let tipY = height - this.h;
    let tipXOffset = map(noise(tipY * 0.002, frameCount * this.speed + this.noiseOffset), 0, 1, -100, 100);
    // 頂部進度為 1，所以 offset * 1 * 1
    curveVertex(this.x + tipXOffset, tipY); // 實際頂點
    curveVertex(this.x + tipXOffset, tipY); // 結束控制點
    endShape();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(10, 50); // 從底部下方開始
    this.d = random(10, 25); // 氣泡大小
    this.speed = random(1, 3); // 上升速度
    this.popHeight = random(height * 0.2, height * 0.8); // 隨機破掉的高度
    this.popped = false; // 是否破掉
    this.popTimer = 10; // 破掉動畫的時間
    this.xOffset = random(100);
  }

  update() {
    if (!this.popped) {
      this.y -= this.speed;
      // 讓氣泡左右輕微搖晃
      this.x += map(noise(frameCount * 0.05 + this.xOffset), 0, 1, -1, 1);
      
      if (this.y < this.popHeight) {
        this.popped = true;
      }
    } else {
      this.popTimer--;
    }
  }

  display() {
    if (!this.popped) {
      noStroke();
      // 氣泡本體：白色，透明度 0.5 (約 127)
      fill(255, 127);
      circle(this.x, this.y, this.d);
      
      // 左上角高光：白色，透明度 0.8 (約 204)
      fill(255, 204);
      circle(this.x - this.d * 0.25, this.y - this.d * 0.25, this.d * 0.25);
    } else {
      // 破掉的效果：畫一個擴散的圓圈
      noFill();
      stroke(255, map(this.popTimer, 10, 0, 200, 0));
      strokeWeight(2);
      circle(this.x, this.y, this.d + (10 - this.popTimer) * 2);
    }
  }

  isFinished() {
    return this.popped && this.popTimer <= 0;
  }
}
