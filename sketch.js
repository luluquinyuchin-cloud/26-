// ════════════════════════════════════════════════════════
//  作品發表畫廊  sketch.js
//  技術：p5.js vertex指令、for迴圈、陣列、class物件導向
//        網頁嵌入 iframe（Modal 彈窗）
// ════════════════════════════════════════════════════════

// ★ 在這裡填入作品資料
const artworkData = [
  { id: 1, title: '作品一', desc: '第一周',   url: '060310/index.html' },
  { id: 2, title: '作品二', desc: '第一周-2', url: '060310-2/index.html' },
  { id: 3, title: '作品三', desc: '第二周',   url: '060317/index.html' },
  { id: 4, title: '作品四', desc: '第三周',   url: '0324/index.html' },
];

// ════════════════════════════════════════════════════════
//  Class：天鵝絨窗簾
// ════════════════════════════════════════════════════════
class Curtain {
  constructor(fw, fh, desc) {
    this.fw      = fw;
    this.fh      = fh;
    this.desc    = desc;
    this.open    = 0;       // 0=全閉 1=全開
    this.target  = 0;
    this.hovered = false;
  }

  update() {
    this.open = lerp(this.open, this.target, 0.065);
  }

  draw() {
    this.update();
    if (this.open > 0.997) return;

    const w  = this.fw;
    const h  = this.fh;
    const op = 1 - this.open;  // 遮擋量

    this._drawRod(w, h);
    this._drawPanel(w, h, op, true);   // 左片
    this._drawPanel(w, h, op, false);  // 右片

    if (op > 0.12) {
      this._drawPlaque(h, op);
    }
  }

  // ── 天鵝絨布料（左或右片）──
  _drawPanel(w, h, op, isLeft) {
    const halfW   = w / 2;
    const panelW  = halfW * op;       // 這片當前展開寬度
    const FOLDS   = 7;                // 摺數（奇數讓中心對稱）
    const foldW   = panelW / FOLDS;   // 單摺寬度
    const sign    = isLeft ? 1 : -1;  // 左=1 右=-1

    push();
    // 左片從 -halfW 開始向右展；右片從 +halfW 開始向左展
    translate(isLeft ? -halfW : halfW, -h / 2);

    for (let f = 0; f < FOLDS; f++) {
      // 摺在畫框座標：左片向右堆，右片向左堆
      const x0 = sign * f * foldW;
      const x1 = sign * (f + 1) * foldW;

      // 每摺明暗交替：峰=亮 谷=暗
      const isCrest = (f % 2 === 0);

      // ── 天鵝絨底色 ──
      // 深酒紅：峰比谷亮一些
      const baseR = isCrest ? 145 : 90;
      const baseG = isCrest ?  18 : 10;
      const baseB = isCrest ?  18 : 10;

      noStroke();

      // 主面（用 vertex 帶輕微波形）
      fill(baseR, baseG, baseB, 252);
      beginShape();
      for (let yi = 0; yi <= 20; yi++) {
        const t  = yi / 20;
        const y  = t * h;
        // 摺皺的橫向偏移：越靠上越強，越靠下收斂（模擬重力垂墜）
        const sag = sin(t * PI * 2.2 + f * 0.9) * foldW * 0.14 * (1 - t * 0.4);
        vertex(x0 + sag, y);
      }
      for (let yi = 20; yi >= 0; yi--) {
        const t  = yi / 20;
        const y  = t * h;
        const sag = sin(t * PI * 2.2 + f * 0.9) * foldW * 0.14 * (1 - t * 0.4);
        vertex(x1 + sag, y);
      }
      endShape(CLOSE);

      // ── 天鵝絨光澤層（斜向高光）──
      // 峰頂加一條細亮條
      if (isCrest) {
        const cx = (x0 + x1) / 2;
        for (let gi = 3; gi >= 1; gi--) {
          fill(220, 60, 60, 14 * gi);
          beginShape();
          for (let yi = 0; yi <= 20; yi++) {
            const t   = yi / 20;
            const y   = t * h;
            const sag = sin(t * PI * 2.2 + f * 0.9) * foldW * 0.14 * (1 - t * 0.4);
            const off = foldW * 0.12 * gi;
            vertex(cx + sag - off, y);
          }
          for (let yi = 20; yi >= 0; yi--) {
            const t   = yi / 20;
            const y   = t * h;
            const sag = sin(t * PI * 2.2 + f * 0.9) * foldW * 0.14 * (1 - t * 0.4);
            const off = foldW * 0.12 * gi;
            vertex(cx + sag + off, y);
          }
          endShape(CLOSE);
        }
      }

      // ── 谷底陰影 ──
      fill(0, 0, 0, isCrest ? 18 : 55);
      beginShape();
      for (let yi = 0; yi <= 20; yi++) {
        const t   = yi / 20;
        const y   = t * h;
        const sag = sin(t * PI * 2.2 + f * 0.9) * foldW * 0.14 * (1 - t * 0.4);
        vertex(x0 + sag, y);
        vertex(x0 + sag + sign * foldW * 0.28, y);
      }
      endShape(CLOSE);
    }

    // ── 底部金色邊條 ──
    stroke(180, 140, 50, 200);
    strokeWeight(2);
    const ex0 = 0;
    const ex1 = sign * panelW;
    line(ex0, h - 1, ex1, h - 1);

    // ── 流蘇 ──
    const fringeN = max(1, floor(panelW / 9));
    for (let fi = 0; fi < fringeN; fi++) {
      const fx   = sign * (fi + 0.5) * (panelW / fringeN);
      const flen = 16 + sin(fi * 1.7) * 5;
      // 流蘇絲線
      stroke(180, 140, 50, 160);
      strokeWeight(0.8);
      line(fx, h, fx, h + flen);
      // 末端金珠
      noStroke();
      fill(200, 160, 55, 220);
      ellipse(fx, h + flen + 2.5, 5, 5);
      fill(240, 210, 120, 160);
      ellipse(fx, h + flen + 1, 2.5, 2.5);
    }

    pop();
  }

