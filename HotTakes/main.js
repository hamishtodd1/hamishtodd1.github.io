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

// --- Outcome titles --------------------------------------------------------
// A title word-wraps to at most TITLE_MAX_LINES. EVERY header is drawn at the
// same number of lines — that of the longest title — so the headers, and with
// them the bet grids below, stay lined up across all the outcomes. A taller
// header eats into the body, so the font shrinks a little as lines are added and
// the bet grid gets the rest. All four fractions are of the BOX HEIGHT.
var TITLE_MAX_LINES = 3;
var TITLE_FONT_FRAC = [0.120, 0.098, 0.084];  // font size, by line count
var TITLE_HEADER_FRAC = [0.20, 0.27, 0.33];   // white strip height, by line count
var TITLE_BODY_TOP = [0.29, 0.36, 0.42];      // where the bet grid starts, by line count

var titleLines = 1;        // shared line count — the max any outcome needs
var titleFontFrac = TITLE_FONT_FRAC[0];
var headerHFrac = TITLE_HEADER_FRAC[0];
var bodyTopFrac = TITLE_BODY_TOP[0];
var bodyHFrac = 0.94 - TITLE_BODY_TOP[0];
var scratchLines = ['', '', ''];  // working space for trial wraps

function applyTitleLines(n) {
  titleLines = n;
  titleFontFrac = TITLE_FONT_FRAC[n - 1];
  headerHFrac = TITLE_HEADER_FRAC[n - 1];
  bodyTopFrac = TITLE_BODY_TOP[n - 1];
  bodyHFrac = 0.94 - bodyTopFrac;
}

// Width available to a title: the box minus its side padding and the space the
// resolve button occupies. Every line wraps to this, including the ones below
// the button, so all lines break against the same width.
function titleFieldWidth(w, h) {
  return w - 2 * (w * 0.08) - (Math.min(h * TITLE_HEADER_FRAC[0], w * RESOLVE_BTN_MAX_W) + w * 0.02);
}

// Greedy word wrap into `out`, at most `maxLines`, using the font already set on
// ctx. Once on the last permitted line it keeps appending rather than dropping
// words, so text is never lost — it just overruns. Returns the lines used.
// Not a per-frame path (runs on edit/resize), so the substrings are fine.
function wrapText(text, width, maxLines, out) {
  out[0] = ''; out[1] = ''; out[2] = '';
  if (text.length === 0) return 1;
  var words = text.split(' ');
  var n = 0;
  var cur = words[0];
  for (var i = 1; i < words.length; i++) {
    var candidate = cur + ' ' + words[i];
    if (n === maxLines - 1 || ctx.measureText(candidate).width <= width) {
      cur = candidate;
    } else {
      out[n++] = cur;
      cur = words[i];
    }
  }
  out[n++] = cur;
  return n;
}

// Smallest line count in 1..TITLE_MAX_LINES at which this text actually fits —
// each count is tried at ITS OWN font size, since more lines means smaller text.
function fittedLineCount(text, fw, boxH) {
  for (var n = 1; n <= TITLE_MAX_LINES; n++) {
    ctx.font = Math.round(boxH * TITLE_FONT_FRAC[n - 1]) + 'px sans-serif';
    var c = wrapText(text, fw, n, scratchLines);
    if (c > n) continue;
    var ok = true;
    for (var i = 0; i < c; i++) {
      if (ctx.measureText(scratchLines[i]).width > fw) { ok = false; break; }
    }
    if (ok) return n;
  }
  return TITLE_MAX_LINES;
}

// Settle the shared line count, then wrap every title again at that final size so
// the breaks match the font they will actually be drawn in.
function rewrapTitles(boxW, boxH) {
  var fw = titleFieldWidth(boxW, boxH);
  var need = 1;
  for (var i = 0; i < topCount; i++) {
    var n = fittedLineCount(topBoxes[i].text, fw, boxH);
    if (n > need) need = n;
  }
  applyTitleLines(need);

  ctx.font = Math.round(boxH * titleFontFrac) + 'px sans-serif';
  for (var j = 0; j < topCount; j++) {
    var b = topBoxes[j];
    b.lineCount = wrapText(b.text, fw, titleLines, b.lines);
    // Two ways a line can still be too wide: a single word longer than the field,
    // and the last line, which is where anything that would not fit gets crammed.
    // Ellipsise either rather than let text run out of the box.
    for (var k = 0; k < b.lineCount; k++) {
      if (ctx.measureText(b.lines[k]).width <= fw) continue;
      var t = b.lines[k];
      while (t.length > 1 && ctx.measureText(t + '…').width > fw) t = t.slice(0, -1);
      b.lines[k] = t + '…';
    }
  }
}

// Player boxes are sized by their contents, between these bounds (set in layout()).
var layoutMargin = 0;   // the screen margin, so players can bottom-anchor to it
var playerPad = 0;      // inner padding of a player box
var playerMinH = 0;     // never smaller than this — they are drag targets
var playerMaxH = 0;     // never taller than the space reserved below the outcomes

// Top ("outcome") box palette, in fill order. Max 6 boxes.
var MAX_TOP = 6;
var TOP_COLORS = ['#FEE824', '#37588C', '#340B6E', '#3BA8A9', '#1F1E80', '#1F1E80'];

var BOTTOM_COUNT = 2;
var BOTTOM_COLOR = '#2a2a33';
var SELECTION_COLOR = '#2a6fff';

// --- Resolve --------------------------------------------------------------
// Every outcome has a resolve button in its top-right corner. Tapping it opens a
// MODAL: the board behind is dulled by a scrim and a dialog in the outcome's own
// colour asks whether the outcome happened. While it is open nothing else on the
// board is touchable. Choosing an option has no effect on the game yet — it just
// closes, like tapping outside does.
var RESOLVE_COLOR = '#2a6fff';         // the button — plain blue for now
var RESOLVE_BTN_MAX_W = 0.25;          // button size ÷ box width, ceiling
var SCRIM_COLOR = 'rgba(0, 0, 0, 0.6)';
var RESOLVE_QUESTION = 'Did this outcome happen?';
var RESOLVE_OPTIONS = ['Yes', 'No', 'Still uncertain'];

var resolveBox = null;                  // outcome whose dialog is open, or null
var dlgX = 0, dlgY = 0, dlgW = 0, dlgH = 0;
var resolveRects = new Array(3);        // option hit rects, preallocated
for (var ro = 0; ro < 3; ro++) resolveRects[ro] = { x: 0, y: 0, w: 0, h: 0 };

// --- Resolution (what "Yes"/"No" actually do) -------------------------------
// Answering Yes or No starts a timed resolution of that outcome:
//   flash  — every bet players hold on it pulses in place
//   then   YES: the bets turn money-coloured and fly into their owner's money
//          NO:  the bets simply fade away, paying nothing
//   end    — the outcome is REMOVED: from the top row and from every hand.
// "Still uncertain" starts nothing; it closes exactly like tapping outside.
var RESOLVE_FLASH_MS = 480;      // pulse phase
var RESOLVE_FLASH_PERIOD = 120;  // ms per on/off toggle within the pulse
var RESOLVE_MOVE_MS = 760;       // fly-to-money (Yes) / fade-out (No) phase
var RESOLVE_MS = RESOLVE_FLASH_MS + RESOLVE_MOVE_MS;
var LOSE_FLASH_COLOR = '#ff5a5a';

var resolving = null;      // outcome being resolved, or null
var resolvingIndex = -1;   // its index in topBoxes for the duration
var resolveWin = false;    // true = Yes (pays out), false = No (pays nothing)
var resolveStart = 0;

// One Payout per held bet being resolved. Only one outcome resolves at a time
// and an outcome only ever has numBetLevels bets, so the pool can never overflow.
function Payout() {
  this.active = false;
  this.player = null;
  this.slot = 0;        // which of the player's held bets on this outcome
  this.moneyFrom = 0;   // index in the money grid its first coin lands on
}
var payouts = new Array(numBetLevels);
for (var pa = 0; pa < numBetLevels; pa++) payouts[pa] = new Payout();
var payoutCount = 0;

// --- Crowns ---------------------------------------------------------------
// Once every outcome has been resolved away there is nothing left to trade, so
// the richest player has won. They get a crown that pops in with a burst of
// particles; ties are shared, so every player on the top score is crowned.
var CROWN_EMOJI = '👑';
var CROWN_POP_MS = 840;
var CROWN_PARTICLES = 22;
var PARTICLE_MS = 1500;
// Particles are real physics, so halving their speed means scaling velocity by
// 1/2 and gravity by 1/4 — that keeps the arc the same shape and size over twice
// the time, rather than flinging them four times as far.
var PARTICLE_GRAVITY = 225;   // px/s², pulls the burst back down
var PARTICLE_SPEED = 60;      // px/s, base outward speed
var PARTICLE_SPEED_VAR = 130; // ...plus up to this much
var PARTICLE_LIFT = 60;       // px/s of upward bias, so the burst fountains
var PARTICLE_COLORS = ['#FFD34D', '#FFF0A8', '#FFFFFF'];
var crownUntil = 0;           // keep rendering until this time

