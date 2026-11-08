// FeelInk stage: the Coordinate plane button (#143). One click posts the preset's axes and its Origin, x axis and
// y axis labels (presets.js) as ordinary tutor strokes and landmarks, so the phone needs nothing new. Its ids are fixed:
// clicking again restores the plane in place instead of drawing a second one. Points are then placed with Label.
// Loaded after stage-tools.js: a click uses its closeName and setStart.
const presetPlane = document.getElementById('presetPlane');
if (presetPlane) {
  // Like the other tool buttons (stage-tools.js): acts on click, never takes focus from a mouse, saves an open name box.
  presetPlane.addEventListener('mousedown', (e) => e.preventDefault());
  presetPlane.addEventListener('click', () => {
    closeName(true);
    const plane = Presets.coordinatePlane();
    for (const st of plane.strokes) { upsert(st); post({ type: 'stroke', ...st }); }
    for (const l of plane.landmarks) {
      const mark = { type: 'landmark', ...l };
      setLandmarks(B.upsertById(landmarks, mark));
      post(mark);
      if (mark.start) setStart(mark.id, true); // Origin becomes the one start point, as the Label tool does (#107)
    }
  });
}