  // ── 銅製窗簾桿 ──
  _drawRod(w, h) {
    const ry  = -h / 2 - 12;
    const ext = 22;

    // 桿主體（漸層感：多層）
    stroke(55, 38, 14);
    strokeWeight(7);
    line(-w/2 - ext, ry, w/2 + ext, ry);
    stroke(110, 80, 30);
    strokeWeight(4);
    line(-w/2 - ext, ry, w/2 + ext, ry);
    // 亮面
    stroke(200, 160, 70, 130);
    strokeWeight(1.5);
    line(-w/2 - ext, ry - 2, w/2 + ext, ry - 2);
    // 暗面
    stroke(30, 20, 5, 100);
    strokeWeight(1);
    line(-w/2 - ext, ry + 3, w/2 + ext, ry + 3);

    // 端球
    this._drawFinial(-w/2 - ext, ry);
    this._drawFinial( w/2 + ext, ry);

    // 環扣（for 迴圈）
    const rings = 8;
    for (let i = 0; i <= rings; i++) {
      const rx = map(i, 0, rings, -w/2, w/2);
      stroke(140, 100, 38, 180);
      strokeWeight(2);
      noFill();
      ellipse(rx, ry, 8, 11);
      stroke(200, 160, 70, 80);
      strokeWeight(0.8);
      ellipse(rx, ry - 1, 5, 7);
    }
  }

  _drawFinial(x, y) {
    // 外球
    noStroke();
    fill(90, 62, 20);
    ellipse(x, y, 18, 18);
    // 中亮
    fill(160, 120, 45);
    ellipse(x, y - 1, 13, 13);
    // 高光
    fill(220, 185, 90, 200);
    ellipse(x - 2, y - 4, 5, 5);
    // 暗邊
    noFill();
    stroke(40, 28, 8, 160);
    strokeWeight(1);
    ellipse(x, y, 18, 18);
  }

