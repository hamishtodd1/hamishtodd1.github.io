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
- **Multitouch must work.** Several players share one device and may touch simultaneously. Use **Pointer Events** and handle each pointer independently — never assume a single active touch, and don't let one touch cancel another. `touch-action: none` (in `index.html`) is required so the browser doesn't steal touches for gestures. **It must be on `#game` itself — `touch-action` does not inherit**, so declaring it only on `body` leaves the canvas at `auto` and the browser claims the second finger as a pinch, firing `pointercancel` on the live drags. Neither the viewport meta (iOS ignores `user-scalable=no`) nor `preventDefault()` on `pointerdown` substitutes for it.

## Files

- **`index.html`** — viewport meta (no zoom/scroll), the single `<canvas id="game">`, and one **hidden `<input id="keyboard-capture">`** (1px, `opacity: 0.01`, `z-index: -1`, parked at the top-left *inside* the viewport and covered by the canvas — off-screen would make iOS scroll to reveal it on focus, shifting the page and invalidating the cached canvas rect; `font-size: 16px` stops iOS auto-zooming on focus for the same reason). CSS sets `touch-action: none` on `#game` to kill browser gestures. Loads `manual.js` then `main.js`.
- **`manual.js`** — tunable game parameters and pricing logic, loaded **before** `main.js` so its symbols are plain globals. Holds `numBetLevels`, `getBetPrice(i)`, and `MONEY_PER_PLAYER` (starting cash). This is the file to edit when tweaking game numbers/rules.
- **`main.js`** — the whole game. Everything (boxes, canvas/ctx, audio) is allocated once at startup; the loop and handlers reuse it.

## Layout model

- Two kinds of **rectangles** (`Box` objects), none of which move:
  - **Top rectangles** — `editable` "outcomes", each owns a `text` string and a palette `color`, and is **outlined** (`OUTCOME_OUTLINE`). Tapping one edits its text.
  - **Bottom rectangles** — **players**: large rects that hold `money` and display scaled-down **mirrors of the top outcomes** inside them.
- `layout()` recomputes box positions **only on resize** (and when a box is added), never per frame. Active top boxes = `topCount` (pool size `MAX_TOP`); bottom boxes = `BOTTOM_COUNT`. The bottom row is tall (~0.42 of height) to fit money + mirrors; the top row is also tall (~0.30) to fit the bet grid. Inside a player, **the mirrors sit at the BOTTOM** and the money grid fills the space above them (`computePlayerLayout()`).
- **Shared cell unit:** money boxes and betBoxes use one cell size, computed in `layoutTop()` so the `numBetLevels`-tall bet grid just fits the outcome box body in *both* axes. Cells are **rectangles**: `unitH` is the derived height and `unitW = unitH * boxWidthPerHeight` (a tunable in `manual.js`; **1 makes them square**). `unitGap` comes off the **height**, so the gap is identical in both axes and widening the boxes does not spread the grid apart vertically. The width constraint carries the ratio, so making boxes wider makes them shorter once width becomes the binding dimension. Recomputed on resize; `drawMoneyGrid()`, `drawBetColumn()` and every cell-position helper read them.
- **Inner boxes are inset by the same amount on all four sides** (derived from the height via `BET_SIZE_FRAC`), so an outline's border reads uniformly thick at any ratio. Consequence: the inner box's width is `unitH * (boxWidthPerHeight - (1 - BET_SIZE_FRAC))`, so **ratios below ~0.45 leave nothing inside the outline** and even 0.5 leaves only a sliver.

## Money & player contents

