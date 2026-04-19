// ASCII globe renderer — one instance per <canvas data-v="...">.
// Features:
//  - Projects a set of 3D points onto a 2D canvas with perspective.
//  - Each point carries a character (A–Z, 0–9, and type glyphs).
//  - Three presets (refined / bold / weird) differ in point distribution,
//    density, size, and "personality" of motion.
//  - Rotation:
//      • idle: slow drift (constant angular velocity)
//      • when mouse is inside viewport: rotation eased toward cursor position
//  - Typing: chars on the globe reshuffle so the user's query letters
//    become the "most visible" (higher opacity) — others fade back.
//  - Dissolve: API hook to fade/scatter all points.

const IDLE_CHARS = (() => {
  const out = [];
  for (let c = 65; c <= 90; c++) out.push(String.fromCharCode(c));
  for (let c = 48; c <= 57; c++) out.push(String.fromCharCode(c));
  out.push('@','&','#','§','¶','†','‡','æ','ß','%','*','/','\\','|','+');
  return out;
})();

function pickIdle(){ return IDLE_CHARS[(Math.random()*IDLE_CHARS.length)|0]; }

// Fibonacci-sphere point distribution (even coverage, no polar clumping)
function fibSphere(n){
  const pts = [];
  const phi = Math.PI * (Math.sqrt(5) - 1);
  for (let i = 0; i < n; i++){
    const y = 1 - (i / (n-1)) * 2;
    const r = Math.sqrt(1 - y*y);
    const th = phi * i;
    pts.push({ x: Math.cos(th)*r, y, z: Math.sin(th)*r });
  }
  return pts;
}

// Lat/long grid
function latLongGrid(latSteps, longSteps){
  const pts = [];
  for (let i = 0; i < latSteps; i++){
    const lat = (-0.5 + (i + 0.5) / latSteps) * Math.PI;  // -pi/2 .. pi/2
    const y = Math.sin(lat);
    const r = Math.cos(lat);
    for (let j = 0; j < longSteps; j++){
      const lon = (j / longSteps) * Math.PI * 2;
      pts.push({ x: Math.cos(lon) * r, y, z: Math.sin(lon) * r });
    }
  }
  return pts;
}

const PRESETS = {
  refined: {
    build: () => latLongGrid(30, 60),
    fontPx: 14,
    radiusFraction: 0.38,  // globe radius as fraction of min(width,height)
    parallaxStrength: 0.9,
    idleSpin: 0.12,        // rad/sec
    tilt: 0.22,
    depthShade: true,
    bgDensity: 1,
  },
  bold: {
    build: () => latLongGrid(83, 166),
    fontPx: 11,
    radiusFraction: 0.62,
    parallaxStrength: 1.05,
    idleSpin: 0.07,
    tilt: 0.38,
    depthShade: true,
    bgDensity: 1,
    globalOpacity: 0.55,      // sits as background element
  },
  mobile: {
    build: () => latLongGrid(42, 84),
    fontPx: 14,
    radiusFraction: 0.72,
    parallaxStrength: 1.05,
    idleSpin: 0.07,
    tilt: 0.38,
    depthShade: true,
    bgDensity: 1,
    globalOpacity: 0.55,
  },
  weird: {
    build: () => fibSphere(420),
    fontPx: 17,
    radiusFraction: 0.42,
    parallaxStrength: 1.4,
    idleSpin: 0.22,
    tilt: 0.55,          // dramatic axial tilt
    depthShade: false,   // flat/graphic
    bgDensity: 0.9,
    constellation: true, // slight per-point jitter
  },
};

