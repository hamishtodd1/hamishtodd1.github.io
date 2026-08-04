# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Hot Takes is a browser-based party game for **phones and tablets**, played by **multiple users sharing a single device** (pass-and-play / hot-seat style — no networking). It has **sound effects**.

> The codebase is in its early stages — `index.html` + `main.js` are a working skeleton. Update this file as the architecture solidifies.

## Tech stack & hard constraints

These are deliberate, non-negotiable design rules. Respect them in every change:

- **Vanilla JavaScript only. No external dependencies** — no frameworks, no build step, no package manager, no bundler. Just one HTML file plus `.js` files loaded by it.
- **The entire page is a single `<canvas>` element.** All rendering happens on the canvas. There is **no scrolling at all** — the canvas fills the viewport and the layout adapts (e.g. the top boxes wrap onto more rows rather than scrolling off-screen).
- **Minimise DOM contact.** The only DOM elements are the canvas and the off-screen `<input>` (which exists solely to raise the mobile keyboard). Do no per-frame DOM reads/writes; cache anything from the DOM (e.g. the canvas rect is cached on resize, not read per pointer-move).
- **Strongly avoid runtime allocation.** Allocate up front; reuse objects, arrays, and buffers across frames. Do not create garbage in the game loop or any per-frame/per-event path (no `new` in hot paths, avoid array methods that allocate, reuse scratch objects). This is to prevent GC pauses on mobile.
- **Function length is not a concern** — functions may be as long as the task requires. Do not split functions purely for brevity.
- **Multitouch must work.** Several players share one device and may touch simultaneously. Use **Pointer Events** and handle each pointer independently — never assume a single active touch, and don't let one touch cancel another. `touch-action: none` (in `index.html`) is required so the browser doesn't steal touches for gestures.

## Files

- **`index.html`** — viewport meta (no zoom/scroll), the single `<canvas id="game">`, and one **off-screen `<input id="keyboard-capture">`**. CSS sets `touch-action: none` to kill browser gestures. Loads `manual.js` then `main.js`.
- **`manual.js`** — tunable game parameters and pricing logic, loaded **before** `main.js` so its symbols are plain globals. Holds `numBetLevels`, `getBetPrice(i)`, and `MONEY_PER_PLAYER` (starting cash). This is the file to edit when tweaking game numbers/rules.
- **`main.js`** — the whole game. Everything (boxes, canvas/ctx, audio) is allocated once at startup; the loop and handlers reuse it.

## Layout model

- Two kinds of **rectangles** (`Box` objects), none of which move:
  - **Top rectangles** — `editable` "outcomes", each owns a `text` string and a palette `color`. Tapping one edits its text.
  - **Bottom rectangles** — **players**: large rects that hold `money` and display scaled-down **mirrors of the top outcomes** inside them.
- `layout()` recomputes box positions **only on resize** (and when a box is added), never per frame. Active top boxes = `topCount` (pool size `MAX_TOP`); bottom boxes = `BOTTOM_COUNT`. The bottom row is tall (~0.42 of height) to fit money + mirrors; the top row is also tall (~0.30) to fit the bet grid.
- **Shared square unit:** money squares and betBoxes use one size, `unitSquare` (+ `unitGap`), computed in `layoutTop()` from the outcome box body height so the `numBetLevels`-tall bet grid just fits. Recomputed on resize; both `drawMoneyGrid()` and `drawBetColumn()` read it.

## Money & player contents

- **Money** = small outlined squares held by players, drawn at the shared `unitSquare` size (so money == betBox size). There are **no per-coin objects** — each player just has a `money` count, and `drawMoneyGrid()` packs that many outlined squares left-to-right into the area. This keeps "quite a few" coins allocation-free. Money is expected to **move between holders** later (mutate counts; if individual coin animation is ever needed, introduce a pooled coin array — do not allocate per coin per frame).
- **Outcome mirrors:** inside each player, the top outcomes are redrawn small via the shared `drawOutcomeBox()` so they update live as outcomes are edited/added. `drawOutcomeBox(x,y,w,h,color,text,focused)` is the single source of truth for an outcome's coloured box + header label — used by both the big top boxes (`drawTopBox`) and the mirrors (`drawPlayer`). The label is a white **header strip** at the top; the body below it is reserved for the bet column. (Mirrors currently show only the box + label, not the bet column.)

## Bets & betBoxes

**betBoxes are fixed outlines; bets are separate movable objects that sit behind them.** Keep these two independent — bets will move, outlines never do.