  // ── 窗簾說明牌 ──
  _drawPlaque(h, op) {
    const pw = 138, ph = 60;
    const py = h * 0.05;  // 略偏上中央
    const al = op * 255;

    // 掛線
    stroke(140, 100, 40, al * 0.45);
    strokeWeight(1);
    line(0, -h/2 + 18, 0, py - ph/2 - 10);

    // 外殼（金色斜切邊框）
    noStroke();
    fill(75, 50, 15, al * 0.92);
    // 用 vertex 做輕微斜切的八角形感
    beginShape();
    vertex(-pw/2 + 5, -ph/2 - 3);
    vertex( pw/2 - 5, -ph/2 - 3);
    vertex( pw/2 + 3,  py - ph/2 + 5);  // 右上角不含 py 偏移先用相對
    vertex( pw/2 + 3,  py + ph/2 - 5);
    vertex( pw/2 - 5,  py + ph/2 + 3);
    vertex(-pw/2 + 5,  py + ph/2 + 3);
    vertex(-pw/2 - 3,  py + ph/2 - 5);
    vertex(-pw/2 - 3,  py - ph/2 + 5);
    endShape(CLOSE);

    // 內底色
    fill(22, 6, 6, al * 0.96);
    rect(-pw/2, py - ph/2, pw, ph, 2);

    // 雙層金線框
    stroke(190, 150, 60, al * 0.75);
    strokeWeight(1);
    noFill();
    rect(-pw/2,     py - ph/2,     pw,     ph,     2);
    stroke(190, 150, 60, al * 0.35);
    strokeWeight(0.6);
    rect(-pw/2 + 5, py - ph/2 + 5, pw-10, ph-10, 1);

    // 四角菱形
    noStroke();
    fill(200, 160, 60, al * 0.75);
    const cs = [[-pw/2+9, py-ph/2+9],[pw/2-9, py-ph/2+9],
                [-pw/2+9, py+ph/2-9],[pw/2-9, py+ph/2-9]];
    for (let i = 0; i < cs.length; i++) {
      push(); translate(cs[i][0], cs[i][1]); rotate(PI/4);
      rect(-2.2,-2.2,4.4,4.4); pop();
    }

    // 標題文字
    noStroke();
    fill(235, 205, 145, al);
    textAlign(CENTER, CENTER);
    textSize(12);
    textFont('Georgia');
    text('作  業  內  容', 0, py - ph/2 + 16);

    // 橫線
    stroke(190, 150, 60, al * 0.38);
    strokeWeight(0.6);
    line(-pw/2+14, py - ph/2 + 28, pw/2-14, py - ph/2 + 28);

    // 說明文字
    noStroke();
    fill(185, 145, 100, al * 0.9);
    textSize(11);
    text(this.desc, 0, py - ph/2 + 42);

    // hover 提示
    if (this.hovered && this.target === 0) {
      fill(235, 205, 145, al * 0.45);
      textSize(8);
      text('▶  點 擊 拉 開 窗 簾', 0, py + ph/2 - 8);
    }
  }
}

// ════════════════════════════════════════════════════════
//  Class：畫框
// ════════════════════════════════════════════════════════
class Frame {
  constructor(id, title, desc, url, x, y, w, h) {
    this.id       = id;
    this.title    = title;
    this.desc     = desc;
    this.url      = url;
    this.x        = x;
    this.y        = y;
    this.w        = w;
    this.h        = h;
    this.hover    = false;
    this.hoverAmt = 0;
    this.floatT   = random(TWO_PI);
    this.curtain  = new Curtain(w, h, desc);
  }

  screenX() { return this.x - scrollX; }

  checkHover(mx, my) {
    const sx = this.screenX();
    const fo = sin(frameCount * 0.018 + this.floatT) * 4;
    const inF = (
      mx > sx - this.w/2 - FRAME_PAD &&
      mx < sx + this.w/2 + FRAME_PAD &&
      my > sy(this) - this.h/2 - FRAME_PAD &&
      my < sy(this) + this.h/2 + FRAME_PAD
    );
    this.hover = inF;
    this.curtain.hovered = inF;
  }

  draw() {
    const sx  = this.screenX();
    const ssy = sy(this);
    this.hoverAmt = lerp(this.hoverAmt, this.hover ? 1 : 0, 0.12);
    const sc = 1 + this.hoverAmt * 0.02;

    push();
    translate(sx, ssy);
    scale(sc);

    this._drawWallMount();
    this._drawShadow();
    this._drawGlow();
    this._drawFrameOuter();
    this._drawFrameInner();
    this._drawCanvas();
    this._drawHoverOverlay();
    this.curtain.draw();
    this._drawTitlePlate();
    pop();
  }

  _drawWallMount() {
    noStroke();
    fill(0, 0, 0, 28);
    ellipse(0, -this.h/2 - FRAME_PAD - 4, this.w * 0.55, 12);
    stroke(55, 40, 18, 90);
    strokeWeight(1.2);
    line(-this.w*0.14, -this.h/2-FRAME_PAD-1, 0, -this.h/2-FRAME_PAD-11);
    line( this.w*0.14, -this.h/2-FRAME_PAD-1, 0, -this.h/2-FRAME_PAD-11);
    noStroke();
    fill(75, 55, 22);
    ellipse(0, -this.h/2-FRAME_PAD-12, 7, 7);
    fill(140, 110, 50, 150);
    ellipse(0, -this.h/2-FRAME_PAD-13, 3.5, 3.5);
  }

