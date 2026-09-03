import { CuratedName, BaziCalculation } from '../types';

export interface PosterOptions {
  name: CuratedName;
  bazi: BaziCalculation;
  babyGender: string;
  isWatermarked?: boolean;
}

export async function generateNamingPoster(options: PosterOptions): Promise<string> {
  const { name, bazi, babyGender, isWatermarked = true } = options;

  const canvas = document.createElement('canvas');
  // 高清 9:16 自媒体长图标准比例 (1080 x 1920)
  const width = 1080;
  const height = 1920;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法初始化 Canvas 绘图环境');

  // 1. 绘制古法宣纸底色与微细纸纹
  ctx.fillStyle = '#F8F5EE';
  ctx.fillRect(0, 0, width, height);

  // 宣纸自然温润光晕与纤维微粒
  const gradient = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 900);
  gradient.addColorStop(0, '#FCFAF5');
  gradient.addColorStop(0.7, '#F6F1E7');
  gradient.addColorStop(1, '#EDE5D5');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 细微颗粒纹理
  ctx.fillStyle = 'rgba(150, 130, 110, 0.035)';
  for (let i = 0; i < 6000; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }

  // 2. 双重回纹国风边框（帝王金与古墨金）
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = 'rgba(197, 160, 89, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(52, 52, width - 104, height - 104);

  // 四角吉祥纹饰 (祥云方胜纹)
  drawCornerAccents(ctx, 40, 40, width - 80, height - 80);

  // 3. 顶部横额与朱砂顶章
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 顶部“皇览吉名”朱砂小印
  drawSeal(ctx, width / 2, 120, 64, '御选', '#C23531');

  // 顶部大标题
  ctx.fillStyle = '#C5A059';
  ctx.font = '28px "Noto Serif SC", serif';
  ctx.letterSpacing = '12px';
  ctx.fillText('・ 满 月 命 名 礼 书 ・', width / 2, 210);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#7D6A58';
  ctx.font = '20px "Noto Serif SC", serif';
  ctx.fillText('周朝六礼 · 名字重典 · 文脉传家', width / 2, 255);

  // 金色装饰横线
  drawGoldenDivider(ctx, width / 2, 290, 420);

  // 4. 生辰八字与五行命盘简额 (中式雅致框)
  ctx.fillStyle = 'rgba(197, 160, 89, 0.08)';
  ctx.fillRect(100, 320, width - 200, 150);
  ctx.strokeStyle = '#D9C8B0';
  ctx.lineWidth = 1;
  ctx.strokeRect(100, 320, width - 200, 150);

  ctx.fillStyle = '#2C3437';
  ctx.font = 'bold 22px "Noto Serif SC", serif';
  ctx.fillText(`吉主生辰：${bazi.solarDate} (${bazi.hourName})  |  属相：${bazi.zodiac}`, width / 2, 360);

  ctx.font = '20px "Noto Serif SC", serif';
  ctx.fillStyle = '#5A4A3B';
  ctx.fillText(
    `四柱八字：【${bazi.yearStemBranch}】 【${bazi.monthStemBranch}】 【${bazi.dayStemBranch}】 【${bazi.hourStemBranch}】`,
    width / 2,
    400
  );

  ctx.font = '18px "Noto Serif SC", serif';
  ctx.fillStyle = '#C23531';
  ctx.fillText(
    `喜用五行：${bazi.luckyElements.join('、')}  |  格局平衡：五行流转 · 纳福承祥`,
    width / 2,
    435
  );

  // 5. 核心名字区（气势磅礴的大字竖排与注音）
  const nameCenterY = 700;

  // 名字后方的金红光环微景
  const haloGrad = ctx.createRadialGradient(width / 2, nameCenterY, 40, width / 2, nameCenterY, 260);
  haloGrad.addColorStop(0, 'rgba(197, 160, 89, 0.12)');
  haloGrad.addColorStop(1, 'rgba(197, 160, 89, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(width / 2, nameCenterY, 260, 0, Math.PI * 2);
  ctx.fill();

  // 拼音与声调
  ctx.fillStyle = '#8B5A2B';
  ctx.font = '24px "Noto Serif SC", serif';
  ctx.letterSpacing = '16px';
  ctx.fillText(name.pinyin.join('  '), width / 2, 530);
  ctx.letterSpacing = '0px';

  // 楷宋大字
  ctx.fillStyle = '#1A1C1E';
  ctx.font = 'bold 108px "Noto Serif SC", "Ma Shan Zheng", serif';
  ctx.letterSpacing = '28px';
  ctx.fillText(name.name, width / 2 + 14, 660);
  ctx.letterSpacing = '0px';

  // 名字字义五行小印
  let startX = width / 2 - ((name.characters.length * 90) / 2) + 45;
  name.characters.forEach((c) => {
    ctx.fillStyle = '#C23531';
    ctx.fillRect(startX - 36, 740, 72, 34);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px "Noto Serif SC", serif';
    ctx.fillText(`${c.char} · ${c.element}`, startX, 757);
    startX += 90;
  });

  // 6. 出处典籍原著卷轴区
  drawGoldenDivider(ctx, width / 2, 820, 600);

  ctx.fillStyle = '#8A6D3B';
  ctx.font = '24px "Noto Serif SC", serif';
  ctx.fillText(`典籍溯源：《${name.poemSource.title}》 ${name.poemSource.dynasty} · ${name.poemSource.author}`, width / 2, 870);

  // 诗文名句背景卷轴块
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#E8DFD0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(90, 915, width - 180, 180, 8);
  ctx.fill();
  ctx.stroke();

  // 卷轴左侧朱红竖纹装饰
  ctx.fillStyle = '#C23531';
  ctx.fillRect(90, 915, 6, 180);

  ctx.fillStyle = '#1A1C1E';
  ctx.font = 'bold 28px "Noto Serif SC", serif';
  ctx.fillText(`“ ${name.poemSource.quote} ”`, width / 2, 975);

  ctx.fillStyle = '#65574A';
  ctx.font = '19px "Noto Serif SC", serif';
  // 简要换行处理
  const transText = `白话详解：${name.poemSource.modernTranslation}`;
  wrapText(ctx, transText, width / 2, 1030, width - 240, 30);

  // 7. 名理寓意与前程福泽
  ctx.fillStyle = 'rgba(197, 160, 89, 0.06)';
  ctx.beginPath();
  ctx.roundRect(90, 1130, width - 180, 220, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#C23531';
  ctx.font = 'bold 22px "Noto Serif SC", serif';
  ctx.fillText('【 寄 托 宏 旨 与 学 业 前 程 】', width / 2, 1180);

  ctx.fillStyle = '#3A322C';
  ctx.font = '20px "Noto Serif SC", serif';
  wrapText(ctx, `名理宏旨：${name.comprehensiveMeaning}`, width / 2, 1225, width - 230, 32);
  wrapText(ctx, `前程祝愿：${name.academicCareerBlessing}`, width / 2, 1295, width - 230, 32);

  // 8. 三才五格大吉印鉴 & 宗师签章
  drawSeal(ctx, 240, 1470, 90, '上上签', '#C23531');
  drawSeal(ctx, width - 240, 1470, 90, '天赐嘉名', '#C5A059');

  ctx.fillStyle = '#2C3437';
  ctx.font = 'bold 24px "Noto Serif SC", serif';
  ctx.fillText(`三才数理：${name.sancaiWuge.sancai} (格局${name.sancaiWuge.sancaiFortune})`, width / 2, 1445);
  ctx.font = '20px "Noto Serif SC", serif';
  ctx.fillStyle = '#786754';
  ctx.fillText(`名理综合得分：${name.overallScore} 分  |  天人合一 · 顺遂亨通`, width / 2, 1485);

  // 9. 底部自媒体裂变小程序二维码与结语
  drawGoldenDivider(ctx, width / 2, 1560, 700);

  // 二维码区域
  drawMockQRCode(ctx, width / 2 - 260, 1610, 140);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#2C3437';
  ctx.font = 'bold 24px "Noto Serif SC", serif';
  ctx.fillText('锦绣良名 · 新生儿国风智能臻选工坊', width / 2 - 160, 1650);

  ctx.font = '19px "Noto Serif SC", serif';
  ctx.fillStyle = '#786858';
  ctx.fillText('长按或扫码为爱宝测算专属吉名', width / 2 - 160, 1690);
  ctx.fillText('已有 12,480+ 位父母共同鉴证 · 好评率 99.4%', width / 2 - 160, 1722);

  // 底部版权法律小字
  ctx.textAlign = 'center';
  ctx.font = '15px "Noto Serif SC", serif';
  ctx.fillStyle = '#A39585';
  ctx.fillText('承袭千载中华文脉 · 融汇传统五行命理与现代人工智能 · 谨制礼呈', width / 2, 1830);

  // 10. 水印处理 (非VIP预览模式添加防伪微透水印)
  if (isWatermarked) {
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-30 * Math.PI) / 180);
    ctx.fillStyle = 'rgba(194, 53, 49, 0.12)';
    ctx.font = 'bold 48px "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('锦 绣 良 名  ·  样 张 预 览', 0, -120);
    ctx.fillText('解 锁 V I P 导 出 无 水 印 臻 品 长 图', 0, 80);
    ctx.restore();
  } else {
    // VIP尊享纯正金印章
    drawSeal(ctx, width - 130, 130, 80, 'VIP宗师', '#C5A059');
  }

  return canvas.toDataURL('image/png', 0.96);
}

