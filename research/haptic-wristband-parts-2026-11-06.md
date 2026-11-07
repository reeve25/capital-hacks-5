# Haptic wristband: parts and actuator options, Nov 6, 2026, about 18:00 PT

Asked by Reeve and Nathan after liking Invisible Leash and reshaping it as a wristband. Nothing here has been built, tested or ordered. Evidence labels: **Read** (I read the page or PDF), **Excerpt** (search-result excerpt only; page blocked or unreachable), **Reasoned** (my inference), **Live** (read from Amazon at about 17:55 PT, signed in, account default address).

## Rival finding that decides the hardware
- **Octaby** (DubHacks '26, "SideShift: 1st Place"), Read: fabric wristband, 4 vibration motors "one for each cardinal direction", camera-based guidance of a blind user's hand to an object. iOS, ARKit, LiDAR. Its first version used servos pushing on the hand; dropped as bulky.
- **ClearVision** (DubHacks '25, "Best Freshman Beginner's Project", "MLH: Best Use of ElevenLabs"), Read: haptic wrist sleeve, 3 buzzers, Raspberry Pi, RealSense. A buzz on the left means an obstacle on the left.
- **Wayband**, shipped product, Excerpt: WearWorks, rebranded Haptic in January 2024. Bluetooth plus phone app navigation. Price sources conflict ($180, $249).
- Under the rival rule (same pitch plus a prize in about 2 years is dead), a four-buzzer wrist guide fails. Reeve and Nathan judge whether ClearVision's prizes count.
- Corpus scan of 54,057 Devpost names and taglines: only Octaby and ClearVision match wrist + haptic + blind + guidance. No real drag or pull project (3 false positives). Tagline scans have missed rivals before, and no different-vendor check has run, so this is not clearance.

## Three ways to make direction felt

### Buzz band: 4 coin motors
- Hong et al., GI 2016, Read: 20 blindfolded participants, 4 vs 8 motors. Eight reduced error by "only an extra two degrees"; apparent floor about 25 degrees. Speed unchanged. So buy four. Participants were blindfolded, not blind.
- Panëels 2013, Excerpt: people struggled to identify motor position on a wrist bracelet; rhythm and circular or alternating motion worked better.

### Drag band: 2 micro servos moving soft tips across the skin
- Skin Drag Displays, Ion, Wang and Baudisch, CHI 2015, Excerpt: about 24% error vs 43% for a vibrotactile array on the forearm, via a 2016 slide deck citing them. Patterns, not directions.
- Stanley and Kuchenbecker, IEEE ToH 2012, Excerpt: 10 tactile forms for wrist rotation; direction reaction was quickest when cue location or steady lateral skin stretch carried direction.
- Build, Reasoned: servo shaft perpendicular to skin, horn parallel to it, rubber tip on the horn end. One sweeps across the wrist, one along the forearm. Audible and bulkier than motors.

### Pull band: asymmetric vibration from voice coils
- Amemiya and Gomi, EuroHaptics 2014, Excerpt: thumb-sized vibrator, a 7 ms pulse at 40 Hz induces the sensation most clearly.
- Sabnis et al., TU Delft, Excerpt: 96% direction accuracy, arm movement about 14 ± 8 degrees per second, 19 participants, 40 Hz peak acceleration. Repository unreachable.
- WAVES, CHI 2017, Excerpt: pair of voice coils on a finger sleeve; 94.5% left vs right, attribution unclear between WAVES and a 2016 paper.
- Tanabe and Kaneko 2024, Excerpt: congruent illusory direction raised wrist angular velocity. I could not confirm whether the vibrator was worn at the wrist or held; DOAJ showed a Cloudflare check, not bypassed.
- **Biggest unknown:** the results I could see are fingertip, finger-sleeve or handheld. I found no comparison of wrist skin with fingertip. Reasoned: wrist skin may be weaker.
- **Parts problem, Live:** X-axis linear actuators (B0FJ5XZG7D, B0FJ5Y32GL) arrive Nov 25. Haptuator did not appear on Amazon. Dayton exciters arrive Saturday, but move perpendicular to their face (Reasoned: mount on edge for a sideways pull), and their resonance is unconfirmed (Reasoned: likely well above 40 Hz, so weak there). Dayton TT25-8 has the right 40 Hz resonance but is 3.5 inches across (Read), so not wrist-sized. DualSense voice coils arrive 5-8 AM at $74, handheld only; channels 3 and 4 route is community-documented only (Excerpt).

## Parts (Live prices before tax, Amazon)
"5-8 AM" is free Overnight on $25 of qualifying items, order within about 1 hr 19 min of 17:55. "Saturday" shows no time window, order within about 5 hr 19 min.

| Use | Part | ASIN | Price | Arrives | No-solder status |
|---|---|---|---|---|---|
| All | ESP32-S3 3-pack with USB-C cable | B0F8NDRQQK | $20.82 | Saturday | Listing: all pins pre-soldered |
| All | USB-A to Dupont cable, 5V from power bank to breadboard | B0D8XXQR1J | $6.99 | Saturday | Yes; check wire colors, pinout unread |
| All | Breadboard kit with jumpers | B0GVD11LSS | $7.09 | 5-8 AM | Yes |
| All | Miady 5000 mAh power bank 2-pack | B0FT7S5W1L | $17.99 | 5-8 AM | Yes |
| All | VELCRO elastic cinch straps | B09QT182R3 | $8.11 | 5-8 AM | Yes |
| All | MPU-6050 5-pack, pre-soldered | B0FDKQQJ7Z | $16.99 | Saturday | Listing says pre-soldered |
| Buzz | 3-pack 5V vibration module x2 | B0D42FXJJJ | $18.28 | Saturday | Listing image shows three header pins; 3.0-5.3V |
| Drag | SG90 servo 3-pack | B0G6R7ZZXH | $6.99 | Saturday | Yes; tips and mount are tape and zip ties |
| Pull | Dayton DAEX13CT-4 x2 | B00M291ZSI | $25.00 | Saturday | Has PCB solder points; use clip leads |
| Pull | DROK PAM8406 amp, 3.5 mm in, 5V | B077MKQJW2 | $9.99 | Saturday | Terminal type unconfirmed; clip leads |
| Pull | JSAUX USB-C to 3.5 mm | B07XYQ2ZKH | $6.99 | Tonight | Only if a laptop has no jack |
| Pull | WG-026 10 alligator clip leads | B06XX25HFX | $5.99 | Tonight | Yes |

Subtotals, corrected about 18:15: shared $77.99; with buzz $96.27; with drag $103.26; with pull $151.23. The three 5-8 AM items total $33.19; dropping the power banks leaves $15.20, under the $25 threshold. ELEGOO jumpers removed because the breadboard kit includes M-M, F-M and F-F wires.

Not picked: Adafruit DRV2605L (guide recommends soldering the motor; fixed address 0x5A needs a multiplexer on one bus). M5StickS3 B0GWHN8HK3, $31.90, 5-8 AM, watch-shaped, specs unread. DualSense would take the total over $200.

## Other findings
- Micro Center Santa Clara, 5201 Stevens Creek Blvd, is the closest (about 10 AM-9 PM; confirm hours and stock). Site says it carries Adafruit boards at some stores; no Santa Clara stock data found.
- StingerStudio Makerspace, University Library 1529, next to the Carlsen Center: 3D printers and a laser cutter; soldering unconfirmed; requires a Sac State OneCard.
- DigiKey Saturday delivery and cutoff not confirmed, not relied on.

## Saturday morning test (before the noon kill deadline)
Wear each on the wrist, blindfolded, and try random directions. For pull, play 7 ms pulses at 40 Hz through the amp, trying wrist, palm and fingertip. Pick by feel.

## Access notes
Amazon works in signed-in Chrome with same-origin fetch and DOMParser; JS results truncate around 1,000 characters, so slice. Devpost pages work with curl and a named agent. TU Delft repository refused connections. MPI bot check, Springer login and DOAJ Cloudflare blocked; not worked around.

## Re-check, about 18:15
- ESP32 listing image notes a "5V input configuration". From memory, boards like this can have a 5V pin that only takes power in unless a pad is soldered, so don't rely on it for servos (listing: 4.8-6.0V, 1.2-1.4 kg/cm). Run the breadboard from a power bank and tie grounds together.
- Power bank has USB-A and USB-C outputs, 5V/2.4A. Clip leads have clips on both ends. Servo horns not confirmed in the listing.
- Advisor estimates, not measurements: buzz works electrically about 90%; drag feels clear and comfortable by Saturday noon about 65%; these exciters give a convincing wrist pull about 25%.
- Phones: Reeve iPhone 15 Pro Max, Nathan Pixel 8. Laptops run Windows, so Pixel 8 is the default tracking phone. From memory: native iOS needs Xcode on a Mac; Safari on iOS lacked WebXR per a March 2025 forum thread, current status unconfirmed.
- Guide dogs: US schools commonly provide them free (Guiding Eyes, Guide Dogs of America), so the earlier "costly" wording is wrong for the user. Waits run months or more; usage estimates differ (2% to 5%). Training cost estimates $50,000-$60,000 are from secondary sources.
- Design note, from my reasoning: hold the drag tip off-center toward the target and return to center when on course, so there is no return stroke to cancel the cue. Limit servo range; test on ourselves first.

## Beyond signaling: methods that apply force, about 18:30
Asked by Reeve: how pull works and whether anything is better. Advisor lean, not a decision: hand leash. Nothing tested.
- **Hand leash, Reasoned:** two forearm servos pull thin lines to a fingerless glove, one servo for left/right and one for up/down, so a relaxed hand tilts toward the target and the wearer can resist. The audience can see it, unlike buzz, drag or pull. Closest research seen: a cable-driven hand guide (IEEE 2018, summary only). Estimate about 60% that it reads clearly by Saturday noon.
- **Steering belt (hanger reflex), Excerpt:** waist was most effective of head, waist and ankle (Kon et al. 2016); HangerON belt (SIGGRAPH 2017); walkers turn toward the induced rotation. Air balloons in the research device; no effect sizes found. Wrist: about 6 N produced rotation (Springer excerpt).
- **Muscle stimulation:** Cruise Control for Pedestrians, Excerpt: about 16 degrees per meter, 11 participants steered, a couple felt nothing. Haptic Marionette (SIGGRAPH Asia 2017), Read: hanger reflex for wrist twist, EMS for flexion and extension, 40 Hz, 200 microsecond pulses. Earlier note on Second Hand still applies: current on a judge needs organizer approval.
- **Shape-changing handheld:** Animotus, Excerpt: no significant difference between visually impaired and sighted users in a 2018 theatre study; the "200% faster than vibration" figure is the developer's own claim.
- **Rejected:** gyroscopes (99.3% direction identification in a handheld study, Read, but a heavy build), propellers (loud), current through the head (unsafe).
- **Rivals:** corpus names and taglines show 0 hanger reflex and no relevant string or tendon guidance projects; not clearance.
- **Cart change, Live about 18:30:** replace SG90 with MG90S 2-pack x2, B0CNL755KP, $17.98, 5-8 AM (torque not read); add SATINIOR fingerless gloves, B0796M3DL9, $5.99, 5-8 AM; dental floss or fishing line from a local store. Without pull parts: $120.24. With pull: $168.21.

## Sources
- https://digitalnature.slis.tsukuba.ac.jp/wp-content/uploads/2017/11/haptic_marionette_siggraph_asia_2017_preprint.pdf
- https://www.jstage.jst.go.jp/article/tvrsj/21/4/21_565/_article/-char/en
- https://history.siggraph.org/?p=65293
- https://sites.google.com/view/t-nakamura/projects/waisthanger
- https://link.springer.com/chapter/10.1007/978-4-431-55690-9_22
- https://www.medien.informatik.uni-muenchen.de/pubdb/publications/pub/pfeiffer2015chi/pfeiffer2015chi.pdf
- https://sites.google.com/view/adspiers/research/shape-changing-haptic-navigation-interfaces
- https://vufind.katalog.k.utb.cz/SummonRecord/FETCH-LOGICAL-i90t-8b7140cac42fc07f4386e1f07a829cc580ed0b921fce11332df1ed5a5b190d323
- https://www.guidingeyes.org/?p=253
- https://webarchive.library.unt.edu/eot2008/20090509001724/http:/www.guidedogsofamerica.org/faq.html
- https://www.guidedogs.ca/?p=6862
- https://www.inquirer.com/opinion/commentary/blind-visually-impaired-guide-service-dogs-20251221.html
- https://www.dogster.com/lifestyle/guide-dog-cost/
- https://devpost.com/software/octaby
- https://devpost.com/software/clearvision
- https://makeabilitylab.cs.washington.edu/media/publications/Hong_EvaluatingAngularAccuracyOfWristBasedHapticDirectionalGuidanceForHandMovement_GI2016.pdf
- https://hal-cea.archives-ouvertes.fr/cea-01841699
- https://bibtex.github.io/CHI-2015-IonWB.html
- https://people.cs.nycu.edu.tw/~liweichan/placeholders/project_slides/2016-uist-edgevib.pdf
- https://is.mpg.de/hi/publications/stanley12-th-guidance
- https://rd.springer.com/chapter/10.1007/978-3-662-44196-1_12
- https://repository.tudelft.nl/record/uuid:88e0f900-1682-4ac8-8583-0a9c013a6380
- https://unpaywall.org/10.1145%2F3025453.3025741
- https://doaj.org/article/7b6b880b717e4867babdd52b77bc164c
- https://daytonaudio.com/product/1104/tt25-8-puck-tactile-transducer-mini-bass-shaker
- https://learn.adafruit.com/adafruit-drv2605-haptic-controller-breakout.md?view=all
- https://library.csus.edu/makerspace
- https://www.microcenter.com/site/stores/Santa-Clara.aspx
- https://imboldn.com/wayband
- https://gust.com/companies/wearworksinc