  _drawShadow() {
    noStroke();
    for (let i = 10; i > 0; i--) {
      fill(0, 0, 0, 13);
      const pad = FRAME_PAD + 8 + i * 3;
      rect(-this.w/2 - pad + i*1.5, -this.h/2 - pad + i*1.5,
           this.w + pad*2, this.h + pad*2, 3);
    }
  }

  _drawGlow() {
    if (this.hoverAmt < 0.01) return;
    noStroke();
    for (let i = 7; i > 0; i--) {
      fill(201, 169, 110, 15 * this.hoverAmt * (i/7));
      const sp = (8-i) * 17;
      ellipse(0, -this.h/2 - FRAME_PAD - sp*0.18, sp*4.5, sp*1.7);
    }
  }

  _drawFrameOuter() {
    const p = FRAME_PAD, hw = this.w/2+p, hh = this.h/2+p;

    noStroke(); fill(46, 30, 12);
    rect(-hw, -hh, hw*2, hh*2);

    // 四邊斜面
    fill(96, 68, 30, 78);
    beginShape(); vertex(-hw,-hh); vertex(hw,-hh); vertex(hw-p,-hh+p); vertex(-hw+p,-hh+p); endShape(CLOSE);
    fill(80, 58, 24, 52);
    beginShape(); vertex(-hw,-hh); vertex(-hw+p,-hh+p); vertex(-hw+p,hh-p); vertex(-hw,hh); endShape(CLOSE);
    fill(0,0,0,72);
    beginShape(); vertex(hw,-hh); vertex(hw,hh); vertex(hw-p,hh-p); vertex(hw-p,-hh+p); endShape(CLOSE);
    fill(0,0,0,82);
    beginShape(); vertex(-hw,hh); vertex(hw,hh); vertex(hw-p,hh-p); vertex(-hw+p,hh-p); endShape(CLOSE);

    // 雕紋細線
    stroke(0,0,0,22); strokeWeight(0.5); noFill();
    for (let j = 3; j < p-2; j += 3) rect(-hw+j,-hh+j,(hw-j)*2,(hh-j)*2);

    // 金邊
    stroke(210,175,110,170); strokeWeight(1.3); noFill();
    rect(-hw+1,-hh+1,hw*2-2,hh*2-2);
    stroke(201,169,110,65); strokeWeight(0.6);
    rect(-hw+p-1,-hh+p-1,(hw-p+1)*2,(hh-p+1)*2);

    // 四角花
    this._cornerOrn(-hw,-hh, 1, 1);
    this._cornerOrn( hw,-hh,-1, 1);
    this._cornerOrn(-hw, hh, 1,-1);
    this._cornerOrn( hw, hh,-1,-1);
    // 中點浮雕
    this._midOrn(0,-hh); this._midOrn(0,hh);
    this._midOrn(-hw,0); this._midOrn(hw,0);
  }

  _cornerOrn(cx,cy,sx,sy) {
    push(); translate(cx+sx*5,cy+sy*5);
    stroke(235,205,132,205); strokeWeight(0.9);
    line(0,0,sx*11,0); line(0,0,0,sy*11);
    stroke(185,145,68,138);
    line(-sx*2,sy*3,sx*3,sy*3); line(sx*3,-sy*2,sx*3,sy*3);
    noStroke(); fill(225,185,88,205);
    push(); rotate(PI/4); rect(-2.9,-2.9,5.8,5.8); pop();
    fill(255,235,155,225); ellipse(0,0,2.8,2.8);
    pop();
  }

  _midOrn(cx,cy) {
    push(); translate(cx,cy);
    noStroke(); fill(46,30,12); ellipse(0,0,20,20);
    stroke(205,170,108,165); strokeWeight(0.9); noFill(); ellipse(0,0,17,17);
    noStroke(); fill(205,170,108,185);
    push(); rotate(PI/4); rect(-3.2,-3.2,6.4,6.4); pop();
    fill(255,238,175,205); ellipse(0,0,3.2,3.2);
    pop();
  }

  _drawFrameInner() {
    const p2 = FRAME_PAD-5, hw = this.w/2+p2, hh = this.h/2+p2;
    noStroke(); fill(14,10,5); rect(-hw,-hh,hw*2,hh*2);
    stroke(205,170,108,95); strokeWeight(0.9); noFill(); rect(-hw,-hh,hw*2,hh*2);
    for (let i=0;i<8;i++) {
      noFill(); stroke(0,0,0,map(i,0,8,62,0)); strokeWeight(1);
      rect(-hw+i*0.45,-hh+i*0.45,(hw-i*0.45)*2,(hh-i*0.45)*2);
    }
  }

