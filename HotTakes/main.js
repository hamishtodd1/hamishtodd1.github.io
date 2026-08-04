'use strict';

// Hot Takes — single-canvas, no-dependency party game.
//
// Design rules (see CLAUDE.md):
//   - The whole page is one <canvas>. No DOM scrolling. No external libraries.
//   - Avoid runtime allocation. Everything below is allocated once at startup;
//     the render loop and event handlers reuse these objects and never `new`.
//   - MULTITOUCH is a core requirement (several players on one device). Pointer
//     events are handled per-pointer; never assume a single active touch.
//   - DOM contact is minimal: the off-screen <input> (only to raise the mobile
//     soft keyboard) and the canvas. No per-frame DOM reads/writes.

// ---------------------------------------------------------------------------
// Globals (allocated once)
// ---------------------------------------------------------------------------

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var input = document.getElementById('keyboard-capture');

var dpr = 1;          // device pixel ratio, refreshed on resize
var viewW = 0;        // CSS pixels
var viewH = 0;
var needsRender = true; // dirty flag — only redraw when something changed
var nowMs = 0;          // performance.now() at the start of the current frame
var joltUntil = 0;      // keep animating until this time (for the vibrate jolt)

// When the top boxes can't fit one row at >= MIN_TOP_W, they WRAP onto further
// rows (like text). The boxes then shrink vertically so all rows fit above the
// players. No scrolling.
var MIN_TOP_W = 120;    // min width of a top box before it wraps to the next line
var topRowsH = 0;       // total height the (possibly multi-row) top area occupies

// Top ("outcome") box palette, in fill order. Max 6 boxes.
var MAX_TOP = 6;
var TOP_COLORS = ['#FEE824', '#37588C', '#340B6E', '#3BA8A9', '#1F1E80', '#1F1E80'];

var BOTTOM_COUNT = 2;
var BOTTOM_COLOR = '#2a2a33';
var SELECTION_COLOR = '#2a6fff';

// Money: small outlined rectangles, held by players (bottom rects) in a grid.
// Counts can grow large and money will move between holders, so rendering is a
// plain count→grid loop (allocation-free); no per-coin objects.
// NOTE: `MONEY_PER_PLAYER` (starting cash) lives in manual.js (loaded first).
var MONEY_OUTLINE = '#d8dee9';

// --- Bets -----------------------------------------------------------------
// Each outcome holds a triangular grid of square betBox OUTLINES that never move:
// one row per bet "level" (numBetLevels rows), with `getBetPrice(level)` outlines
// in that row, left-aligned.
// A "bet" is a separate movable object: a horizontal run of `maxPrice` white
// squares (same size as money) sitting at one level. Bets are drawn BEHIND the
// outlines in the same cells, so wherever a white square and an outline coincide
// the box reads as "filled in"; the part of a bet that runs past the row's
// outlines shows as bare white squares. Each outcome starts with one bet per
// level, bet j at level j — soon they will move while the outlines stay put.
// NOTE: `numBetLevels`, `getBetPrice()` and `maxPrice` live in manual.js.
var BETBOX_COLOR = '#0a0a0a';  // colour of the (stroked) betBox outlines
var BET_COLOR = '#ffffff';     // bets are white
var BET_SIZE_FRAC = 0.86;      // white bet square size ÷ cell, so it sits inside the outline

// Money squares and betBoxes share ONE size (`unitSquare`), computed in layout()
// so the numBetLevels-tall bet grid just fits an outcome box's body. Both money
// and betBoxes use it, so betBoxes are exactly money-sized.
var BET_GAP_RATIO = 0.22;      // gap between unit squares ÷ square size
var unitSquare = 0;            // px size of a money square / betBox (computed in layout)
var unitGap = 0;               // px gap between unit squares (computed in layout)

var DRAG_THRESHOLD = 8; // px of movement before a tap becomes a drag
var JOLT_MS = 220;      // duration of a box's vibrate jolt
var PIPE_OUTER = 16;    // pipe outline thickness
var PIPE_INNER = 9;     // hollow interior thickness

function now() { return performance.now(); }