// 绘制四角国风祥云方胜角标
function drawCornerAccents(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const size = 30;
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 2.5;

  const corners = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];

  corners.forEach(([cx, cy, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(cx + dx * size, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * size);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + dx * 10, cy + dy * 10, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#C23531';
    ctx.fill();
  });
}

// 绘制典雅金色横线
function drawGoldenDivider(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  const grad = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
  grad.addColorStop(0, 'rgba(197, 160, 89, 0)');
  grad.addColorStop(0.5, 'rgba(197, 160, 89, 0.8)');
  grad.addColorStop(1, 'rgba(197, 160, 89, 0)');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - width / 2, y);
  ctx.lineTo(x + width / 2, y);
  ctx.stroke();

  // 中心点菱形小花
  ctx.fillStyle = '#C5A059';
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x + 5, y);
  ctx.lineTo(x, y + 5);
  ctx.lineTo(x - 5, y);
  ctx.closePath();
  ctx.fill();
}

// 绘制仿古印章（朱砂印 / 金石印）
function drawSeal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  text: string,
  color: string = '#C23531'
) {
  ctx.save();
  ctx.translate(x, y);

  // 印章外框带有微弱斑驳圆角
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(-size / 2, -size / 2, size, size);

  // 内部细框
  ctx.lineWidth = 1;
  ctx.strokeRect(-size / 2 + 4, -size / 2 + 4, size - 8, size - 8);

  // 印泥微透底色
  ctx.fillStyle = color === '#C23531' ? 'rgba(194, 53, 49, 0.08)' : 'rgba(197, 160, 89, 0.08)';
  ctx.fillRect(-size / 2, -size / 2, size, size);

  // 印文篆书风格
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.floor(size * 0.38)}px "Noto Serif SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (text.length === 2) {
    ctx.fillText(text.charAt(0), 0, -size * 0.2);
    ctx.fillText(text.charAt(1), 0, size * 0.2);
  } else if (text.length === 4) {
    ctx.fillText(text.slice(0, 2), 0, -size * 0.2);
    ctx.fillText(text.slice(2, 4), 0, size * 0.2);
  } else {
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
}