  _drawCanvas() {
    const w=this.w,h=this.h;
    noStroke(); fill(10,8,5); rect(-w/2,-h/2,w,h);
    for (let i=0;i<10;i++) {
      noFill(); stroke(0,0,0,map(i,0,10,68,0)); strokeWeight(1);
      rect(-w/2+i*0.42,-h/2+i*0.42,w-i*0.84,h-i*0.84);
    }
    if (!this.url) {
      stroke(201,169,110,13); strokeWeight(0.6);
      for (let i=-w;i<w+h;i+=13) line(-w/2+i,-h/2,-w/2+i-h,h/2);
    }
  }

  _drawHoverOverlay() {
    if (this.curtain.open < 0.45) return;
    if (this.hoverAmt < 0.01) return;
    const blend = min(1, (this.curtain.open - 0.45) / 0.55);
    noStroke(); fill(5,3,1,155 * this.hoverAmt * blend);
    rect(-this.w/2,-this.h/2,this.w,this.h);
    if (!this.url) return;
    const bw=124,bh=36;
    stroke(205,170,108, 225 * this.hoverAmt * blend); strokeWeight(1);
    fill(0,0,0, 75 * this.hoverAmt * blend);
    rect(-bw/2,-bh/2,bw,bh,2);
    noStroke(); fill(235,215,165, 245 * this.hoverAmt * blend);
    textAlign(CENTER,CENTER); textSize(12); textFont('Georgia');
    text('觀  賞  作  品',0,1);
  }

  _drawTitlePlate() {
    const py = this.h/2 + FRAME_PAD + 30;
    stroke(118,88,52,95); strokeWeight(1);
    line(0,this.h/2+FRAME_PAD+5,0,py-9);

    const pw=112,ph=32;
    noStroke(); fill(22,14,5); rect(-pw/2-2,py-ph/2-2,pw+4,ph+4,2);
    fill(16,11,5); rect(-pw/2,py-ph/2,pw,ph,1);
    stroke(205,170,108,175); strokeWeight(0.9); noFill(); rect(-pw/2,py-ph/2,pw,ph,1);
    stroke(205,170,108,48); strokeWeight(0.5); rect(-pw/2+3,py-ph/2+3,pw-6,ph-6,1);

    noStroke(); fill(205,170,108,145);
    const rv=[[-pw/2+5,py-ph/2+5],[pw/2-5,py-ph/2+5],[-pw/2+5,py+ph/2-5],[pw/2-5,py+ph/2-5]];
    for (let i=0;i<rv.length;i++) ellipse(rv[i][0],rv[i][1],3.2,3.2);
    fill(185,145,58,155);
    push(); translate(-pw/2+9,py); rotate(PI/4); rect(-2.3,-2.3,4.6,4.6); pop();
    push(); translate( pw/2-9,py); rotate(PI/4); rect(-2.3,-2.3,4.6,4.6); pop();

    noStroke(); fill(235,215,165);
    textAlign(CENTER,CENTER); textSize(11); textFont('Georgia');
    text(this.title,0,py-1);
    fill(118,88,52,195); textSize(8.5);
    text('No. '+String(this.id).padStart(3,'0'),0,py+23);
  }

  isClicked(mx,my) {
    if (!this.url) return false;
    if (this.curtain.open < 0.45) return false;
    const sx=this.screenX(), ssy=sy(this);
    return (mx>sx-62&&mx<sx+62&&my>ssy-18&&my<ssy+18);
  }

  isCurtainClicked(mx,my) {
    const sx=this.screenX(), ssy=sy(this);
    return (
      mx > sx-this.w/2-FRAME_PAD && mx < sx+this.w/2+FRAME_PAD &&
      my > ssy-this.h/2-FRAME_PAD && my < ssy+this.h/2+FRAME_PAD
    );
  }
}

// ── 計算畫框螢幕 y 位置（含浮動+lift）──
function sy(f) {
  return f.y + sin(frameCount*0.018+f.floatT)*4 + f.hoverAmt*-10;
}

// ════════════════════════════════════════════════════════
//  全域變數
// ════════════════════════════════════════════════════════
const FRAME_PAD = 16;
let frames=[], scrollX=0, targetScrollX=0;
let isDragging=false, dragStartX=0, dragStartScroll=0, maxScroll=0;
let dustParticles=[], planters=[], wallLamps=[];