// A reusable box. `editable` top boxes ("outcomes") own a `text` string; bottom
// boxes are players that hold `money` and mirror the top outcomes inside them.
// Top boxes may wrap onto multiple rows, so each has its own x AND y.
function Box(editable) {
  this.x = 0; this.y = 0; this.w = 0; this.h = 0;
  this.editable = editable;
  this.text = '';
  this.color = '#000000';
  this.money = 0;          // bottom boxes only
  this.betPrices = null;   // top boxes only: per-LEVEL betBox outline count = getBetPrice(level)
  this.betCols = 0;        // top boxes only: grid width in cells (>= maxPrice, the bet width)
  this.betLevel = null;    // top boxes only: current level of bet j (bets move; outlines don't)
  this.joltTime = 0;       // performance.now() of the last vibrate jolt
}

var topBoxes = new Array(MAX_TOP);
for (var i = 0; i < MAX_TOP; i++) {
  topBoxes[i] = new Box(true);
  topBoxes[i].color = TOP_COLORS[i];
  topBoxes[i].betPrices = new Float32Array(numBetLevels);
  var cols = maxPrice;                                 // a bet is maxPrice cells wide
  for (var s = 0; s < numBetLevels; s++) {
    topBoxes[i].betPrices[s] = getBetPrice(s);         // # of outlines at this level
    if (topBoxes[i].betPrices[s] > cols) cols = topBoxes[i].betPrices[s];
  }
  topBoxes[i].betCols = cols;
  topBoxes[i].betLevel = new Int16Array(numBetLevels); // one bet per level; bet j starts at level j
  for (var s2 = 0; s2 < numBetLevels; s2++) topBoxes[i].betLevel[s2] = s2;
}
var topCount = 2;
topBoxes[0].text = 'A';
topBoxes[1].text = 'B';

var bottomBoxes = new Array(BOTTOM_COUNT);
for (var j = 0; j < BOTTOM_COUNT; j++) {
  bottomBoxes[j] = new Box(false);
  bottomBoxes[j].color = BOTTOM_COLOR;
  bottomBoxes[j].money = MONEY_PER_PLAYER;
}

var addBtn = { x: 0, y: 0, w: 0, h: 0, visible: true }; // x in content coords too

var focusedBox = null; // currently-edited top box, or null
var selected = false;  // true while the focused box's text is highlighted

// ---------------------------------------------------------------------------
// Drag state — one per active pointer (multitouch). Pre-allocated pool.
// ---------------------------------------------------------------------------

function Drag() {
  this.active = false;
  this.pointerId = -1;
  this.sourceBox = null;
  this.sourceIsTop = false;
  this.startX = 0; this.startY = 0;
  this.curX = 0; this.curY = 0;
  this.moved = false;
  this.target = null;   // box the finger is currently inside (opposite row)
}

var MAX_POINTERS = 10;
var drags = new Array(MAX_POINTERS);
for (var d = 0; d < MAX_POINTERS; d++) drags[d] = new Drag();
var activeDragCount = 0;

function acquireDrag(pointerId) {
  for (var k = 0; k < MAX_POINTERS; k++) {
    if (!drags[k].active) {
      var dr = drags[k];
      dr.active = true; dr.pointerId = pointerId;
      dr.sourceBox = null; dr.target = null; dr.moved = false;
      activeDragCount++;
      return dr;
    }
  }
  return null;
}

function findDrag(pointerId) {
  for (var k = 0; k < MAX_POINTERS; k++) {
    if (drags[k].active && drags[k].pointerId === pointerId) return drags[k];
  }
  return null;
}

function releaseDrag(dr) {
  dr.active = false;
  dr.sourceBox = null;
  dr.target = null;
  dr.moved = false;
  activeDragCount--;
}

// Pipes are EPHEMERAL: a pipe exists only while its finger is down and vanishes
// the instant the pointer lifts. There is no persistent connection state.

// ---------------------------------------------------------------------------
// Sound (WebAudio, no audio files)
// ---------------------------------------------------------------------------

var audioCtx = null; // created lazily on first user gesture (mobile autoplay policy)

function ensureAudio() {
  if (audioCtx === null) {
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playBlip(freq) {
  if (!audioCtx) return;
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  var t = audioCtx.currentTime;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.16);
}

function playConnect() {
  if (!audioCtx) return;
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  var t = audioCtx.currentTime;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, t);
  osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + 0.27);
}

// ---------------------------------------------------------------------------
// Layout — recomputed only on resize / box add, never per frame
// ---------------------------------------------------------------------------

function layout() {
  var margin = Math.round(Math.min(viewW, viewH) * 0.04);
  var bottomRowH = Math.round(viewH * 0.42); // players are large — they hold money + mini outcomes

  layoutTop(margin, bottomRowH);
  layoutRow(bottomBoxes, BOTTOM_COUNT, margin, viewH - margin - bottomRowH, bottomRowH);
}