function Particle() {
  this.active = false;
  this.x = 0; this.y = 0;     // launch point
  this.vx = 0; this.vy = 0;   // px per second
  this.born = 0;
  this.colorIndex = 0;
}
var MAX_PARTICLES = 96;
var particles = new Array(MAX_PARTICLES);
for (var pi = 0; pi < MAX_PARTICLES; pi++) particles[pi] = new Particle();
var activeParticles = 0;

// Money: small filled squares, held by players (bottom rects) in a grid.
// Counts can grow large and money will move between holders, so rendering is a
// plain count→grid loop (allocation-free); no per-coin objects.
// NOTE: `MONEY_PER_PLAYER` (starting cash) lives in manual.js (loaded first).
// Banknote green. Deliberately kept clear of TOP_COLORS[3] ('#3BA8A9'), the only
// other green-ish colour on the board: that one is a desaturated TEAL at hue
// ~181°, this is a saturated green at hue ~142°. Money also fills rows inside
// the outcome boxes, so it has to stay legible sitting directly on that teal —
// hence the difference in saturation and lightness as well as hue.
var MONEY_COLOR = '#16A34A';

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
// Outline weight and the size of what sits inside it are two ends of one dial:
// the stroke is centred on the cell edge, so it eats BETBOX_STROKE_FRAC of the
// cell overall, leaving (1 - BETBOX_STROKE_FRAC) clear inside. BET_SIZE_FRAC
// must stay below that or the squares will sit under the outline rather than in
// it. The stroke also spreads half its width outward, so BETBOX_STROKE_FRAC must
// stay under BET_GAP_RATIO or neighbouring outlines will touch.
var BETBOX_STROKE_FRAC = 0.28; // outline thickness ÷ cell
var BET_SIZE_FRAC = 0.55;      // bet/money square size ÷ cell, so it sits inside the outline

// PRICE: a bet is always `maxPrice` boxes wide; the number of betBox OUTLINES in
// the row it rests on is its price. Buying always takes the CHEAPEST remaining
// bet (the greatest level index, i.e. the narrowest row), so each purchase of an
// outcome costs more than the last. The bought bet leaves the outcome and lands
// in the buyer's mirror; exactly `price` money squares travel the other way and
// fill the row it vacated.
var TRANSFER_MS = 1120;        // duration of the bet↓ / money↑ swap animation
var PIPE_FADE_FRAC = 0.85;     // the standing pipe holds until here, then fades out
var TRANSFER_STAGGER = 0.5;    // share of the flight spent queueing squares into the pipe
// Motion blur: a square in flight is drawn not as a box but as a LINE SEGMENT as
// thick as the box is wide, streaked back along the path it just took. It is
// sampled over BLUR_TRAIL_MS of real time, so the streak shortens by itself as
// the square eases in and out, and becomes a box again at either end.
var BLUR_TRAIL_MS = 45;        // how far back along its own path a square smears
var BLUR_MAX_FRAC = 6;         // longest streak ÷ square size
var BLUR_MIN_FRAC = 0.35;      // below this it is moving too slowly to blur

// Money boxes and betBoxes share ONE cell size, computed in layout() so the
// numBetLevels-tall bet grid just fits an outcome box's body. Both use it, so a
// betBox is exactly money-sized.
var BET_GAP_RATIO = 0.30;      // gap between cells ÷ cell HEIGHT (> BETBOX_STROKE_FRAC)
// Cells are RECTANGLES: `unitH` is the height the layout derives, `unitW` is
// `unitH * boxWidthPerHeight` (manual.js) — at a ratio of 1 they are square.
// `unitGap` comes off the HEIGHT, so the gap is the same in both axes and
// widening the boxes does not spread the grid apart vertically.
var unitH = 0;                 // px height of a money box / betBox (computed in layout)
var unitW = 0;                 // px width of the same
var unitGap = 0;               // px gap between cells, both axes (computed in layout)

var DRAG_THRESHOLD = 8; // px of movement before a tap becomes a drag
var JOLT_MS = 220;      // duration of a box's vibrate jolt
var PIPE_OUTER = 16;    // pipe outline thickness
var PIPE_INNER = 9;     // hollow interior thickness
var PIPE_CURVE = 0.45;  // bezier control offset ÷ vertical span
var PIPE_CURVE_MIN = 16; // ...plus this, so short hops still curve

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
  this.betAlive = null;    // top boxes only: 1 while bet j is still here, 0 once bought
  this.betArrive = null;   // top boxes only: when a sold-back bet finishes flying in
  this.moneyAt = null;     // top boxes only: money squares now filling level i (0 = none)
  this.moneyArrive = null; // top boxes only: when that money finishes flying in
  this.ownedCount = null;  // bottom boxes only: bets this player holds, per outcome index
  this.ownedLevel = null;  // bottom boxes only: level each held bet was bought at (price record)
  this.ownedArrive = null; // bottom boxes only: when each held bet finishes flying in
  this.lines = ['', '', ''];  // top boxes only: `text` word-wrapped, recomputed on change
  this.lineCount = 1;
  this.crownTime = 0;      // bottom boxes only: when this player was crowned (0 = not)
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
  topBoxes[i].betAlive = new Uint8Array(numBetLevels);
  topBoxes[i].betArrive = new Float64Array(numBetLevels);
  topBoxes[i].moneyAt = new Uint8Array(numBetLevels);
  topBoxes[i].moneyArrive = new Float64Array(numBetLevels);
  for (var s2 = 0; s2 < numBetLevels; s2++) {
    topBoxes[i].betLevel[s2] = s2;
    topBoxes[i].betAlive[s2] = 1;
  }
}
var topCount = 2;
topBoxes[0].text = 'A';
topBoxes[1].text = 'B';