// ════════════════════════════════════════════════════════
//  setup()
// ════════════════════════════════════════════════════════
function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont('Georgia');

  const fH  = height * 0.50;
  const fW  = fH * 0.72;
  const sp  = fW + FRAME_PAD*2 + 90;
  const n   = artworkData.length;
  const tl  = sp * n;
  const sx0 = max(width/2, tl > width ? sp*0.85 : (width - sp*(n-1))/2);

  // ── for 迴圈：建立 Frame 陣列 ──
  for (let i=0;i<n;i++) {
    const d=artworkData[i];
    frames.push(new Frame(d.id,d.title,d.desc,d.url,
      sx0+i*sp, height*0.44, fW,fH));
  }
  maxScroll = max(0, frames[n-1].x + fW/2 + FRAME_PAD + 100 - width);

  // ── for 迴圈：浮塵 ──
  for (let i=0;i<70;i++) {
    dustParticles.push({
      x:random(width),y:random(height),
      r:random(0.3,1.6),vx:random(-0.12,0.12),
      vy:random(-0.22,-0.04),a:random(0.03,0.25)
    });
  }

  // 壁燈 & 盆栽位置
  for (let i=0;i<=n;i++) {
    const lx = i===0 ? sx0-sp*0.5
               : i===n ? frames[n-1].x+sp*0.5
               : (frames[i-1].x+frames[i].x)/2;
    wallLamps.push({x:lx, y:height*0.35});
    planters.push({x:lx});
  }
}

// ════════════════════════════════════════════════════════
//  draw()
// ════════════════════════════════════════════════════════
function draw() {
  scrollX = lerp(scrollX, targetScrollX, 0.1);

  drawBackground();
  drawWallDecor();
  drawWallLamps();
  drawCeilingLights();
  drawFloor();
  drawPlanters();
  drawDust();

  for (let i=0;i<frames.length;i++) {
    frames[i].checkHover(mouseX,mouseY);
    frames[i].draw();
  }

  drawBaseboard();
  drawHeader();
  drawScrollIndicator();
  drawArrows();
}

function drawBackground() {
  background(14,11,8);
  noStroke();
  for (let i=9;i>0;i--) { fill(201,169,110,3); ellipse(width/2,height*0.28,width*(i/9),height*0.55*(i/9)); }
  for (let i=0;i<5;i++) { stroke(0,0,0,28+i*12); strokeWeight(60); noFill(); rect(-30,-30,width+60,height+60); }
}

function drawWallDecor() {
  const wallH=height*0.74, wainY=height*0.68;
  stroke(255,255,255,7); strokeWeight(0.4);
  const gs=54;
  for (let x=-(scrollX*0.05%gs);x<width+gs;x+=gs) line(x,60,x,wallH);
  for (let y=60;y<wallH;y+=gs) line(0,y,width,y);

  stroke(201,169,110,50); strokeWeight(2); line(0,wainY,width,wainY);
  stroke(201,169,110,20); strokeWeight(1); line(0,wainY+5,width,wainY+5);
  noStroke(); fill(10,8,5,120); rect(0,wainY+6,width,height*0.74-wainY-6);

  stroke(201,169,110,25); strokeWeight(0.6);
  const pW=180, pH=wainY-80, pOx=-(scrollX*0.05%pW);
  for (let px=pOx-pW;px<width+pW;px+=pW) {
    noFill();
    beginShape(); vertex(px+12,82); vertex(px+pW-12,82); vertex(px+pW-12,70+pH-12); vertex(px+12,70+pH-12); endShape(CLOSE);
    stroke(201,169,110,12);
    beginShape(); vertex(px+18,88); vertex(px+pW-18,88); vertex(px+pW-18,70+pH-18); vertex(px+18,70+pH-18); endShape(CLOSE);
    stroke(201,169,110,25);
  }
}

function drawWallLamps() {
  for (let i=0;i<wallLamps.length;i++) {
    const lx=wallLamps[i].x-scrollX*0.08, ly=wallLamps[i].y;
    if (lx<-80||lx>width+80) continue;
    push(); translate(lx,ly);
    stroke(80,60,28); strokeWeight(4); line(0,0,22,-10); line(22,-10,28,-22);
    noStroke(); fill(58,44,16);
    beginShape(); vertex(-16,-22);vertex(16,-22);vertex(10,-10);vertex(-10,-10); endShape(CLOSE);
    stroke(180,140,60,155); strokeWeight(0.9); noFill();
    beginShape(); vertex(-16,-22);vertex(16,-22);vertex(10,-10);vertex(-10,-10); endShape(CLOSE);
    noStroke();
    for (let j=6;j>0;j--) { fill(222,182,82,12*(j/6)); ellipse(0,-10,40*(j/3),30*(j/3)); }
    fill(255,248,200,205); ellipse(0,-12,7,7);
    for (let s=0;s<8;s++) {
      const t1=s/8,t2=(s+1)/8;
      fill(222,182,82,map(s,0,8,15,0));
      beginShape(); vertex(-20*t1,-10+t1*80);vertex(-20*t2,-10+t2*80);vertex(20*t2,-10+t2*80);vertex(20*t1,-10+t1*80); endShape(CLOSE);
    }
    pop();
  }
}