- **Money is stacked in GROUPS of `maxPrice` boxes** — the same shape as a bet — so a pile reads as "n bets' worth" at a glance. Groups sit side by side with a **wider gap between them** (`MONEY_GROUP_GAP` × `unitGap`) than between the boxes inside one, and wrap onto further rows; the block of them is centred like the bet grid. An amount that is not a multiple of `maxPrice` leaves **one short final group**. `moneyCellPos()` maps a flat money index through group → position-in-group → row.
- **Money** = small **filled banknote-green** squares (`MONEY_COLOR`, `#16A34A`). It is deliberately kept clear of `TOP_COLORS[3]` (`#3BA8A9`), the only other green-ish colour: that is a desaturated **teal** (hue 181°, sat 48%), this is a saturated **green** (hue 142°, sat 76%). They differ in hue, saturation and lightness because money also fills rows *inside* the outcome boxes and must stay legible sitting on that teal — helped by each square being framed by the heavy `BETBOX_COLOR` outline. If you retune either colour, keep that separation. Money is held by players and drawn at the shared cell size (so money == betBox size). There are **no per-coin objects** — each player just has a `money` count, and `drawMoneyGrid()` packs that many filled squares left-to-right into the area. This keeps "quite a few" coins allocation-free. Money is expected to **move between holders** later (mutate counts; if individual coin animation is ever needed, introduce a pooled coin array — do not allocate per coin per frame).
- Money is **not only held by players**: once spent it sits in the outcome, filling the row of the bet it paid for (`Box.moneyAt[level]`).
- **Outcome mirrors are GONE.** They used to sit inside each player. The call is kept commented out in `drawPlayer()` and is **allowed to rot** — it references `drawOwnedBets`, which no longer exists.
- Players sit **well apart**: `layoutRow()` takes an explicit `innerGap` (`margin * PLAYER_GAP_MULT`) that is wider than the screen margin, so the boxes are narrower than they used to be and read as clearly separate hands.
- **A player's box is sized by its contents.** `updatePlayerBoxes()` sets each player's `h` from the rows they actually hold — **bets on top, money along the bottom** — so the box grows taller as they gain money or bets and shrinks as they lose them. It is **anchored to the bottom of the screen**, so it grows *upward* and the money never shifts under a finger. Each player is sized independently, so their boxes differ in height. Bounded by `playerMinH` (they are drag targets and must stay reachable) and `playerMaxH` (never climb into the outcomes); when capped, `drawMoneyGrid()` and `drawHeldBets()` clip to the rows that fit.
- It is recomputed **every frame** from `render()`, not just in `layout()`, so it tracks trades and resolutions without every mutation having to remember to re-layout. `playerMoneySlots()` counts coins that have been *spent but are still in the air*, so the box does not snap shorter the instant a purchase is made and leave its own animation outside it.
- **Held bets form ONE pile at the top of the hand** (`drawHeldBets()`), with the money grid below it. The pile is **ordered by outcome**: every bet on outcome 0, then outcome 1, and so on — bet on yellow, then blue, then yellow and the pile reads **yellow-yellow-blue**. `pileTotal()`/`pileIndex()` turn `(outcome, slot)` into a position in that single ordering.
- **A held bet is drawn in its OUTCOME's colour.** With the mirrors gone, colour is the only thing identifying which outcome a bet belongs to. Bets stay **white inside the outcome box** (where they sit on a coloured background); a bet in flight wears the colour it will have **on arrival**.
- The pile is anchored to the **top** of the box and reads **downward**, so a bet's position depends only on its own index. It therefore does not move when the pile grows below it, and a bet being *sold* still resolves to the slot it was sitting in even though the count has already dropped — which is why `handBetCellPos()` needs no pile-height argument. Rows past `pileRows` are only clipped when the box has hit its cap. Because the ordering groups by outcome, **buying a bet on an earlier outcome shifts later ones down** — inherent to the grouping, not a bug.
- **A bet NEVER changes size.** It is `maxPrice` cells of `unitW × unitH` in the outcome, in the air, and in a player's hand — the flight animates position only. The pile is centred in the hand's full inner width, which is what finally makes this fit: the old mirrors were about a quarter of that and bets overflowed them in most layouts. `drawOutcomeBox(x,y,w,h,color,text,focused)` is the single source of truth for an outcome's coloured box + header label — used by both the big top boxes (`drawTopBox`) and the mirrors (`drawPlayer`). The label is a white **header strip** at the top; the body below it is reserved for the bet column. (Mirrors currently show only the box + label, not the bet column.)

## Bets & betBoxes

**betBoxes are fixed outlines; bets are separate movable objects that sit behind them.** Keep these two independent — bets will move, outlines never do.

