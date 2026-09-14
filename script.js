// ==========================================
// MathVerse - Glassmorphism Interactive Engine
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundMathCanvas();
  initHeroSimulation();
  initCardCanvases();
  initNavigationAndSearch();
  initCategoryFilters();
  initSimulationModal();
  initCircleActivitiesDB();
});

// 1. Background Math Particle & Graph Animation
function initBackgroundMathCanvas() {
  const canvas = document.getElementById('math-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mathSymbols = ['π', '∑', '∫', '√x', '∂', '∞', 'θ', 'λ', 'e', 'Δ', '∇', 'dx'];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  // Create particles
  const particleCount = Math.min(Math.floor((width * height) / 18000), 65);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.2,
      symbol: Math.random() > 0.65 ? mathSymbols[Math.floor(Math.random() * mathSymbols.length)] : null,
      symbolOpacity: Math.random() * 0.35 + 0.15,
      hue: Math.random() > 0.5 ? 260 : 190 // Purple or Cyan
    });
  }

  let mouse = { x: null, y: null };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Draw node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, 0.4)`;
      ctx.fill();

      // Draw mathematical symbol if assigned
      if (p.symbol) {
        ctx.font = '14px "JetBrains Mono", sans-serif';
        ctx.fillStyle = `hsla(${p.hue}, 85%, 80%, ${p.symbolOpacity})`;
        ctx.fillText(p.symbol, p.x + 6, p.y - 6);
      }

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(147, 197, 253, ${0.18 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Mouse interactive repulse/pull
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 150) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.25 * (1 - mdist / 150)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// 2. Hero Interactive Math Visualizer
let heroState = {
  type: 'trig', // 'trig' or 'quadratic' or 'gaussian'
  amp: 1.8,
  freq: 1.5,
  speed: 1.0,
  phase: 0
};

function initHeroSimulation() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const ampSlider = document.getElementById('slider-amp');
  const freqSlider = document.getElementById('slider-freq');
  const speedSlider = document.getElementById('slider-speed');
  const formulaDisplay = document.getElementById('hero-formula-display');
  const typeButtons = document.querySelectorAll('[data-sim-type]');

  if (ampSlider) {
    ampSlider.addEventListener('input', (e) => {
      heroState.amp = parseFloat(e.target.value);
      updateFormula();
    });
  }
  if (freqSlider) {
    freqSlider.addEventListener('input', (e) => {
      heroState.freq = parseFloat(e.target.value);
      updateFormula();
    });
  }
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      heroState.speed = parseFloat(e.target.value);
    });
  }

  typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      typeButtons.forEach((b) => b.classList.remove('active', 'bg-indigo-600/30', 'border-indigo-400/50', 'text-white'));
      btn.classList.add('active', 'bg-indigo-600/30', 'border-indigo-400/50', 'text-white');
      heroState.type = btn.getAttribute('data-sim-type');
      updateFormula();
    });
  });

  function updateFormula() {
    if (!formulaDisplay) return;
    if (heroState.type === 'trig') {
      formulaDisplay.innerHTML = `f(x) = <span class="text-pink-400">${heroState.amp.toFixed(1)}</span> · sin(<span class="text-cyan-400">${heroState.freq.toFixed(1)}</span>x + t) &nbsp;|&nbsp; f'(x) = <span class="text-amber-400">${(heroState.amp * heroState.freq).toFixed(1)}</span> · cos(...)`;
    } else if (heroState.type === 'circle') {
      const hVal = (Math.sin(heroState.phase * 0.4) * 1.2).toFixed(1);
      const kVal = (Math.cos(heroState.phase * 0.4) * 0.8).toFixed(1);
      const rVal = (heroState.amp * 1.2).toFixed(1);
      const r2Val = (heroState.amp * 1.2 * heroState.amp * 1.2).toFixed(1);
      formulaDisplay.innerHTML = `(x - <span class="text-cyan-400">${hVal}</span>)² + (y - <span class="text-pink-400">${kVal}</span>)² = <span class="text-amber-400">${r2Val}</span> &nbsp;|&nbsp; 중심 C(${hVal}, ${kVal}), 반지름 r = ${rVal}`;
    } else if (heroState.type === 'quadratic') {
      formulaDisplay.innerHTML = `f(x) = <span class="text-pink-400">${(heroState.amp * 0.4).toFixed(2)}</span>(x - t)² - <span class="text-cyan-400">${(heroState.freq * 15).toFixed(0)}</span> &nbsp;|&nbsp; 판별식 D &gt; 0`;
    } else if (heroState.type === 'gaussian') {
      formulaDisplay.innerHTML = `f(x) = <span class="text-pink-400">${heroState.amp.toFixed(1)}</span> · exp(-<span class="text-cyan-400">${heroState.freq.toFixed(1)}</span>(x - t)²) &nbsp;|&nbsp; 정규분포 곡선 N(μ, σ²)`;
    }
  }
  updateFormula();

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function drawHero() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const centerY = h / 2;
    const centerX = w / 2;

    ctx.clearRect(0, 0, w, h);

    // Draw coordinate axes
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    // X Axis
    ctx.moveTo(0, centerY);
    ctx.lineTo(w, centerY);
    // Y Axis
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, h);
    ctx.stroke();

    // Grid lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = centerX % 40; x < w; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = centerY % 40; y < h; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();

    heroState.phase += 0.02 * heroState.speed;

    // Draw Function Curve
    ctx.beginPath();
    ctx.lineWidth = 3;

    // Gradient stroke
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.5, '#a855f7');
    grad.addColorStop(1, '#f43f5e');
    ctx.strokeStyle = grad;

    let points = [];
    const scaleFactor = 40;

    if (heroState.type === 'circle') {
      const hCenter = centerX + Math.sin(heroState.phase * 0.4) * 1.2 * scaleFactor;
      const kCenter = centerY - Math.cos(heroState.phase * 0.4) * 0.8 * scaleFactor;
      const rPixels = heroState.amp * 1.2 * scaleFactor;

      // Circle Fill Glow
      ctx.beginPath();
      ctx.arc(hCenter, kCenter, rPixels, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fill();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Center Point C(a, b)
      ctx.beginPath();
      ctx.arc(hCenter, kCenter, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px "JetBrains Mono"';
      ctx.fillText(`C(a, b)`, hCenter + 8, kCenter - 8);

      // Rotating point & Tangent line
      const rotAngle = heroState.phase * 0.8;
      const px = hCenter + rPixels * Math.cos(rotAngle);
      const py = kCenter - rPixels * Math.sin(rotAngle);

      // Radius line
      ctx.beginPath();
      ctx.moveTo(hCenter, kCenter);
      ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tangent point
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Tangent line (perpendicular to radius)
      const tangentDx = -Math.sin(rotAngle);
      const tangentDy = -Math.cos(rotAngle);
      ctx.beginPath();
      ctx.moveTo(px - tangentDx * 90, py - tangentDy * 90);
      ctx.lineTo(px + tangentDx * 90, py + tangentDy * 90);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      requestAnimationFrame(drawHero);
      return;
    }

    for (let px = 0; px <= w; px += 2) {
      const mathX = (px - centerX) / scaleFactor;
      let mathY = 0;

      if (heroState.type === 'trig') {
        mathY = heroState.amp * Math.sin(heroState.freq * mathX + heroState.phase);
      } else if (heroState.type === 'quadratic') {
        const t = Math.sin(heroState.phase * 0.5) * 1.5;
        mathY = - (heroState.amp * 0.35) * Math.pow(mathX - t, 2) + (heroState.freq * 0.8);
      } else if (heroState.type === 'gaussian') {
        const t = Math.sin(heroState.phase * 0.6) * 2;
        mathY = heroState.amp * 2.2 * Math.exp(-0.8 * heroState.freq * Math.pow(mathX - t, 2));
      }

      const py = centerY - mathY * scaleFactor;
      points.push({ x: px, y: py });

      if (px === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Fill under curve with glowing glass gradient
    ctx.lineTo(w, centerY);
    ctx.lineTo(0, centerY);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, centerY - 80, 0, centerY + 80);
    fillGrad.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
    fillGrad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // Draw active dynamic tangent point
    const activeIndex = Math.floor((Math.sin(heroState.phase * 0.7) * 0.4 + 0.5) * points.length);
    if (points[activeIndex]) {
      const pt = points[activeIndex];

      // Tangent point halo
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.fill();

      // Tangent point core
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      // Slope Tangent Line
      const pPrev = points[Math.max(0, activeIndex - 5)];
      const pNext = points[Math.min(points.length - 1, activeIndex + 5)];
      if (pPrev && pNext) {
        const slope = (pNext.y - pPrev.y) / (pNext.x - pPrev.x);
        ctx.beginPath();
        ctx.moveTo(pt.x - 50, pt.y - 50 * slope);
        ctx.lineTo(pt.x + 50, pt.y + 50 * slope);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    requestAnimationFrame(drawHero);
  }

  requestAnimationFrame(drawHero);
}

// 3. Card Mini Canvas Visualizers
function initCardCanvases() {
  // 0. Circle Equation Dedicated Card Canvas
  const circleCanvas = document.getElementById('canvas-circle-equation');
  if (circleCanvas) {
    const ctx = circleCanvas.getContext('2d');
    let phase = 0;
    function renderCircleEquation() {
      const w = circleCanvas.width = circleCanvas.offsetWidth;
      const h = circleCanvas.height = circleCanvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      phase += 0.02;

      const cx = w / 2 + Math.sin(phase * 0.5) * 16;
      const cy = h / 2 + Math.cos(phase * 0.6) * 10;
      const r = Math.min(w, h) * 0.28 + Math.sin(phase) * 6;

      // Coordinate axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
      ctx.stroke();

      // Circle fill & glowing stroke
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Center point
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Radius line & point
      const angle = phase * 0.8;
      const px = cx + r * Math.cos(angle);
      const py = cy - r * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tangent line
      const tx = -Math.sin(angle);
      const ty = -Math.cos(angle);
      ctx.beginPath();
      ctx.moveTo(px - tx * 65, py - ty * 65);
      ctx.lineTo(px + tx * 65, py + ty * 65);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glowing contact point
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();

      requestAnimationFrame(renderCircleEquation);
    }
    renderCircleEquation();
  }

  // 1. Unit Circle Canvas
  const unitCanvas = document.getElementById('canvas-unit-circle');
  if (unitCanvas) {
    const ctx = unitCanvas.getContext('2d');
    let angle = 0;
    function renderUnitCircle() {
      const w = unitCanvas.width = unitCanvas.offsetWidth;
      const h = unitCanvas.height = unitCanvas.offsetHeight;
      const r = Math.min(w, h) * 0.32;
      const cx = w * 0.38;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      angle += 0.025;

      // Draw Axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - r - 15, cy);
      ctx.lineTo(cx + r + 15, cy);
      ctx.moveTo(cx, cy - r - 15);
      ctx.lineTo(cx, cy + r + 15);
      ctx.stroke();

      // Draw Circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Point on Circle
      const px = cx + r * Math.cos(angle);
      const py = cy - r * Math.sin(angle);

      // Sin line (vertical)
      ctx.beginPath();
      ctx.moveTo(px, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cos line (horizontal)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, cy);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Radius vector
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Glowing dot
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connecting wave projection to right
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(w * 0.65, py);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.3)';
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small Sine Wave segment on right
      ctx.beginPath();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      for (let x = w * 0.65; x < w - 10; x += 2) {
        const waveAngle = angle - (x - w * 0.65) * 0.08;
        const wy = cy - r * Math.sin(waveAngle);
        if (x === w * 0.65) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();

      requestAnimationFrame(renderUnitCircle);
    }
    renderUnitCircle();
  }

  // 2. 3D Vector & Cube Canvas
  const vectorCanvas = document.getElementById('canvas-3d-vector');
  if (vectorCanvas) {
    const ctx = vectorCanvas.getContext('2d');
    let rotX = 0.4, rotY = 0;
    function render3DVector() {
      const w = vectorCanvas.width = vectorCanvas.offsetWidth;
      const h = vectorCanvas.height = vectorCanvas.offsetHeight;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);
      rotY += 0.015;

      // 3D projection helper
      function project(x, y, z) {
        // Rotate Y
        const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotate X
        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const distance = 180;
        const scale = distance / (distance + z2 + 90);
        return {
          x: cx + x1 * scale * 0.9,
          y: cy - y2 * scale * 0.9
        };
      }

      // Draw origin axes
      const o = project(0, 0, 0);
      const axX = project(55, 0, 0);
      const axY = project(0, 55, 0);
      const axZ = project(0, 0, 55);

      ctx.lineWidth = 1.5;
      // X: Red
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(axX.x, axX.y); ctx.strokeStyle = '#f43f5e'; ctx.stroke();
      // Y: Green
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(axY.x, axY.y); ctx.strokeStyle = '#34d399'; ctx.stroke();
      // Z: Blue
      ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(axZ.x, axZ.y); ctx.strokeStyle = '#38bdf8'; ctx.stroke();

      // Draw two vectors u and v and cross product u x v
      const u = project(40, 20, 10);
      const v = project(10, 45, 25);
      const uPlusV = project(50, 65, 35);

      // Vector Parallelogram
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(u.x, u.y);
      ctx.lineTo(uPlusV.x, uPlusV.y);
      ctx.lineTo(v.x, v.y);
      ctx.closePath();
      ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.stroke();

      // Normal Vector (u x v)
      const normal = project(15, -10, 50);
      ctx.beginPath();
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(normal.x, normal.y);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      requestAnimationFrame(render3DVector);
    }
    render3DVector();
  }

  // 3. Galton Board Simulation Preview
  const galtonCanvas = document.getElementById('canvas-galton');
  if (galtonCanvas) {
    const ctx = galtonCanvas.getContext('2d');
    let balls = [];
    let bins = new Array(12).fill(0);
    let timer = 0;

    function renderGalton() {
      const w = galtonCanvas.width = galtonCanvas.offsetWidth;
      const h = galtonCanvas.height = galtonCanvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      timer++;
      if (timer % 5 === 0 && balls.length < 40) {
        balls.push({
          x: w / 2 + (Math.random() - 0.5) * 4,
          y: 15,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 1.5,
          r: 2.8,
          color: Math.random() > 0.5 ? '#38bdf8' : '#c084fc'
        });
      }

      // Draw Pegs (Pins)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      const rows = 6;
      for (let r = 0; r < rows; r++) {
        const count = r + 1;
        const spacing = 16;
        const startX = w / 2 - ((count - 1) * spacing) / 2;
        const py = 35 + r * 14;
        for (let c = 0; c < count; c++) {
          ctx.beginPath();
          ctx.arc(startX + c * spacing, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update Balls
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.y += b.vy;
        b.x += b.vx;
        b.vy += 0.08; // gravity

        // bounce slightly randomly around pin area
        if (b.y > 35 && b.y < 115 && Math.random() > 0.6) {
          b.vx += (Math.random() - 0.5) * 0.9;
        }

        // reached bins
        if (b.y >= h - 25) {
          const binIndex = Math.max(0, Math.min(bins.length - 1, Math.floor((b.x / w) * bins.length)));
          bins[binIndex] = Math.min(bins[binIndex] + 1.2, 40);
          balls.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
      }

      // Draw Distribution Bins at bottom
      const binWidth = w / bins.length;
      for (let i = 0; i < bins.length; i++) {
        const bh = bins[i];
        ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.fillRect(i * binWidth + 1, h - bh - 5, binWidth - 2, bh);
      }

      // Reset bins periodically
      if (timer > 600) {
        bins.fill(0);
        timer = 0;
      }

      requestAnimationFrame(renderGalton);
    }
    renderGalton();
  }

  // 4. Gradient Descent Surface Preview
  const gradientCanvas = document.getElementById('canvas-gradient-descent');
  if (gradientCanvas) {
    const ctx = gradientCanvas.getContext('2d');
    let ball = { x: 30, y: 30, vx: 0, vy: 0 };
    let frame = 0;

    function renderGradientDescent() {
      const w = gradientCanvas.width = gradientCanvas.offsetWidth;
      const h = gradientCanvas.height = gradientCanvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      frame++;

      // Draw contour lines of loss function
      const cx = w / 2;
      const cy = h / 2;
      for (let r = 12; r < 70; r += 14) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * 1.3, r * 0.8, Math.PI / 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 + (70 - r) / 140})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Target optimal minimum
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();

      // Optimization step of ball
      if (frame % 180 === 0) {
        ball = { x: cx + (Math.random() - 0.5) * 110, y: cy + (Math.random() - 0.5) * 80, path: [] };
      }
      if (!ball.path) ball.path = [];

      // Gradient vector toward (cx, cy)
      const dx = cx - ball.x;
      const dy = cy - ball.y;
      const lr = 0.05; // Learning rate
      ball.x += dx * lr;
      ball.y += dy * lr;

      if (frame % 4 === 0) {
        ball.path.push({ x: ball.x, y: ball.y });
        if (ball.path.length > 25) ball.path.shift();
      }

      // Draw trajectory path
      if (ball.path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ball.path[0].x, ball.path[0].y);
        for (let pt of ball.path) ctx.lineTo(pt.x, pt.y);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw current learning weight point
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(renderGradientDescent);
    }
    renderGradientDescent();
  }
}

// 4. Navigation & Search Interaction
function initNavigationAndSearch() {
  const nav = document.querySelector('.glass-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // Mobile menu drawer
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
    // Close on link click
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => mobileDrawer.classList.remove('open'));
    });
  }

  // Search filter
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.simulation-card');
      cards.forEach((card) => {
        const title = card.getAttribute('data-title')?.toLowerCase() || '';
        const desc = card.getAttribute('data-desc')?.toLowerCase() || '';
        const tags = card.getAttribute('data-tags')?.toLowerCase() || '';
        if (title.includes(query) || desc.includes(query) || tags.includes(query)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // Keyboard shortcut Ctrl + K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

// 5. Category Filtering
function initCategoryFilters() {
  const filterButtons = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.simulation-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active', 'bg-indigo-600/30', 'border-indigo-400/50', 'text-white'));
      btn.classList.add('active', 'bg-indigo-600/30', 'border-indigo-400/50', 'text-white');

      const cat = btn.getAttribute('data-category');

      cards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// 6. Simulation Interactive Modal
const simulationDemos = {
  'circle-equation': {
    title: '원의 방정식과 접선의 기하학',
    category: '고등 공통수학 / 해석기하학',
    desc: '좌표평면 위에서 한 정점 C(a, b)로부터 일정한 거리 r에 있는 점 P(x, y)의 자취를 나타내는 표준형 (x - a)² + (y - b)² = r² 및 원과 직선의 위치 관계, 접선의 방정식을 탐구합니다.',
    formula: '(x - a)^2 + (y - b)^2 = r^2, \\quad d = \\frac{|am - b + k|}{\\sqrt{m^2 + 1}} = r',
    tip: '원의 중심과 직선 사이의 거리 d와 반지름 r을 비교하여 d < r (두 점), d = r (접선), d > r (만나지 않음)의 기하학적 조건을 확인해 보세요.'
  },
  'unit-circle': {
    title: '단위원과 삼각함수의 세계',
    category: '미적분학 / 기하학',
    desc: '각도 θ가 0에서 2π까지 변화함에 따라 단위원 위의 동경 좌표 (cos θ, sin θ)와 삼각함수 파동 곡선의 관계를 직관적으로 탐구합니다.',
    formula: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1, \\quad \\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)}',
    tip: '파라미터 회전 속도와 각도를 마우스로 직접 드래그하여 위상차를 관찰해 보세요.'
  },
  'vector-cross': {
    title: '3차원 공간벡터와 외적(Cross Product)',
    category: '기하와 벡터',
    desc: '두 3차원 벡터 u, v의 크기와 사이각이 결정하는 평행사변형 면적 및 수직인 법선 벡터 u × v의 물리적 회전 토크를 실시간 렌더링합니다.',
    formula: '\\vec{u} \\times \\vec{v} = (u_y v_z - u_z v_y, \\, u_z v_x - u_x v_z, \\, u_x v_y - u_y v_x)',
    tip: '오른손 법칙을 시각화하여 외적 벡터의 방향이 결정되는 원리를 확인할 수 있습니다.'
  },
  'galton-board': {
    title: '갈톤 보드와 중심극한정리 (CLT)',
    category: '확률과 통계',
    desc: '수백 개의 구슬이 다단계 핀 장애물과 충돌하여 좌우로 무작위 분기할 때, 이항분포 B(n, 1/2)가 정규분포 N(μ, σ²)로 수렴하는 통계학적 기적을 관찰합니다.',
    formula: 'X \\sim B(n, p) \\xrightarrow{n \\to \\infty} N(np, \\, np(1-p))',
    tip: '구슬의 개수를 늘려갈수록 종 모양(Bell Curve) 대칭 곡선이 완벽하게 형성되는 과정을 확인하세요.'
  },
  'gradient-descent': {
    title: '경사하강법과 인공지능 최적화 곡면',
    category: 'AI & 응용수학',
    desc: '머신러닝 신경망이 손실 함수(Loss Function)의 그래디언트(기울기)를 계산하여 최소 오차 가중치(Optimal Weights)로 수렴해 나가는 3차원 최적화 경로입니다.',
    formula: 'W_{t+1} = W_t - \\eta \\nabla L(W_t)',
    tip: '학습률(Learning Rate, η)이 너무 크면 발산(Overshoot)하고 너무 작으면 극소점에 갇히는 현상을 체감할 수 있습니다.'
  },
  'quadratic-function': {
    title: '이차함수의 포물선과 판별식 D',
    category: '함수와 대수',
    desc: '계수 a, b, c의 변화에 따라 포물선의 꼭짓점 이동, 대칭축 및 판별식 D = b² - 4ac의 부호에 따른 x축과의 교점 개수를 실시간 탐구합니다.',
    formula: 'f(x) = ax^2 + bx + c, \\quad D = b^2 - 4ac',
    tip: 'D > 0 (서로 다른 두 실근), D = 0 (중근 접점), D < 0 (허근, 부유) 상태를 직접 슬라이더로 전환해 보세요.'
  },
  'fourier-transform': {
    title: '푸리에 급수와 주파수 스펙트럼 합성',
    category: '미적분학 / 응용수학',
    desc: '임의의 주기 파형(사각파, 톱니파)을 무한한 단순 조화 정현파(Sine waves)들의 중첩과 에피사이클 회전으로 분해 및 재구성합니다.',
    formula: 'f(t) = \\frac{a_0}{2} + \\sum_{n=1}^\\infty \\left(a_n \\cos(n\\omega t) + b_n \\sin(n\\omega t)\\right)',
    tip: '음향, 통신, 이미지 압축의 수학적 토대가 되는 주파수 영역 변환의 기본 원리입니다.'
  }
};

function initSimulationModal() {
  const modalOverlay = document.getElementById('simulation-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalCategory = document.getElementById('modal-category');
  const modalDesc = document.getElementById('modal-desc');
  const modalFormula = document.getElementById('modal-formula');
  const modalTip = document.getElementById('modal-tip');
  const launchButtons = document.querySelectorAll('.launch-sim-btn');

  if (!modalOverlay) return;

  launchButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const simKey = btn.getAttribute('data-sim-key');
      const data = simulationDemos[simKey];

      if (data) {
        modalTitle.textContent = data.title;
        modalCategory.textContent = data.category;
        modalDesc.textContent = data.desc;
        modalFormula.textContent = data.formula;
        modalTip.textContent = data.tip;

        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });
}

// ==========================================
// 7. Circle Equation Activities Database Module
// ==========================================
function initCircleActivitiesDB() {
  const gridContainer = document.getElementById('circle-activities-grid');
  if (!gridContainer) return;

  const searchInput = document.getElementById('circle-act-search');
  const difficultyFilter = document.getElementById('circle-act-difficulty-filter');
  const categoryPills = document.querySelectorAll('.circle-cat-pill');
  const emptyMessage = document.getElementById('circle-activities-empty');
  const statTotal = document.getElementById('stat-total-activities');
  const downloadBtn = document.getElementById('btn-download-db-json');
  const openAddBtn = document.getElementById('btn-open-add-activity');
  const navQuickAddBtn = document.getElementById('nav-quick-add-btn');
  const resetFiltersBtn = document.getElementById('btn-reset-filters');
  const syncSupabaseBtn = document.getElementById('btn-sync-supabase');
  const supabaseStatusText = document.getElementById('supabase-status-text');

  // Modals
  const detailModal = document.getElementById('activity-detail-modal');
  const detailCloseBtn = document.getElementById('act-modal-close-btn');
  const addModal = document.getElementById('add-activity-modal');
  const addCloseBtn = document.getElementById('add-modal-close-btn');
  const addForm = document.getElementById('add-activity-form');

  // Detail Modal Elements
  const detailTitle = document.getElementById('act-modal-title');
  const detailCat = document.getElementById('act-modal-category');
  const detailDiff = document.getElementById('act-modal-difficulty');
  const detailGrade = document.getElementById('act-modal-grade');
  const detailEqType = document.getElementById('act-modal-eqtype');
  const detailFormula = document.getElementById('act-modal-formula');
  const detailCompetencies = document.getElementById('act-modal-competencies');
  const detailConcept = document.getElementById('act-modal-concept');
  const detailSteps = document.getElementById('act-modal-steps');
  const detailParams = document.getElementById('act-modal-params');
  const detailRealWorld = document.getElementById('act-modal-realworld');
  const detailEval = document.getElementById('act-modal-eval');
  const detailCopyBtn = document.getElementById('act-modal-copy-btn');
  const detailLaunchBtn = document.getElementById('act-modal-launch-sim-btn');

  let currentSelectedActivity = null;

  // 1. Data Store Initialization (Global DB + LocalStorage custom activities)
  const defaultActivities = (window.CIRCLE_ACTIVITIES_DB && window.CIRCLE_ACTIVITIES_DB.activities) ? window.CIRCLE_ACTIVITIES_DB.activities : [];

  function getCustomActivities() {
    try {
      const stored = localStorage.getItem('mathverse_circle_activities_custom');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('LocalStorage access warning:', e);
      return [];
    }
  }

  function saveCustomActivities(customList) {
    try {
      localStorage.setItem('mathverse_circle_activities_custom', JSON.stringify(customList));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }

  function getAllActivities() {
    return [...defaultActivities, ...getCustomActivities()];
  }

  // Filter State
  const filterState = {
    keyword: '',
    category: 'all',
    difficulty: 'all'
  };

  // Badge Color Helper
  const categoryColorMap = {
    'standard-general': { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30', accent: '#6366f1' },
    'axis-tangent': { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30', accent: '#06b6d4' },
    'line-circle': { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/30', accent: '#f43f5e' },
    'real-world': { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30', accent: '#10b981' },
    'locus-family': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30', accent: '#f59e0b' }
  };

  const difficultyColorMap = {
    '기본': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '발전': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    '심화': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
  };

  // 2. Render Activity Cards
  function renderActivities() {
    const all = getAllActivities();
    if (statTotal) statTotal.textContent = all.length;
    const catAllCount = document.getElementById('cat-count-all');
    if (catAllCount) catAllCount.textContent = all.length;

    const filtered = all.filter((act) => {
      // Category filter
      if (filterState.category !== 'all' && act.category !== filterState.category) {
        return false;
      }
      // Difficulty filter
      if (filterState.difficulty !== 'all' && act.difficulty !== filterState.difficulty) {
        return false;
      }
      // Keyword filter (title, formula, keywords, concept)
      if (filterState.keyword.trim() !== '') {
        const q = filterState.keyword.toLowerCase();
        const titleMatch = (act.title || '').toLowerCase().includes(q);
        const formulaMatch = (act.equationFormula || '').toLowerCase().includes(q);
        const typeMatch = (act.equationType || '').toLowerCase().includes(q);
        const conceptMatch = (act.conceptSummary || '').toLowerCase().includes(q);
        const kwMatch = Array.isArray(act.keywords) && act.keywords.some(k => k.toLowerCase().includes(q));
        if (!titleMatch && !formulaMatch && !typeMatch && !conceptMatch && !kwMatch) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      gridContainer.innerHTML = '';
      if (emptyMessage) emptyMessage.classList.remove('hidden');
      return;
    }

    if (emptyMessage) emptyMessage.classList.add('hidden');

    gridContainer.innerHTML = filtered.map((act, index) => {
      const colors = categoryColorMap[act.category] || { bg: 'bg-white/10', text: 'text-slate-300', border: 'border-white/20', accent: '#a855f7' };
      const diffClass = difficultyColorMap[act.difficulty] || 'bg-white/10 text-slate-300 border-white/20';
      const cleanFormula = (act.equationFormula || '').replace(/\\\\quad/g, ' | ').replace(/\\\\/g, '');
      const keywordsHtml = Array.isArray(act.keywords) 
        ? act.keywords.slice(0, 3).map(k => `<span class="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/5">#${k}</span>`).join('') 
        : '';
      const isCustom = act.id && act.id.startsWith('circle-custom-');

      return `
        <article class="glass-card simulation-card flex flex-col justify-between border-white/10 hover:border-amber-400/40 transition-all duration-300 group" data-act-id="${act.id}">
          <div class="p-6 space-y-4">
            
            <!-- Top Badges -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}">
                  ${act.categoryName || act.category}
                </span>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full border ${diffClass}">
                  ${act.difficulty || '발전'}
                </span>
              </div>
              <span class="text-[11px] font-mono text-slate-500 font-semibold">
                #${String(index + 1).padStart(2, '0')} ${isCustom ? '<span class="text-pink-400 text-[10px]">[사용자등록]</span>' : ''}
              </span>
            </div>

            <!-- Title -->
            <div>
              <h3 class="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                ${act.title}
              </h3>
              <p class="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                ${act.conceptSummary || ''}
              </p>
            </div>

            <!-- Formula Highlight Box -->
            <div class="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto select-all">
              ${cleanFormula || '(x - a)² + (y - b)² = r²'}
            </div>

            <!-- Keywords Tag Cloud -->
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${keywordsHtml}
            </div>

          </div>

          <!-- Card Bottom Action Toolbar -->
          <div class="p-4 pt-3 border-t border-white/10 flex items-center justify-between bg-white/[0.01]">
            <span class="text-[11px] text-slate-400 font-mono">
              ${act.equationType || '표준형'}
            </span>
            <div class="flex items-center gap-2">
              <button class="glass-btn glass-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 btn-open-act-detail" data-act-id="${act.id}">
                <i data-lucide="compass" class="w-3.5 h-3.5"></i>
                <span>탐구하기</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Attach click handlers to cards
    const openButtons = gridContainer.querySelectorAll('.btn-open-act-detail');
    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-act-id');
        const activity = all.find(a => a.id === id);
        if (activity) openActivityDetail(activity);
      });
    });
  }

  // 3. Open Activity Detail Modal
  function openActivityDetail(activity) {
    currentSelectedActivity = activity;
    if (!detailModal) return;

    if (detailTitle) detailTitle.textContent = activity.title;
    if (detailCat) detailCat.textContent = activity.categoryName || activity.category;
    if (detailDiff) detailDiff.textContent = activity.difficulty;
    if (detailGrade) detailGrade.textContent = activity.targetGrade || '고등학교 공통수학1';
    if (detailEqType) detailEqType.textContent = activity.equationType || '표준형 방정식';
    if (detailFormula) detailFormula.textContent = activity.equationFormula;
    if (detailConcept) detailConcept.textContent = activity.conceptSummary;

    // Competencies
    if (detailCompetencies) {
      if (Array.isArray(activity.competency) && activity.competency.length > 0) {
        detailCompetencies.innerHTML = activity.competency.map(c => `
          <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 flex items-center gap-1">
            <i data-lucide="award" class="w-3 h-3 text-indigo-400"></i> ${c}
          </span>
        `).join('');
      } else {
        detailCompetencies.innerHTML = '';
      }
    }

    // Steps
    if (detailSteps) {
      if (Array.isArray(activity.steps) && activity.steps.length > 0) {
        detailSteps.innerHTML = activity.steps.map(s => `
          <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
            <span class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-400/30">
              ${s.stepNumber || '•'}
            </span>
            <div>
              <div class="text-xs font-bold text-slate-200">${s.title || ''}</div>
              <p class="text-xs text-slate-300 mt-0.5 leading-relaxed">${s.instruction || ''}</p>
            </div>
          </div>
        `).join('');
      } else {
        detailSteps.innerHTML = '<p class="text-xs text-slate-400">등록된 탐구 단계 가이드가 없습니다.</p>';
      }
    }

    // Parameters
    if (detailParams) {
      if (activity.parameters) {
        detailParams.innerHTML = Object.entries(activity.parameters).map(([k, v]) => {
          const valStr = typeof v === 'object' ? JSON.stringify(v) : v;
          return `<div><span class="text-cyan-400">${k}</span>: <span class="text-slate-200">${valStr}</span></div>`;
        }).join('');
      } else {
        detailParams.textContent = '기본 중심 (0, 0), 반지름 r = 3';
      }
    }

    // Real World
    if (detailRealWorld) {
      detailRealWorld.textContent = activity.realWorldApplication || '해석기하학 및 궤적 모델링';
    }

    // Evaluation
    if (detailEval) {
      detailEval.textContent = activity.evaluationCriteria || '원의 기하학적 정의를 명확히 이해하고 방정식을 능숙하게 표현할 수 있는가?';
    }

    detailModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (window.lucide) window.lucide.createIcons();
  }

  function closeDetailModal() {
    if (!detailModal) return;
    detailModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (detailCloseBtn) detailCloseBtn.addEventListener('click', closeDetailModal);
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeDetailModal();
    });
  }

  // Copy Activity to Clipboard
  if (detailCopyBtn) {
    detailCopyBtn.addEventListener('click', () => {
      if (!currentSelectedActivity) return;
      const act = currentSelectedActivity;
      const text = `[원의 방정식 탐구 활동지: ${act.title}]\n\n- 카테고리: ${act.categoryName || act.category}\n- 난이도: ${act.difficulty}\n- 방정식 공식: ${act.equationFormula}\n\n[수학적 개념]\n${act.conceptSummary}\n\n[단계별 탐구 미션]\n${(act.steps || []).map(s => `${s.stepNumber}. ${s.title}: ${s.instruction}`).join('\n')}\n\n[실생활 융합]\n${act.realWorldApplication || 'N/A'}`;
      
      navigator.clipboard.writeText(text).then(() => {
        const originalText = detailCopyBtn.innerHTML;
        detailCopyBtn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i><span class="text-emerald-300">복사 완료!</span>`;
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          detailCopyBtn.innerHTML = originalText;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      }).catch(err => {
        alert('클립보드 복사에 실패했습니다.');
      });
    });
  }

  // Launch Simulator with Activity Params
  if (detailLaunchBtn) {
    detailLaunchBtn.addEventListener('click', () => {
      closeDetailModal();
      
      // Scroll to Hero Sandbox
      const sandbox = document.getElementById('interactive-sandbox');
      if (sandbox) {
        sandbox.scrollIntoView({ behavior: 'smooth' });
      }

      // Activate Circle mode in Hero sandbox
      const circleBtn = document.querySelector('[data-sim-type="circle"]');
      if (circleBtn) {
        circleBtn.click();
      }

      // Adjust amplitude slider to match radius if possible
      if (currentSelectedActivity && currentSelectedActivity.parameters && currentSelectedActivity.parameters.radius) {
        const rVal = parseFloat(currentSelectedActivity.parameters.radius);
        const ampSlider = document.getElementById('slider-amp');
        const ampLabel = document.getElementById('label-amp');
        if (ampSlider && !isNaN(rVal)) {
          const targetAmp = Math.max(0.5, Math.min(3.0, (rVal / 1.5)));
          ampSlider.value = targetAmp;
          if (ampLabel) ampLabel.textContent = targetAmp.toFixed(1);
          ampSlider.dispatchEvent(new Event('input'));
        }
      }
    });
  }

  // 4. Search and Filters
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterState.keyword = e.target.value;
      renderActivities();
    });
  }

  if (difficultyFilter) {
    difficultyFilter.addEventListener('change', (e) => {
      filterState.difficulty = e.target.value;
      renderActivities();
    });
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active', 'bg-indigo-600/30', 'border-indigo-400/50', 'text-white'));
      pill.classList.add('active', 'bg-indigo-600/30', 'border-indigo-400/50', 'text-white');
      filterState.category = pill.getAttribute('data-act-cat');
      renderActivities();
    });
  });

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      filterState.keyword = '';
      filterState.category = 'all';
      filterState.difficulty = 'all';
      if (searchInput) searchInput.value = '';
      if (difficultyFilter) difficultyFilter.value = 'all';
      categoryPills.forEach(p => {
        if (p.getAttribute('data-act-cat') === 'all') {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
      renderActivities();
    });
  }

  // 5. Download Full DB as JSON
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const exportData = {
        databaseInfo: {
          title: "원의 방정식 표현 및 탐구 활동 데이터베이스 (Circle Equation Activities DB)",
          version: "1.0.0",
          curriculum: "2022 개정 수학과 교육과정 (공통수학1 / 해석기하 / 도형의 방정식)",
          exportedAt: new Date().toISOString(),
          totalActivities: getAllActivities().length
        },
        activities: getAllActivities()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "circle_activities_db_export.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }

  // 6. Add Custom Activity Modal
  function openAddModal() {
    if (!addModal) return;
    addModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeAddModal() {
    if (!addModal) return;
    addModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openAddBtn) openAddBtn.addEventListener('click', openAddModal);
  if (navQuickAddBtn) navQuickAddBtn.addEventListener('click', openAddModal);
  if (addCloseBtn) addCloseBtn.addEventListener('click', closeAddModal);
  if (addModal) {
    addModal.addEventListener('click', (e) => {
      if (e.target === addModal) closeAddModal();
    });
  }

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('custom-act-title').value.trim();
      const category = document.getElementById('custom-act-cat').value;
      const difficulty = document.getElementById('custom-act-diff').value;
      const equationType = document.getElementById('custom-act-type').value.trim();
      const equationFormula = document.getElementById('custom-act-formula').value.trim();
      const conceptSummary = document.getElementById('custom-act-concept').value.trim();
      const rawSteps = document.getElementById('custom-act-steps').value.trim();
      const realWorldApplication = document.getElementById('custom-act-realworld').value.trim();
      const keywordsRaw = document.getElementById('custom-act-keywords').value.trim();

      const catNameMap = {
        'standard-general': '표준형 & 일반형',
        'axis-tangent': '좌표축 접촉',
        'line-circle': '위치관계 & 접선',
        'real-world': '실생활 융합 모델링',
        'locus-family': '심화 자취 & 원의 족'
      };

      const stepsList = rawSteps.split('\n').filter(line => line.trim() !== '').map((line, idx) => {
        const parts = line.split(':');
        return {
          stepNumber: idx + 1,
          title: parts.length > 1 ? parts[0].trim() : `탐구 단계 ${idx + 1}`,
          instruction: parts.length > 1 ? parts.slice(1).join(':').trim() : line.trim()
        };
      });

      const newActivity = {
        id: `circle-custom-${Date.now()}`,
        title,
        category,
        categoryName: catNameMap[category] || category,
        difficulty,
        equationType,
        equationFormula,
        targetGrade: '고등학교 1학년',
        competency: ['문제해결', '개념이해', '기호표현'],
        keywords: keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : ['원의방정식'],
        conceptSummary,
        steps: stepsList,
        realWorldApplication: realWorldApplication || '도형의 방정식 및 공학적 모델링',
        evaluationCriteria: '원의 방정식을 명확히 수립하고 기하학적 의미를 추론할 수 있는가?'
      };

      const customList = getCustomActivities();
      customList.push(newActivity);
      saveCustomActivities(customList);

      addForm.reset();
      closeAddModal();
      renderActivities();

      // Async Sync to Supabase via Vercel Serverless Function
      fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      }).then(res => res.json()).then(resData => {
        if (resData.success) {
          alert(`🎉 '${title}' 활동이 Supabase 클라우드 DB 및 로컬스토리지에 성공적으로 저장되었습니다!`);
          if (supabaseStatusText) supabaseStatusText.textContent = 'Supabase Cloud 저장 완료';
        } else {
          alert(`'${title}' 활동이 로컬스토리지에 저장되었습니다. (Supabase 안내: ${resData.message || 'Vercel 환경변수 연동 필요'})`);
        }
      }).catch(() => {
        alert(`'${title}' 활동이 로컬 브라우저 데이터베이스에 안전하게 저장되었습니다!`);
      });
    });
  }

  // 7. Supabase Bulk Sync Button Handler
  if (syncSupabaseBtn) {
    syncSupabaseBtn.addEventListener('click', async () => {
      const allActivities = getAllActivities();
      syncSupabaseBtn.disabled = true;
      const originalHtml = syncSupabaseBtn.innerHTML;
      syncSupabaseBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-emerald-400"></i><span>동기화 중...</span>`;
      if (window.lucide) window.lucide.createIcons();

      try {
        const response = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allActivities)
        });
        const result = await response.json();

        if (result.success) {
          alert(`🚀 [Supabase 클라우드 동기화 성공]\n총 ${allActivities.length}개의 원의 방정식 탐구 활동이 Supabase DB (circle_activities 테이블)에 안전하게 저장·업데이트되었습니다!`);
          if (supabaseStatusText) supabaseStatusText.textContent = `Supabase 연동됨 (${allActivities.length}건)`;
        } else {
          alert(`[Supabase 연동 상태 안내]\n${result.message || 'Vercel 배포 환경에서 환경 변수(SUPABASE_URL, SUPABASE_ANON_KEY)를 확인해 주세요.'}`);
        }
      } catch (err) {
        alert(`로컬 프리뷰 상태입니다. Vercel 배포 시 /api/activities 서버리스 함수를 통해 Supabase로 즉시 자동 전송됩니다.`);
      } finally {
        syncSupabaseBtn.disabled = false;
        syncSupabaseBtn.innerHTML = originalHtml;
        if (window.lucide) window.lucide.createIcons();
      }
    });
  }

  // 8. Remote Supabase Fetch on Load
  async function checkAndFetchSupabase() {
    try {
      const res = await fetch('/api/activities');
      if (!res.ok) return;
      const data = await res.json();
      if (data.connected && supabaseStatusText) {
        supabaseStatusText.textContent = `Supabase Cloud 연결됨 (${data.count || 0}건)`;
      }
      if (data.activities && data.activities.length > 0) {
        const currentCustom = getCustomActivities();
        let addedCount = 0;
        data.activities.forEach(remoteAct => {
          const existsInDefault = defaultActivities.some(d => d.id === remoteAct.id);
          const existsInCustom = currentCustom.some(c => c.id === remoteAct.id);
          if (!existsInDefault && !existsInCustom) {
            currentCustom.push(remoteAct);
            addedCount++;
          }
        });
        if (addedCount > 0) {
          saveCustomActivities(currentCustom);
          renderActivities();
        }
      }
    } catch (e) {
      // Offline / Static fallback mode
    }
  }

  // Global ESC Modal Close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (detailModal && detailModal.classList.contains('open')) closeDetailModal();
      if (addModal && addModal.classList.contains('open')) closeAddModal();
    }
  });

  // Initial Render & Remote Check
  renderActivities();
  checkAndFetchSupabase();
}