function drawCeilingLights() {
  for (let i=0;i<frames.length;i++) {
    const sx=frames[i].screenX();
    if (sx<-120||sx>width+120) continue;
    noStroke(); fill(255,248,220,235); ellipse(sx,5,9,9);
    for (let j=5;j>0;j--) { fill(201,169,110,22*(j/5)); ellipse(sx,5,7+j*7,5+j*5); }
    stroke(180,140,60,155); strokeWeight(2); line(sx,0,sx,9);
    noStroke();
    const cH=height*0.67, cW=142;
    for (let s=0;s<14;s++) {
      const t1=s/14,t2=(s+1)/14;
      fill(201,169,110,map(s,0,14,20,0));
      beginShape(); vertex(sx-t1*cW,9+t1*cH);vertex(sx-t2*cW,9+t2*cH);vertex(sx+t2*cW,9+t2*cH);vertex(sx+t1*cW,9+t1*cH); endShape(CLOSE);
    }
  }
}

function drawFloor() {
  const fy=height*0.74;
  noStroke(); fill(9,7,4); rect(0,fy,width,height-fy);
  stroke(201,169,110,12); strokeWeight(0.5);
  const bw=60;
  for (let x=-(scrollX*0.12%bw);x<width+bw;x+=bw) line(x,fy,x+(height-fy)*0.4,height);
  for (let s=0;s<8;s++) { stroke(201,169,110,8); line(0,fy+(height-fy)*(s/8),width,fy+(height-fy)*(s/8)); }
  stroke(201,169,110,46); strokeWeight(1.2); line(0,fy,width,fy);
  stroke(201,169,110,18); strokeWeight(0.6); line(0,fy+4,width,fy+4);
  for (let i=0;i<frames.length;i++) {
    const sx=frames[i].screenX();
    if (sx<-200||sx>width+200) continue;
    noStroke();
    for (let j=0;j<10;j++) { fill(0,0,0,18-j*1.6); ellipse(sx+j*1.5,fy+7,frames[i].w*0.75,20-j*1.8); }
  }
}

function drawBaseboard() {
  const fy=height*0.74;
  noStroke(); fill(22,16,8); rect(0,fy-12,width,12);
  stroke(201,169,110,62); strokeWeight(0.8); line(0,fy-12,width,fy-12);
  stroke(201,169,110,26); strokeWeight(0.4); line(0,fy-7,width,fy-7);
}

function drawPlanters() {
  const fy=height*0.74;
  for (let i=0;i<planters.length;i++) {
    const px=planters[i].x-scrollX*0.12;
    if (px<-130||px>width+130) continue;
    push(); translate(px,fy);
    noStroke(); fill(52,33,13);
    beginShape(); vertex(-20,0);vertex(20,0);vertex(16,-28);vertex(-16,-28); endShape(CLOSE);
    fill(68,46,20); rect(-20,-4,40,4,1);
    stroke(95,68,28,125); strokeWeight(0.6); noFill();
    beginShape(); vertex(-20,0);vertex(20,0);vertex(16,-28);vertex(-16,-28); endShape(CLOSE);
    noStroke();
    const lc=7;
    for (let l=0;l<lc;l++) {
      const ang=map(l,0,lc,-PI*0.9,PI*0.1), ll=30+sin(l*2.1)*12, lw=6+cos(l*1.7)*2;
      push(); translate(0,-28); rotate(ang);
      fill(28,78,33,215);
      beginShape(); vertex(0,0);vertex(lw,-ll*0.4);vertex(lw*0.6,-ll);vertex(0,-ll*1.05);vertex(-lw*0.6,-ll);vertex(-lw,-ll*0.4); endShape(CLOSE);
      stroke(48,108,48,125); strokeWeight(0.5); line(0,0,0,-ll);
      pop();
    }
    pop();
  }
}