// Loose Earth-like land mask. Each entry = { lat (deg, -90..90), lon (deg, -180..180), rLat, rLon }
// Approximate continent ovals — not geographic, just readable silhouettes.
const LAND_BLOBS = [
  // Africa + Europe
  { lat:  10, lon:  15, rLat: 28, rLon: 22 },
  { lat:  50, lon:  15, rLat: 12, rLon: 24 },
  // Eurasia (big stretched blob)
  { lat:  55, lon:  80, rLat: 18, rLon: 55 },
  { lat:  30, lon:  95, rLat: 14, rLon: 22 },
  // India
  { lat:  22, lon:  80, rLat: 10, rLon: 10 },
  // North America
  { lat:  50, lon: -100, rLat: 20, rLon: 30 },
  { lat:  25, lon:  -95, rLat: 12, rLon: 16 },
  // South America
  { lat: -20, lon:  -60, rLat: 28, rLon: 14 },
  // Australia
  { lat: -25, lon: 135, rLat: 10, rLon: 18 },
  // Scandinavia cap
  { lat:  65, lon:  20, rLat: 10, rLon: 18 },
];

function isLand(pt){
  // pt is unit vector {x,y,z}. Convert back to lat/lon in degrees.
  const lat = Math.asin(pt.y) * 180 / Math.PI;
  const lon = Math.atan2(pt.z, pt.x) * 180 / Math.PI;
  for (const b of LAND_BLOBS){
    const dLat = (lat - b.lat) / b.rLat;
    // Handle lon wraparound (+/- 180)
    let dLonRaw = lon - b.lon;
    if (dLonRaw > 180) dLonRaw -= 360;
    if (dLonRaw < -180) dLonRaw += 360;
    const dLon = dLonRaw / b.rLon;
    if (dLat*dLat + dLon*dLon < 1) return true;
  }
  return false;
}

