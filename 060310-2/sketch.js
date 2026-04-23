function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 設定色彩模式為 HSB (色相, 飽和度, 亮度, 透明度)
  colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
  // 設定背景色（淡淡的灰綠色）
  background(85, 20, 90);
  
  // 移除圓形的邊框，讓視覺更乾淨
  noStroke();

  // 外層迴圈控制 X 軸
  for (let i = 0; i < width; i += 30) {
    // 內層迴圈控制 Y 軸 (已修正為 j += 30)
    for (let j = 0; j < height; j += 30) {
      
      // 1. 計算顏色：結合時間(frameCount)與座標，產生流動的彩虹感
      let hue = (frameCount + i / width * 60 + j / height * 60) % 360;
      let clr = color(hue, 80, 100);
      
      // 2. 設定透明度：根據 X 軸位置改變
      clr.setAlpha(i / width);
      fill(clr);

      // 3. 滑鼠互動：讓圓形大小隨滑鼠位置改變 (使用 map 函數限制在 10~60 之間)
      let circleSize = map(mouseX, 0, width, 10, 60);
      
      // 繪製圓形
      ellipse(i, j, circleSize, circleSize);
    }
  }
}

// 當視窗縮放時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