function drawDust() {
  noStroke();
  for (let i=0;i<dustParticles.length;i++) {
    const p=dustParticles[i];
    fill(201,169,110,p.a*255); ellipse(p.x,p.y,p.r*2);
    p.x+=p.vx; p.y+=p.vy;
    if (p.y<-4) { p.y=height+4; p.x=random(width); }
    if (p.x<-4) p.x=width+4;
    if (p.x>width+4) p.x=-4;
  }
}

function drawHeader() {
  noStroke(); fill(10,8,5,218); rect(0,0,width,68);
  stroke(201,169,110,88); strokeWeight(0.8);
  const cx=width/2;
  beginShape(); vertex(cx-152,60); vertex(cx-34,60); endShape();
  beginShape(); vertex(cx+34,60);  vertex(cx+152,60); endShape();
  noStroke(); fill(201,169,110,175);
  push(); translate(cx,60); rotate(PI/4); rect(-4.8,-4.8,9.6,9.6); pop();
  fill(235,215,165); textAlign(CENTER,CENTER); textSize(24);
  text('G  A  L  L  E  R  Y',cx,28);
  fill(118,88,52,215); textSize(9);
  text('A C T I O N  S C R I P T  E X H I B I T I O N',cx,48);
}

function drawScrollIndicator() {
  if (maxScroll<=0) return;
  const bw=112,bh=3,bx=width/2-bw/2,by=height-16;
  noStroke(); fill(33,24,11); rect(bx,by,bw,bh,2);
  fill(201,169,110,192); rect(bx,by,bw*constrain(scrollX/maxScroll,0,1),bh,2);
}

function drawArrows() {
  _arrow(38,height/2,-1,scrollX>1);
  _arrow(width-38,height/2,1,scrollX<maxScroll-1);
}
function _arrow(x,y,dir,active) {
  const a=active?1:0.2;
  stroke(201,169,110,172*a); strokeWeight(1); fill(10,8,5,192*a); ellipse(x,y,44,44);
  noFill(); stroke(201,169,110,232*a); strokeWeight(1.9);
  const s=9;
  beginShape(); vertex(x+dir*s*0.35,y-s*0.65); vertex(x-dir*s*0.45,y); vertex(x+dir*s*0.35,y+s*0.65); endShape();
}

// ════════════════════════════════════════════════════════
//  滑鼠事件
// ════════════════════════════════════════════════════════
function mousePressed() {
  if (dist(mouseX,mouseY,38,height/2)<22) { targetScrollX=max(0,targetScrollX-400); return; }
  if (dist(mouseX,mouseY,width-38,height/2)<22) { targetScrollX=min(maxScroll,targetScrollX+400); return; }
  for (let i=0;i<frames.length;i++) {
    if (frames[i].isClicked(mouseX,mouseY)) { openModal(frames[i].url,frames[i].title); return; }
  }
  for (let i=0;i<frames.length;i++) {
    if (frames[i].isCurtainClicked(mouseX,mouseY)) {
      const c=frames[i].curtain; c.target=c.target===0?1:0; return;
    }
  }
  isDragging=true; dragStartX=mouseX; dragStartScroll=targetScrollX;
}
function mouseDragged() {
  if (!isDragging) return;
  targetScrollX=constrain(dragStartScroll-(mouseX-dragStartX),0,maxScroll);
}
function mouseReleased() { isDragging=false; }
function mouseWheel(event) { targetScrollX=constrain(targetScrollX+event.delta*0.8,0,maxScroll); return false; }
function windowResized() { resizeCanvas(windowWidth,windowHeight); }

// ════════════════════════════════════════════════════════
//  Modal 控制（開啟/關閉動畫）
// ════════════════════════════════════════════════════════
function openModal(url, title) {
  const bd   = document.getElementById('modal-backdrop');
  const iframe = document.getElementById('modal-iframe');
  const label  = document.getElementById('modal-label');

  iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups');
  iframe.src = url;
  label.textContent = title;

  // 先套 opening 觸發 transition，下一幀再換成 open
  bd.classList.remove('closing','open');
  bd.classList.add('opening');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bd.classList.remove('opening');
      bd.classList.add('open');
    });
  });
}

function closeModal() {
  const bd = document.getElementById('modal-backdrop');
  bd.classList.remove('opening','open');
  bd.classList.add('closing');
  // 等動畫結束後清空 src
  setTimeout(() => {
    bd.classList.remove('closing');
    document.getElementById('modal-iframe').src = '';
  }, 520);
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});