- Each outcome holds a **triangular grid of square betBox outlines**: one row per bet "level" (**`numBetLevels`** rows, declared in `manual.js`; currently 24), and **`getBetPrice(level)`** outlines in that row. So the number returned by `getBetPrice(i)` is a **count of betBoxes at level `i`** (it was once a width). Rows are **left-aligned**, giving a triangle that widens toward the pricier levels (level 0 = top = widest).
- **betBoxes are squares the same size as money** (the shared `unitSquare`, computed in `layoutTop()` so the grid fits the box body in *both* axes — `numBetLevels` rows down, a full `maxPrice`-wide bet across). They are **stroked outlines** (`BETBOX_COLOR`), not filled. `Box.betPrices[level]` holds the count per level; `Box.betCols` is the grid width in cells (≥ `maxPrice`).
- A **bet** is a horizontal run of **`maxPrice` white squares** (`BET_COLOR`), each the size of money, sitting at one level. There is **one bet per level per outcome**; `Box.betLevel[j]` is bet `j`'s current level (`Int16Array`, preallocated) and starts at `j`. Moving a bet = writing a new level into that array.
- **Z-order:** `drawBetColumn()` draws the white bets **first (behind)**, then the outlines **on top**. Where a white square and an outline coincide the box reads as **"filled in"**; the tail of a bet running past that row's outlines shows as **bare white squares**. That is why only some boxes look filled. Bets are inset slightly (`BET_SIZE_FRAC`) so they sit inside the outline stroke.

## Core interaction (the central mechanic)

The fundamental gesture is **dragging between a top box and a bottom box** to connect them with a "pipe". It works in either direction (top→bottom or bottom→top):

1. Put a finger down on a box and drag.
2. A **pipe** is drawn from the source box to the finger's current position. The pipe is **outlined in the source box's colour**.
3. While dragging, if the finger enters another box, the pipe **snaps to connect the two boxes** (source → target). The target box **vibrates very briefly** the moment the finger enters it (haptic + a small visual jolt).
4. The finger can leave and enter different boxes, re-targeting freely; the brief vibration fires again on each new entry.
5. On **release** (finger up): if over a valid target box, a **sound effect plays**. The pipe is **ephemeral** — it vanishes the instant the finger lifts (there is no persistent connection state).

How it's implemented in `main.js`:
- **Drag state** lives in a pre-allocated pool of `Drag` objects (`drags`, size `MAX_POINTERS`), one claimed per `pointerId` — multitouch-safe, no per-move allocation. `pointermove`/`pointerup` are bound on `window` so a drag keeps tracking past its start element.
- **Tap vs drag:** a pointer that moves less than `DRAG_THRESHOLD` is a tap (focuses a top box's text); beyond it becomes a pipe-drag (and dismisses text editing).
- **Pipes** are drawn by `drawPipe()` as a thick coloured outer stroke with the background "punched through" (hollow tube), in the **source** box's colour regardless of direction. Pipes render before boxes so anchor ends sit cleanly under the boxes.
- **Targeting:** `boxInOppositeRow()` only matches the row opposite the source. Entering a new target sets its `joltTime` (drives `shakeOffset` shake) and calls `navigator.vibrate(15)` (guarded — absent on iOS Safari, hence the visual shake).
- **Pipes are ephemeral** — there is no stored connection state. A pipe is only the live `Drag` visual; `releaseDrag()` ends it, so it disappears the moment the pointer lifts. Release over a valid target just plays `playConnect()` (rising sweep); release elsewhere cancels silently.
- The loop renders while `activeDragCount > 0` or `now() < joltUntil`, so live pipes and jolts animate without a dirty flag.

## How key pieces work

- **Text editing on a canvas:** canvas has no native input. Each editable top box draws an inner white **text field** (the "box within the box"). Tapping that field programmatically focuses the hidden `#keyboard-capture` input and calls `input.select()` — so the text is shown highlighted (`selected` flag) and the next keystroke **replaces it entirely**. The `input` event mirrors `input.value` into the focused box's `text` and clears `selected`; all text is **drawn on the canvas**, never shown via the input. Text is centred (`textAlign='center'`, `textBaseline='middle'`).
- **Adding outcomes:** top boxes are pooled (`topBoxes`, size `MAX_TOP=6`); `topCount` controls how many are active. The "Add Outcome" button activates the next pooled box (labels `A,B,C…`) — no allocation. Colours come from `TOP_COLORS` in order.
- **Top boxes wrap (narrow screens):** if the outcomes can't fit one row at `>= MIN_TOP_W`, `layoutTop()` flows them left-to-right and **wraps onto more rows** (the add button is the final flowed item) — each top box gets its own `x` AND `y`. The box height then shrinks so all rows fit in the space above the players (`topAvail`), so boxes never vanish. There is no horizontal scroll; hit-testing and pipe anchors use plain box coords.
- **Render-on-demand:** `frame()` runs every rAF but only calls `render()` when the `needsRender` dirty flag is set. Set `needsRender = true` after any state change instead of drawing directly.
- **DPI:** `resize()` sets the canvas backing store to `viewW*dpr × viewH*dpr` and applies a `setTransform(dpr,...)` so all drawing code works in CSS pixels.
- **Sound:** WebAudio only, no audio files. `audioCtx` is created lazily on first user gesture (`ensureAudio`) to satisfy mobile autoplay policy. `playBlip()` makes one-shot oscillator/gain nodes — acceptable since it fires on discrete actions, never per frame.

## Running & developing

- No build/test tooling. Open `index.html` in a browser to run.
- For mobile-accurate testing, serve over a local static server and open on a phone/tablet (or use browser device emulation). Add the exact command here once one is chosen.

## Targeting

- Design for **touch input** and varied phone/tablet screen sizes first. Handle device-pixel-ratio scaling for the canvas so rendering is crisp on high-DPI screens.
