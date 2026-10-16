// Draws a donut/pie chart onto an off-screen canvas and returns a PNG data URL.
// Used by every report format (PDF, Excel, image) so they all share one pie.
const OTHER_COLOR = '#94A3B8';
const MAX_SLICES = 8;

/** rows: [{ name, value, color }] sorted desc -> top slices + one aggregated "other" slice. */
export function toPieSlices(rows, otherLabel) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (!total) return [];
  const head = rows.slice(0, MAX_SLICES);
  const tail = rows.slice(MAX_SLICES);
  const slices = head.map((r) => ({ ...r }));
  if (tail.length) slices.push({ name: otherLabel, value: tail.reduce((s, r) => s + r.value, 0), color: OTHER_COLOR });
  return slices.map((s) => ({ ...s, pct: (s.value / total) * 100 }));
}

export function renderPieDataUrl(slices, { size = 520, donut = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const r = size / 2 - 6;
  let angle = -Math.PI / 2;

  slices.forEach((s) => {
    // A lone 100% slice would be a zero-length arc (360° wraps to 0°) - stop just short of it.
    const sweep = Math.min((s.pct / 100) * Math.PI * 2, Math.PI * 2 - 0.0001);
    ctx.beginPath();
    ctx.moveTo(cx, cx);
    ctx.arc(cx, cx, r, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    s._mid = angle + sweep / 2;
    angle += sweep;
  });

  if (donut) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(cx, cx, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  // Percent labels on slices big enough to hold them.
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(size / 26)}px system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`;
  const labelR = donut ? r * 0.76 : r * 0.62;
  slices.forEach((s) => {
    if (s.pct < 5) return;
    ctx.fillText(`${Math.round(s.pct)}%`, cx + Math.cos(s._mid) * labelR, cx + Math.sin(s._mid) * labelR);
  });

  return canvas.toDataURL('image/png');
}
