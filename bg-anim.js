/**
 * Sci-Fi Gateway Animated Background
 * วงกลม gateway หมุนช้าๆ + จุด node เรืองแสง + เส้น circuit
 */
(function () {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], frame = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    initNodes();
  }

  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function initNodes() {
    nodes = [];
    const count = Math.floor((W * H) / 22000);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.5 + 0.8,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.008
      });
    }
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, W, H);
    const dark = isDark();
    const A = dark ? 1 : 0.5;
    const col = dark ? '100,181,246' : '21,101,192';
    const col2 = dark ? '206,147,216' : '106,27,154';
    const cx = W * 0.5, cy = H * 0.45;
    const baseR = Math.min(W, H) * 0.14;
    const time = frame * 0.008;
    const breathe = (Math.sin(time * 0.8) + 1) / 2; // 0-1 slow breathe

    // ===== CIRCUIT LINES =====
    const maxDist = Math.min(W, H) * 0.16;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const a = (1 - dist / maxDist) * 0.2 * A;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          const mx = (nodes[i].x + nodes[j].x) / 2;
          ctx.lineTo(mx, nodes[i].y);
          ctx.lineTo(mx, nodes[j].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(' + col + ',' + a + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    // ===== NODES =====
    for (const n of nodes) {
      n.phase += n.speed;
      const glow = (Math.sin(n.phase) + 1) / 2;
      const a = (0.25 + glow * 0.75) * A;
      const r = n.r + glow * 1;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
      g.addColorStop(0, 'rgba(' + col + ',' + (a * 0.4) + ')');
      g.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.beginPath(); ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + col + ',' + a + ')'; ctx.fill();
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }

    // ===== GATEWAY RING =====
    const ga = (0.06 + breathe * 0.14) * A;
    const rot = time * 0.3; // slow rotation

    ctx.save();
    ctx.translate(cx, cy);

    // Outer ambient glow
    const outerG = ctx.createRadialGradient(0, 0, baseR * 0.5, 0, 0, baseR * 2.2);
    outerG.addColorStop(0, 'rgba(' + col + ',' + (ga * 0.4) + ')');
    outerG.addColorStop(0.5, 'rgba(' + col + ',' + (ga * 0.15) + ')');
    outerG.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.beginPath(); ctx.arc(0, 0, baseR * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = outerG; ctx.fill();

    // Main ring layers (3 rings with different rotation)
    for (let layer = 0; layer < 3; layer++) {
      const lr = baseR + layer * 8;
      const la = ga * (1 - layer * 0.25);
      const lRot = rot * (1 - layer * 0.3) * (layer % 2 === 0 ? 1 : -1);
      ctx.save();
      ctx.rotate(lRot);
      ctx.beginPath(); ctx.arc(0, 0, lr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + col + ',' + la + ')';
      ctx.lineWidth = 2 - layer * 0.5;
      ctx.stroke();

      // Tick marks around ring
      const tickCount = 36 + layer * 12;
      for (let t = 0; t < tickCount; t++) {
        const angle = (t / tickCount) * Math.PI * 2;
        const tickLen = (t % 6 === 0) ? 8 : (t % 3 === 0) ? 5 : 2.5;
        const tickA = (t % 6 === 0) ? la * 0.9 : la * 0.4;
        const x1 = Math.cos(angle) * lr;
        const y1 = Math.sin(angle) * lr;
        const x2 = Math.cos(angle) * (lr + tickLen);
        const y2 = Math.sin(angle) * (lr + tickLen);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(' + col + ',' + tickA + ')';
        ctx.lineWidth = (t % 6 === 0) ? 1.2 : 0.6;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Inner detail rings (thin, rotating opposite)
    for (let d = 0; d < 4; d++) {
      const dr = baseR * (0.4 + d * 0.12);
      const dRot = -rot * (1.5 + d * 0.3);
      const da = ga * (0.5 - d * 0.08);
      ctx.save();
      ctx.rotate(dRot);
      ctx.beginPath(); ctx.arc(0, 0, dr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(' + col2 + ',' + da + ')';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3 + d * 2, 6 + d * 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Arc segments (rotating arcs like sci-fi portal)
    for (let s = 0; s < 6; s++) {
      const sAngle = (s / 6) * Math.PI * 2 + rot * 1.2;
      const sLen = Math.PI * 0.15 + Math.sin(time + s) * 0.08;
      const sr = baseR * (0.75 + Math.sin(time * 0.5 + s * 1.2) * 0.08);
      const sa = ga * (0.6 + Math.sin(time + s * 0.8) * 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, sr, sAngle, sAngle + sLen);
      ctx.strokeStyle = 'rgba(' + col + ',' + sa + ')';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Accent arcs (purple, counter-rotate)
    for (let s = 0; s < 4; s++) {
      const sAngle = (s / 4) * Math.PI * 2 - rot * 0.8;
      const sLen = Math.PI * 0.1;
      const sr = baseR * 1.15;
      const sa = ga * 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, sr, sAngle, sAngle + sLen);
      ctx.strokeStyle = 'rgba(' + col2 + ',' + sa + ')';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Center core glow (breathe)
    const coreG = ctx.createRadialGradient(0, 0, 0, 0, 0, baseR * 0.35);
    coreG.addColorStop(0, 'rgba(' + col + ',' + (ga * 1.5) + ')');
    coreG.addColorStop(0.6, 'rgba(' + col + ',' + (ga * 0.3) + ')');
    coreG.addColorStop(1, 'rgba(' + col + ',0)');
    ctx.beginPath(); ctx.arc(0, 0, baseR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = coreG; ctx.fill();

    // Tiny center dot
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + col + ',' + (0.3 + breathe * 0.5) * A + ')';
    ctx.fill();

    ctx.restore();

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
