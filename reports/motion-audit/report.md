# Data Islands motion audit

Measured on 31 October 2026 against the uncommitted site, as a local production build (`vite preview`) in headless Chromium at 375, 768 and 1440 px, with and without reduced motion. Evidence marks: `local` measured here, `static` read from code. No hosted site was opened, and no product code changed. The reel is a simulation of proposals, not shipped behaviour.

## Storyboard (120 BPM, 8 bars, 16 s)

| Bar | Beat | Time | Moment | ID |
|---|---|---|---|---|
| 1 | 1-2 | 0.0 | Map of islands, cursor rests on one | |
| 1 | 3-4 | 1.0 | Press: the island travels to fill the page while the others fade | M3 |
| 1-2 | 4-6 | 1.5 | Icons land back to front, within about 0.65 s | M13 |
| 2 | 7-8 | 3.0 | Press +: the camera glides, and icons grow and share the island's bob | M2, M7 |
| 3 | 9-10 | 4.0 | Hover an icon: 120 ms lift | M9 |
| 3 | 11-12 | 5.0 | Press: pending ring while details load | M5 |
| 4-5 | 13-20 | 6.0 | Details rise from the icon, then return to it on Close | M4 |
| 6 | 21-23 | 10.0 | Drag follows the hand, release settles | M10 |
| 6 | 24 | 11.5 | Press a small icon: the camera flies towards it | M6 |
| 7 | 25-28 | 12.0 | Filter: rows fade, the panel keeps its height | M8 |
| 8 | 29-32 | 14.0 | Fit glides back, the island returns to the map | M2, M3 |

Beat times are spread for legibility. Real durations are in the proposals. M1, M11 and M12 fix defects with nothing to show.

## Top 10

Score = (frequency × visibility × meaning, each 1-3) ÷ cost (S=1, M=2, L=3).

| ID | Title | Class | Route | Impact | Cost | Score |
|---|---|---|---|---|---|---|
| M1 | Selecting during a slow load stacks modals and ignores Escape | Wrong motion | Island pages | 2×3×3 | S | 18 |
| M5 | No response between press and modal | Missing feedback | Island pages | 3×2×3 | S | 18 |
| M2 | Zoom and Fit jump on one frame | Dead swap | Island pages | 3×3×3 | M | 13.5 |
| M4 | Modal appears and vanishes on one frame | Blinking exit | Island pages | 3×3×3 | M | 13.5 |
| M6 | Small-icon tap jumps 2.56× at once | Dead swap | Island pages | 2×2×3 | S | 12 |
| M7 | Icons do not ride the island's bob | Broken continuity | Island pages | 3×2×2 | S | 12 |
| M11 | Font swap shifts the home page 40 px on phones | Layout jump | /, /owners | 3×2×2 | S | 12 |
| M3 | Map to island is a hard cut | Broken continuity | /, /owners | 3×3×3 | L | 9 |
| M13 | Icons arrive all at once | Loader without a handoff | Island pages | 3×3×2 | M | 9 |
| M8 | Filter swaps the list and moves the footer 1,098 px | Dead swap, layout jump | Island pages | 2×2×2 | S | 8 |

Also in the opportunities: M9 (6), M12 (6), M10 (4), M14 (4).

## Baseline

- **Vocabulary:** none. There are no duration or curve tokens, no motion tests, and no CSS transitions or keyframes on the site (`getAnimations()` read 0 at load, after zoom, hover, modal and filter).
- **Moving things:** the island's bob (±1.4 units) and cloud drift, from `IdleMotion.ts`, driven by the `PreviewStage` render loop.
- **Rules held:** the render loop stops under reduced motion and icon hover scale is removed. Measured: 0 WebGL draws per second when idle under reduced motion.
- **What reduced motion cannot reach:** nothing yet, because nothing else moves. Any new JS tween must check the preference itself.
- **Traversal:** SvelteKit client navigation with no view transitions. `document.startViewTransition` exists in the tested browser and is unused. The modal uses shallow routing with `preloadData` and `pushState`.

## Surface inventory

| Route | State | Current motion, measured | Seen | Mark |
|---|---|---|---|---|
| /, /owners | Load | Islands draw at about 0.25 s, no fade | Pop-in | local |
| /, /owners | 375 px load | Layout shift 0.03: list and notes move 40 px at about 25-48 ms | Font swap rewraps text | local |
| / | Hover sign | Colour change on one frame | Abrupt, minor | local |
| / to island | Navigate | Hard cut, 0.36 s to icons | Identity of the island lost | local |
| Island | Load | Icons at 0.22-0.30 s, all in one frame | Pop-in | local |
| Island | Zoom button | Width 1344 to 2150 on one frame | Dead swap | local |
| Island | Fit | Width 2150 to 1344 on one frame | Dead swap | local |
| Island | Small-icon tap | Width 1344 to 3441 on one frame | Dead swap | local |
| Island | Drag | Follows pointer, stops dead on release | Correct, no inertia | local |
| Island | Icon hover | 30 to 40.5 px on one frame | Abrupt | local |
| Island | Modal, fast data | Opens and closes on one frame, focus returns correctly | No origin | local |
| Island | Modal, 1.5 s delay | No feedback; cursor and `aria-busy` unchanged | Looks broken | local |
| Island | Filter | List 32 to 7 rows, footer 2428 to 1330 px on one frame | Dead swap and jump | local |
| Island | Idle zoomed in | Bob moves island, icons fixed | Icons slide on ground | static, computed |
| All | Reduced motion | No draws when idle, zoom works | Correct | local |
| Broker page | Load | Up to 0.025 shift at some widths, 27 px on `p.muted` | Font swap | local |
| Sources | Load | No meaningful motion | Fine | local |