- Each outcome holds a **triangular grid of square betBox outlines**: one row per bet "level" (**`numBetLevels`** rows, declared in `manual.js`; currently 24), and **`getBetPrice(level)`** outlines in that row. So the number returned by `getBetPrice(i)` is a **count of betBoxes at level `i`** (it was once a width). **The bet grid as a whole is horizontally CENTRED in the outcome box, and the price rows are LEFT-JUSTIFIED within it.** `gridStartX(bx, bw)` returns the one left edge everything shares: it centres a `maxPrice`-wide run, so bets (which are exactly that wide) come out centred, while the shorter runs — a level's price outlines, and the money that fills them — start at that same edge. The triangle therefore opens to the **right**, widening toward the pricier levels (level 0 = top = widest). There is no per-run alignment parameter; if you change where the grid sits, change `gridStartX()`.
- **Outline weight vs. contents are two ends of one dial.** `BETBOX_STROKE_FRAC` (outline thickness ÷ cell) and `BET_SIZE_FRAC` (bet/money square ÷ cell) must be changed together: the stroke is centred on the cell edge, so it eats `BETBOX_STROKE_FRAC` of the cell and `BET_SIZE_FRAC` must stay below `1 - BETBOX_STROKE_FRAC` or the squares sit *under* the outline instead of in it. The stroke also spreads half its width outward, so `BETBOX_STROKE_FRAC` must stay under `BET_GAP_RATIO` or neighbouring outlines touch.
- **betBoxes are the same size as money** (the shared `unitW × unitH`, computed in `layoutTop()` so the grid fits the box body in *both* axes — `numBetLevels` rows down, a full `maxPrice`-wide bet across). They are **stroked outlines** (`BETBOX_COLOR`), not filled. `Box.betPrices[level]` holds the count per level; `Box.betCols` is the grid width in cells (≥ `maxPrice`).
- **A bet is a ROW of boxes — always exactly `maxPrice` of them.** What varies is the row it sits on. **The number of betBox outlines in the row a bet occupies is that bet's PRICE.** So price is read off the *grid*, not off the bet: a bet resting on a wide row (near level 0) is expensive, one resting on a narrow row is cheap. Since a bet is always `maxPrice` wide but its row holds only `getBetPrice(level)` outlines, the bet overhangs its row by `maxPrice - price` squares — the filled-in part is what you pay, the bare white tail is what you'd get.
- A **bet** is a horizontal run of **`maxPrice` white squares** (`BET_COLOR`), each the size of money, sitting at one level. There is **one bet per level per outcome**; `Box.betLevel[j]` is bet `j`'s current level (`Int16Array`, preallocated) and starts at `j`. Moving a bet = writing a new level into that array.
- **Z-order:** `drawBetColumn()` draws the white bets **first (behind)**, then the outlines **on top**. Where a white square and an outline coincide the box reads as **"filled in"**; the tail of a bet running past that row's outlines shows as **bare white squares**. That is why only some boxes look filled. Bets are inset slightly (`BET_SIZE_FRAC`) so they sit inside the outline stroke.

## Core interaction (the central mechanic)

The fundamental gesture is **dragging between a top box and a bottom box** to connect them with a "pipe". It works in either direction (top→bottom or bottom→top):

1. Put a finger down on a box and drag.
2. A **pipe** is drawn from the source box to the finger's current position. The pipe is **outlined in the source box's colour**.
3. While dragging, if the finger enters another box, the pipe **snaps to connect the two boxes** (source → target). The target box **vibrates very briefly** the moment the finger enters it (haptic + a small visual jolt).
4. The finger can leave and enter different boxes, re-targeting freely; the brief vibration fires again on each new entry.
5. On **release** (finger up): if over a valid target box, **the player buys a bet** (see "Buying a bet" below) and a **sound effect plays**. The pipe is **ephemeral** — it vanishes the instant the finger lifts (there is no persistent connection state).