var bottomBoxes = new Array(BOTTOM_COUNT);
for (var j = 0; j < BOTTOM_COUNT; j++) {
  bottomBoxes[j] = new Box(false);
  bottomBoxes[j].color = BOTTOM_COLOR;
  bottomBoxes[j].money = MONEY_PER_PLAYER;
  // Bets held per outcome. Flat MAX_TOP × numBetLevels arrays, indexed
  // [outcomeIndex * numBetLevels + slot] — preallocated, never grown.
  bottomBoxes[j].ownedCount = new Int16Array(MAX_TOP);
  bottomBoxes[j].ownedLevel = new Int16Array(MAX_TOP * numBetLevels);
  bottomBoxes[j].ownedArrive = new Float64Array(MAX_TOP * numBetLevels);
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
// Transfers — the bet↓ / money↑ swap, animated. Pre-allocated pool.
// ---------------------------------------------------------------------------
//
// A Transfer only carries the ANIMATION. All the state changes commit the moment
// the purchase is made, each stamped with the time it should become visible
// (`moneyArrive`, `ownedArrive`). So the game state is never mid-flight or
// inconsistent — the drawing simply hides an item until its arrival time passes,
// and the Transfer draws it travelling in the meantime. Multitouch-safe: several
// purchases can be in the air at once without interfering.

function Transfer() {
  this.active = false;
  this.start = 0;
  this.outcome = null;      // top box the bet came from
  this.outcomeIndex = 0;    // its index in topBoxes (for locating the mirror)
  this.player = null;       // bottom box that bought it
  this.level = 0;           // level the bet rested on = which row the money fills
  this.price = 0;           // = getBetPrice(level) = coins travelling up
  this.betSlot = 0;         // slot in the player's hand the bet lands in / left from
  this.coinFrom = 0;        // index of the first coin in the money grid to leave / arrive
  this.sell = false;        // false = buy (bet↓ money↑), true = sell (bet↑ money↓)
}

var MAX_TRANSFERS = 8;
var transfers = new Array(MAX_TRANSFERS);
for (var tr0 = 0; tr0 < MAX_TRANSFERS; tr0++) transfers[tr0] = new Transfer();
var activeTransferCount = 0;

function acquireTransfer() {
  for (var k = 0; k < MAX_TRANSFERS; k++) {
    if (!transfers[k].active) {
      transfers[k].active = true;
      activeTransferCount++;
      return transfers[k];
    }
  }
  return null;
}

function releaseTransfer(tr) {
  tr.active = false;
  tr.outcome = null;
  tr.player = null;
  activeTransferCount--;
}

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

// A sale is a purchase backwards, so its sound is playConnect's sweep inverted.
function playSell() {
  if (!audioCtx) return;
  var osc = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  var t = audioCtx.currentTime;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(880, t);
  osc.frequency.exponentialRampToValueAtTime(440, t + 0.12);
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
  // Players get their x/w from the row; their HEIGHT comes from their contents
  // (updatePlayerBoxes), capped so they can never climb into the outcomes.
  layoutRow(bottomBoxes, BOTTOM_COUNT, margin, viewH - margin - bottomRowH, bottomRowH);
  layoutMargin = margin;
  playerPad = Math.max(4, margin * 0.4);
  playerMaxH = bottomRowH;
  playerMinH = viewH * 0.1;
  updatePlayerBoxes();
  if (resolveBox) layoutResolveDialog();
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
  // topCount can reach 0 once every outcome has been resolved away.
  var fillW = topCount > 0
    ? (viewW - fillGaps * gap - (addBtn.visible ? baseH : 0)) / topCount
    : viewW;

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

  // Titles are wrapped now that the box size is settled, because how many lines
  // they need decides how tall the header is — and so how much room is left for
  // the bet grid below it. Box width and height do not depend on the titles, so
  // there is no circularity.
  rewrapTitles(boxW, boxH);

  // Derive the shared cell size so the bet grid fits the box body: all
  // numBetLevels rows down it (body is bodyTopFrac..0.94 of box height) and a full
  // maxPrice-wide bet across it (body is inset 0.08 each side) — see drawBetColumn.
  // The width constraint carries `boxWidthPerHeight`, so making the boxes wider
  // makes them shorter too once width is what is binding.
  var bodyH = boxH * bodyHFrac;
  var bodyW = boxW * 0.84;
  unitH = Math.min(bodyH / (numBetLevels + BET_GAP_RATIO * (numBetLevels + 1)),
                   bodyW / (maxPrice * boxWidthPerHeight + BET_GAP_RATIO * (maxPrice + 1)));
  unitW = unitH * boxWidthPerHeight;
  unitGap = unitH * BET_GAP_RATIO;

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

// Geometry of an outcome's resolve button — the top-right corner of the box,
// squared off to the height of the header strip. Written to scratch globals and
// shared by the drawing and the hit test so they cannot disagree.
var rbX = 0, rbY = 0, rbW = 0, rbH = 0;
function resolveBtnRect(x, y, w, h) {
  // Sized off the header strip, but CAPPED against the box width: top boxes get
  // narrow (they wrap at MIN_TOP_W on phones) and an uncapped button would eat a
  // third of the header, leaving the title almost no room to wrap into.
  rbH = Math.min(h * TITLE_HEADER_FRAC[0], w * RESOLVE_BTN_MAX_W);
  rbW = rbH;
  rbY = y + h * 0.06;
  rbX = x + w - w * 0.08 - rbW;  // w*0.08 is drawOutcomeBox's side padding
}

// The modal dialog. Laid out on open and on resize — never per frame.
function layoutResolveDialog() {
  dlgW = Math.min(viewW * 0.84, 420, viewH * 0.8);
  var pad = dlgW * 0.07;
  var titleH = dlgW * 0.16;
  var optH = dlgW * 0.15;
  var optGap = dlgW * 0.05;
  dlgH = pad + titleH + pad + 3 * optH + 2 * optGap + pad;
  dlgX = (viewW - dlgW) * 0.5;
  dlgY = (viewH - dlgH) * 0.5;

  var oy = dlgY + pad + titleH + pad;
  for (var i = 0; i < 3; i++) {
    var r = resolveRects[i];
    r.x = dlgX + pad;
    r.w = dlgW - 2 * pad;
    r.y = oy + i * (optH + optGap);
    r.h = optH;
  }
}

function openResolve(b) {
  focusBox(null);
  // A modal takes over completely: drop any pipes other fingers are holding.
  for (var k = 0; k < MAX_POINTERS; k++) { if (drags[k].active) releaseDrag(drags[k]); }
  resolveBox = b;
  layoutResolveDialog();
  playBlip(520);
  needsRender = true;
}

function closeResolve() {
  resolveBox = null;
  needsRender = true;
}

// Begin resolving `b`. Every bet held on it by any player gets a Payout; the
// money itself is credited at the END (finishResolve), because a resolution is
// an inherently timed process that culminates in removing the outcome.
function startResolve(b, win) {
  var oi = 0;
  for (var i = 0; i < topCount; i++) { if (topBoxes[i] === b) { oi = i; break; } }

  // Purchases have already committed their state, so dropping their remaining
  // animation is harmless — and it keeps soon-to-be-stale outcome indices out
  // of the resolution.
  for (var t = 0; t < MAX_TRANSFERS; t++) { if (transfers[t].active) releaseTransfer(transfers[t]); }

  resolving = b;
  resolvingIndex = oi;
  resolveWin = win;
  resolveStart = now();
  payoutCount = 0;

  for (var p = 0; p < BOTTOM_COUNT; p++) {
    var pl = bottomBoxes[p];
    var n = pl.ownedCount[oi];
    var moneyIndex = pl.money;   // winnings land on the end of the existing pile
    for (var s = 0; s < n && payoutCount < payouts.length; s++) {
      var po = payouts[payoutCount++];
      po.active = true;
      po.player = pl;
      po.slot = s;
      po.moneyFrom = moneyIndex;
      moneyIndex += maxPrice;    // a bet is maxPrice boxes, so it becomes maxPrice money
    }
  }

  playBlip(win ? 880 : 220);
  needsRender = true;
}

// Pay out (if Yes) and make the outcome vanish.
function finishResolve() {
  for (var i = 0; i < payoutCount; i++) {
    if (resolveWin) payouts[i].player.money += maxPrice;
    payouts[i].active = false;
  }
  payoutCount = 0;
  removeOutcome(resolvingIndex);
  resolving = null;
  resolvingIndex = -1;
  needsRender = true;
}

// Return an outcome to the pool: the active boxes above it shift down, and every
// player's per-outcome holdings shift with them so the indices stay aligned.
// This is what makes the outcome disappear from the top row AND from every hand.
function removeOutcome(oi) {
  var removed = topBoxes[oi];
  for (var i = oi; i < topCount - 1; i++) topBoxes[i] = topBoxes[i + 1];
  topBoxes[topCount - 1] = removed;
  topCount--;

  for (var p = 0; p < BOTTOM_COUNT; p++) {
    var b = bottomBoxes[p];
    for (var k = oi; k < topCount; k++) {
      b.ownedCount[k] = b.ownedCount[k + 1];
      for (var s = 0; s < numBetLevels; s++) {
        b.ownedLevel[k * numBetLevels + s] = b.ownedLevel[(k + 1) * numBetLevels + s];
        b.ownedArrive[k * numBetLevels + s] = b.ownedArrive[(k + 1) * numBetLevels + s];
      }
    }
    b.ownedCount[topCount] = 0;
  }

  resetOutcome(removed);   // hand the pool slot back clean, ready for Add Outcome
  layout();
  updateCrowns();          // resolving the last outcome decides the winner
}

// Who is wearing a crown. Called whenever the number of outcomes changes — the
// only moments it can differ, since with no outcomes there is nothing to trade
// and money can no longer move. Crowning is idempotent: an already-crowned
// player keeps their existing crownTime, so the pop does not restart.
function updateCrowns() {
  var i;
  if (topCount > 0) {
    for (i = 0; i < BOTTOM_COUNT; i++) bottomBoxes[i].crownTime = 0;
    needsRender = true;
    return;
  }

  var best = -1;
  for (i = 0; i < BOTTOM_COUNT; i++) {
    if (bottomBoxes[i].money > best) best = bottomBoxes[i].money;
  }

  var t = now();
  for (i = 0; i < BOTTOM_COUNT; i++) {
    var p = bottomBoxes[i];
    if (p.money === best) {           // ties share the crown
      if (p.crownTime === 0) {
        p.crownTime = t;
        emitCrownBurst(p);
      }
    } else {
      p.crownTime = 0;
    }
  }
  needsRender = true;
}

function crownSize(p) {
  return Math.min(p.w * 0.22, p.h * 0.2, 64);
}

// Centre of a player's crown, just above their box. Into gx/gy.
function crownPos(p) {
  gx = p.x + p.w * 0.5;
  gy = p.y - crownSize(p) * 0.5;
}

function acquireParticle() {
  for (var i = 0; i < MAX_PARTICLES; i++) {
    if (!particles[i].active) { particles[i].active = true; activeParticles++; return particles[i]; }
  }
  return null;
}

function emitCrownBurst(p) {
  crownPos(p);
  var cx = gx, cy = gy;
  var t = now();
  for (var i = 0; i < CROWN_PARTICLES; i++) {
    var pt = acquireParticle();
    if (!pt) return;
    // Spread evenly around the circle, jittered, so the burst reads as a ring
    // rather than a random cloud.
    var a = (i / CROWN_PARTICLES) * Math.PI * 2 + Math.random() * 0.5;
    var speed = PARTICLE_SPEED + Math.random() * PARTICLE_SPEED_VAR;
    pt.x = cx; pt.y = cy;
    pt.vx = Math.cos(a) * speed;
    pt.vy = Math.sin(a) * speed - PARTICLE_LIFT;   // biased upward, so it fountains
    pt.born = t;
    pt.colorIndex = i % PARTICLE_COLORS.length;
  }
  crownUntil = t + Math.max(CROWN_POP_MS, PARTICLE_MS);
}

function resetOutcome(b) {
  for (var s = 0; s < numBetLevels; s++) {
    b.betLevel[s] = s;
    b.betAlive[s] = 1;
    b.betArrive[s] = 0;
    b.moneyAt[s] = 0;
    b.moneyArrive[s] = 0;
  }
  b.text = '';
  b.joltTime = 0;
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
// Cell geometry — SINGLE SOURCE OF TRUTH for where a square sits
// ---------------------------------------------------------------------------
//
// Both the static drawing and the flight animation ask these helpers for
// positions, so an item can never appear to jump when it lands. They return
// through the scratch globals `gx`/`gy` rather than an object, so calling them
// per square per frame allocates nothing.

var gx = 0, gy = 0;

// Interior geometry of a player, recomputed on demand (pure arithmetic).
var plInnerX = 0, plInnerW = 0;
var plMoneyY = 0, plMoneyH = 0, plMoneyCols = 1, plMoneyRows = 0;
var plPileTop = 0, pileRows = 0;

// Height of `n` stacked rows of cells.
function rowsHeight(n) {
  return n <= 0 ? 0 : n * unitH + (n - 1) * unitGap;
}

// How many money cells a player needs room for. Coins already spent are gone
// from `money` but may still be in the air, and they fly out of cells past the
// end of the pile — so the box has to stay big enough to hold them until they
// land, or it would snap shorter the instant a purchase is made.
function playerMoneySlots(p) {
  var n = p.money;
  for (var i = 0; i < MAX_TRANSFERS; i++) {
    var tr = transfers[i];
    if (!tr.active || tr.player !== p) continue;
    var end = tr.coinFrom + tr.price;
    if (end > n) n = end;
  }
  return n;
}

// A player's box is exactly as tall as what it holds — BETS ON TOP, MONEY ALONG
// THE BOTTOM — so it grows and shrinks as they win, spend and trade. The box is
// anchored to the bottom of the screen, so it grows UPWARD and the money never
// shifts under the player's finger. Recomputed every frame (a handful of
// multiplications per player) rather than only in layout(), so it tracks state
// changes and in-flight transfers without anything having to remember to ask.
function updatePlayerBoxes() {
  for (var i = 0; i < BOTTOM_COUNT; i++) {
    var p = bottomBoxes[i];
    var cols = Math.max(1, Math.floor((p.w - 2 * playerPad - unitGap) / (unitW + unitGap)));
    var bh = rowsHeight(pileTotal(p));
    var mh = rowsHeight(Math.ceil(playerMoneySlots(p) / cols));
    var h = playerPad * 2 + bh + mh + ((bh > 0 && mh > 0) ? playerPad : 0);
    if (h < playerMinH) h = playerMinH;
    if (h > playerMaxH) h = playerMaxH;   // never grow up into the outcomes
    p.h = h;
    p.y = viewH - layoutMargin - h;
  }
}

function computePlayerLayout(p) {
  plInnerX = p.x + playerPad;
  plInnerW = p.w - 2 * playerPad;
  plMoneyCols = Math.max(1, Math.floor((plInnerW - unitGap) / (unitW + unitGap)));

  // Money sits along the BOTTOM, filling upward from the floor of the box; the
  // bet pile starts at the TOP and reads downward.
  // Row counts are worked out DIRECTLY, never by dividing a height back down.
  // The box is sized to its contents, so a band's height is exactly its rows'
  // height — and that round-trip lands a hair under in floating point, which
  // silently clips the LAST row. Clipping only ever happens when the box has hit
  // playerMaxH, so that is the only case that recomputes a capacity.
  var interior = p.h - 2 * playerPad;
  plMoneyRows = Math.ceil(playerMoneySlots(p) / plMoneyCols);
  plMoneyH = rowsHeight(plMoneyRows);
  if (plMoneyH > interior) {
    plMoneyRows = Math.max(1, Math.floor((interior + unitGap) / (unitH + unitGap)));
    plMoneyH = rowsHeight(plMoneyRows);
  }
  plMoneyY = p.y + p.h - playerPad - plMoneyH;
  plPileTop = p.y + playerPad;

  var band = plMoneyY - playerPad - plPileTop;
  pileRows = pileTotal(p);
  if (rowsHeight(pileRows) > band + 0.5) {   // tolerance: a row is many px tall
    pileRows = Math.max(1, Math.floor((band + unitGap) / (unitH + unitGap)));
  }
}

// A player's held bets form ONE pile, ordered by outcome: every bet on outcome 0,
// then every bet on outcome 1, and so on. Bet on yellow, then blue, then yellow
// and the pile reads yellow-yellow-blue. These two turn (outcome, slot) into a
// position in that single ordering.
function pileTotal(p) {
  var n = 0;
  for (var i = 0; i < topCount; i++) n += p.ownedCount[i];
  return n;
}

function pileIndex(p, oi, slot) {
  var n = 0;
  for (var i = 0; i < oi; i++) n += p.ownedCount[i];
  return n + slot;
}

// Left edge of the bet grid inside a box of width `bw` at `bx`: the maxPrice-wide
// run of cells, horizontally CENTRED. A bet is exactly this wide, so bets come
// out centred. The shorter runs — a level's price outlines, and the money that
// fills them — are LEFT-JUSTIFIED to this same edge, so the triangle opens to
// the right and every row shares one left edge with the bets.
function gridStartX(bx, bw) {
  return bx + (bw - (maxPrice * unitW + (maxPrice - 1) * unitGap)) * 0.5;
}

// Cell (level, col) of an outcome's bet grid, in the big top box.
function betCellPos(b, level, col) {
  gx = gridStartX(b.x, b.w) + col * (unitW + unitGap);
  gy = b.y + b.h * bodyTopFrac + unitGap + level * (unitH + unitGap);
}

// Money box `index` in a player's grid. Assumes computePlayerLayout(p) ran.
function moneyCellPos(index) {
  gx = plInnerX + unitGap + (index % plMoneyCols) * (unitW + unitGap);
  gy = plMoneyY + unitGap + ((index / plMoneyCols) | 0) * (unitH + unitGap);
}

// Cell (slot, col) of a bet held in a player's hand. Cells are `unitW × unitH` — a
// bet NEVER changes size, so a held bet is identical in size to the one that was
// sitting in the outcome's grid. The pile is anchored to the TOP of the box and
// reads downward, so a bet's position depends only on its own index: it does not
// move when the pile grows below it, and a bet being SOLD still resolves to the
// slot it was sitting in even though the count has already dropped.
// Assumes computePlayerLayout(p) ran.
function handBetCellPos(p, oi, slot, col) {
  gx = gridStartX(plInnerX, plInnerW) + col * (unitW + unitGap);
  gy = plPileTop + pileIndex(p, oi, slot) * (unitH + unitGap);
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

// A pipe is a cubic bezier whose control points are pulled straight out of the
// two ends, so it leaves the source box and enters the target box perpendicular
// to their edges. `dir` is +1 when the pipe sets off downward (source is an
// outcome) and -1 when it sets off upward (source is a player).
//
// This is the single definition of the curve. Bets and money in flight are run
// along it by pipePoint(), so an exchange follows exactly the path its pipe took.
function pipePull(y1, y2) {
  var d = y2 - y1;
  if (d < 0) d = -d;
  return d * PIPE_CURVE + PIPE_CURVE_MIN;
}

// Point at t (0..1) along that curve, into the scratch globals gx/gy. The
// control points share the endpoints' x, so x eases as well as y.
function pipePoint(x1, y1, x2, y2, dir, t) {
  var pull = pipePull(y1, y2);
  var c1y = y1 + dir * pull;
  var c2y = y2 - dir * pull;
  var u = 1 - t;
  var a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  gx = (a + b) * x1 + (c + d) * x2;
  gy = a * y1 + b * c1y + c * c2y + d * y2;
}

function drawPipe(x1, y1, x2, y2, color, dir) {
  var pull = pipePull(y1, y2);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.bezierCurveTo(x1, y1 + dir * pull, x2, y2 - dir * pull, x2, y2);
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

  // Settle a finished resolution BEFORE drawing, so the frame that removes the
  // outcome is also the frame that shows the winnings — no one-frame gap.
  if (resolving !== null && nowMs - resolveStart >= RESOLVE_MS) finishResolve();

  // Player boxes are sized by their contents, which change constantly.
  updatePlayerBoxes();

  ctx.clearRect(0, 0, viewW, viewH);

  // Active drag pipes first, so boxes sit cleanly over the anchor ends.
  for (var k = 0; k < MAX_POINTERS; k++) {
    var dr = drags[k];
    if (dr.active && dr.moved) drawActiveDrag(dr);
  }
  // Pipes left standing after release, for the squares to run along.
  for (var tp = 0; tp < MAX_TRANSFERS; tp++) {
    if (transfers[tp].active) drawTransferPipe(transfers[tp]);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (var a = 0; a < topCount; a++) drawTopBox(topBoxes[a]);
  if (addBtn.visible) drawAddButton();
  for (var b2 = 0; b2 < BOTTOM_COUNT; b2++) drawPlayer(bottomBoxes[b2]);

  // Transfers last — bets and money in flight pass OVER the boxes. Finished ones
  // are retired here; by this point their arrival times have passed, so the
  // static drawing above has already taken over seamlessly.
  for (var tI = 0; tI < MAX_TRANSFERS; tI++) {
    var tr = transfers[tI];
    if (!tr.active) continue;
    if (nowMs - tr.start >= TRANSFER_MS) { releaseTransfer(tr); continue; }
    drawTransfer(tr);
  }

  if (resolving !== null) drawResolution();

  for (var cw = 0; cw < BOTTOM_COUNT; cw++) drawCrown(bottomBoxes[cw]);
  if (activeParticles > 0) drawParticles();

  // The resolve dialog is modal, so it goes in front of absolutely everything.
  if (resolveBox) drawResolveDialog();
}

// The bets being resolved, drawn in place of the ones drawHeldBets() suppresses.
// Phase 1 — all of them pulse where they sit. Phase 2 — on Yes they take the
// colour of money, grow from bet-inset to full money size and fly onto the end
// of their owner's pile; on No they simply fade out and pay nothing.
function drawResolution() {
  var e = nowMs - resolveStart;
  var flashing = e < RESOLVE_FLASH_MS;
  var k = flashing ? 0 : easeInOut((e - RESOLVE_FLASH_MS) / RESOLVE_MOVE_MS);

  var hFrom = unitH * BET_SIZE_FRAC;
  var inset = (unitH - hFrom) * 0.5;
  var wFrom = unitW - 2 * inset;
  var h = flashing ? hFrom : hFrom + (unitH - hFrom) * k;   // grows to full money size
  var w = flashing ? wFrom : wFrom + (unitW - wFrom) * k;
  var r = Math.min(h * 0.25, 3);

  // Held bets wear their outcome's colour, so that is what flashes.
  if (flashing) {
    var on = (((e / RESOLVE_FLASH_PERIOD) | 0) % 2) === 0;
    ctx.fillStyle = on ? resolving.color : (resolveWin ? MONEY_COLOR : LOSE_FLASH_COLOR);
  } else if (resolveWin) {
    ctx.fillStyle = MONEY_COLOR;
  } else {
    ctx.fillStyle = resolving.color;
    ctx.globalAlpha = 1 - k;
  }

  for (var i = 0; i < payoutCount; i++) {
    var po = payouts[i];
    computePlayerLayout(po.player);
    for (var c = 0; c < maxPrice; c++) {
      handBetCellPos(po.player, resolvingIndex, po.slot, c);
      var ax = gx + inset, ay = gy + inset;
      var x = ax, y = ay;
      if (resolveWin && !flashing) {
        moneyCellPos(po.moneyFrom + c);
        x = ax + (gx - ax) * k;
        y = ay + (gy - ay) * k;
      }
      roundRectPath(x, y, w, h, r);
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

// Scrim over the whole board (dulling it), then the dialog in the outcome's own
// colour. The question and the three options are white fields with dark text —
// the same idiom as an outcome's header — so they stay legible on any of the
// outcome colours, from the bright yellow to the dark blues.
function drawResolveDialog() {
  ctx.fillStyle = SCRIM_COLOR;
  ctx.fillRect(0, 0, viewW, viewH);

  roundRectPath(dlgX, dlgY, dlgW, dlgH, Math.round(dlgW * 0.06));
  ctx.fillStyle = resolveBox.color;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  var pad = dlgW * 0.07;
  var titleH = dlgW * 0.16;
  roundRectPath(dlgX + pad, dlgY + pad, dlgW - 2 * pad, titleH, Math.round(titleH * 0.2));
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.fillStyle = '#1a1a1a';
  ctx.font = Math.round(titleH * 0.32) + 'px sans-serif';
  ctx.fillText(RESOLVE_QUESTION, dlgX + dlgW * 0.5, dlgY + pad + titleH * 0.5);

  for (var i = 0; i < 3; i++) {
    var r = resolveRects[i];
    roundRectPath(r.x, r.y, r.w, r.h, Math.round(r.h * 0.25));
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = Math.round(r.h * 0.36) + 'px sans-serif';
    ctx.fillText(RESOLVE_OPTIONS[i], r.x + r.w * 0.5, r.y + r.h * 0.5);
  }
}

function easeInOut(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) * 0.5;
}

// easeOutBack — overshoots past 1 and settles, which is what makes it "pop".
function popScale(x) {
  var c1 = 1.70158, c3 = c1 + 1, u = x - 1;
  return 1 + c3 * u * u * u + c1 * u * u;
}

function drawCrown(p) {
  if (p.crownTime === 0) return;
  var e = (nowMs - p.crownTime) / CROWN_POP_MS;
  if (e < 0) e = 0;
  var size = crownSize(p) * (e >= 1 ? 1 : popScale(e));
  if (size <= 0.5) return;
  crownPos(p);
  ctx.font = Math.round(size) + 'px serif';
  ctx.fillText(CROWN_EMOJI, gx, gy);
}

// Particles are integrated from their launch time rather than stepped per frame,
// so they are frame-rate independent and cannot drift.
function drawParticles() {
  for (var i = 0; i < MAX_PARTICLES; i++) {
    var pt = particles[i];
    if (!pt.active) continue;
    var e = (nowMs - pt.born) / PARTICLE_MS;
    if (e < 0) e = 0;
    if (e >= 1) { pt.active = false; activeParticles--; continue; }

    var s = e * PARTICLE_MS / 1000;   // seconds since launch
    var x = pt.x + pt.vx * s;
    var y = pt.y + pt.vy * s + PARTICLE_GRAVITY * s * s * 0.5;
    var size = 6 * (1 - e) + 1;

    ctx.globalAlpha = 1 - e * e;      // hold brightness, then fade off quickly
    ctx.fillStyle = PARTICLE_COLORS[pt.colorIndex];
    ctx.fillRect(x - size * 0.5, y - size * 0.5, size, size);
  }
  ctx.globalAlpha = 1;
}

// One purchase in flight: the bet falling into the player's mirror (shrinking to
// mirror scale) and, at the same time, its price in money rising into the row
// the bet vacated. Endpoints come from the same cell-geometry helpers the static
// drawing uses, so both halves land exactly where they will come to rest.
function drawTransfer(tr) {
  var e = (nowMs - tr.start) / TRANSFER_MS;
  if (e < 0) e = 0; else if (e > 1) e = 1;

  computePlayerLayout(tr.player);
  transferPipeEnds(tr);
  var plen = pipeLength();

  // A SALE is a purchase run backwards: the bet travels up out of the hand and
  // the money comes down out of the row. Same endpoints, swapped.
  var sell = tr.sell;

  // The bet. Its size is CONSTANT throughout the flight — a bet is the same size
  // in the outcome, in the air, and in the hand. Only position moves.
  var betH = unitH * BET_SIZE_FRAC;
  var betIn = (unitH - betH) * 0.5;
  var betW = unitW - 2 * betIn;
  var betR = Math.min(betH * 0.25, 3);
  // A bet is white in the outcome (where it sits on a coloured box) but takes the
  // outcome's colour in a hand (where colour is all that identifies it). In
  // flight it wears the colour it will have on ARRIVAL.
  ctx.fillStyle = sell ? BET_COLOR : tr.outcome.color;
  ctx.strokeStyle = ctx.fillStyle;
  // The blur samples a fixed slice of REAL time; a square's local clock only runs
  // over the non-queueing part of the flight, hence the conversion.
  var dtLin = BLUR_TRAIL_MS / ((1 - TRANSFER_STAGGER) * TRANSFER_MS);
  for (var c = 0; c < maxPrice; c++) {
    betCellPos(tr.outcome, tr.level, c);
    var rowX = gx + betIn, rowY = gy + betIn;
    handBetCellPos(tr.player, tr.outcomeIndex, tr.betSlot, c);
    var handX = gx + betIn, handY = gy + betIn;
    var ax = sell ? handX : rowX, ay = sell ? handY : rowY;
    var bx = sell ? rowX : handX, by = sell ? rowY : handY;
    // The bet always runs from the pipe's start mouth to its finish mouth: the
    // pipe was drawn from whichever box the drag began on, which is where the
    // bet is coming from in both directions.
    var tl = staggeredT(e, c, maxPrice);
    var tp = tl - dtLin; if (tp < 0) tp = 0;
    throughPipe(ax, ay, bx, by, true, plen, easeInOut(tl));
    var nowX = gx, nowY = gy;
    throughPipe(ax, ay, bx, by, true, plen, easeInOut(tp));
    drawFlyingSquare(nowX, nowY, gx, gy, betW, betH, betR);
  }

  // The money — exactly `price` squares, which is exactly the width of the row
  // they occupy. Money is full-cell in the pile and bet-inset in the row, so the
  // size eases between the two in whichever direction it is going.
  var inRowH = unitH * BET_SIZE_FRAC;
  var coinIn = (unitH - inRowH) * 0.5;
  var inRowW = unitW - 2 * coinIn;
  ctx.fillStyle = MONEY_COLOR;
  ctx.strokeStyle = MONEY_COLOR;
  for (var i = 0; i < tr.price; i++) {
    var ml = staggeredT(e, i, tr.price);
    var mp = ml - dtLin; if (mp < 0) mp = 0;
    var mt = easeInOut(ml);
    var coinH = sell ? inRowH + (unitH - inRowH) * mt : unitH + (inRowH - unitH) * mt;
    var coinW = sell ? inRowW + (unitW - inRowW) * mt : unitW + (inRowW - unitW) * mt;
    var coinR = Math.min(coinH * 0.22, 3);
    moneyCellPos(tr.coinFrom + i);
    var pileX = gx, pileY = gy;
    betCellPos(tr.outcome, tr.level, i); // the row's outlines, left-justified
    var slotX = gx + coinIn, slotY = gy + coinIn;
    var mx = sell ? slotX : pileX, my = sell ? slotY : pileY;
    var nx = sell ? pileX : slotX, ny = sell ? pileY : slotY;
    // Money always runs the pipe the OTHER way — it is the counterpayment, so it
    // passes the bets going the opposite direction inside the same tube.
    throughPipe(mx, my, nx, ny, false, plen, mt);
    var coinX = gx, coinY = gy;
    throughPipe(mx, my, nx, ny, false, plen, easeInOut(mp));
    drawFlyingSquare(coinX, coinY, gx, gy, coinW, coinH, coinR);
  }
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
  drawPipe(sx, sy, ex, ey, s.color, dr.sourceIsTop ? 1 : -1);
}

// The pipe does not vanish on release: it stands for the length of the exchange
// so the bet and money can be seen running along it, then fades out. It is the
// same pipe the finger drew — anchors, direction and colour all continue from
// the drag, which is why the colour is the SOURCE's (the outcome on a buy, the
// player on a sale) rather than always the outcome's.
//
// Recomputed from the boxes each frame rather than stored, so it stays correct
// across a resize mid-flight.
// The two mouths of a transfer's pipe, into scratch globals. The pipe always
// runs from the box the drag STARTED on to the box it ended on, so the bet
// always travels forward along it and the money always travels backward.
var pipeSX = 0, pipeSY = 0, pipeEX = 0, pipeEY = 0, pipeDir = 1;
function transferPipeEnds(tr) {
  var o = tr.outcome, p = tr.player;
  if (tr.sell) {
    pipeSX = p.x + p.w * 0.5; pipeSY = p.y;
    pipeEX = o.x + o.w * 0.5; pipeEY = o.y + o.h;
    pipeDir = -1;
  } else {
    pipeSX = o.x + o.w * 0.5; pipeSY = o.y + o.h;
    pipeEX = p.x + p.w * 0.5; pipeEY = p.y;
    pipeDir = 1;
  }
}

// Arc length of the current pipe, sampled. Needed so squares move at a CONSTANT
// speed through the three legs of their journey instead of crawling along the
// short ones. Computed once per transfer per frame, not once per square.
function pipeLength() {
  var len = 0, ax = pipeSX, ay = pipeSY;
  for (var i = 1; i <= 8; i++) {
    pipePoint(pipeSX, pipeSY, pipeEX, pipeEY, pipeDir, i / 8);
    var dx = gx - ax, dy = gy - ay;
    len += Math.sqrt(dx * dx + dy * dy);
    ax = gx; ay = gy;
  }
  return len;
}

// One square running THROUGH the pipe: out of its start cell to the near mouth,
// along the bezier, then out of the far mouth to its end cell. Time is split
// between the three legs in proportion to their LENGTH, so the square keeps a
// steady pace rather than pausing at the mouths. `forward` = travelling from the
// pipe's start mouth to its finish mouth. Result into gx/gy.
function throughPipe(sx, sy, dx, dy, forward, plen, t) {
  var m1x = forward ? pipeSX : pipeEX, m1y = forward ? pipeSY : pipeEY;
  var m2x = forward ? pipeEX : pipeSX, m2y = forward ? pipeEY : pipeSY;

  var ix = m1x - sx, iy = m1y - sy;
  var ox = dx - m2x, oy = dy - m2y;
  var lin = Math.sqrt(ix * ix + iy * iy);
  var lout = Math.sqrt(ox * ox + oy * oy);
  var d = t * (lin + plen + lout);

  if (d <= lin) {
    var u = lin > 0 ? d / lin : 1;
    gx = sx + ix * u; gy = sy + iy * u;
  } else if (d <= lin + plen) {
    var v = (d - lin) / plen;
    pipePoint(pipeSX, pipeSY, pipeEX, pipeEY, pipeDir, forward ? v : 1 - v);
  } else {
    var w = lout > 0 ? (d - lin - plen) / lout : 1;
    gx = m2x + ox * w; gy = m2y + oy * w;
  }
}

// One square in flight, at (x,y) having just come from (px,py) — both top-left
// corners. Moving fast it is a segment as thick as the box is wide, drawn back
// along its own path; slow, it is the box itself. Caller must have set BOTH
// fillStyle and strokeStyle.
function drawFlyingSquare(x, y, px, py, w, h, r) {
  var dx = x - px, dy = y - py;
  var len = Math.sqrt(dx * dx + dy * dy);

  // The streak's thickness is the box's cross-section as seen from the direction
  // of travel: its height when moving sideways, its width when moving up or
  // down, blended in between. For square boxes this is just the box size.
  var thick = len > 0 ? (Math.abs(dx) * h + Math.abs(dy) * w) / len : h;

  if (len < thick * BLUR_MIN_FRAC) {
    roundRectPath(x, y, w, h, r);
    ctx.fill();
    return;
  }

  var maxLen = thick * BLUR_MAX_FRAC;
  if (len > maxLen) { var f = maxLen / len; dx *= f; dy *= f; }

  var hw = w * 0.5, hh = h * 0.5;   // the segment runs through the box's centre
  ctx.lineCap = 'round';
  ctx.lineWidth = thick;
  ctx.beginPath();
  ctx.moveTo(x - dx + hw, y - dy + hh);
  ctx.lineTo(x + hw, y + hh);
  ctx.stroke();
}

// Squares go through ONE BY ONE: square `i` of `n` sets off after the one before
// it, each still getting the same share of the flight. `k` is LINEAR progress —
// the queue is a real-time effect — and the returned local time is eased by the
// caller.
function staggeredT(k, i, n) {
  if (n <= 1) return k;
  var t = (k - (i / (n - 1)) * TRANSFER_STAGGER) / (1 - TRANSFER_STAGGER);
  return t < 0 ? 0 : (t > 1 ? 1 : t);
}

function drawTransferPipe(tr) {
  var e = (nowMs - tr.start) / TRANSFER_MS;
  if (e >= 1) return;

  transferPipeEnds(tr);
  if (e > PIPE_FADE_FRAC) ctx.globalAlpha = 1 - (e - PIPE_FADE_FRAC) / (1 - PIPE_FADE_FRAC);
  drawPipe(pipeSX, pipeSY, pipeEX, pipeEY, tr.sell ? tr.player.color : tr.outcome.color, pipeDir);
  ctx.globalAlpha = 1;
}

// Draws an outcome box: coloured rect + a white text field as a HEADER strip at
// the top (its label), which is `titleLines` lines tall — the same for every
// outcome, so they stay lined up. The body below is left free for the bet column
// (drawn separately by drawBetColumn). `focused`/`selected` extras only apply to
// the box being edited.
function drawOutcomeBox(b, x, y, w, h, focused, resolve) {
  roundRectPath(x, y, w, h, Math.round(h * 0.1));
  ctx.fillStyle = b.color;
  ctx.fill();
  if (focused) {
    ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  }

  var padX = w * 0.08;
  var fx = x + padX;
  var fw = w - 2 * padX;
  var fy = y + h * 0.06;
  var fh = h * headerHFrac;

  // The resolve button sits in the top-right corner; the header yields the room.
  // Only the big top boxes get one — mirrors inside players pass resolve=false.
  if (resolve) {
    resolveBtnRect(x, y, w, h);
    fw -= rbW + w * 0.02;
    roundRectPath(rbX, rbY, rbW, rbH, Math.round(rbH * 0.25));
    ctx.fillStyle = RESOLVE_COLOR;
    ctx.fill();
  }

  roundRectPath(fx, fy, fw, fh, Math.round(fh * 0.25));
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  if (b.lineCount === 1 && b.lines[0].length === 0) return;

  // The strip is always titleLines tall; a title needing fewer sits centred in
  // it, so a one-line name still looks centred next to a three-line one.
  var lineH = fh / titleLines;
  var top = fy + (titleLines - b.lineCount) * lineH * 0.5;
  var cx = fx + fw * 0.5;
  ctx.font = Math.round(h * titleFontFrac) + 'px sans-serif';

  for (var i = 0; i < b.lineCount; i++) {
    var line = b.lines[i];
    var cy = top + (i + 0.5) * lineH;
    if (focused && selected) {
      var tw = ctx.measureText(line).width;
      var hlW = Math.min(tw + 10, fw - 6);
      ctx.fillStyle = SELECTION_COLOR;
      ctx.fillRect(cx - hlW * 0.5, cy - lineH * 0.4, hlW, lineH * 0.8);
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#1a1a1a';
    }
    ctx.fillText(line, cx, cy);
  }
}

function drawTopBox(b) {
  var jx = shakeOffset(b.joltTime);
  if (jx !== 0) { ctx.save(); ctx.translate(jx, 0); }
  drawOutcomeBox(b, b.x, b.y, b.w, b.h, b === focusedBox, true);
  drawBetColumn(b);
  if (jx !== 0) ctx.restore();
}

// The bets (white squares) and, in front of them, the betBox outlines. Row `i`
// has b.betPrices[i] outlines, left-aligned; they never move. A bet is a run of
// `maxPrice` white squares at its current level (b.betLevel[j]), drawn first so
// the outlines frame it — where the two coincide the box reads as "filled in",
// and the tail of a bet past the row's outlines shows as bare white squares.
// Cells use the shared `unitW × unitH` so betBoxes are exactly money-sized.
function drawBetColumn(b) {
  var g = unitGap;
  var rows = numBetLevels;
  if (unitH <= 0.5 || unitW <= 0.5 || b.betCols <= 0) return;

  var stepX = unitW + g, stepY = unitH + g;
  var cellR = Math.min(unitH * 0.25, 3);
  var y0 = b.y + b.h * bodyTopFrac + g;   // just below the header from drawOutcomeBox
  var x0 = gridStartX(b.x, b.w);          // centred bet width; shorter runs left-justify to it

  // bets (white), behind — each is maxPrice cells wide at its own level.
  // A bet that has been bought is no longer alive here; it is either in flight
  // (drawn by its Transfer) or already sitting in the buyer's hand.
  // The inner box is inset by the SAME amount on every side, so the outline's
  // border reads uniformly thick however wide the boxes get.
  var bh = unitH * BET_SIZE_FRAC;
  var off = (unitH - bh) * 0.5;
  var bw = unitW - 2 * off;
  var betR = Math.min(bh * 0.25, 3);
  ctx.fillStyle = BET_COLOR;
  for (var j = 0; j < rows; j++) {
    if (!b.betAlive[j] || nowMs < b.betArrive[j]) continue; // a sold-back bet is still flying in
    var by = y0 + b.betLevel[j] * stepY + off;
    for (var c = 0; c < maxPrice; c++) {
      roundRectPath(x0 + c * stepX + off, by, bw, bh, betR);
      ctx.fill();
    }
  }

  // Money that has been paid for a bet, filling the row that bet vacated. It is
  // exactly `price` squares — the width of the row's outlines — so a sold level
  // reads as a solid paid-off bar. Hidden until it has finished flying in.
  ctx.fillStyle = MONEY_COLOR;
  for (var m = 0; m < rows; m++) {
    var held = b.moneyAt[m];
    if (held === 0 || nowMs < b.moneyArrive[m]) continue;
    var my = y0 + m * stepY + off;
    for (var mc = 0; mc < held; mc++) {   // left-justified, so it fills the row's outlines exactly
      roundRectPath(x0 + mc * stepX + off, my, bw, bh, betR);
      ctx.fill();
    }
  }

  // betBox outlines, in front — these stay put
  ctx.strokeStyle = BETBOX_COLOR;
  ctx.lineWidth = Math.max(1, unitH * BETBOX_STROKE_FRAC);
  for (var i = 0; i < rows; i++) {
    var price = b.betPrices[i];
    var y = y0 + i * stepY;
    for (var cc = 0; cc < price; cc++) {  // left-justified to the bet grid's edge
      roundRectPath(x0 + cc * stepX, y, unitW, unitH, cellR);
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

  computePlayerLayout(b);

  // REMOVED: the mini outcome mirrors that used to sit here. Held bets now pile
  // up in this band instead and identify their outcome by COLOUR, so the mirrors
  // are redundant. Kept commented in case they are ever wanted back — note it has
  // not been maintained since, and `drawOwnedBets` no longer exists.
  // for (var k = 0; k < topCount; k++) {
  //   drawOutcomeBox(plInnerX + k * (plMiniW + plMiniGap), plMiniY, plMiniW, plMiniH,
  //                  topBoxes[k].color, topBoxes[k].text, false, false);
  //   drawOwnedBets(b, k);
  // }

  drawMoneyGrid(b);
  drawHeldBets(b);

  if (jx !== 0) ctx.restore();
}

// The single pile of bets a player holds, ordered by outcome and drawn in each
// outcome's OWN colour — with the mirrors gone, colour is the only thing saying
// which outcome a bet belongs to. Each is a full maxPrice-wide row. Bets still in
// flight are skipped; their Transfer draws them. Assumes computePlayerLayout ran.
function drawHeldBets(p) {
  if (unitH <= 0.5) return;
  var total = pileTotal(p);
  if (total === 0) return;

  var bh = unitH * BET_SIZE_FRAC;
  var off = (unitH - bh) * 0.5;
  var bw = unitW - 2 * off;
  var r = Math.min(bh * 0.25, 3);

  var idx = 0;
  for (var oi = 0; oi < topCount; oi++) {
    var n = p.ownedCount[oi];
    var hidden = (resolving !== null && oi === resolvingIndex); // drawResolution owns those
    ctx.fillStyle = topBoxes[oi].color;
    for (var s = 0; s < n; s++, idx++) {
      if (hidden || idx >= pileRows) continue;   // overflow past a capped box
      if (nowMs < p.ownedArrive[oi * numBetLevels + s]) continue;
      for (var c = 0; c < maxPrice; c++) {
        handBetCellPos(p, oi, s, c);
        roundRectPath(gx + off, gy + off, bw, bh, r);
        ctx.fill();
      }
    }
  }
}

// Draws a player's `money` as filled boxes packed left-to-right. Uses the shared
// cell size so money is exactly betBox-sized, and `moneyCellPos()` so
// a coin in flight lands exactly where a static one would sit. Coins that have
// been spent are simply no longer in the count. Assumes computePlayerLayout ran.
function drawMoneyGrid(p) {
  // Coins from a sale are credited immediately but are still in the air. They
  // always land on the END of the pile, so the hidden part is always a suffix:
  // draw up to the earliest in-flight claim. Reading the pool (max 8) rather
  // than storing a pending range keeps concurrent sales correct, and a dropped
  // animation just reveals the coins early instead of losing them.
  var count = p.money;
  for (var f = 0; f < MAX_TRANSFERS; f++) {
    var ft = transfers[f];
    if (!ft.active || !ft.sell || ft.player !== p) continue;
    if (nowMs - ft.start >= TRANSFER_MS) continue;
    if (ft.coinFrom < count) count = ft.coinFrom;
  }
  if (count <= 0 || unitH <= 0.5 || plMoneyH <= 0) return;

  // If the box hit its cap the band holds fewer rows than the count needs.
  var fits = plMoneyRows * plMoneyCols;
  if (count > fits) count = fits;

  var r = Math.min(unitH * 0.22, 3);
  ctx.fillStyle = MONEY_COLOR;
  for (var i = 0; i < count; i++) {
    moneyCellPos(i);
    roundRectPath(gx, gy, unitW, unitH, r);
    ctx.fill();
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
    // A keystroke can change how many lines the titles need, which changes the
    // header height and so the whole bet grid. Relaying out per keystroke is
    // cheap and keeps everything consistent.
    layout();
    needsRender = true;
  }
}

function addOutcome() {
  if (topCount >= MAX_TOP) return;
  topBoxes[topCount].text = String.fromCharCode(65 + topCount); // 'C', 'D', ...
  topCount++;
  layout();
  updateCrowns();   // there is something to play for again — crowns come off
  needsRender = true;
  playBlip(880);
}

// ---------------------------------------------------------------------------
// Buying a bet — the core transaction
// ---------------------------------------------------------------------------

// The cheapest bet this outcome still holds: the one resting on the narrowest
// row, i.e. the GREATEST level. Returns its index, or -1 if the outcome is sold
// out. Scanning betLevel (rather than assuming bet j is on level j) keeps this
// correct once bets can move between levels.
function cheapestBet(b) {
  var best = -1, bestLevel = -1;
  for (var j = 0; j < numBetLevels; j++) {
    if (b.betAlive[j] && b.betLevel[j] > bestLevel) { bestLevel = b.betLevel[j]; best = j; }
  }
  return best;
}

// Move one bet from `outcome` down into `player`'s mirror, and simultaneously
// move exactly enough money the other way to pay for it. The price is the number
// of betBox outlines in the row the bet was resting on — which is also, exactly,
// how many money squares it takes to fill that row once the bet has left it.
function outcomeIndex(b) {
  for (var i = 0; i < topCount; i++) { if (topBoxes[i] === b) return i; }
  return 0;
}

function buyBet(outcome, player) {
  var j = cheapestBet(outcome);
  if (j < 0) { playBlip(160); return false; }                 // outcome is sold out

  var level = outcome.betLevel[j];
  var price = getBetPrice(level);
  if (player.money < price) { playBlip(120); return false; }  // can't afford it

  var tr = acquireTransfer();
  if (!tr) return false;

  var oi = outcomeIndex(outcome);
  var t = now();
  var arrive = t + TRANSFER_MS;
  var slot = player.ownedCount[oi];

  // Commit the whole transaction NOW, stamped with when each half becomes
  // visible. The state is therefore never half-applied; only the drawing waits.
  outcome.betAlive[j] = 0;
  outcome.moneyAt[level] = price;
  outcome.moneyArrive[level] = arrive;
  player.money -= price;
  player.ownedLevel[oi * numBetLevels + slot] = level;
  player.ownedArrive[oi * numBetLevels + slot] = arrive;
  player.ownedCount[oi] = slot + 1;

  tr.start = t;
  tr.sell = false;
  tr.outcome = outcome;
  tr.outcomeIndex = oi;
  tr.player = player;
  tr.level = level;
  tr.price = price;
  tr.betSlot = slot;
  // The departing coins are the ones just past those still in the grid, so they
  // fly out of the end of the pile. Concurrent purchases claim disjoint runs.
  tr.coinFrom = player.money;

  needsRender = true;
  return true;
}

// The exact inverse of buyBet: the player's bet goes back to the outcome and its
// price comes back as money. It is SOLD AT THE HIGHEST PRICE — the returning bet
// takes the widest row currently standing free, i.e. the lowest-index level, and
// that row's price is what the player is paid. With nothing to sell, nothing
// happens (same as an unaffordable buy or a sold-out outcome).
function sellBet(outcome, player) {
  var oi = outcomeIndex(outcome);
  var n = player.ownedCount[oi];
  if (n === 0) { playBlip(140); return false; }     // nothing to sell

  // A free row is one holding money, because its bet was bought. The lowest
  // index among those is the widest row, hence the highest price.
  var level = -1;
  for (var i = 0; i < numBetLevels; i++) { if (outcome.moneyAt[i] > 0) { level = i; break; } }
  if (level < 0) { playBlip(140); return false; }   // nowhere to put it back

  // The bet belonging to that row is the dead one recorded at that level.
  var j = -1;
  for (var b2 = 0; b2 < numBetLevels; b2++) {
    if (!outcome.betAlive[b2] && outcome.betLevel[b2] === level) { j = b2; break; }
  }
  if (j < 0) { playBlip(140); return false; }

  var tr = acquireTransfer();
  if (!tr) return false;

  var price = getBetPrice(level);
  var t = now();
  var slot = n - 1;                    // the top of the player's stack goes back

  // Commit now, stamped with when each half becomes visible — as with a buy.
  outcome.moneyAt[level] = 0;          // money leaves the row at once
  outcome.moneyArrive[level] = 0;
  outcome.betAlive[j] = 1;             // the bet is back in the outcome...
  outcome.betArrive[j] = t + TRANSFER_MS; // ...but only shows once it lands
  player.ownedCount[oi] = slot;        // it leaves the hand at once
  tr.coinFrom = player.money;          // the paid coins land on the end of the pile
  player.money += price;

  tr.start = t;
  tr.sell = true;
  tr.outcome = outcome;
  tr.outcomeIndex = oi;
  tr.player = player;
  tr.level = level;
  tr.price = price;
  tr.betSlot = slot;

  needsRender = true;
  return true;
}

// ---------------------------------------------------------------------------
// Pointer handling (multitouch — one Drag per pointerId)
// ---------------------------------------------------------------------------

var canvasLeft = 0, canvasTop = 0; // cached on resize (no scrolling page)
function canvasX(clientX) { return clientX - canvasLeft; }
function canvasY(clientY) { return clientY - canvasTop; }

function onPointerDown(pointerId, px, py) {
  ensureAudio();

  // While the resolve dialog is open it is MODAL — every pointer is swallowed
  // here and nothing on the board can be touched. An option closes it (choosing
  // has no effect on the game yet); so does a tap outside it. A tap on the
  // dialog itself but not on an option does nothing.
  if (resolveBox) {
    for (var ri = 0; ri < 3; ri++) {
      if (inRect(resolveRects[ri], px, py)) {
        var answered = resolveBox;
        closeResolve();
        if (ri === 0) startResolve(answered, true);        // Yes — bets pay out
        else if (ri === 1) startResolve(answered, false);  // No  — bets are lost
        else playBlip(660);                                // Still uncertain — nothing
        return;
      }
    }
    if (px < dlgX || px > dlgX + dlgW || py < dlgY || py > dlgY + dlgH) closeResolve();
    return;
  }

  // The board is inert while an outcome resolves — no buying a bet on something
  // that is in the middle of vanishing.
  if (resolving !== null) return;

  // Resolve buttons sit on top of their outcome, so they are tested first —
  // otherwise the box underneath would claim the touch and start a pipe.
  for (var rb = 0; rb < topCount; rb++) {
    var tb = topBoxes[rb];
    resolveBtnRect(tb.x, tb.y, tb.w, tb.h);
    if (px >= rbX && px <= rbX + rbW && py >= rbY && py <= rbY + rbH) {
      openResolve(tb);
      return;
    }
  }

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
    // The pipe itself is ephemeral, but the release trades — and the DIRECTION
    // of the drag decides which way: outcome → player BUYS, player → outcome
    // SELLS. Each sounds its own refusal and returns false if it can't proceed.
    if (dr.sourceIsTop) {
      if (buyBet(dr.sourceBox, dr.target)) playConnect();
    } else {
      if (sellBet(dr.target, dr.sourceBox)) playSell();
    }
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
  if (needsRender || activeDragCount > 0 || activeTransferCount > 0 ||
      resolving !== null || activeParticles > 0 || t < crownUntil ||
      t < joltUntil) render(t);
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