// 绘制精美模拟二维码 (新中式金色/墨黑条码)
function drawMockQRCode(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, size, size);

  // 伪二维码矩阵点阵绘制（美观真实的阵列效果）
  ctx.fillStyle = '#2C3437';
  const cols = 21;
  const cellSize = size / cols;

  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      // 四角定位点
      const isCorner1 = r < 7 && c < 7;
      const isCorner2 = r < 7 && c >= cols - 7;
      const isCorner3 = r >= cols - 7 && c < 7;

      if (isCorner1 || isCorner2 || isCorner3) {
        if (
          (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) && isCorner1 ||
          (r === 0 || r === 6 || c === cols - 7 || c === cols - 1 || (r >= 2 && r <= 4 && c >= cols - 5 && c <= cols - 3)) && isCorner2 ||
          (r === cols - 7 || r === cols - 1 || c === 0 || c === 6 || (r >= cols - 5 && r <= cols - 3 && c >= 2 && c <= 4)) && isCorner3
        ) {
          ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize, cellSize);
        }
      } else {
        // 中间伪随机点
        if (((r * 13 + c * 7 + (r ^ c)) % 3 === 0) || ((r + c) % 5 === 0)) {
          ctx.fillRect(x + c * cellSize + 0.5, y + r * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }
  }

  // 二维码中心金色“吉”字印标
  const centerSize = cellSize * 5;
  const cx = x + (size - centerSize) / 2;
  const cy = y + (size - centerSize) / 2;
  ctx.fillStyle = '#C23531';
  ctx.fillRect(cx, cy, centerSize, centerSize);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.floor(centerSize * 0.65)}px "Noto Serif SC", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('吉', cx + centerSize / 2, cy + centerSize / 2);

  ctx.restore();
}

// 文字自动换行
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  let line = '';
  let curY = y;

  for (let n = 0; n < text.length; n++) {
    const testLine = line + text[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = text[n];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}