export function createGlobe(canvas, variant){
  const preset = PRESETS[variant];
  const ctx = canvas.getContext('2d');

  let cssW = 0, cssH = 0;
  const mouse = { x: 0.5, y: 0.5, inside: false };
  const rot = { y: 0, x: preset.tilt, vy: 0, vx: 0, targetY: 0, targetX: preset.tilt };
  // Build point cloud — even grid distribution.
  let points = preset.build().map(p => ({
    ...p,
    char: pickIdle(),
    weight: Math.random(),
    flipAt: performance.now() + 2000 + Math.random()*6000,
    jitter: preset.constellation ? (Math.random()*2 - 1) : 0,
  }));

  // Query state — which letters the user is searching.
  // When set (non-empty), we relabel a subset of the globe with those chars.
  let query = "";
  let dissolving = false;
  let dissolveStart = 0;

  function setQuery(q){
    query = (q || "").toUpperCase();
    // Rebuild characters: pick points near the viewer (front hemisphere)
    // and stamp them with the query chars; background chars remain idle.
    if (!query){
      points.forEach(p => { p.char = pickIdle(); });
      return;
    }
    const chars = query.split("").filter(c => c.trim().length);
    if (chars.length === 0){
      points.forEach(p => { p.char = pickIdle(); });
      return;
    }
    points.forEach((p, i) => {
      p.char = chars[i % chars.length];
    });
  }

  function dissolve(){
    dissolving = true;
    dissolveStart = performance.now();
  }

  function reset(){
    dissolving = false;
    dissolveStart = 0;
    query = "";
    points.forEach(p => { p.char = pickIdle(); });
  }

  let inkColor = '#A4A198';
  function setColor(hex){ inkColor = hex; }

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    // If the canvas is hidden (display:none), rect will be 0×0 — skip,
    // and we'll be called again via ResizeObserver when it becomes visible.
    if (rect.width === 0 || rect.height === 0) return;
    cssW = rect.width;
    cssH = rect.height;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);
  // ResizeObserver catches display:none → block transitions (tab switches)
  const ro = (typeof ResizeObserver !== 'undefined') ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvas);

  // Mouse parallax — track globally relative to the canvas's bounding rect
  let lastMoveAt = 0;
  function onMove(e){
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouse.x = Math.max(0, Math.min(1, x));
    mouse.y = Math.max(0, Math.min(1, y));
    mouse.inside = true;
    lastMoveAt = performance.now();
  }
  function onLeave(e){
    // document.mouseleave fires when the cursor exits the viewport
    if (!e || e.relatedTarget === null || e.type === 'mouseleave' || e.type === 'blur'){
      mouse.inside = false;
    }
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseleave', onLeave);
  document.addEventListener('mouseout', (e) => {
    // Fires when pointer leaves the document root (reliable cross-browser)
    if (!e.relatedTarget && !e.toElement) mouse.inside = false;
  });
  window.addEventListener('blur', onLeave);

  let last = performance.now();
  function frame(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // If still unsized (e.g. stage hidden), skip drawing
    if (cssW === 0 || cssH === 0){
      raf = requestAnimationFrame(frame);
      return;
    }

    // Target rotation
    if (mouse.inside){
      rot.targetY = (mouse.x - 0.5) * Math.PI * preset.parallaxStrength;
      rot.targetX = preset.tilt + (mouse.y - 0.5) * 0.6;
    } else {
      rot.targetY += preset.idleSpin * dt;
      rot.targetX = preset.tilt;
    }
    // Ease current toward target
    rot.y += (rot.targetY - rot.y) * Math.min(1, dt * 3.2);
    rot.x += (rot.targetX - rot.x) * Math.min(1, dt * 3.2);

    draw(now);
    raf = requestAnimationFrame(frame);
  }

  function draw(now){
    const w = cssW, h = cssH;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(Math.max(w, 540), h) * preset.radiusFraction;
    const fov = R * 2.4;

    const cy_x = Math.cos(rot.x), sy_x = Math.sin(rot.x);
    const cy_y = Math.cos(rot.y), sy_y = Math.sin(rot.y);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = preset.fontPx;
    ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, monospace`;

    const dissolveT = dissolving ? Math.min(1, (now - dissolveStart)/900) : 0;

    for (let i = 0; i < points.length; i++){
      const p = points[i];

      // Idle char flicker (when no query active)
      if (!query && now >= p.flipAt){
        p.char = pickIdle();
        p.flipAt = now + 1600 + Math.random()*6000;
      }

      // Rotate around Y, then X
      let x = p.x, y = p.y, z = p.z;
      const xz_x = x * cy_y + z * sy_y;
      const xz_z = -x * sy_y + z * cy_y;
      x = xz_x; z = xz_z;
      const yz_y = y * cy_x - z * sy_x;
      const yz_z = y * sy_x + z * cy_x;
      y = yz_y; z = yz_z;

      // Constellation jitter
      if (preset.constellation){
        const wob = Math.sin(now * 0.0004 + i) * 0.015;
        x += wob * p.jitter;
        y += wob * (1 - p.jitter);
      }

      // Perspective projection
      const scale = fov / (fov + z * R);
      const sx = cx + x * R * scale;
      const sy = cy + y * R * scale;

      // z ranges roughly -1..1 after rotation; front = -1
      const frontness = (1 - z) / 2;   // 0 (back) .. 1 (front)

      // Opacity
      let op;
      if (preset.depthShade){
        // Depth-shaded: back half nearly invisible, front half strong
        op = 0.04 + frontness * 0.85;
      } else {
        op = frontness > 0.5 ? 0.92 : 0.12;
      }

      // Globe-wide opacity scalar (pushes globe toward background)
      if (preset.globalOpacity != null){
        op *= preset.globalOpacity;
      }

      // If user is searching, emphasise query letters by pushing back chars further down
      if (query){
        op *= 0.95;
      }

      // Dissolve: spread points outward + fade globally
      let dx = 0, dy = 0;
      if (dissolving){
        const t = dissolveT;
        const ang = Math.atan2(sy - cy, sx - cx);
        const push = 180 * t;
        dx = Math.cos(ang) * push;
        dy = Math.sin(ang) * push;
        op *= (1 - t);
      }

      ctx.globalAlpha = Math.max(0, Math.min(1, op));
      ctx.fillStyle = inkColor;
      // Slight size modulation with perspective on weird variant
      if (preset.constellation){
        ctx.font = `${Math.round(fontSize * (0.7 + frontness * 0.7))}px "JetBrains Mono", ui-monospace, monospace`;
      }
      ctx.fillText(p.char, sx + dx, sy + dy);
    }

    ctx.globalAlpha = 1;
  }

  let raf = requestAnimationFrame(frame);

  return {
    setQuery,
    setColor,
    dissolve,
    reset,
    destroy(){
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      if (ro) ro.disconnect();
    }
  };
}