How it's implemented in `main.js`:
- **Drag state** lives in a pre-allocated pool of `Drag` objects (`drags`, size `MAX_POINTERS`), one claimed per `pointerId` — multitouch-safe, no per-move allocation. `pointermove`/`pointerup` are bound on `window` so a drag keeps tracking past its start element.
- **Tap vs drag:** a pointer that moves less than `DRAG_THRESHOLD` is a tap (focuses a top box's text); beyond it becomes a pipe-drag (and dismisses text editing).
- **Pipes** are drawn by `drawPipe()` as a thick coloured outer stroke with the background "punched through" (hollow tube), in the **source** box's colour regardless of direction. Pipes render before boxes so anchor ends sit cleanly under the boxes.
- **Pipes are cubic beziers.** The control points are pulled straight out of both ends (`pipePull()`), so a pipe leaves its source box and enters its target perpendicular to their edges. `dir` is `+1` when it sets off downward (source is an outcome) and `-1` upward (source is a player). `PIPE_CURVE` / `PIPE_CURVE_MIN` tune it.
- **Squares go THROUGH the pipe, one by one.** `throughPipe()` gives each square a three-leg journey: out of its cell to the near mouth, **along the pipe's actual bezier**, then out of the far mouth to its destination cell. While in the pipe a square sits exactly on the centreline (deviation 0.0000px). Time is divided between the legs in proportion to their **length** (`pipeLength()` samples the arc once per transfer per frame), so a square keeps a steady pace instead of crawling along the short legs.
- The **bet always runs the pipe forward** and the **money always backward** — the pipe is drawn from whichever box the drag began on, which is where the bet comes from in both directions, so the counterpayment necessarily passes it going the other way inside the same tube.
- **Squares in flight are motion-blurred**: `drawFlyingSquare()` draws them not as boxes but as **line segments as thick as the box is wide**, streaked back along the path they just took. The trail is sampled over `BLUR_TRAIL_MS` of *real* time (converted into the square's local clock), so it lengthens and shortens by itself with the easing — a square at rest, or queued, falls back to being a box. Length is capped at `BLUR_MAX_FRAC` × **that square's own size**, which matters because money changes size mid-flight while bets never do.
- `TRANSFER_STAGGER` is the share of the flight spent queueing squares in, so they enter **one at a time** rather than as a clump. Stagger is applied to *linear* progress (it is a real-time queue); each square's own local time is then eased.
- The legs inside the boxes are straight, and for a **bet** the in-hand leg is long — the pile is at the bottom of the hand while the pipe ends at its top — so a bet spends only ~40% of its journey in the pipe against the money's ~53%. That asymmetry is geometric, not a bug.
- **Players do not have to be hit exactly.** `playerAt()` treats the whole lower part of the screen — everything below the top of the **tallest** player box — as belonging to the players, and picks whichever box the point is **nearest** to (`rectDist2`, 0 inside). This applies both to landing a drag and to starting one, so a press anywhere in that zone begins a drag from the nearest hand. The boxes are narrow and change height constantly, which made exact hits fiddly. **Outcomes still require a direct hit.**
- **Targeting:** `boxInOppositeRow()` only matches the row opposite the source. Entering a new target sets its `joltTime` (drives `shakeOffset` shake) and calls `navigator.vibrate(15)` (guarded — absent on iOS Safari, hence the visual shake).
- **A pipe outlives its finger, but only just.** There is still no stored connection state: the `Drag` ends on release as before. But if the release starts a trade, the pipe **stands for the length of the exchange** so the bet and money can be seen running along it, then fades out over the last `1 - PIPE_FADE_FRAC` of the flight. `drawTransferPipe()` recomputes it from the two boxes each frame rather than storing coordinates, so it stays correct across a resize mid-flight, and it uses the **source's** colour (the outcome on a buy, the player on a sale) so it reads as a continuation of the pipe the finger drew. Release that starts no trade cancels silently and the pipe goes at once.
- The loop renders while `activeDragCount > 0` or `now() < joltUntil`, so live pipes and jolts animate without a dirty flag.

## Trading (what a completed drag actually does)

**The direction of the drag decides the trade:**
- **outcome → player = BUY** (`buyBet`)
- **player → outcome = SELL** (`sellBet`)

Either way, if the trade can't proceed **nothing happens**: a low `playBlip()`, no transfer, no connect sound. That covers an unaffordable price, a sold-out outcome, and a player with nothing to sell.

### Buying

- **Which bet?** Always the **cheapest remaining** — the bet on the narrowest row, i.e. the greatest level. `cheapestBet()` scans `betLevel` for the highest level still `betAlive`, rather than assuming bet `j` sits on level `j`, so it stays correct once bets can move. Consequence: **each purchase of an outcome costs more than the last**, and the triangle fills with black money from its narrow end upward.
- **The swap.** The bet leaves the outcome and lands in the buyer's mirror of that outcome; simultaneously `price` money squares leave the player's grid and fill the row the bet vacated. Because price *is* that row's outline count, the money fits the row exactly — a sold level reads as a solid paid-off bar.
- **Refusals** — sold-out outcome or a player who can't afford the price: no transfer, a low `playBlip()`, and no `playConnect()`.
- **State layout.** Outcome: `betAlive[j]` (0 once bought), `betArrive[j]`, `moneyAt[level]`/`moneyArrive[level]`. Player: `money`, plus flat `MAX_TOP × numBetLevels` arrays `ownedCount[oi]`, `ownedLevel[]`, `ownedArrive[]` indexed `oi * numBetLevels + slot`. All preallocated; nothing grows.

### Selling

`sellBet(outcome, player)` is `buyBet` run backwards — the bet goes up out of the hand, the money comes down out of the row. The same `Transfer` drives it with `sell = true`, which swaps both flights' endpoints; there is no second animation path.

- **Sold at the highest price.** The returning bet takes the **widest row currently standing free** — the lowest-index level whose `moneyAt > 0`, i.e. a row whose bet was bought — and that row's price is what the player is paid. The player's **topmost** held bet is the one returned (bets are fungible, all `maxPrice` wide).
- **Invariant:** every level holds either a live bet or money, never both and never neither. So `alive + moneyRows === numBetLevels`, and total held bets across players `===` money rows. Worth asserting if this area is changed.
- **The market this creates:** a lone player's buy→sell round trip is exactly break-even. But because buying takes the *cheapest* row and selling pays the *highest vacated* row, an early buyer profits once others have bought in above them — e.g. P0 buys at 3, P1 then buys 8 bets, P0 sells for 5.
- **Visibility while a sale is in the air.** The bet leaves the hand at once (`ownedCount--`) and is already `betAlive` in the outcome, but hidden until `betArrive[j]`. The money is credited at once but the coins are still flying: since a credit always lands on the **end** of the pile, the hidden part is always a suffix, so `drawMoneyGrid()` reads the transfer pool (max 8) for the earliest in-flight claim rather than storing a pending range. That keeps concurrent sales correct, and a **dropped** animation reveals the coins early instead of losing them.

### Animating it without half-applied state

The transaction **commits in full at purchase time**. Each half is stamped with the time it should become *visible* (`moneyArrive`, `ownedArrive`); the static drawing simply skips an item until `nowMs` passes that stamp, and a pooled `Transfer` draws it travelling in the meantime. So game state is never mid-flight, and several purchases can be in the air at once (multitouch) without interfering. `Transfer` carries animation only — retiring one changes nothing. `TRANSFER_MS` is the duration; the loop keeps rendering while `activeTransferCount > 0`.

**Cell geometry is shared.** `betCellPos()`, `moneyCellPos()` and `mirrorBetCellPos()` (fed by `computePlayerLayout()`) are the single source of truth for where a square sits, used by **both** the static drawing and the flight endpoints — so nothing can jump on landing. They return via the scratch globals `gx`/`gy` instead of an object, so calling them per square per frame allocates nothing. If you change a grid's position, change it there.

## Resolving an outcome

Every outcome has a **resolve button** in its **top-right corner** — a **`⚖️` balance-scales emoji** (`RESOLVE_EMOJI`), drawn bare with no plate behind it. Its *hit* rect is still the whole square `resolveBtnRect()` describes, so it stays as easy to tap as it looks. The header strip shrinks to make room for it. Only the big top boxes get one; mirrors pass `resolve=false` to `drawOutcomeBox()`. `resolveBtnRect()` is the shared geometry for drawing and hit-testing.

Tapping it opens a **modal** (`resolveBox` holds the outcome, or null):
- A **scrim** (`SCRIM_COLOR`) covers the whole board, dulling it.
- A dialog is drawn **in front of everything** (after the boxes *and* the in-flight transfers), filled with **that outcome's colour**. The question and the three options are white fields with dark text — the same idiom as an outcome's header — so they stay legible on every palette colour, from the bright yellow to the dark blues.
- It asks **"Did this outcome happen?"** with three options: **Yes / No / Still uncertain**.

What the three options do:
- **Still uncertain** — closes with no change. Identical to tapping outside.
- **Yes** — the bets players hold on that outcome **flash, take the colour of money, and fly into their owner's pile**. A bet is `maxPrice` boxes, so it becomes **`maxPrice` money**. Then the outcome disappears.
- **No** — the held bets **flash and fade away**, paying nothing. Then the outcome disappears.

"Disappears" means `removeOutcome()`: the outcome leaves the top row **and every player's hand**, the active boxes above it shift down, and each player's per-outcome holdings shift with them so the indices stay aligned. The freed pool slot is reset (`resetOutcome()`) ready for Add Outcome to reuse. `topCount` can legitimately reach **0** — `layoutTop()` and `computePlayerLayout()` guard the division.

**Economics worth knowing:** a winning bet pays `maxPrice` but cost only its row's price, so **Yes creates money**; the money that buyers paid into the outcome's rows vanishes with the box, so **No destroys it**. The bank is implicit — totals are not conserved. Unsold bets still sitting in the outcome just vanish with it; only *held* bets animate.

Timing (`startResolve` → `finishResolve`): `RESOLVE_FLASH_MS` pulsing in place, then `RESOLVE_MOVE_MS` flying or fading, then payout + removal. One `Payout` per held bet, from a pool sized `numBetLevels` — only one outcome resolves at a time and an outcome only ever has that many bets, so it cannot overflow. Unlike a purchase, **the money is credited at the END**, because a resolution is inherently a timed process that culminates in removing the outcome; `render()` settles a finished resolution *before* drawing so the frame that removes the outcome also shows the winnings. `drawOwnedBets()` suppresses the bets being resolved — `drawResolution()` owns them for the duration.

Interaction rules:
- While the dialog is open it is **modal**: `onPointerDown` swallows every pointer before anything else is tested, so no pipes, taps or text edits reach the board. Opening it also **drops any pipes other fingers are already holding** and dismisses text editing.
- **The board is inert while an outcome resolves** — you cannot buy a bet on something mid-vanish.
- Starting a resolution **drops any in-flight purchase animations**. Their state has already committed, so this is harmless, and it keeps about-to-be-stale outcome indices out of the resolution.
- **Tapping outside closes it with no change.** Tapping the dialog but not an option does nothing.
- `layoutResolveDialog()` runs on open and from `layout()` on resize — never per frame. The option hit rects (`resolveRects`) are preallocated.

## Crowns (winning)

When `topCount` reaches **0** — every outcome resolved away — there is nothing left to trade, so money can no longer move and the richest player has won. They get a **`👑` emoji** above their box. **Ties share it:** every player on the top score is crowned.

- `updateCrowns()` is called from `removeOutcome()` and `addOutcome()` — the only moments the answer can change. Adding an outcome takes the crowns back off.
- It is **idempotent**: an already-crowned player keeps their `crownTime`, so the pop doesn't restart.
- **The pop** is `popScale()` (easeOutBack) over `CROWN_POP_MS`, scaling from 0 through an overshoot of ~1.09 and settling at 1. It is genuinely zero-sized on its first frame — a crown legitimately does not render on the frame it is created.
- **Particles** (`emitCrownBurst`) come from a preallocated pool of `MAX_PARTICLES`. They are spread evenly around a circle with jitter so the burst reads as a ring, biased upward so it fountains, and **integrated from their launch time rather than stepped per frame** — frame-rate independent and drift-free. The loop stays awake via `activeParticles > 0 || t < crownUntil`.

## Outcome titles (multi-line)

A title **word-wraps to at most `TITLE_MAX_LINES` (3)**, and **every header is drawn at the same number of lines** — whatever the longest title needs (`titleLines`) — so the headers, and the bet grids below them, stay lined up across all outcomes. A title needing fewer lines is centred vertically in the strip.

- A taller header eats into the body, so the three lookup tables `TITLE_FONT_FRAC` / `TITLE_HEADER_FRAC` / `TITLE_BODY_TOP` (all fractions of **box height**, indexed by line count) shrink the font a little as lines are added and hand the rest to the bet grid. `bodyTopFrac` / `bodyHFrac` derive from them — **nothing may hardcode 0.29 or 0.65 any more**; `betCellPos()` and `drawBetColumn()` read `bodyTopFrac`.
- **Wrapping is cached**, not done per frame: `rewrapTitles()` fills each box's preallocated `lines[]`/`lineCount` and runs only from `layoutTop()`. `onInput()` calls `layout()` on each keystroke, since a keystroke can change the line count and therefore the whole grid.
- `fittedLineCount()` tries 1, 2 then 3 lines, **each at its own font size** (more lines = smaller text), and takes the first that genuinely fits. Then everything is re-wrapped at the final shared size so the breaks match the font actually used.
- Order in `layoutTop()` matters: box width/height first, **then** `rewrapTitles()`, **then** `unitH`. Box size does not depend on the titles, so there is no circularity — but the cell size does.
- Two overflow cases are **ellipsised** at wrap time: a single word wider than the field, and the last permitted line (which is where anything that will not fit gets crammed, so no words are ever silently dropped before that point).
- The **resolve button is capped at `RESOLVE_BTN_MAX_W` of the box width**. It is sized off the header height, and top boxes get narrow (they wrap at `MIN_TOP_W` on phones) — uncapped it took ~36% of the header and left the title almost nothing to wrap into.

## How key pieces work

- **Text editing on a canvas:** canvas has no native input. Each editable top box draws an inner white **text field** (the "box within the box"). Tapping that field programmatically focuses the hidden `#keyboard-capture` input and calls `input.select()` — so the text is shown highlighted (`selected` flag) and the next keystroke **replaces it entirely**. The `input` event mirrors `input.value` into the focused box's `text` and clears `selected`; all text is **drawn on the canvas**, never shown via the input. Text is centred (`textAlign='center'`, `textBaseline='middle'`).
- **Adding outcomes:** top boxes are pooled (`topBoxes`, size `MAX_TOP=6`); `topCount` controls how many are active. The "Add Outcome" button activates the next pooled box (labels `A,B,C…`) — no allocation. Colours come from `TOP_COLORS` in order.
- **Top boxes wrap (narrow screens):** if the outcomes can't fit one row at `>= MIN_TOP_W`, `layoutTop()` flows them left-to-right and **wraps onto more rows** (the add button is the final flowed item) — each top box gets its own `x` AND `y`. The box height then shrinks so all rows fit in the space above the players (`topAvail`), so boxes never vanish. There is no horizontal scroll; hit-testing and pipe anchors use plain box coords.
- **Render-on-demand:** `frame()` runs every rAF but only calls `render()` when the `needsRender` dirty flag is set. Set `needsRender = true` after any state change instead of drawing directly.
- **Background:** a vertical gradient (`BG_TOP` → `BG_BOTTOM`), darkest at the **bottom** so player boxes read as lighter panels on it while the vivid outcome colours still pop at the top. Built in `resize()` and cached in `bgGradient` — creating a gradient allocates, so never per frame. `render()` fills with it instead of `clearRect`. `index.html`'s body colour matches `BG_BOTTOM` so safe-area insets blend in.
- **DPI:** `resize()` sets the canvas backing store to `viewW*dpr × viewH*dpr` and applies a `setTransform(dpr,...)` so all drawing code works in CSS pixels.
- **Sound:** WebAudio only, no audio files. `audioCtx` is created lazily on first user gesture (`ensureAudio`) to satisfy mobile autoplay policy. `playBlip()` makes one-shot oscillator/gain nodes — acceptable since it fires on discrete actions, never per frame.

## Running & developing

- No build/test tooling. Open `index.html` in a browser to run.
- For mobile-accurate testing, serve over a local static server and open on a phone/tablet (or use browser device emulation). Add the exact command here once one is chosen.

## Targeting

- Design for **touch input** and varied phone/tablet screen sizes first. Handle device-pixel-ratio scaling for the canvas so rendering is crisp on high-DPI screens.