// Lay out the top "outcome" boxes. When they all fit on one row at a width that
// stays >= MIN_TOP_W they fill that row; otherwise they WRAP onto further rows
// (the add button is the final flowed item). The box height then shrinks so the
// whole wrapped block fits in the space above the players — boxes never vanish.
function layoutTop(margin, bottomRowH) {
  var gap = margin;
  addBtn.visible = topCount < MAX_TOP;
  var baseH = Math.round(viewH * 0.30);   // preferred (single-row) box height — tall to fit the bet grid

  // Single-row fill width (boxes share the row with a square add button).
  var fillGaps = addBtn.visible ? (topCount + 2) : (topCount + 1);
  var fillW = (viewW - fillGaps * gap - (addBtn.visible ? baseH : 0)) / topCount;

  var boxW, perRow, rows;
  if (fillW >= MIN_TOP_W) {
    boxW = fillW; rows = 1;                // everything fits on one line
  } else {
    boxW = MIN_TOP_W;
    perRow = Math.max(1, Math.floor(viewW / (boxW + gap)));
    rows = Math.ceil((topCount + (addBtn.visible ? 1 : 0)) / perRow);
  }

  // Shrink box height so all rows fit in the area above the players.
  var topAvail = viewH - 2 * margin - bottomRowH - gap;
  var boxH = Math.floor(Math.min(baseH, (topAvail - (rows - 1) * gap) / rows));
  if (boxH < 24) boxH = 24;
  var addW = boxH; // square add button

  // Derive the shared unit-square size so the bet grid fits the box body: all
  // numBetLevels rows down it (body is 0.29..0.94 of box height) and a full
  // maxPrice-wide bet across it (body is inset 0.08 each side) — see drawBetColumn.
  var bodyH = boxH * 0.65;
  var bodyW = boxW * 0.84;
  unitSquare = Math.min(bodyH / (numBetLevels + BET_GAP_RATIO * (numBetLevels + 1)),
                        bodyW / (maxPrice + BET_GAP_RATIO * (maxPrice + 1)));
  unitGap = unitSquare * BET_GAP_RATIO;

  // Flow the boxes left-to-right, wrapping when the next box would overflow.
  var x = gap, y = margin;
  for (var k = 0; k < topCount; k++) {
    if (x + boxW > viewW - gap + 0.5) { x = gap; y += boxH + gap; }
    var b = topBoxes[k];
    b.x = x; b.y = y; b.w = boxW; b.h = boxH;
    x += boxW + gap;
  }
  if (addBtn.visible) {
    if (x + addW > viewW - gap + 0.5) { x = gap; y += boxH + gap; }
    addBtn.x = x; addBtn.y = y; addBtn.w = addW; addBtn.h = boxH;
  }

  topRowsH = (y + boxH) - margin;
}

