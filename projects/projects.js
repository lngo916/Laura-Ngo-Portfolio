// ── THEME TOGGLE ──────────────────────────────────────
(function () {

  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');

  if (!button) return;

  let saved = null;

  try {
    saved = localStorage.getItem('laura-theme');
  } catch (e) {}

  const systemLight =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches;

  const initial =
    (saved === 'light' || saved === 'dark')
      ? saved
      : (systemLight ? 'light' : 'dark');

  function setTheme(theme, persist) {

    root.setAttribute('data-theme', theme);

    const light = theme === 'light';

    button.setAttribute(
      'aria-pressed',
      String(light)
    );

    button.setAttribute(
      'aria-label',
      light
        ? 'Switch to dark mode'
        : 'Switch to light mode'
    );

    button.setAttribute(
      'title',
      light
        ? 'Switch to dark mode'
        : 'Switch to light mode'
    );

    if (persist) {
      try {
        localStorage.setItem('laura-theme', theme);
      } catch (e) {}
    }

  }

  setTheme(initial, false);

  button.addEventListener('click', function () {

    const next =
      root.getAttribute('data-theme') === 'light'
        ? 'dark'
        : 'light';

    setTheme(next, true);

  });

})();

// ── ELEMENTS ──────────────────────────────────────────
const projectCards  = Array.from(document.querySelectorAll('.project-card'));
const pieEl         = document.getElementById('yearChart');
const chartLegend   = document.getElementById('chartLegend');
const chartSummary  = document.getElementById('chartSummary');
const yearFilterEl  = document.getElementById('yearFilter');
const searchInput   = document.getElementById('projectSearch');
const projectCount  = document.getElementById('projectCount');
const resultsCount  = document.getElementById('resultsCount');
const activeFilter  = document.getElementById('activeFilter');
const emptyState    = document.getElementById('emptyState');
const resultsBar    = document.querySelector('.results-bar');

const COLORS = ["#ff4e4e", "#ffa065", "#ffec3c", "#75d179", "#2276d6", "#8301be"];
const HOLE_RADIUS = 43; // half of the 86px donut hole in CS DS

// ── STATE ─────────────────────────────────────────────
const state = { year: 'all', query: '' };
let slices = [];

// ── DATA ──────────────────────────────────────────────
function getYearCounts() {
  const counts = {};
  projectCards.forEach(card => {
    const year = card.dataset.year;
    counts[year] = (counts[year] || 0) + 1;
  });
  return counts;
}

function getYears() {
  return Object.keys(getYearCounts()).sort((a, b) => Number(a) - Number(b));
}

// ── FILTERING ─────────────────────────────────────────
function setYear(year) {
  // clicking the active year again clears the filter
  state.year = (year === state.year) ? 'all' : year;
  applyFilters();
}

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  let visible = 0;

  projectCards.forEach(card => {
    const matchesYear = state.year === 'all' || card.dataset.year === state.year;
    const matchesQuery = !q || card.textContent.toLowerCase().includes(q) ||
                         (card.dataset.title || '').toLowerCase().includes(q);
    const show = matchesYear && matchesQuery;
    card.hidden = !show;
    if (show) visible++;
  });

  projectCount.textContent = `(${visible})`;
  resultsCount.textContent = `${visible} PROJECT${visible === 1 ? '' : 'S'}`;
  activeFilter.textContent = state.year === 'all' ? 'ALL YEARS' : state.year;
  emptyState.hidden = visible > 0;

  // sync year buttons
  document.querySelectorAll('.year-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.year === state.year);
  });

  renderChart();
}

// ── YEAR BUTTONS ──────────────────────────────────────
function buildYearButtons() {
  yearFilterEl.innerHTML =
    `<button class="year-btn" data-year="all" type="button">ALL</button>`;

  yearFilterEl.addEventListener('click', e => {
    const btn = e.target.closest('.year-btn');
    if (!btn) return;
    state.year = 'all';
    applyFilters();
  });
}

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  applyFilters();
});

