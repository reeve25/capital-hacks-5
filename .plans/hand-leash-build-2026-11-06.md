# Hand leash build plan, Nov 6, 2026, about 19:15 PT

Nothing is built. No servo has pulled a hand yet. The only test so far: a floss tug reported as reading clearly (Reeve's answer at 18:50; who wore it, where it was tied and the force were not recorded).

Labels: **Read** (source page or PDF read), **Excerpt** (search excerpt only), **Live** (read from Amazon or a store site tonight), **Computed** (`tools/leash_geometry.py`, a model, not a measurement), **Reasoned** (my judgment, untested).

## The problem
A blind person walks into a place they have never been and needs to reach something specific, like a door, an empty chair or a counter. A cane finds what is on the ground right in front of them, but it does not say where the door is. A guide dog can help, but waits run months or more and only a small share of blind people use one (Excerpt, earlier research). A phone can talk, but speech ties up the hearing they rely on for traffic and people (Reasoned). Buzz bands exist, but they give a code to learn and remember, and a four-buzzer wrist guide already won prizes (Octaby, ClearVision, Read).

No blind person has told us any of this, and `USERS.md` is empty. Contact is parked for now (Reeve, Nov 6, about 19:10), so this stays our own reading.

## What it physically is
A rigid forearm bracer, about the size of a shin guard, holds two small servos. Thin bright lines run from the servos, past the wrist without touching it, to four points on a fingerless glove. A small hip pack holds the battery and controller. A phone worn on the chest sees the target.

How a person uses it:
1. Pull on the glove and bracer and clip the pack on. The target is 30 seconds or less.
2. Hold the arm out as if about to shake hands, and let the hand go floppy.
3. The hand tilts toward the target on its own. Nothing to decode.
4. Turn or walk until the hand comes back to straight, then keep going.
5. Push against it any time. Say "stop" and it goes slack.

The audience can watch the hand swing, which a buzz band can't show.

## Decisions for Reeve and Nathan
These change the product or the demo. Reeve decided D1 and D2 at about 19:23. D3 has a lean and stays open.

**D1. Hand pose. Decided: handshake pose.**

| Pose | Left/right cue uses | Stiffness, Nm/rad (Read, Formica 2012, 10 people) | Line tension, Computed | Tilt limit | Fits |
|---|---|---|---|---|---|
| Handshake, thumb up | Flexion and extension | 0.55 and 1.02 | 5-9 N, stiff wearer 6-12 N | ±20° | Stage: the whole hand swings like a compass needle, and weight doesn't fight it |
| Palm down | Radial and ulnar | 1.71 and 1.25 | 11-15 N, stiff wearer 15-20 N | Must stay under ±19° (mean radial range, Excerpt) | Looks like a dog lead, but with half the swing, and the relaxed hand droops |
| Arm hanging at the side | Flexion and extension | Same as handshake | Same | ±20° | Everyday walking, but harder to see from the judges' table |

The same hardware serves handshake and hanging, so they can try both on Saturday.

**D2. How many directions for Sunday. Decided: left/right first. Up/down comes only after the noon test passes.**
Walking to a door needs left/right only. Reaching for a cup on a table needs up/down too. Up is the weak direction: the relaxed hand's weight adds about 0.26 Nm against it (Reasoned from a remembered 0.6% of body mass), which is more than half of the Computed peak on the left/right axis.

**D3. Look. Lean: bright visible lines and a plain, honest bracer.** The visible hardware is what makes the demo legible. A cleaner shell is a Saturday afternoon job at most.

## Mechanical design (defaults, execution is mine to call)

### The main finding: the line needs a standoff at the wrist
Computed for the MG90S at 5 V (0.18 Nm, interpolated from the AZ-Delivery sheet, Read), with a 16 mm horn hole and 2 mm of slack:

| Case | Tilt | Tension, average | Tension, stiff wearer | Stall margin, average | Stall margin, stiff |
|---|---|---|---|---|---|
| Handshake, flexion, line held 45 mm off the wrist | 20.5° | 4.7 N | 6.1 N | 4.5x | 3.5x |
| Handshake, extension, line held 45 mm off the wrist | 20.5° | 8.6 N | 11.8 N | 2.5x | 1.8x |
| Handshake, extension, line lying on the wrist | 28° | 14.8 N | 20.3 N | 1.3x | **0.97x, stalls** |
| Palm down, radial | 21° | 15.2 N | 20.3 N | 1.4x | 1.04x |

Friction, muscle tone and any wrist stiffening beyond about 17° (where the Formica data stops) are not in the model, so treat the margins as optimistic. The scale test in the first issue replaces this model with real numbers.

Two things follow:
- Holding the line 45 mm off the wrist nearly halves the force and keeps the line off the skin.
- The MG90S should be enough in the handshake pose, so it stays the main servo. The stronger hobby-shop servo becomes the fallback, reversing the shopping list's earlier suggestion. No stronger micro servo showed an overnight window on Amazon (Live).

Useful side effect, Computed: the horn pulls hardest near the end of its swing, because the arm is nearly in line with the pull. So the servo is lightly loaded while holding a tilt, and horn radius alone caps how far the wrist can go.

### Forearm base
Job: stay put while pulled toward the wrist by up to 20 N, with the wrist fully free.

| Option | For | Against | Call |
|---|---|---|---|
| Youth soccer shin guard, hard shell with foam and vent holes | Pre-curved, padded, cheap, zip ties go through the holes | Fit unknown until tried | **Default** (Reasoned, not tried) |
| Archery arm guard | Made for a forearm, looks deliberate | May be flexible; stock unknown | Buy if rigid when pressed in the store |
| Stiff ruler or paint stick, foam and two straps | Free and instant | Ugly; rocks on the arm | Tonight's fallback |
| Wrist brace with a metal stay | Sold everywhere | Locks the wrist, which kills the product | Rejected |
| 3D print at StingerStudio | Clean fit | OneCard required (Read), and fabrication is outside the bar | Rejected for now |

How it stays on (Reasoned):
- The forearm narrows toward the wrist, so a strap there slides off under load. Put the elbow-side strap **just on the elbow side of the widest part of the forearm**, so the muscle bulge stops the base from sliding.
- Put non-slip shelf liner between foam and skin.
- Second strap about 100 mm toward the wrist. Stop the shell at least 40 mm short of the wrist crease.

### Servo mount
- Left/right servo sits on the thumb edge of the forearm (on top in the handshake pose), shaft pointing away from the arm, centered over the arm, 50-70 mm behind the crossbar.
- Set the servo to center in firmware **before** fitting the horn. Fit a double-arm horn so its arms point straight across the forearm. Use the screw. The same servo then pulls one line while letting the other out.
- Mount: heavy foam tape under the servo, then two zip ties around the body and through the shell holes. It must not rock when you pull on the horn by hand.
- Guard: a small plastic cup or food container zip-tied over the horn, with slots for the lines, so hair and sleeves can't reach it. Required before anyone but Reeve and Nathan wears it.
- Up/down servo (only after noon) lies on the back-of-hand side, shaft pointing outward, using the 10 mm horn hole. Its arms point up and down.

Two unknowns to check when the servos arrive: whether horns are in the box (the listing doesn't say, Live), and real travel, because the datasheet says "Maximum Angle of Rotation 90°" while sellers say 180° (Read). If travel is only ±45°, move to a longer horn hole.

### Line routing

```
Looking down from above, handshake pose: thumb on top, palm facing sideways.

 elbow                     back-of-hand side                            fingers
                                   o  guide ring on the crossbar end
                       line A   .-'|`-._
  strap     .-----------------'    |     `-._   snap + weak link
   ||   horn tip A                 |         `---o  D-ring, back of hand
 ==||==[ servo ]==[ base shell ]===|==(wrist)==[  glove  ]====
   ||   horn tip B                 |         .---o  D-ring, palm
            `-----------------.    |     .-'
                       line B   `-.|_.-'
                                   o  guide ring on the crossbar end
                           palm side

             |<--50-70 mm-->|<-50 mm->|<--60 mm-->|
             servo to bar    bar to    wrist to
                             wrist     anchor
```

- **Standoff, tonight: a crossbar.** A paint stick or stiff ruler across the shell, 50 mm behind the wrist center, with a small split ring zip-tied 45 mm out from the center on each side. It takes five minutes. It sits slightly high, so the lines also lift the hand a little, which helps against droop (Reasoned).
- **Standoff, stage version option: an embroidery hoop collar.** A wooden hoop of about 4 inches, tied to the base. A hand passes through it, and it gives four guide points at true left, right, top and bottom, so up/down needs no rework. Light and cheap, with stiffness to be proven (Reasoned). Rejected: PVC coupling (too heavy, Reasoned).
- **Line:** 30 lb braid in hi-vis yellow or green. It barely stretches, so the hand responds at once. Rubber bands in series are rejected: at these forces they would stretch more than the 16 mm of horn travel.
- **Order on each line:** horn hole, braid, guide ring, snap swivel, weak link, glove D-ring.
- **Fit between people:** tie a ladder of three small loops, 5 mm apart, at the glove end of each weak link and clip the swivel to the loop that leaves 2 mm of slack. Fine trim is a firmware center offset.

### Glove anchors
- Half-finger gym gloves in M and L, sold in pairs, so both hands are covered. **No wrist-wrap style:** a stiff wrap braces the wrist and defeats the product. The finger holes stop the glove from sliding back under pull, which is why a glove beats a strap around the palm (Reasoned).
- Back of hand: the middle of the hand, about one third of the way back from the middle knuckle.
- Palm: the center of the palm pad.
- Up/down, later: outer edge below the index knuckle, and outer edge below the pinky knuckle.
- Each anchor: a D-ring on a tab of webbing about 2.5 x 2 cm, sewn through both glove layers with heavy thread. At 20 N that is 4 N/cm² (Computed).
- Nothing attaches to a finger or the thumb, and no line ever forms a loop around any body part.

### On the body
- Controller, breadboard and batteries go in a small hip pack. One cable bundle runs up the arm, held by hook-and-loop at the upper arm and the elbow, with a zip tie at the bracer so a tug can't reach the connectors.
- Two power banks: one powers the ESP32 by USB-C, one powers the servos through the USB pigtail. Tie the grounds together. MG90S stall is 700 mA each (Read), and separating them keeps servo dips from resetting the ESP32 (Reasoned).

## Safety limits
Prototype limits from my reasoning, not medical clearance. The body limits are for robot contact on healthy adults (DGUV FP-430, Table 21, quasi-static, Read): arm nerve 90 N and 180 N/cm², forearm muscle 100 N and 190 N/cm², radial bone 110 N and 180 N/cm², thenar 130 N and 200 N/cm², back of hand 150 N and 200 N/cm², palm 190 N and 260 N/cm².

| Limit | Value | Why | Enforced by | Checked by |
|---|---|---|---|---|
| Normal line tension | 20 N or less | Under a quarter of the lowest force limit | Servo size, horn hole | Scale, per axis |
| Breakaway on every line | Breaks at 25-45 N; start with 8 lb mono (36 N on the label) | 30 lb braid holds about 130 N, more than that same limit, so a door-handle snag could hurt. The servo can reach about 44 N at its horn limit (Computed) | Sacrificial link | Scale: break 5 samples |
| Line on skin | Never | 20 N through a 0.3 mm line is about 667 N/cm², more than 3x the lowest pressure limit (Computed) | Standoff, guide rings | Look at full tilt each way |
| Left/right tilt | ±21° at the 16 mm hole | Inside mean flexion 74° and extension 66° (Excerpt) | Horn radius first, then firmware | Phone photo at full travel |
| Up/down tilt | ±13° at the 10 mm hole | Inside mean radial 19° and ulnar 28° (Excerpt) | Same | Same |
| Horn angle | ±75° from center | Avoids the lockup point | Firmware clamp | Self-check |
| Speed | Full tilt takes 0.5 s or more | No startle or jerk (Reasoned) | Firmware ramp | Timed on video |
| Power-up | Lines unclipped until the servo is centered | Servos jump on first pulse | Preflight step | Checklist |
| Hold | 8 s, then 1 s slack; retune after the heat test | Heat from a stalled wearer (Reasoned) | Firmware | 10-minute heat test |
| Lost signal | Over 500 ms with no command: go to center | Never hold a pull on stale data | Firmware watchdog | Unplug test |
| Stop | Say "stop": operator key and USB pull. Wearer: yank breaks the links. Glove and bracer off in 10 s with one hand | Wearer stays in control | Practice | Timed |
| Electrical | 5 V USB only, nothing exposed on the wearer, no current on skin | | Pack layout | Look |
| Who | Adults who agree first. Not with wrist or hand injury, recent surgery, carpal tunnel, arthritis or pain. Rings, watch and bracelets off, hair and sleeves clear | Consent is per person (CLAUDE.md) | Consent script | Each wearer |
| Blindfolded walking | Spotter within arm's reach, clear floor, no stairs | | Demo layout | Each run |
| Hygiene | Wipe glove and mask between wearers | | Kit | Each wearer |

## What could break a live demo, worst first (Reasoned)
1. A Dupont connector shakes loose. Tape every joint, keep the breadboard in the pack, strain-relieve at the bracer.
2. A power bank sleeps because the servo side draws too little at idle. Run the soak test. Fix: one bank for both with a capacitor, or a small dummy load.
3. The base slides toward the wrist and the lines go slack. Strap placement and liner; mark the arm and measure after 20 cues.
4. Line length changes between judges. Ladder loops and firmware trim.
5. A judge can't relax. Coach "let it go floppy" and have them shake the hand out first.
6. Horn screw backs out or a gear strips. Spare servo and pre-tied line set in the kit.
7. Bluetooth fails in a crowded room. USB serial is the first link and stays as the fallback.

## Parts
**Your question: can things be picked up in person instead? Mostly no, and it matters less than we thought.** I found no store around Sacramento with confirmed ESP32 or MPU-6050 stock, and I called no one.

| Place | What it could cover | Open | Status |
|---|---|---|---|
| R/C Country Hobbies, 9500 Micron Ave, 916-731-5868 | Servos | Closed for today at 6:30. Sat 10-5, Sun closed (Read, its site) | Servos not stated: "parts from most of the hobby quality brands" |
| Fast Track Hobbies, 4420 Granite Dr, Rocklin, 916-784-1722 | Servos | Closed for today at 7. Sat 10-7, Sun 10-5 (Read, its site) | Servos not stated |
| Sacramento Electronic Supply, 11470 Sunrise Gold Cir Ste 7, Rancho Cordova, 916-638-4821 | Wire, connectors, meters, tools | Hours not stated | Site shows no microcontrollers or capacitors (Read). Call |
| Micro Center Santa Clara | Everything, likely | Rough hours about 10-9 | About 2 hours each way. Can't be back by noon Saturday if it opens at 10. Last resort |
| StingerStudio, Sac State library | "Arduino kits available" (Read) | Hours not read | OneCard required; loan terms not stated. Ask an organizer or a Sac State student |
| Best Buy, Target, Walmart electronics | Unknown | | Not checked, a search returned nothing useful |

**Ordered at about 19:23 with Reeve's yes: $110.24 with tax, from the gift card balance, to the account's default address.** Arrival times are Amazon's estimates; check Your Orders in the morning.

| Part | ASIN | Price | Estimated arrival | Needed by noon |
|---|---|---|---|---|
| Miuzei MG90S 5-pack. Replaced two Beffkkip 2-packs, which slipped to Sunday at quantity 2 | B0BWJ2CK9D | $15.99 | Sat 7-10 AM | Yes |
| ELEGOO ESP32 3-pack, USB-C, no cable included. The 3-hour option was gone at checkout | B0D8T53CQ5 | $19.99 | Sat 7-10 AM | Yes |
| Breadboard kit | B0GVD11LSS | $7.09 | Sat 7-10 AM | Yes |
| Power bank 2-pack | B0FT7S5W1L | $17.99 | Sat 7-10 AM | Yes |
| Servo extension leads, 15 cm per the checkout line; the servo's own lead is 175 mm (Read) | B09MNK7TFM | $6.59 | Sat 7-10 AM | Yes |
| USB pigtail 2-pack, 20 AWG, with spring connectors | B09FF883CX | $7.89 | Sat 7-10 AM | Yes |
| MPU-6050 5-pack, pre-soldered | B0FDKQQJ7Z | $16.99 | Sat, no time given | No, for tilt numbers |
| Vibration module 3-pack x1. Two packs slipped to Sunday; three modules cover a left/right comparison | B0D42FXJJJ | $9.14 | Sat, no time given | No |

Items total $101.67.

The Miuzei listing claims 2.0 kg/cm at 6 V, against 2.2 on the datasheet used above. If that holds, the Computed stall margins drop about 9%: extension becomes about 2.3x average and 1.6x stiff.

Lesson: quantity can change Amazon's window, and listing pages can disagree with checkout. Read the windows at checkout.

**Tonight in person** (one stop, Reasoned: a Walmart Supercenter; 6051 Florin Rd lists 6 AM-11 PM, Excerpt; stock not confirmed, so call or swap for Big 5, Dick's or Home Depot):
- Fishing aisle: 30 lb braid in hi-vis, **8 lb mono (new)**, small snap swivels, **small split rings (new)**, **fish or luggage scale (new, sets every number above)**.
- Half-finger gym gloves in M and L, no wrist wrap.
- **Youth soccer shin guard with vent holes (new)**, plus an archery arm guard if it is rigid when pressed.
- 1-inch hook-and-loop strap, heavy mounting tape, small zip ties, foam weatherstrip, **non-slip shelf liner (new)**, a paint stick or stiff ruler (new).
- Small D-rings, 1-inch webbing, heavy thread, needle, sharp scissors.
- Cheap multimeter, **USB-A to USB-C data cable if you don't have one**, electrical tape.
- **Small hip pack, sleep mask, antibacterial wipes, washable marker (new).**

Budget: Amazon came to $110.24. My guess for the in-person list is $80-130, no prices read, so the total lands around $190-240 against the $50-200 bar. To stay under, buy one glove size first and skip the archery guard unless the shin guard fails. Holding or lifting the cap is Reeve's call.

## Timeline
| When | What |
|---|---|
| Tonight | Store run. Scale test. Build glove and base with no motor. Write firmware and its laptop test without a board |
| Sat 07:00-10:00 | Parts arrive (Amazon's estimate). Flash firmware, sweep servos unloaded, soak test |
| Sat 10:00 | Hobby shops open, only if a servo stalls or strips |
| Sat by 11:00 | First servo pull on a hand, in this order: Reeve or Nathan, own consent |
| **Sat 12:00** | **Blindfold test. Go or no-go is theirs** |
| Sat afternoon | Tracking, up/down if D2 says so, buzz comparison, mentors |
| Sat evening | Stage rehearsal, consent run-through, spares packed |
| Sun 09:00-11:00 | Preflight and submit (planning on 11:00; deadline unconfirmed) |

## Work split
Proposed lanes, not agreed: Nathan takes the physical build, which needs little code and is where the demo is won. Reeve takes firmware, tracking and integration. Swap anything by saying so.

| Issue | Task | Who | When |
|---|---|---|---|
| #13 | Store run; Amazon is done | Both | Tonight |
| #14 | Measure the pull with a scale | Nathan, Reeve wearing | Tonight, first |
| #15 | Glove and line sets | Nathan | Tonight |
| #16 | Forearm base | Nathan | Tonight, servo seated Saturday |
| #17 | Servo firmware with safety limits | Reeve | Code tonight, flash Saturday |
| #18 | Wiring and 30-minute soak test | Nathan, Reeve checks first power-on | Saturday morning |
| #19 | Noon blindfold test | Both | Saturday by 12:00 |
| #20 | Up and down | Nathan | After #19, if D2 says so |
| #21 | Pixel 8 tracking | Reeve | Saturday afternoon |
| #22 | Buzz band comparison | Nathan | Saturday afternoon |
| #23 | Safety card, consent script, preflight | Nathan, both sign off | Saturday afternoon |

Not in this plan: organizer details stay in #4, and user contact (#3) is parked.

## Run the numbers
`python tools/leash_geometry.py` prints the table above and runs its own checks. After the scale test, replace the stiffness and servo values and re-run it.

## Sources
- Formica et al., The passive stiffness of the wrist and forearm, J Neurophysiol 2012: https://pmc.ncbi.nlm.nih.gov/articles/PMC3424077/
- Pando et al., position-dependent wrist stiffness (radial stiffer than ulnar; linear model off 20-30%): https://asu.elsevierpure.com/en/publications/position-dependent-characterization-of-passive-wrist-stiffness/
- MG90S sheet: https://cdn.shopify.com/s/files/1/1509/1638/files/MG90S_Micro_Servo_Datenblatt_AZ-Delivery_Vertriebs_GmbH.pdf
- DGUV FP-430 final report, Table 21: https://www.dguv.de/projektdatenbank/0430/ab_18.12.2019_fp430_englisch.pdf
- Ryu et al. 1991, functional wrist motion, abstract only: https://mayoclinic.elsevierpure.com/en/publications/functional-ranges-of-motion-of-the-wrist-joint/
- Stores: https://www.rccountryhobbies.com/ , https://www.fasttrackhobbies.com , https://store.sacelec.com/ , https://library.csus.edu/makerspace , https://www.walmart.com/store/2464