function layoutRow(boxes, count, margin, rowY, rowH) {
  var gap = margin;
  var boxW = (viewW - gap * (count + 1)) / count;
  for (var k = 0; k < count; k++) {
    var b = boxes[k];
    b.x = gap + k * (boxW + gap);
    b.y = rowY; b.w = boxW; b.h = rowH;
  }
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function roundRectPath(x, y, w, h, r) {
  if (r > w * 0.5) r = w * 0.5;
  if (r > h * 0.5) r = h * 0.5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shakeOffset(joltTime) {
  if (joltTime <= 0) return 0;
  var e = nowMs - joltTime;
  if (e >= JOLT_MS) return 0;
  return Math.sin(e * 0.08) * (1 - e / JOLT_MS) * 6;
}

function drawPipe(x1, y1, x2, y2, color) {
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = PIPE_OUTER;
  ctx.stroke();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = PIPE_INNER;
  ctx.stroke();
}

function render(t) {
  nowMs = t;
  needsRender = false;

  ctx.clearRect(0, 0, viewW, viewH);

  // Active drag pipes first, so boxes sit cleanly over the anchor ends.
  for (var k = 0; k < MAX_POINTERS; k++) {
    var dr = drags[k];
    if (dr.active && dr.moved) drawActiveDrag(dr);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (var a = 0; a < topCount; a++) drawTopBox(topBoxes[a]);
  if (addBtn.visible) drawAddButton();
  for (var b2 = 0; b2 < BOTTOM_COUNT; b2++) drawPlayer(bottomBoxes[b2]);
}

// Anchor a pipe to the edge of a box facing the opposite row.
function drawActiveDrag(dr) {
  var s = dr.sourceBox;
  var sx = s.x + s.w * 0.5;
  var sy = dr.sourceIsTop ? (s.y + s.h) : s.y;
  var ex, ey;
  if (dr.target) {
    ex = dr.target.x + dr.target.w * 0.5;
    ey = dr.sourceIsTop ? dr.target.y : (dr.target.y + dr.target.h);
  } else {
    ex = dr.curX; ey = dr.curY;
  }
  drawPipe(sx, sy, ex, ey, s.color);
}

// Draws an outcome box: coloured rect + a white text field as a HEADER strip at
// the top (its label). The body below the header is left free for the bet column
// (drawn separately by drawBetColumn on the big top boxes). Used both for the big
// top boxes and, scaled down, for the mirrors inside players. `focused`/`selected`
// extras only apply to the top box being edited.
function drawOutcomeBox(x, y, w, h, color, text, focused) {
  roundRectPath(x, y, w, h, Math.round(h * 0.1));
  ctx.fillStyle = color;
  ctx.fill();
  if (focused) {
    ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  }

  var padX = w * 0.08;
  var fx = x + padX;
  var fw = w - 2 * padX;
  var fy = y + h * 0.06;
  var fh = h * 0.2;
  roundRectPath(fx, fy, fw, fh, Math.round(fh * 0.25));
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  if (text.length === 0) return;
  var cx = fx + fw * 0.5;
  var cy = fy + fh * 0.5;
  ctx.font = Math.round(fh * 0.6) + 'px sans-serif';
  if (focused && selected) {
    var tw = ctx.measureText(text).width;
    var hlW = Math.min(tw + 10, fw - 6);
    ctx.fillStyle = SELECTION_COLOR;
    ctx.fillRect(cx - hlW * 0.5, cy - fh * 0.32, hlW, fh * 0.64);
    ctx.fillStyle = '#ffffff';
  } else {
    ctx.fillStyle = '#1a1a1a';
  }
  ctx.fillText(text, cx, cy);
}

function drawTopBox(b) {
  var jx = shakeOffset(b.joltTime);
  if (jx !== 0) { ctx.save(); ctx.translate(jx, 0); }
  drawOutcomeBox(b.x, b.y, b.w, b.h, b.color, b.text, b === focusedBox);
  drawBetColumn(b);
  if (jx !== 0) ctx.restore();
}

// The bets (white squares) and, in front of them, the betBox outlines. Row `i`
// has b.betPrices[i] outlines, left-aligned; they never move. A bet is a run of
// `maxPrice` white squares at its current level (b.betLevel[j]), drawn first so
// the outlines frame it — where the two coincide the box reads as "filled in",
// and the tail of a bet past the row's outlines shows as bare white squares.
// Cells use the shared `unitSquare` so betBoxes are exactly money-sized.
function drawBetColumn(b) {
  var cell = unitSquare, g = unitGap;
  var rows = numBetLevels;
  if (cell <= 0.5 || b.betCols <= 0) return;

  var step = cell + g;
  var cellR = Math.min(cell * 0.25, 3);
  var x0 = b.x + b.w * 0.08 + g;
  var y0 = b.y + b.h * 0.29 + g;          // just below the header from drawOutcomeBox

  // bets (white), behind — each is maxPrice cells wide at its own level
  var bs = cell * BET_SIZE_FRAC;
  var off = (cell - bs) * 0.5;
  var betR = Math.min(bs * 0.25, 3);
  ctx.fillStyle = BET_COLOR;
  for (var j = 0; j < rows; j++) {
    var by = y0 + b.betLevel[j] * step + off;
    for (var c = 0; c < maxPrice; c++) {
      roundRectPath(x0 + c * step + off, by, bs, bs, betR);
      ctx.fill();
    }
  }

  // betBox outlines, in front — these stay put
  ctx.strokeStyle = BETBOX_COLOR;
  ctx.lineWidth = Math.max(1, cell * 0.12);
  for (var i = 0; i < rows; i++) {
    var price = b.betPrices[i];
    var y = y0 + i * step;
    for (var cc = 0; cc < price; cc++) {
      roundRectPath(x0 + cc * step, y, cell, cell, cellR);
      ctx.stroke();
    }
  }
}

// A player: a large rect holding scaled-down mirrors of the top outcomes (top
// strip) and a grid of money (below).
function drawPlayer(b) {
  var jx = shakeOffset(b.joltTime);
  if (jx !== 0) { ctx.save(); ctx.translate(jx, 0); }

  roundRectPath(b.x, b.y, b.w, b.h, Math.round(b.h * 0.06));
  ctx.fillStyle = b.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#8893aa';
  ctx.stroke();

  var pad = b.h * 0.06;
  var innerX = b.x + pad;
  var innerW = b.w - 2 * pad;

  // Mini outcome mirrors, identical to the top row (live text + colours).
  var miniY = b.y + pad;
  var miniH = b.h * 0.26;
  var miniGap = pad * 0.6;
  var miniW = (innerW - miniGap * (topCount - 1)) / topCount;
  for (var k = 0; k < topCount; k++) {
    drawOutcomeBox(innerX + k * (miniW + miniGap), miniY, miniW, miniH,
                   topBoxes[k].color, topBoxes[k].text, false);
  }

  // Money grid fills the area below the mirrors.
  var moneyY = miniY + miniH + pad;
  drawMoneyGrid(innerX, moneyY, innerW, (b.y + b.h - pad) - moneyY, b.money);

  if (jx !== 0) ctx.restore();
}

// Draws `count` outlined squares packed left-to-right into the (ax,ay,aw,ah)
// area. Uses the shared `unitSquare` so money is exactly betBox-sized.
function drawMoneyGrid(ax, ay, aw, ah, count) {
  if (count <= 0 || aw <= 0 || ah <= 0) return;
  var cell = unitSquare, g = unitGap;
  if (cell <= 0.5) return;

  var step = cell + g;
  var cols = Math.max(1, Math.floor((aw - g) / step));
  var r = Math.min(cell * 0.22, 3);
  ctx.lineWidth = Math.max(1, cell * 0.08);
  ctx.strokeStyle = MONEY_OUTLINE;
  var startX = ax + g, startY = ay + g;
  for (var i = 0; i < count; i++) {
    var c = i % cols;
    var rr = (i / cols) | 0;
    roundRectPath(startX + c * step, startY + rr * step, cell, cell, r);
    ctx.stroke();
  }
}

function drawAddButton() {
  var radius = Math.round(addBtn.h * 0.18);
  roundRectPath(addBtn.x, addBtn.y, addBtn.w, addBtn.h, radius);
  ctx.fillStyle = '#26262e';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#5a6a88';
  ctx.stroke();

  var cx = addBtn.x + addBtn.w * 0.5;
  ctx.fillStyle = '#ffffff';
  ctx.font = Math.round(addBtn.h * 0.34) + 'px sans-serif';
  ctx.fillText('+', cx, addBtn.y + addBtn.h * 0.3);
  var small = Math.round(addBtn.h * 0.13);
  ctx.font = small + 'px sans-serif';
  ctx.fillText('Add', cx, addBtn.y + addBtn.h * 0.62);
  ctx.fillText('Outcome', cx, addBtn.y + addBtn.h * 0.62 + small * 1.2);
}

// ---------------------------------------------------------------------------
// Hit testing
// ---------------------------------------------------------------------------

function inRect(r, px, py) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Box in the row OPPOSITE the drag source that contains (px,py), or null.
function boxInOppositeRow(sourceIsTop, px, py) {
  if (sourceIsTop) {
    for (var i = 0; i < BOTTOM_COUNT; i++) {
      if (inRect(bottomBoxes[i], px, py)) return bottomBoxes[i];
    }
  } else {
    for (var j = 0; j < topCount; j++) {
      if (inRect(topBoxes[j], px, py)) return topBoxes[j];
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Text editing
// ---------------------------------------------------------------------------

function focusBox(b) {
  focusedBox = b;
  if (b) {
    selected = true;
    input.value = b.text;
    input.focus();
    input.select();
  } else {
    selected = false;
    input.blur();
  }
  needsRender = true;
}

function onInput() {
  if (focusedBox) {
    focusedBox.text = input.value;
    selected = false;
    needsRender = true;
  }
}

function addOutcome() {
  if (topCount >= MAX_TOP) return;
  topBoxes[topCount].text = String.fromCharCode(65 + topCount); // 'C', 'D', ...
  topCount++;
  layout();
  needsRender = true;
  playBlip(880);
}

// ---------------------------------------------------------------------------
// Pointer handling (multitouch — one Drag per pointerId)
// ---------------------------------------------------------------------------

var canvasLeft = 0, canvasTop = 0; // cached on resize (no scrolling page)
function canvasX(clientX) { return clientX - canvasLeft; }
function canvasY(clientY) { return clientY - canvasTop; }

function onPointerDown(pointerId, px, py) {
  ensureAudio();

  if (addBtn.visible && inRect(addBtn, px, py)) {
    addOutcome();
    return;
  }

  var src = null, srcIsTop = false;
  for (var i = 0; i < topCount; i++) {
    if (inRect(topBoxes[i], px, py)) { src = topBoxes[i]; srcIsTop = true; break; }
  }
  if (!src) {
    for (var j = 0; j < BOTTOM_COUNT; j++) {
      if (inRect(bottomBoxes[j], px, py)) { src = bottomBoxes[j]; srcIsTop = false; break; }
    }
  }
  if (!src) { focusBox(null); return; }

  var dr = acquireDrag(pointerId);
  if (!dr) return;
  dr.sourceBox = src;
  dr.sourceIsTop = srcIsTop;
  dr.startX = px; dr.startY = py;
  dr.curX = px; dr.curY = py;
  dr.moved = false; dr.target = null;
}

function onPointerMove(pointerId, px, py) {
  var dr = findDrag(pointerId);
  if (!dr) return;
  dr.curX = px; dr.curY = py;

  if (!dr.moved) {
    var ddx = px - dr.startX, ddy = py - dr.startY;
    if (ddx * ddx + ddy * ddy >= DRAG_THRESHOLD * DRAG_THRESHOLD) {
      dr.moved = true;
      if (focusedBox) focusBox(null); // a real drag dismisses text editing
    }
  }

  if (dr.moved) {
    var t = boxInOppositeRow(dr.sourceIsTop, px, py);
    if (t !== dr.target) {
      dr.target = t;
      if (t) {
        t.joltTime = now();
        joltUntil = t.joltTime + JOLT_MS;
        if (navigator.vibrate) navigator.vibrate(15);
      }
    }
  }
  needsRender = true;
}

function onPointerUp(pointerId, px, py) {
  var dr = findDrag(pointerId);
  if (!dr) return;

  if (dr.moved && dr.target) {
    playConnect(); // pipe is ephemeral — releasing only plays the sound, then it vanishes
  } else if (!dr.moved && dr.sourceIsTop) {
    focusBox(dr.sourceBox); // a tap (no drag) on a top box edits its text
    playBlip(660);
  }

  releaseDrag(dr);
  needsRender = true;
}

// ---------------------------------------------------------------------------
// Resize & main loop
// ---------------------------------------------------------------------------

function resize() {
  dpr = window.devicePixelRatio || 1;
  viewW = window.innerWidth;
  viewH = window.innerHeight;

  canvas.width = Math.round(viewW * dpr);
  canvas.height = Math.round(viewH * dpr);
  canvas.style.width = viewW + 'px';
  canvas.style.height = viewH + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  var rect = canvas.getBoundingClientRect();
  canvasLeft = rect.left;
  canvasTop = rect.top;

  layout();
  needsRender = true;
}

function frame() {
  var t = now();
  if (needsRender || activeDragCount > 0 || t < joltUntil) render(t);
  requestAnimationFrame(frame);
}

// ---------------------------------------------------------------------------
// Wiring — pointer events fire once per touch point, enabling multitouch.
// ---------------------------------------------------------------------------

canvas.addEventListener('pointerdown', function (e) {
  e.preventDefault();
  onPointerDown(e.pointerId, canvasX(e.clientX), canvasY(e.clientY));
}, { passive: false });

window.addEventListener('pointermove', function (e) {
  onPointerMove(e.pointerId, canvasX(e.clientX), canvasY(e.clientY));
}, { passive: false });
window.addEventListener('pointerup', function (e) {
  onPointerUp(e.pointerId, canvasX(e.clientX), canvasY(e.clientY));
});
window.addEventListener('pointercancel', function (e) {
  var dr = findDrag(e.pointerId);
  if (dr) { releaseDrag(dr); needsRender = true; }
});

input.addEventListener('input', onInput);
input.addEventListener('blur', function () {
  if (focusedBox) { focusedBox = null; selected = false; needsRender = true; }
});

window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize);

resize();
requestAnimationFrame(frame);