// ── PIE CHART ─────────────────────────────────────────
function renderChart() {
  const counts = getYearCounts();
  const years = getYears();
  const total = years.reduce((sum, y) => sum + counts[y], 0);
  if (!pieEl || total === 0) return;

  const filtering = state.year !== 'all';
  let currentAngle = 0;
  slices = [];

  const stops = years.map((year, index) => {
    const color = COLORS[index % COLORS.length];
    const start = currentAngle;
    currentAngle += (counts[year] / total) * 360;
    slices.push({ year, count: counts[year], start, end: currentAngle, color });

    // dim the slices that aren't selected
    const shown = (!filtering || year === state.year)
      ? color
      : `color-mix(in srgb, ${color} 25%, transparent)`;
    return `${shown} ${start}deg ${currentAngle}deg`;
  });

  pieEl.style.background = `conic-gradient(${stops.join(', ')})`;

  chartLegend.innerHTML = slices.map(s => `
    <button type="button"
            class="legend-item${filtering && s.year !== state.year ? ' dim' : ''}${s.year === state.year ? ' selected' : ''}"
            data-year="${s.year}">
      <span class="legend-swatch" style="background:${s.color}"></span>
      <span>${s.year}</span>
      <span class="legend-value">${s.count}</span>
    </button>
  `).join('');

  chartSummary.textContent = filtering
    ? `Showing ${counts[state.year] || 0} project${counts[state.year] === 1 ? '' : 's'} from ${state.year}. Click the chart again to show all years.`
    : `${years.length === 1 ? '' : ''} Click a slice to filter by year.`;
}

chartLegend.addEventListener('click', e => {
  const item = e.target.closest('.legend-item');
  if (item) setYear(item.dataset.year);
});

// ── PIE INTERACTION (hover tooltip + click filter) ────
const tooltip = document.createElement('div');
tooltip.className = 'pie-tooltip';
document.body.appendChild(tooltip);

function getPointerInfo(e) {
  const rect = pieEl.getBoundingClientRect();
  const dx = e.clientX - (rect.left + rect.width / 2);
  const dy = e.clientY - (rect.top + rect.height / 2);
  const dist = Math.hypot(dx, dy);

  if (dist > rect.width / 2) return { zone: 'outside' };
  if (dist < HOLE_RADIUS) return { zone: 'hole' };

  let angle = Math.atan2(dx, -dy) * 180 / Math.PI; // clockwise from 12 o'clock
  if (angle < 0) angle += 360;

  const slice = slices.find(s => angle >= s.start && angle < s.end);
  return slice ? { zone: 'slice', slice } : { zone: 'outside' };
}

function hideTooltip() {
  tooltip.classList.remove('show');
  document.querySelectorAll('.legend-item').forEach(i => i.classList.remove('hover'));
}

pieEl.addEventListener('pointermove', e => {
  const info = getPointerInfo(e);

  if (info.zone === 'slice') {
    const s = info.slice;
    tooltip.innerHTML =
      `<strong>${s.year}</strong> · ${s.count} project${s.count === 1 ? '' : 's'}`;
    tooltip.style.left = e.clientX + 14 + 'px';
    tooltip.style.top = e.clientY + 14 + 'px';
    tooltip.classList.add('show');
    pieEl.style.cursor = 'pointer';
    document.querySelectorAll('.legend-item').forEach(i =>
      i.classList.toggle('hover', i.dataset.year === s.year));
  } else {
    hideTooltip();
    pieEl.style.cursor = info.zone === 'hole' && state.year !== 'all' ? 'pointer' : 'default';
  }
});

pieEl.addEventListener('pointerleave', hideTooltip);

pieEl.addEventListener('click', e => {
  const info = getPointerInfo(e);

  if (info.zone === 'slice') {
    setYear(info.slice.year);
  } else if (info.zone === 'hole' && state.year !== 'all') {
    state.year = 'all'; // click the center to reset
    applyFilters();
  }
});

// ── INIT ──────────────────────────────────────────────
buildYearButtons();
applyFilters();


