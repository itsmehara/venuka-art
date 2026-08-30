/* =========================================================================
   Venuka — living background scene
   -------------------------------------------------------------------------
   A seasonal meadow that runs behind the whole website: sunlight turns
   cloudy, rain falls, snow falls, then the sun returns. Butterflies fly,
   flap, wander, and settle on a flower to wait out the weather.

   No libraries. The physics is purpose-built because rigid-body engines are
   the wrong shape for this: butterflies want forces, drag and steering
   behaviours, and flowers want spring-dampers. Roughly 200 lines of physics
   beats 90KB of collision solver here, and it keeps the site dependency-free.

   Everything is drawn crisply — flat fills with dark outlines, no blur
   filters — so the butterflies and flowers stay clearly readable against any
   sky. Every sky palette is deliberately light enough that the page's dark
   text keeps its contrast ratio.

   Sections: 1 Settings  2 Maths  3 Seasons  4 Wind  5 Sky  6 Clouds
             7 Weather  8 Ground  9 Flowers  10 Butterflies  11 Engine
   ========================================================================= */
(function () {
  "use strict";

  /* ---------- 1. Settings ------------------------------------------------ */
  var SEASON_SECONDS = 30;     /* how long each season lasts */
  var BLEND_SECONDS  = 5;      /* crossfade at the start of each season */
  var STORE_KEY      = "venuka-scene";

  var canvas = document.getElementById("scene-canvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d", { alpha: false });

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 2. Maths --------------------------------------------------- */
  var TAU = Math.PI * 2;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { return t * t * (3 - 2 * t); }          /* ease in/out */

  function mixHex(a, b, t) {
    var ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
    var br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
    return "rgb(" + Math.round(lerp(ar, br, t)) + "," + Math.round(lerp(ag, bg, t)) + "," +
           Math.round(lerp(ab, bb, t)) + ")";
  }

  /* ---------- 3. Seasons -------------------------------------------------
     Every skyTop is kept light on purpose. Dark page text sits over this,
     and a moody near-black storm sky would quietly break its contrast.
     Rain reads as weather through its clouds and streaks, not by going dark.
     ---------------------------------------------------------------------- */
  var SEASONS = [
    {
      key: "sunny", name: "Sunny", icon: "☀️",
      skyTop: "#6fcbf2", skyMid: "#a8e2f7", skyBot: "#fff4d6",
      sun: 1, sunColour: "#fff0a8", cloudCount: 2, cloudAlpha: 0.55, cloudTint: "#ffffff",
      precip: null, intensity: 0,
      wind: 26, gust: 14, light: 1,
      grass: "#69b85f", accent: "#ffc93c",
      flight: 1            /* butterflies fly freely */
    },
    {
      key: "cloudy", name: "Cloudy", icon: "⛅",
      skyTop: "#9fb6cc", skyMid: "#c3d1de", skyBot: "#eef2f6",
      sun: 0.28, sunColour: "#fdf6dc", cloudCount: 7, cloudAlpha: 0.9, cloudTint: "#fbfcfe",
      precip: null, intensity: 0,
      wind: 52, gust: 30, light: 0.9,
      grass: "#63a862", accent: "#8fb3d9",
      flight: 0.75
    },
    {
      key: "rainy", name: "Rain", icon: "🌧️",
      skyTop: "#8ea3bd", skyMid: "#aebccd", skyBot: "#dde4ec",
      sun: 0.06, sunColour: "#eef0f4", cloudCount: 9, cloudAlpha: 1, cloudTint: "#e7ecf3",
      precip: "rain", intensity: 1,
      wind: 74, gust: 46, light: 0.82,
      grass: "#4f9a5c", accent: "#6f8fb5",
      flight: 0            /* butterflies shelter on the flowers */
    },
    {
      key: "snowy", name: "Snow", icon: "🌨️",
      skyTop: "#bcc9dc", skyMid: "#d7e0ec", skyBot: "#f4f8fc",
      sun: 0.14, sunColour: "#ffffff", cloudCount: 7, cloudAlpha: 0.95, cloudTint: "#ffffff",
      precip: "snow", intensity: 1,
      wind: 30, gust: 22, light: 0.88,
      grass: "#6f9a78", accent: "#b9cbe4",
      flight: 0
    }
  ];

  /* The live, blended season. Everything reads from this, never from SEASONS
     directly, so a crossfade is simply two seasons mixed by `t`. */
  var S = {
    skyTop: SEASONS[0].skyTop, skyMid: SEASONS[0].skyMid, skyBot: SEASONS[0].skyBot,
    sun: SEASONS[0].sun, sunColour: SEASONS[0].sunColour,
    cloudAlpha: SEASONS[0].cloudAlpha, cloudTint: SEASONS[0].cloudTint,
    grass: SEASONS[0].grass, accent: SEASONS[0].accent,
    wind: SEASONS[0].wind, gust: SEASONS[0].gust, light: 1, flight: 1,
    rain: 0, snow: 0, cloudTarget: SEASONS[0].cloudCount,
    index: 0, name: SEASONS[0].name, icon: SEASONS[0].icon, progress: 0
  };

  function updateSeason(elapsed) {
    var span = SEASON_SECONDS;
    var i = Math.floor(elapsed / span) % SEASONS.length;
    var into = elapsed % span;
    var prev = SEASONS[(i - 1 + SEASONS.length) % SEASONS.length];
    var cur = SEASONS[i];
    var t = into < BLEND_SECONDS ? smooth(into / BLEND_SECONDS) : 1;

    S.index = i; S.name = cur.name; S.icon = cur.icon; S.progress = into / span;
    S.skyTop = mixHex(prev.skyTop, cur.skyTop, t);
    S.skyMid = mixHex(prev.skyMid, cur.skyMid, t);
    S.skyBot = mixHex(prev.skyBot, cur.skyBot, t);
    S.sunColour = mixHex(prev.sunColour, cur.sunColour, t);
    S.cloudTint = mixHex(prev.cloudTint, cur.cloudTint, t);
    S.grass = mixHex(prev.grass, cur.grass, t);
    S.accent = mixHex(prev.accent, cur.accent, t);
    S.sun = lerp(prev.sun, cur.sun, t);
    S.cloudAlpha = lerp(prev.cloudAlpha, cur.cloudAlpha, t);
    S.wind = lerp(prev.wind, cur.wind, t);
    S.gust = lerp(prev.gust, cur.gust, t);
    S.light = lerp(prev.light, cur.light, t);
    S.flight = lerp(prev.flight, cur.flight, t);
    S.rain = lerp(prev.precip === "rain" ? prev.intensity : 0, cur.precip === "rain" ? cur.intensity : 0, t);
    S.snow = lerp(prev.precip === "snow" ? prev.intensity : 0, cur.precip === "snow" ? cur.intensity : 0, t);
    S.cloudTarget = Math.round(lerp(prev.cloudCount, cur.cloudCount, t));
  }

  /* ---------- 4. Wind ----------------------------------------------------
     One shared, slowly-breathing horizontal field. Everything that moves
     asks the wind what it is doing: clouds drift, rain slants, snow swirls,
     flower stalks lean, and butterflies get pushed off course.
     ---------------------------------------------------------------------- */
  var wind = { value: 0, phase: rand(0, TAU), phase2: rand(0, TAU) };

  function updateWind(dt) {
    wind.phase += dt * 0.23;
    wind.phase2 += dt * 0.71;
    var breath = Math.sin(wind.phase) * 0.7 + Math.sin(wind.phase2 * 0.6) * 0.3;
    wind.value = S.wind * 0.35 + breath * S.gust;
  }

  /* ---------- 5. Sky ----------------------------------------------------- */
  var W = 0, H = 0, DPR = 1, groundY = 0;

  function drawSky() {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, S.skyTop);
    g.addColorStop(0.55, S.skyMid);
    g.addColorStop(1, S.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawSun(time) {
    if (S.sun <= 0.02) return;
    /* A slow arc across the sky, one full sweep per season cycle. */
    var span = SEASON_SECONDS * SEASONS.length;
    var p = (time % span) / span;
    var x = W * (0.12 + p * 0.78);
    var y = H * (0.30 - Math.sin(p * Math.PI) * 0.16);
    var r = Math.min(W, H) * 0.055 + 18;

    var glow = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 7);
    glow.addColorStop(0, "rgba(255,244,190," + (0.55 * S.sun) + ")");
    glow.addColorStop(0.45, "rgba(255,236,170," + (0.16 * S.sun) + ")");
    glow.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H * 0.85);

    ctx.globalAlpha = S.sun;
    ctx.fillStyle = S.sunColour;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }

  /* ---------- 6. Clouds --------------------------------------------------- */
  var clouds = [];

  function makeCloud(offscreen) {
    var scale = rand(0.55, 1.5);
    var puffs = [], n = randInt(4, 7), spread = 62 * scale;
    for (var i = 0; i < n; i++) {
      puffs.push({
        x: rand(-spread, spread),
        y: rand(-16 * scale, 12 * scale),
        r: rand(20, 42) * scale
      });
    }
    return {
      x: offscreen ? -180 * scale : rand(0, W),
      y: rand(H * 0.05, H * 0.42),
      scale: scale,
      speed: rand(0.55, 1.25),
      alpha: rand(0.7, 1),
      puffs: puffs,
      width: spread + 60 * scale
    };
  }

  function updateClouds(dt) {
    var want = S.cloudTarget || 2;
    while (clouds.length < want) clouds.push(makeCloud(clouds.length > 0));
    while (clouds.length > want) clouds.pop();

    for (var i = clouds.length - 1; i >= 0; i--) {
      var c = clouds[i];
      c.x += wind.value * c.speed * 0.55 * dt;
      if (c.x - c.width > W) c.x = -c.width;
      if (c.x + c.width < 0) c.x = W + c.width;
    }
  }

  function drawClouds() {
    if (S.cloudAlpha <= 0.01) return;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      ctx.globalAlpha = S.cloudAlpha * c.alpha;
      /* Soft body, then a brighter crown so clouds read as volume, not fog. */
      for (var j = 0; j < c.puffs.length; j++) {
        var p = c.puffs[j];
        var g = ctx.createRadialGradient(c.x + p.x, c.y + p.y, p.r * 0.15,
                                         c.x + p.x, c.y + p.y, p.r);
        g.addColorStop(0, S.cloudTint);
        g.addColorStop(0.72, S.cloudTint);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(c.x + p.x, c.y + p.y, p.r, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- 7. Weather: rain and snow ----------------------------------
     One pooled array holds both. Rain is a fast streak with a splash at the
     ground; snow is slow, drifts sideways and settles into a drift line.
     ---------------------------------------------------------------------- */
  var drops = [], splashes = [], MAX_DROPS = 460;

  function dropCount() {
    var area = (W * H) / (1440 * 900);
    var cap = Math.round(clamp(area, 0.5, 1.6) * MAX_DROPS * quality);
    return Math.round(cap * Math.max(S.rain, S.snow));
  }

  function spawnDrop(kind, spread) {
    var y0 = spread ? rand(-H * 0.4, groundY) : rand(-H * 0.5, 0);
    if (kind === "rain") {
      return { kind: "rain", x: rand(-120, W + 120), y: y0,
               vy: rand(760, 1150), len: rand(14, 30), a: rand(0.34, 0.7), z: rand(0.5, 1) };
    }
    return { kind: "snow", x: rand(-60, W + 60), y: y0,
             vy: rand(34, 78), r: rand(2, 5), a: rand(0.62, 1),
             sway: rand(0, TAU), swaySpeed: rand(0.6, 1.7), z: rand(0.5, 1) };
  }

  function updateWeather(dt) {
    var want = dropCount();
    var kind = S.snow > S.rain ? "snow" : "rain";

    while (drops.length < want) drops.push(spawnDrop(kind, true));
    while (drops.length > want) drops.pop();

    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      if (d.kind !== kind) { drops[i] = spawnDrop(kind, true); continue; }

      if (d.kind === "rain") {
        d.x += wind.value * 0.55 * d.z * dt;
        d.y += d.vy * d.z * dt;
        if (d.y > groundY) {
          if (splashes.length < 60 && Math.random() < 0.4) {
            splashes.push({ x: d.x, y: groundY, r: 0, life: 1 });
          }
          d.y = rand(-140, -10); d.x = rand(-120, W + 120);
        }
      } else {
        d.sway += d.swaySpeed * dt;
        d.x += (wind.value * 0.42 * d.z + Math.sin(d.sway) * 22) * dt;
        d.y += d.vy * d.z * dt;
        if (d.y > groundY + 6) {
          addSnowDepth(d.x, 1.3);
          d.y = rand(-160, -10); d.x = rand(-60, W + 60);
        }
      }
      if (d.x < -160) d.x = W + 140;
      if (d.x > W + 160) d.x = -140;
    }

    for (var s = splashes.length - 1; s >= 0; s--) {
      var sp = splashes[s];
      sp.r += 46 * dt; sp.life -= dt * 2.6;
      if (sp.life <= 0) splashes.splice(s, 1);
    }
  }

  function drawWeather() {
    var i, d;
    if (S.rain > 0.01) {
      ctx.lineCap = "round";
      var slant = wind.value * 0.13;
      for (i = 0; i < drops.length; i++) {
        d = drops[i];
        if (d.kind !== "rain") continue;
        ctx.strokeStyle = "rgba(216,234,248," + (d.a * S.rain) + ")";
        ctx.lineWidth = 1 + d.z * 0.9;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - slant * d.z, d.y + d.len * d.z * 1.9);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(226,240,250,0.5)";
      ctx.lineWidth = 1.4;
      for (i = 0; i < splashes.length; i++) {
        var sp = splashes[i];
        ctx.globalAlpha = clamp(sp.life, 0, 1) * S.rain * 0.7;
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y, sp.r, sp.r * 0.34, 0, Math.PI, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    if (S.snow > 0.01) {
      for (i = 0; i < drops.length; i++) {
        d = drops[i];
        if (d.kind !== "snow") continue;
        ctx.fillStyle = "rgba(255,255,255," + (d.a * S.snow) + ")";
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * d.z, 0, TAU); ctx.fill();
      }
    }
  }

  /* ---------- 8. Ground and settled snow ---------------------------------- */
  var BUCKETS = 72, snowDepth = new Float32Array(BUCKETS);

  function addSnowDepth(x, amount) {
    var i = clamp(Math.floor((x / W) * BUCKETS), 0, BUCKETS - 1);
    snowDepth[i] = Math.min(snowDepth[i] + amount, 44);
  }

  function updateGround(dt) {
    /* Melt when it is not snowing; the sunnier it is, the faster it goes. */
    if (S.snow < 0.35) {
      var melt = (0.3 + S.sun * 1.7) * dt;
      for (var i = 0; i < BUCKETS; i++) {
        if (snowDepth[i] > 0) snowDepth[i] = Math.max(0, snowDepth[i] - melt);
      }
    }
    /* Let neighbouring buckets even out, so drifts look smooth, not spiky. */
    for (var j = 1; j < BUCKETS - 1; j++) {
      var avg = (snowDepth[j - 1] + snowDepth[j] + snowDepth[j + 1]) / 3;
      snowDepth[j] += (avg - snowDepth[j]) * Math.min(1, dt * 2.4);
    }
  }

  function drawGround() {
    var g = ctx.createLinearGradient(0, groundY - 10, 0, H);
    g.addColorStop(0, S.grass);
    g.addColorStop(1, mixHex("#2f6b3d", "#2f6b3d", 0));
    ctx.fillStyle = g;
    ctx.fillRect(0, groundY, W, H - groundY);

    /* A soft meadow lip so the grass does not read as a hard rectangle. */
    ctx.fillStyle = S.grass;
    ctx.beginPath();
    ctx.moveTo(0, groundY + 4);
    for (var x = 0; x <= W; x += 40) {
      ctx.quadraticCurveTo(x + 20, groundY - 7 - Math.sin(x * 0.013) * 5, x + 40, groundY + 3);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    var any = false;
    for (var i = 0; i < BUCKETS; i++) { if (snowDepth[i] > 0.4) { any = true; break; } }
    if (!any) return;

    ctx.fillStyle = "#fdfeff";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, groundY + 4 - snowDepth[0]);
    for (var b = 0; b < BUCKETS; b++) {
      var px = (b / (BUCKETS - 1)) * W;
      ctx.lineTo(px, groundY + 4 - snowDepth[b]);
    }
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  }

  /* ---------- 9. Flowers --------------------------------------------------
     Each stalk is a spring-damper. Wind applies a torque, and a butterfly's
     weight applies another, so a flower visibly dips when one lands on it and
     springs back when it leaves.
     ---------------------------------------------------------------------- */
  var FLOWER_COLOURS = [
    { petal: "#ff4d9d", petal2: "#ff8fc0", centre: "#ffd028", edge: "#7a1145" },
    { petal: "#ffc300", petal2: "#ffe07a", centre: "#c2410c", edge: "#8a5900" },
    { petal: "#ff6b3d", petal2: "#ffa07a", centre: "#ffe07a", edge: "#8a2f10" },
    { petal: "#a855f7", petal2: "#c9a0ff", centre: "#ffd028", edge: "#4a1080" },
    { petal: "#ffffff", petal2: "#eef3ff", centre: "#ffc93c", edge: "#7d8798" },
    { petal: "#3fb6e8", petal2: "#8bd7f5", centre: "#fff0a8", edge: "#0b5d84" },
    { petal: "#e8323f", petal2: "#ff7b84", centre: "#ffe07a", edge: "#7a0f18" }
  ];

  var flowers = [];

  /* One shared depth curve. Because butterflies use the same curve, a
     butterfly and the flower it lands on are always in believable proportion. */
  function depthScale(depth) { return lerp(0.62, 1.5, depth); }

  function makeFlower(x, depth) {
    var scale = depthScale(depth);
    return {
      x: x, depth: depth, scale: scale,
      baseY: groundY + 6 + (1 - depth) * 16,
      stem: rand(46, 92) * scale,
      headR: rand(11, 16) * scale,
      petals: randInt(5, 8),
      spin: rand(0, TAU),
      colour: pick(FLOWER_COLOURS),
      angle: 0, angVel: 0,
      windCatch: rand(0.7, 1.25),
      load: 0,                       /* downward force from a resting butterfly */
      leaf: rand(0.34, 0.56),
      occupied: null
    };
  }

  function flowerHead(f) {
    return { x: f.x + Math.sin(f.angle) * f.stem, y: f.baseY - Math.cos(f.angle) * f.stem };
  }

  function updateFlowers(dt) {
    for (var i = 0; i < flowers.length; i++) {
      var f = flowers[i];
      var k = 26 / (1 + f.stem * 0.011);          /* longer stalks are floppier */
      var damping = 3.1;
      var windTorque = (wind.value / 190) * f.windCatch;
      var loadTorque = f.load * 0.62 * Math.sign(f.angle || 0.001);
      var acc = -k * f.angle - damping * f.angVel + windTorque + loadTorque;
      f.angVel += acc * dt;
      f.angle = clamp(f.angle + f.angVel * dt, -0.72, 0.72);
    }
  }

  function drawFlower(f) {
    var head = flowerHead(f);
    var c = f.colour;
    var lw = Math.max(1.1, 1.7 * f.scale);

    /* Stem, curved by the current lean. */
    ctx.strokeStyle = "#2f7d3f";
    ctx.lineWidth = Math.max(1.8, 3 * f.scale);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(f.x, f.baseY);
    ctx.quadraticCurveTo(f.x + Math.sin(f.angle) * f.stem * 0.38,
                         f.baseY - f.stem * 0.55, head.x, head.y);
    ctx.stroke();

    /* One leaf, leaning with the stem. */
    var ly = f.baseY - f.stem * f.leaf;
    var lx = f.x + Math.sin(f.angle) * f.stem * f.leaf * 0.5;
    var side = f.spin > Math.PI ? -1 : 1;
    ctx.fillStyle = "#3d9150";
    ctx.strokeStyle = "#22603a";
    ctx.lineWidth = lw * 0.7;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.quadraticCurveTo(lx + side * 16 * f.scale, ly - 11 * f.scale,
                         lx + side * 25 * f.scale, ly + 2 * f.scale);
    ctx.quadraticCurveTo(lx + side * 15 * f.scale, ly + 8 * f.scale, lx, ly);
    ctx.fill(); ctx.stroke();

    /* Petals: flat fills with a dark edge so they stay crisp at any size. */
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.rotate(f.angle * 0.6 + f.spin);
    ctx.strokeStyle = c.edge;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    for (var p = 0; p < f.petals; p++) {
      var a = (p / f.petals) * TAU;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = p % 2 ? c.petal2 : c.petal;
      ctx.beginPath();
      ctx.ellipse(0, -f.headR * 1.12, f.headR * 0.56, f.headR * 1.02, 0, 0, TAU);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = c.centre;
    ctx.beginPath(); ctx.arc(0, 0, f.headR * 0.62, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  /* ---- Where there is actually sky to fly in -----------------------------
     The canvas is fixed, so it shares the viewport's coordinates. That lets the
     scene ask the page directly which rectangles are covered by opaque content,
     and keep the butterflies in the part a visitor can genuinely see. It is the
     difference between a butterfly and a faint smudge behind a panel. */
  var sky = { top: 0, bottom: 0, usable: true };
  var panels = [];
  var skyRoomy = true, clearBottom = 0;

  function refreshSky() {
    var header = document.querySelector(".site-header");
    var hb = header ? header.getBoundingClientRect().bottom : 0;

    var lowest = groundY - 30;
    var blocks = document.querySelectorAll("main > section:not(.hero):not(.page-hero), .site-footer");
    for (var i = 0; i < blocks.length; i++) {
      var r = blocks[i].getBoundingClientRect();
      if (r.top > hb && r.top < lowest) lowest = r.top;
    }
    sky.top = Math.max(hb + 14, 8);
    sky.bottom = lowest - 12;
    sky.usable = (sky.bottom - sky.top) > 150;

    /* Only things you genuinely cannot see through count as obstacles. The text
       panels are ~82% transparent, so a butterfly behind one reads perfectly
       well — steering around them just penned the butterflies into the gutters.
       The artwork photograph is the one thing that would actually hide one. */
    panels.length = 0;
    var covered = 0;
    var solids = document.querySelectorAll(".art-frame");
    for (var j = 0; j < solids.length; j++) {
      var b = solids[j].getBoundingClientRect();
      if (b.bottom > sky.top && b.top < sky.bottom) {
        panels.push({ cx: b.left + b.width / 2, cy: b.top + b.height / 2,
                      hw: b.width / 2 + 18, hh: b.height / 2 + 18 });
        covered += b.width * Math.min(b.bottom, sky.bottom) - b.width * Math.max(b.top, sky.top);
      }
    }
    var skyArea = W * Math.max(sky.bottom - sky.top, 1);
    skyRoomy = sky.usable && (covered / skyArea) < 0.62;

    /* When a panel covers most of the hero — which is what happens on a phone —
       steering round it is pointless. Instead the butterflies are kept in the
       clear strip of sky above it, where they can actually be seen. */
    clearBottom = sky.bottom;
    if (!skyRoomy && panels.length) {
      var highest = sky.bottom;
      for (var k = 0; k < panels.length; k++) {
        highest = Math.min(highest, panels[k].cy - panels[k].hh);
      }
      if (highest - sky.top > 66) clearBottom = highest;
    }
  }

  /* A soft push out of the nearest edge of any panel the butterfly drifts into.
     Soft, so it reads as the butterfly choosing to go round, not bouncing.
     On a narrow phone the panel can cover almost the whole hero; steering round
     it there would just pin every butterfly to the screen edge, so the rule is
     dropped whenever there is not enough clear sky to make it worthwhile. */
  function avoidPanels(b, fx, fy) {
    if (!skyRoomy) return;
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      var dx = b.x - p.cx, dy = b.y - p.cy;
      var ox = p.hw - Math.abs(dx), oy = p.hh - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;                 /* outside this panel */
      /* Leave towards whichever side has real sky behind it, rather than simply
         the nearest edge — the nearest edge is often downwards, which used to
         push butterflies below the meadow where nobody could see them. */
      var roomAbove = (p.cy - p.hh) - sky.top;
      var roomBelow = clearBottom - (p.cy + p.hh);
      var up = roomAbove >= roomBelow ? -1 : 1;
      var push = 340;
      fy.v += up * push * (0.4 + 0.6 * (oy / p.hh));
      fx.v += (dx >= 0 ? 1 : -1) * push * 0.25 * (ox / p.hw);
    }
  }

  /* ---------- 10. Butterflies ---------------------------------------------
     Forces: gravity, drag, a lift impulse on every wing downstroke, wind, and
     a steering force that either wanders or arrives at a chosen flower.
     The lift-per-downstroke is what gives the flight its bobbing rhythm — it
     is not a sine wave laid over a straight line.
     ---------------------------------------------------------------------- */
  var WING_COLOURS = [
    { fore: "#ff7a18", hind: "#ff9c3c", edge: "#1d1526", spot: "#fff3d0", body: "#221a2e" },
    { fore: "#2f7ef7", hind: "#5aa2ff", edge: "#131a33", spot: "#dbeaff", body: "#141a33" },
    { fore: "#ff3d8b", hind: "#ff77b0", edge: "#3a0f24", spot: "#ffe3ef", body: "#2c1020" },
    { fore: "#ffcf1f", hind: "#ffe27a", edge: "#3a2c05", spot: "#fff8d6", body: "#332705" },
    { fore: "#8b5cf6", hind: "#b598ff", edge: "#241040", spot: "#ece3ff", body: "#241040" },
    { fore: "#12bfae", hind: "#5fe6d6", edge: "#062f2b", spot: "#d8fff9", body: "#07322d" },
    { fore: "#e8323f", hind: "#ff6b74", edge: "#3a0a0f", spot: "#ffe0e2", body: "#330a0e" }
  ];

  var butterflies = [];

  function makeButterfly(depth) {
    var scale = depthScale(depth);
    return {
      depth: depth, scale: scale,
      size: 17 * scale,               /* half-wingspan in pixels */
      x: 0, y: 0, hoverX: 0, hoverY: 0,
      vx: rand(28, 62), vy: 0,
      mass: 0.55 + depth * 0.5,
      flap: rand(0, TAU), flapRate: rand(15, 20),
      heading: 0, tilt: 0,
      wander: rand(0, TAU),
      drift: Math.random() < 0.82 ? 1 : -1,   /* mostly left to right */
      colour: pick(WING_COLOURS),
      state: "cruise", target: null, rest: 0, settle: 0,
      flutter: rand(0.5, 3), flutterFor: 0, chase: 0,
      landScale: 1
    };
  }

  /* Somewhere in open sky that no panel is covering. Tries a handful of spots
     and settles for the last one rather than looping forever. */
  function placeInClearSky(b) {
    var lo = sky.usable ? sky.top + 24 : H * 0.14;
    var hi = sky.usable ? Math.max(lo + 20, clearBottom - 24) : groundY - 110;
    for (var attempt = 0; attempt < 14; attempt++) {
      b.x = rand(-60, W * 0.94);
      b.y = rand(lo, hi);
      var clear = true;
      for (var i = 0; i < panels.length && attempt < 12; i++) {
        var p = panels[i];
        if (Math.abs(b.x - p.cx) < p.hw && Math.abs(b.y - p.cy) < p.hh) { clear = false; break; }
      }
      if (clear) return b;
    }
    return b;
  }

  function pickFlower(b) {
    /* Only flowers in this butterfly's own size band, so it never lands on a
       bloom it dwarfs or disappears into. */
    var options = flowers.filter(function (f) {
      return !f.occupied && Math.abs(f.depth - b.depth) < 0.24;
    });
    if (!options.length) {
      options = flowers.filter(function (f) { return !f.occupied; });
    }
    return options.length ? pick(options) : null;
  }

  function releaseFlower(b) {
    if (b.target) { b.target.occupied = null; b.target = null; }
  }

  function updateButterflies(dt, time) {
    for (var i = 0; i < butterflies.length; i++) {
      var b = butterflies[i];

      /* --- resting on a flower ---------------------------------------- */
      if (b.state === "landed") {
        var f = b.target;
        if (!f) { b.state = "cruise"; continue; }
        var head = flowerHead(f);
        b.x = head.x + Math.sin(f.angle) * -2;
        b.y = head.y - f.headR * 0.85 - b.size * 0.18;
        b.vx = b.vy = 0;
        b.tilt = f.angle * 0.85;
        f.load = b.mass;

        /* Wings open and close slowly, with the odd quick flutter, so a resting
           butterfly still looks alive rather than pinned to the flower. */
        b.flutter -= dt;
        if (b.flutter <= 0) { b.flutter = rand(1.6, 4.5); b.flutterFor = rand(0.35, 0.8); }
        if (b.flutterFor > 0) { b.flutterFor -= dt; b.flap += dt * 15; }
        else { b.flap += dt * 1.7; }

        b.rest -= dt;
        var sheltering = S.flight < 0.45;

        /* Sheltering can last a whole season, so rather than sit stone-still it
           hops to a neighbouring bloom now and then. */
        if (sheltering && b.rest <= 0) {
          var hop = pickFlower(b);
          b.rest = rand(6, 12);
          if (hop && hop !== f) {
            f.load = 0;
            f.angVel += 1.1;
            releaseFlower(b);
            hop.occupied = b; b.target = hop; b.state = "approach";
          }
          continue;
        }

        if (!sheltering && b.rest <= 0) {
          b.state = "takeoff";
          b.vy = -rand(150, 230);
          b.vx = b.drift * rand(50, 95);
          f.angVel += (b.vx >= 0 ? -1 : 1) * 2.6;   /* springs back as it pushes off */
          f.load = 0;
          releaseFlower(b);
          b.settle = 0.9;
        }
        continue;
      }

      /* --- decide where to go ----------------------------------------- */
      if (b.state === "cruise") {
        var wantsRest = S.flight < 0.45 || Math.random() < dt * 0.055;
        if (wantsRest) {
          /* On a phone the hero panel covers the meadow, so a landing would
             happen out of sight. There the butterfly waits on the wing
             instead: it slows, hangs about in one spot, and flaps gently. */
          if (!skyRoomy) {
            b.state = "hover";
            b.rest = rand(3, 7);
            b.hoverX = b.x; b.hoverY = b.y;
          } else {
            var f2 = pickFlower(b);
            if (f2) { f2.occupied = b; b.target = f2; b.state = "approach"; }
          }
        }
      }

      if (b.state === "hover") {
        b.rest -= dt;
        if (b.rest <= 0) b.state = "cruise";
      }

      /* --- forces ------------------------------------------------------ */
      var FX = { v: 0 }, FY = { v: 0 };
      avoidPanels(b, FX, FY);
      var fx = FX.v, fy = FY.v;

      /* Gravity, always pulling down. */
      fy += 300 * b.mass;

      /* Wing beat. Lift only happens on the downstroke, which is what makes
         the flight bob instead of gliding along a flat line. */
      var stroke = Math.sin(b.flap);
      var lift = Math.max(0, stroke) * 950 * b.mass;
      fy -= lift;
      fx += Math.cos(b.flap) * 26 * b.drift;

      /* Air resistance. */
      fx -= b.vx * 1.75;
      fy -= b.vy * 1.75;

      /* Wind pushes lighter butterflies around more. */
      fx += wind.value * 0.85 / b.mass;

      if (b.state === "approach" && b.target) {
        /* Do not chase one flower indefinitely — a gust can keep a butterfly
           just out of reach, and an endless approach reads as broken. */
        b.chase += dt;
        if (b.chase > 9) { releaseFlower(b); b.state = "cruise"; b.chase = 0; }
      }
      if (b.state !== "approach") b.chase = 0;

      if (b.state === "approach" && b.target) {
        var tHead = flowerHead(b.target);
        var tx = tHead.x, ty = tHead.y - b.target.headR * 0.85 - b.size * 0.18;
        var dx = tx - b.x, dy = ty - b.y;
        var dist = Math.hypot(dx, dy) || 1;
        /* Arrival: ease off as it gets close so it settles rather than jabs. */
        var speed = clamp(dist * 1.5, 0, 190);
        fx += ((dx / dist) * speed - b.vx) * 3.1;
        fy += ((dy / dist) * speed - b.vy) * 3.1;
        b.flapRate = lerp(b.flapRate, dist < 70 ? 9 : 17, dt * 3);
        if (dist < 11 && Math.abs(b.vx) < 60 && Math.abs(b.vy) < 60) {
          b.state = "landed";
          b.rest = S.flight < 0.45 ? rand(6, 12) : rand(3, 7);
          /* Dip towards the side it arrived from, so the flower visibly takes
             the weight instead of twitching. */
          b.target.angVel += (b.vx >= 0 ? 1 : -1) * 2.4 + rand(-0.3, 0.3);
          /* Match the butterfly exactly to this bloom as it settles. */
          b.landScale = clamp((b.target.headR * 2.0) / (b.size * 1.35), 0.75, 1.8);
        }
      } else if (b.state === "hover") {
        /* Hold station over one spot, drifting only a little. */
        b.wander += rand(-1.4, 1.4) * dt * 3;
        fx += (b.hoverX - b.x) * 2.4 - b.vx * 1.2 + Math.cos(b.wander) * 26;
        fy += (b.hoverY - b.y) * 2.4 - b.vy * 1.2 + Math.sin(b.wander) * 18;
        b.flapRate = lerp(b.flapRate, 10, dt * 2);
      } else {
        /* Reynolds wander: a target on a circle ahead, jittered each frame. */
        b.wander += rand(-2.4, 2.4) * dt * 3;
        fx += Math.cos(b.wander) * 105 + b.drift * 78;
        fy += Math.sin(b.wander) * 82;

        b.flapRate = lerp(b.flapRate, S.flight > 0.5 ? rand(14, 19) : 12, dt * 2);
        if (b.settle > 0) b.settle -= dt;
        if (b.settle <= 0 && b.state === "takeoff") b.state = "cruise";
      }

      /* Anything not on its way to a flower stays inside the band of sky a
         visitor can actually see. A butterfly nobody can see is wasted work. */
      var ceiling = sky.usable ? sky.top + b.size * 0.7 : H * 0.12;
      var floor = Math.min(sky.usable ? clearBottom : groundY - 44, groundY - 24) - b.size * 0.7;
      if (floor < ceiling + 60) floor = ceiling + 60;
      if (b.state !== "approach" && b.state !== "landed") {
        if (b.y < ceiling) fy += (ceiling - b.y) * 3.6;
        if (b.y > floor) fy -= (b.y - floor) * 4.4;
      }

      /* --- integrate --------------------------------------------------- */
      b.vx += (fx / b.mass) * dt;
      b.vy += (fy / b.mass) * dt;
      b.vx = clamp(b.vx, -195, 195);
      b.vy = clamp(b.vy, -250, 250);
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      /* Springs can be overwhelmed by a gust or a shove. This is the hard stop
         that guarantees a flying butterfly is never off the top of the sky or
         underneath the meadow. */
      if (b.state !== "approach" && b.state !== "landed") {
        if (b.y < ceiling) { b.y = ceiling; if (b.vy < 0) b.vy *= -0.25; }
        else if (b.y > floor) { b.y = floor; if (b.vy > 0) b.vy *= -0.25; }
      }

      b.flap += b.flapRate * dt;
      b.landScale = lerp(b.landScale, 1, dt * 1.6);

      /* Face the way it is travelling, and bank into the turn. */
      b.heading = lerp(b.heading, b.vx >= 0 ? 1 : -1, dt * 5);
      b.tilt = lerp(b.tilt, clamp(b.vy / 320, -0.42, 0.42), dt * 5);

      /* Wrap around the edges so the meadow never empties. */
      if (b.x > W + 90 || b.x < -90) {
        var fromLeft = b.x < 0;
        placeInClearSky(b);
        b.x = fromLeft ? W + 80 : -80;
        releaseFlower(b);
        b.state = "cruise";
        /* Now and then a different butterfly comes back, so the colours change. */
        if (Math.random() < 0.35) b.colour = pick(WING_COLOURS);
      }
    }
  }

  /* Wingbeat downwash. A butterfly passing close to a bloom stirs it, so the
     meadow reacts to them all the time, not only at the moment one lands. */
  function stirFlowers(dt) {
    for (var i = 0; i < butterflies.length; i++) {
      var b = butterflies[i];
      if (b.state === "landed") continue;
      var speed = Math.hypot(b.vx, b.vy);
      for (var j = 0; j < flowers.length; j++) {
        var f = flowers[j];
        if (f === b.target && b.state === "approach") continue;
        var head = flowerHead(f);
        var dx = b.x - head.x, dy = b.y - head.y;
        var reach = f.headR * 3 + b.size * 1.8;
        var d2 = dx * dx + dy * dy;
        if (d2 > reach * reach) continue;
        var falloff = 1 - Math.sqrt(d2) / reach;
        /* Push the bloom away from the butterfly and set it nodding. */
        f.angVel += (dx >= 0 ? -1 : 1) * falloff * falloff * (0.5 + speed * 0.004) * dt * 11;
      }
    }
  }

  /* One wing, drawn in unit space then scaled. Flat colour plus a dark edge
     keeps it crisp and readable against a bright sky or a grey one. */
  function wingPath(s, hind) {
    ctx.beginPath();
    if (hind) {
      ctx.moveTo(0, 0.06 * s);
      ctx.bezierCurveTo(0.70 * s, 0.04 * s, 1.10 * s, 0.44 * s, 0.86 * s, 0.88 * s);
      ctx.bezierCurveTo(0.63 * s, 1.20 * s, 0.14 * s, 0.68 * s, 0, 0.14 * s);
    } else {
      ctx.moveTo(0, 0.04 * s);
      ctx.bezierCurveTo(0.06 * s, -0.86 * s, 0.76 * s, -1.16 * s, 1.16 * s, -0.56 * s);
      ctx.bezierCurveTo(1.36 * s, -0.19 * s, 0.86 * s, 0.10 * s, 0, 0.10 * s);
    }
    ctx.closePath();
  }

  function drawButterfly(b) {
    var c = b.colour;
    var s = b.size * b.landScale;
    var lw = Math.max(1, s * 0.085);

    /* Wing dihedral. cos() of the flap angle is the foreshortening you see
       from the front, which is what sells the flap as three-dimensional. */
    var w = Math.sin(b.flap) * 1.28;
    var proj = 0.38 + 0.62 * Math.cos(clamp(w, -1.32, 1.32));
    var rise = Math.sin(w) * s * 0.16;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.tilt * 0.55);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    /* Far wings first, a shade darker, then the body, then the near wings. */
    for (var pass = 0; pass < 2; pass++) {
      var dir = pass === 0 ? -1 : 1;
      if (b.heading < 0) dir = -dir;
      var shade = pass === 0 ? 0.82 : 1;

      ctx.save();
      ctx.translate(0, -rise * (pass === 0 ? 1 : -1) * 0.5);
      ctx.scale(dir * proj, 1);

      ctx.strokeStyle = c.edge;
      ctx.lineWidth = lw / Math.max(proj, 0.22);

      ctx.fillStyle = pass === 0 ? shadeHex(c.hind, shade) : c.hind;
      wingPath(s, true); ctx.fill(); ctx.stroke();

      ctx.fillStyle = pass === 0 ? shadeHex(c.fore, shade) : c.fore;
      wingPath(s, false); ctx.fill(); ctx.stroke();

      /* Markings — two spots and a band along the outer edge. */
      ctx.fillStyle = c.spot;
      ctx.beginPath(); ctx.arc(0.80 * s, -0.62 * s, 0.15 * s, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0.52 * s, -0.30 * s, 0.10 * s, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0.58 * s, 0.60 * s, 0.12 * s, 0, TAU); ctx.fill();
      ctx.strokeStyle = c.edge;
      ctx.lineWidth = lw * 1.7 / Math.max(proj, 0.22);
      ctx.beginPath();
      ctx.moveTo(1.06 * s, -0.62 * s);
      ctx.quadraticCurveTo(1.24 * s, -0.28 * s, 0.88 * s, 0.05 * s);
      ctx.stroke();
      ctx.restore();
    }

    /* Body: three segments, thickest at the thorax. */
    ctx.fillStyle = c.body;
    ctx.beginPath();
    ctx.ellipse(0, 0.06 * s, 0.13 * s, 0.62 * s, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -0.3 * s, 0.16 * s, 0.24 * s, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -0.56 * s, 0.14 * s, 0, TAU);
    ctx.fill();

    /* Antennae. */
    ctx.strokeStyle = c.body;
    ctx.lineWidth = Math.max(0.8, s * 0.055);
    ctx.beginPath();
    ctx.moveTo(-0.05 * s, -0.62 * s);
    ctx.quadraticCurveTo(-0.34 * s, -1.0 * s, -0.44 * s, -1.16 * s);
    ctx.moveTo(0.05 * s, -0.62 * s);
    ctx.quadraticCurveTo(0.34 * s, -1.0 * s, 0.44 * s, -1.16 * s);
    ctx.stroke();
    ctx.fillStyle = c.body;
    ctx.beginPath(); ctx.arc(-0.45 * s, -1.18 * s, s * 0.075, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(0.45 * s, -1.18 * s, s * 0.075, 0, TAU); ctx.fill();

    ctx.restore();
  }

  function shadeHex(hex, mul) {
    var r = Math.round(parseInt(hex.slice(1, 3), 16) * mul);
    var g = Math.round(parseInt(hex.slice(3, 5), 16) * mul);
    var b = Math.round(parseInt(hex.slice(5, 7), 16) * mul);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  /* A new butterfly flies in from the edge every so often until the meadow is
     full. Arrivals are what make it feel like somewhere things happen. */
  var flyTarget = 0, arriveIn = 0, nearRatio = 1;

  function arrivals(dt) {
    if (butterflies.length >= flyTarget) return;
    arriveIn -= dt;
    if (arriveIn > 0) return;
    arriveIn = rand(16, 30);
    var nb = placeInClearSky(makeButterfly(rand(0.45 * nearRatio, nearRatio)));
    nb.x = nb.drift > 0 ? -70 : W + 70;
    butterflies.push(nb);
    butterflies.sort(function (a, b) { return a.depth - b.depth; });
  }

  /* ---------- 11. Engine --------------------------------------------------- */
  var quality = 1, running = false, motionPending = false, last = 0, rafId = 0;
  /* Start past the crossfade window so the first thing a visitor sees is a
     fully sunny day, not the tail of the previous season blending in. */
  var elapsed = BLEND_SECONDS;
  var slowFrames = 0, accentTick = 0, skyTick = 0, saveTick = 0;

  function populate() {
    var wide = W > 900, mid = W > 620;
    var flowerCount = wide ? randInt(11, 14) : mid ? randInt(8, 10) : randInt(5, 7);
    var flyCount = wide ? 5 : mid ? 4 : 3;

    var near = wide ? 1 : mid ? 0.85 : 0.7;   /* how large the nearest layer gets */

    flowers = [];
    for (var i = 0; i < flowerCount; i++) {
      var slot = (i + rand(0.18, 0.82)) / flowerCount;
      flowers.push(makeFlower(slot * W, rand(0.32, 1)));
    }
    flowers.sort(function (a, b) { return a.depth - b.depth; });

    /* Start with a couple and let the rest drift in over the next minute, so
       the meadow fills up while you are looking at it. */
    nearRatio = near;
    flyTarget = flyCount;
    arriveIn = rand(10, 18);
    butterflies = [];
    var startWith = Math.max(2, flyCount - 2);
    for (var j = 0; j < startWith; j++) butterflies.push(placeInClearSky(makeButterfly(rand(0.45 * near, near))));
    butterflies.sort(function (a, b) { return a.depth - b.depth; });

    clouds = [];
    drops = [];
    splashes = [];
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    groundY = H * 0.845;
    /* Read page geometry before resizing the drawing buffer. Keeping layout
       reads ahead of canvas writes avoids a forced synchronous reflow. */
    refreshSky();
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    populate();
    if (S.skyTop) render(elapsed);   /* repaint at once: resizing clears the canvas */
  }

  function render(time) {
    drawSky();
    drawSun(time);
    drawClouds();
    drawGround();

    /* Painter's algorithm: distant flowers and butterflies first. */
    var all = flowers.concat(butterflies).sort(function (a, b) { return a.depth - b.depth; });
    for (var i = 0; i < all.length; i++) {
      if (all[i].petals !== undefined) drawFlower(all[i]);
      else drawButterfly(all[i]);
    }

    drawWeather();

    /* A gentle warm or cool wash so the whole scene feels lit by the season. */
    if (S.light < 0.995) {
      ctx.fillStyle = "rgba(38,44,64," + ((1 - S.light) * 0.34) + ")";
      ctx.fillRect(0, 0, W, H);
    }
  }

  function step(now) {
    rafId = requestAnimationFrame(step);
    if (!last) last = now;
    var dt = (now - last) / 1000;
    last = now;
    if (dt > 0.12) dt = 0.12;              /* survive a background tab */
    if (!(dt > 0)) dt = 0.016;             /* never run the physics backwards */
    elapsed += dt;

    /* Auto-degrade rather than stutter on a slow device. */
    if (dt > 0.034) { if (++slowFrames > 90) { quality = Math.max(0.3, quality - 0.2); slowFrames = 0; } }
    else if (slowFrames > 0) slowFrames--;

    skyTick += dt;
    if (skyTick > 0.75) { skyTick = 0; refreshSky(); }

    updateSeason(elapsed);
    updateWind(dt);
    updateClouds(dt);
    updateWeather(dt);
    updateGround(dt);
    updateFlowers(dt);
    updateButterflies(dt, elapsed);
    stirFlowers(dt);
    arrivals(dt);
    render(elapsed);

    saveTick += dt;
    if (saveTick > 2) { saveTick = 0; saveState(); }

    accentTick += dt;
    if (accentTick > 0.25) {
      accentTick = 0;
      document.documentElement.style.setProperty("--season-accent", S.accent);
      updateBadge();
    }
  }

  function start() {
    if (running) return;
    running = true; last = 0;
    rafId = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function staticFrame() {
    /* Reduced motion still gets a scene — just a still one, not a blank box.
       populate() has already put the butterflies in visible sky, so all this
       does is spread them across the width and open their wings nicely. */
    updateSeason(elapsed);
    updateWind(0.016);
    updateClouds(0.016);
    updateWeather(0.016);
    updateFlowers(0.016);
    /* Place them in genuinely clear sky. This is the only frame a reduced-motion
       visitor ever sees, so a butterfly hidden behind the hero panel is a
       butterfly they never get at all. */
    var top = sky.top, bottom = sky.usable ? sky.bottom : groundY - 80;
    for (var q = 0; q < panels.length; q++) bottom = Math.min(bottom, panels[q].cy - panels[q].hh);
    if (bottom - top < 70) bottom = sky.usable ? sky.bottom : groundY - 80;
    for (var i = 0; i < butterflies.length; i++) {
      var bf = butterflies[i];
      bf.x = W * (0.1 + (i + 0.5) / butterflies.length * 0.8) + rand(-26, 26);
      bf.y = clamp(lerp(top, bottom, (i % 2 ? 0.68 : 0.32)) + rand(-14, 14),
                   top + bf.size * 0.8, bottom - bf.size * 0.8);
      bf.flap = rand(0.7, 1.05);                  /* wings open, mid-stroke */
    }
    render(elapsed);
    document.documentElement.style.setProperty("--season-accent", S.accent);
    updateBadge();
  }

  /* ---------- Carrying the scene between pages -----------------------------
     Each page is a separate document, so without this the meadow would be
     rebuilt from scratch on every click: new flowers, new butterflies, and the
     weather back to sunny. Saving the state in sessionStorage — per tab, gone
     when the tab closes — lets the same afternoon carry on across the site.
     ------------------------------------------------------------------------ */
  var CARRY_KEY = "venuka-scene-state";

  function saveState() {
    if (!flowers.length) return;
    try {
      sessionStorage.setItem(CARRY_KEY, JSON.stringify({
        t: elapsed,
        ts: Date.now(),
        w: Math.round(W), h: Math.round(H),
        snow: Array.prototype.slice.call(snowDepth).map(function (n) { return +n.toFixed(1); }),
        flowers: flowers.map(function (f) {
          return [+f.x.toFixed(1), +f.depth.toFixed(3), FLOWER_COLOURS.indexOf(f.colour),
                  +f.stem.toFixed(1), +f.headR.toFixed(1), f.petals,
                  +f.spin.toFixed(2), +f.leaf.toFixed(2), +f.angle.toFixed(3)];
        }),
        flies: butterflies.map(function (b) {
          return [+b.x.toFixed(1), +b.y.toFixed(1), +b.vx.toFixed(1), +b.vy.toFixed(1),
                  +b.depth.toFixed(3), WING_COLOURS.indexOf(b.colour), b.drift];
        })
      }));
    } catch (e) { /* private mode, or storage full: the scene just restarts */ }
  }

  function loadState() {
    var raw;
    try { raw = sessionStorage.getItem(CARRY_KEY); } catch (e) { return false; }
    if (!raw) return false;
    var d;
    try { d = JSON.parse(raw); } catch (e) { return false; }
    if (!d || typeof d.t !== "number") return false;

    /* Keep the weather running through the page load itself. */
    var gap = Math.min((Date.now() - (d.ts || Date.now())) / 1000, 30);
    elapsed = d.t + gap;

    if (d.snow && d.snow.length === BUCKETS) {
      for (var i = 0; i < BUCKETS; i++) snowDepth[i] = d.snow[i];
    }

    /* Only reuse the layout if the window is still about the same size —
       otherwise the flowers would sit in the wrong places. */
    var sameSize = Math.abs((d.w || 0) - W) < 60 && Math.abs((d.h || 0) - H) < 120;
    if (!sameSize || !d.flowers || !d.flies) return true;

    flowers = d.flowers.map(function (a) {
      var f = makeFlower(a[0], a[1]);
      f.colour = FLOWER_COLOURS[a[2]] || f.colour;
      f.stem = a[3]; f.headR = a[4]; f.petals = a[5];
      f.spin = a[6]; f.leaf = a[7]; f.angle = a[8];
      return f;
    });
    flowers.sort(function (a, b) { return a.depth - b.depth; });

    butterflies = d.flies.map(function (a) {
      var b = makeButterfly(a[4]);
      b.x = a[0]; b.y = a[1]; b.vx = a[2]; b.vy = a[3];
      b.colour = WING_COLOURS[a[5]] || b.colour;
      b.drift = a[6] || 1;
      /* The new page may put its panels somewhere else, so anything that would
         arrive stuck behind one gets moved into clear sky. */
      for (var i = 0; i < panels.length; i++) {
        var q = panels[i];
        if (Math.abs(b.x - q.cx) < q.hw && Math.abs(b.y - q.cy) < q.hh) {
          placeInClearSky(b);
          break;
        }
      }
      return b;
    });
    butterflies.sort(function (a, b) { return a.depth - b.depth; });
    return true;
  }

  window.addEventListener("pagehide", saveState);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) saveState();
  });

  /* ---------- Controls ----------------------------------------------------- */
  var badge = document.getElementById("scene-toggle");
  var badgeIcon = badge && badge.querySelector("[data-scene-icon]");
  var badgeText = badge && badge.querySelector("[data-scene-text]");

  function updateBadge() {
    if (!badge) return;
    var active = running || motionPending;
    if (badgeIcon) badgeIcon.textContent = active ? S.icon : "⏸";
    if (badgeText) badgeText.textContent = active ? S.name : "Scene paused";
    badge.setAttribute("aria-pressed", String(active));
    badge.setAttribute("title", active
      ? "Weather: " + S.name + ". Select to pause the moving background."
      : "The moving background is paused. Select to start it.");
  }

  function stored() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) { /* private mode */ }
  }

  if (badge) {
    badge.addEventListener("click", function () {
      if (running || motionPending) { motionPending = false; stop(); store("off"); }
      else { start(); store("on"); }
      updateBadge();
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (running) cancelAnimationFrame(rafId);
      return;
    }
    render(elapsed);                 /* something to look at immediately */
    if (running) { last = 0; rafId = requestAnimationFrame(step); }
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (!running) staticFrame();
    }, 180);
  });

  /* ---------- Boot --------------------------------------------------------- */
  resize();
  loadState();                        /* pick up where the last page left off */
  var choice = stored();
  var shouldRun = choice === "on" || (choice !== "off" && !prefersReduced);
  updateSeason(elapsed);
  updateWind(0.016);
  updateClouds(0.016);
  updateWeather(0.016);
  render(elapsed);
  if (shouldRun) {
    /* Give the page's text and hero artwork the first clear turn to paint.
       The visitor still sees the complete static meadow immediately; motion
       begins shortly after the window has finished loading. */
    motionPending = true;
    var beginMotion = function () {
      setTimeout(function () {
        if (!motionPending) return;
        motionPending = false;
        start();
        updateBadge();
      }, 1800);
    };
    if (document.readyState === "complete") beginMotion();
    else window.addEventListener("load", beginMotion, { once: true });
  } else {
    staticFrame();
  }
  updateBadge();
})();