## Opportunities

### M1. Make the modal request interruptible
- **Location:** `open()` in `src/lib/components/IslandPage.svelte`, `BrokerDialog.svelte`.
- **Today (`local`, 1.5 s data delay):** Escape during the wait does nothing, then the modal opens anyway. Clicking A then B shows B, and one Escape reveals A. Clicking the same icon twice adds 2 history entries, and one Escape leaves it open.
- **Proposal:** keep one request token. A newer selection replaces it, and Escape, drag or navigation cancels it. Ignore stale results, and use `replaceState` when a modal is already open.
- **Communicates:** the latest choice is the one that counts.
- **Reduced motion:** same. **Other platforms:** none. **Cost:** S. **Risk:** history handling. **Verify:** repeat the three cases with delayed data, and add a test.

### M5. Answer the press
- **Today:** nothing changes during the wait (`local`).
- **Proposal:** after a 100 ms grace period, show a 2 px ring around the pressed icon (1 s linear rotation, `fast` fade), with `aria-busy`. It hands off to M4, and on failure it stops and full navigation follows.
- **Communicates:** this was received. **Reduced motion:** static ring, no rotation. **Cost:** S. **Verify:** delayed-data run.

### M2. Glide the camera
- **Location:** `IslandScene.svelte`. **Today:** one-frame steps (`local`).
- **Proposal:** animate zoom with a `camera` spring (response 0.35 s, zeta 1) in a rAF loop, keeping the zoom point fixed. Retarget from the current value and velocity on a new input. Wheel and pinch stay direct.
- **Communicates:** you are moving closer to the same place. **Interrupt:** any drag takes over at once. **Reduced motion:** instant. **Mechanism:** requires only `PanZoomView` values, so the stage needs a refresh each frame. **Cost:** M. **Risk:** large `.world` sizes; test at 8×. **Verify:** per-frame width sampling.

### M4. Details rise from the icon
- **Today:** one frame in, one frame out, no `getAnimations()` entries (`local`).
- **Proposal:** the pressed icon becomes the title icon, and the sheet scales from it (0.92 to 1 with fade, `travel`, about 220 ms), reversing on close. Use the View Transitions API with a unique name, or `@starting-style` on `dialog` as the fallback. The backdrop fades at `fast`.
- **Communicates:** this is that company. **Interrupt:** closing during opening reverses from the current value. **Reduced motion:** 120 ms fade only. **Cost:** M. **Risk:** a duplicate transition name cancels the transition, and a hidden document aborts it. **Verify:** sample `currentTime` through `finished`, with fast and slow data.

### M6. Fly to the small icon
- **Today:** a 2.56× jump on one frame (`local`). **Proposal:** use the M2 camera, with target centred on the icon. **Communicates:** where you are heading. **Reduced motion:** instant. **Cost:** S after M2.

### M7. One pose for island and icons
- **Today (`static`, computed from `idlePose` and framing):** bob moves the island about ±4 px at Fit, and about ±33 px at 8× on People search, while icons stay fixed. **Proposal:** apply the stage's pose to `.world` content as well, or stop the bob on island pages where icons are the point. I'd share the pose; holding still at high zoom is the fallback. **Reduced motion:** no pose. **Cost:** S; needs an accessor on the stage. **Verify:** track an icon against a marked terrace point.

### M11. Stop the font shift
- **Today:** 0.03 layout shift at 375 px, shared cause on / and /owners (`local`). Happens under reduced motion too. **Proposal:** preload the two fonts and use a metric-matched fallback. No animation. **Communicates:** nothing, which is the point. **Cost:** S. **Verify:** probe at 375 px, including a 1600 px tall viewport.

### M3. Map to island continuity
- **Today:** hard cut (`local`). **Proposal:** a view transition with the selected island as the shared element, others fading at `fast`, about 300 ms. Island and page have separate WebGL scenes, so capture the canvas cell or render the page's scene before swapping. **Communicates:** you went into this island. **Reduced motion:** cross-fade 120 ms. **Cost:** L. **Risk:** canvas snapshots and one-frame blanks; prototype first. **Verify:** frame sampling at midpoints, both directions.

