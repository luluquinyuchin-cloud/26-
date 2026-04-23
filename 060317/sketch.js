let input;
let slider;
let jumpButton;
let isJumping = false;
let iframeEle;
let sel;

function setup() {
  // 建立全螢幕滿版的畫布
  createCanvas(windowWidth, windowHeight);

  // 1. 產生一個文字方塊，並設定初始預設文字
  input = createInput('淡江大學');
  input.position(20, 20); // 設定文字方塊在視窗上的位置
  input.size(200, 25); // 設定 input 元件的寬為 200，高為 25
  input.style('font-size', '20px'); // 設定 input 元件輸入的文字大小為 20px
  input.style('background-color', '#e7ecef'); // 設定 input 元件背景顏色
  input.style('color', '#124559'); // 設定 input 元件文字顏色

  // 2. 產生一個滑桿，範圍為 15 到 80，預設值為 30
  // 參數：最小值, 最大值, 初始值
  slider = createSlider(15, 80, 30);
  slider.position(input.x + input.width + 10, 20); // 緊鄰在文字方塊右邊

  // 產生一個「跳動」按鈕
  jumpButton = createButton('跳動');
  jumpButton.position(slider.x + slider.width + 10, 20); // 緊鄰在滑桿右邊
  jumpButton.mousePressed(toggleJumping); // 設定按鈕按下的回呼函式
  
  // 產生下拉式選單
  sel = createSelect();
  sel.position(jumpButton.x + jumpButton.width + 50, 20); // 與按鈕距離 50
  sel.option('淡江大學');
  sel.option('教科系');
  sel.changed(mySelectEvent);

  // 設定文字垂直對齊至上方，以利後續由上而下繪製
  textAlign(LEFT, TOP);

  // 5. 產生一個 iframe 網頁區域，位於視窗中間，距離四周 200px
  iframeEle = createElement('iframe');
  iframeEle.position(200, 200);
  iframeEle.size(windowWidth - 400, windowHeight - 400);
  iframeEle.attribute('src', 'https://www.tku.edu.tw');
  iframeEle.style('opacity', '0.95'); // 設定半透明效果
}

// 按下按鈕時，切換 isJumping 的布林值
function toggleJumping() {
  isJumping = !isJumping;
}

function mySelectEvent() {
  let item = sel.value();
  input.value(item); // 更新文字框內容
  if (item === '淡江大學') {
    iframeEle.attribute('src', 'https://www.tku.edu.tw');
  } else if (item === '教科系') {
    iframeEle.attribute('src', 'https://www.et.tku.edu.tw/');
  }
}

function draw() {
  background("#01161e"); // 設定背景顏色

  // 3. 動態取得滑桿的值，並設定為畫布上的文字大小
  textSize(slider.value());

  // 4. 動態取得文字方塊的輸入內容
  let txt = input.value();

  if (txt.length > 0) {
    let tw = textWidth(txt); // 計算使用者輸入的字串寬度
    
    if (tw > 0) {
      // 建立指定的色票陣列 (來自第一張圖的配色)
      let colors = ['#e07a5f', '#3d405b', '#81b29a', '#f2cc8f'];

      // 利用雙重迴圈及字體寬度，將文字重複填滿整個視窗
      // y 的起始位置設為 100，避免擋到上方的 UI 元件
      // 行距調整為滑桿數值 + 20，讓間隔隨字體大小變動
      for (let y = 100; y < height; y += slider.value() + 20) {
        let wordIndex = 0; // 記錄同一行中文字的順序
        
        for (let x = 0; x < width; x += tw + 30) {
          // 根據文字順序，利用取餘數 (%) 輪流套用色票陣列中的顏色
          fill(colors[wordIndex % colors.length]);

          let xOffset = 0;
          let yOffset = 0;
          if (isJumping) {
            // 改用 noise 產生平滑的「滑動」效果
            // 參數：x座標係數, y座標係數, 時間(控制速度)
            // map 函式將 noise 的 0~1 數值映射到 -20~20 (增加移動幅度)
            xOffset = map(noise(x * 0.01, y * 0.01, frameCount * 0.02), 0, 1, -20, 20);
            yOffset = map(noise(x * 0.01 + 100, y * 0.01 + 100, frameCount * 0.02), 0, 1, -20, 20);
          }
          text(txt, x + xOffset, y + yOffset);
          wordIndex++; // 換下一個顏色
        }
      }
    }
  }
}

// 當視窗縮放時自動調整畫布大小，保持滿版
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  iframeEle.position(200, 200);
  iframeEle.size(windowWidth - 400, windowHeight - 400);
}