### M13. Icons land
- **Today:** all at once at about 0.3 s (`local`). **Proposal:** fade and 8 px settle, back to front, whole group within 500 ms (shorter step on big islands), first arrival on the page only. **Communicates:** these companies live here. **Interrupt:** any input completes it at once. **Reduced motion:** appear immediately. **Cost:** M.

### M8. Filter without the jump
- **Today:** dead swap and a 1,098 px footer jump (`local`). **Proposal:** hold the list's minimum height while a query is active, and fade results at `fast`. No per-row reorder animation at this list length. **Reduced motion:** no fade. **Cost:** S.

### M9. Hover at `fast`. Icon scale and sign colour at 120 ms ease-out. Reduced motion keeps colour, drops scale. Score 6, cost S.
### M12. Pause when nothing is visible. The loop draws at full rate behind the modal (240 draws/s on an island, 960 on the home page, `local`). Pause while a dialog is open and when no cell is visible. Score 6, cost S.
### M10. Drag release. Add light inertia, ending at the world's edge without overshoot. The drag itself must keep following the hand exactly. Score 4, cost M.
### M14. Keyboard focus. Tabbing re-centres the map on one frame (`static`). Use the M2 camera. Reduced motion instant. Score 4, cost S.

## Vocabulary proposals

No other platform exists, so nothing needs mirroring.

- `--motion-fast` 120 ms, ease-out `cubic-bezier(.2,.7,.2,1)`: hover, fades. Replaces one-frame swaps. Reduced motion keeps colour and opacity changes only.
- `--motion-travel` 220 ms, same curve: modal. Reduced motion becomes `fast` fade.
- `camera` spring, response 0.35 s, zeta 1, in JS: zoom and fly-to. Reduced motion is instant, checked in the helper, because a CSS rule cannot reach it.
- `settle` 8 px plus fade: icons landing only.
- Add a test asserting that one helper reads the reduced-motion preference for all JS motion.

## Do not animate

- Owner names, source links and confidence: these replace on one frame or fade. Facts are not revealed for effect.
- Broker, owner and placement counts: never count up, because they'd pass through false values and look like growth.
- Sensitive data lists: no emphasis or stagger.
- Focus rings: state, not motion.
- Drag and pinch: exact tracking, with no smoothing while held.
- Opt-out links: no celebration around leaving for one.
- No bounce, particles or glows, and no extra idle motion beyond the existing bob and clouds.

## Unknowns

- Real frame rates. Headless WebGL ran on a software renderer, and draw counts show loop rates, not device performance. Cost at 8× on a phone is unmeasured.
- Real touch and pinch, and screen-reader announcements for M5.
- M7's drift is computed, not filmed. Verify it in a browser before fixing.
- An earlier report of islands appearing slowly did not reproduce here: first draw was about 0.25 s. It was seen in the embedded browser pane, which can throttle rendering. Check on a real device.
- Slow connections beyond the injected 1.5 s data delay, and first-load font and JS timings on real networks.

## Build results

All 14 proposals were built and re-measured in headless Chromium on the production build. Product changes are uncommitted in the working checkout. A reduced-motion check covered idle drawing, landing, zoom and the modal.

| ID | Before | After |
|---|---|---|
| M1 | Escape ignored; A then B and a double press stacked modals | Escape cancels, newest selection wins, one Escape closes |
| M2 | One-frame zoom and Fit | 37 sampled widths, no overshoot; a second press retargets smoothly |
| M3 | Hard cut | Island travels as a shared element for 300 ms, both ways; other content fades |
| M4 | One frame each way | Icon flies to the title and back over 220 ms; sheet scales from it; focus returns |
| M5 | No response | Ring after 100 ms, with `aria-busy` |
| M6 | One-frame 2.56× jump | Glide, no modal opens |
| M7 | Icons drift from terrain | Icons share the island's pose; checked in frames at high zoom |
| M8 | Footer jumps 1,098 px | Footer does not move while filtering |
| M9 | One-frame hover | Icon and sign change over 120 ms |
| M10 | Stops dead | Inertia after a throw, none after a pause or under reduced motion |
| M11 | Up to 0.03 shift on phones | 0 on tested routes, using preloaded fonts and sized fallbacks |
| M12 | 240 draws/s behind the modal | 0, resumes on close; also skips drawing when off screen |
| M13 | All at once | Back to front within 500 ms; any input completes it |
| M14 | One-frame focus jump | Keyboard focus glides; mouse clicks no longer re-centre |

**Built as proposed.** M3: the chosen island travels between the map and its page as a shared element, while the rest of the page fades. A zoomed island page, an off-screen cell or a direct landing falls back to the zoom through the clicked point. M4: a copy of the pressed icon flies to the title above the rising sheet and back on close, and closing mid-flight reverses it from where it has got to.

**Not verified.** Real touch and pinch, device frame rates at high zoom, and the 120 ms list fade while it runs (it was finished by the time it was sampled). The reduced-motion page transition was read from CSS, not filmed.
