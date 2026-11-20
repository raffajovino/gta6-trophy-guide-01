// Leonida 55 boot: loads the trophy list and the roadmap, keeps the earned set and the
// spoiler setting, and routes between the four views by location hash.
import { loadProgress, saveProgress, loadSpoilerSetting, saveSpoilerSetting, exportProgress, importProgressFile } from './progressStore.js';
import { countEarnedByGrade } from './trophyFilters.js';
import { renderChecklistView } from './checklistView.js';
import { renderRoadmapView } from './roadmapView.js';
import { renderMissablesView } from './missablesView.js';
import { renderSourcesView } from './sourcesView.js';

const viewRoot = document.getElementById('view');
const earnedCount = document.getElementById('earnedCount');
const progressFill = document.getElementById('progressFill');
const gradeCounts = document.getElementById('gradeCounts');
const tabs = document.querySelectorAll('#viewTabs a');

const state = {
  trophies: [],
  sources: {},
  roadmap: null,
  earned: new Set(),
  spoilerOn: true,
  filters: { kind: 'all', grade: 'all', query: '' },
  selectedId: null,
  view: 'checklist',
};

// Refresh the masthead progress (big count, bar, per-grade counts).
function refreshMasthead() {
  earnedCount.textContent = String(state.earned.size);
  progressFill.style.width = `${(state.earned.size / state.trophies.length) * 100}%`;
  const byGrade = countEarnedByGrade(state.trophies, state.earned);
  gradeCounts.innerHTML = '';
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const total = state.trophies.filter((t) => t.grade === grade).length;
    const span = document.createElement('span');
    span.innerHTML = `<b>${byGrade[grade]}</b>/${total} ${grade}`;
    gradeCounts.append(span);
  }
}

// Read the view (and the selected trophy) from the hash: #/checklist, #/roadmap,
// #/missables, #/sources, #/trophy/<id>.
function readHash() {
  const parts = location.hash.replace(/^#\//, '').split('/');
  if (parts[0] === 'roadmap' || parts[0] === 'missables' || parts[0] === 'sources') {
    return { view: parts[0], selectedId: null };
  }
  if (parts[0] === 'trophy' && Number.isInteger(Number(parts[1]))) {
    return { view: 'checklist', selectedId: Number(parts[1]) };
  }
  return { view: 'checklist', selectedId: null };
}

function render() {
  const { view, selectedId } = readHash();
  state.view = view;
  state.selectedId = selectedId;
  for (const tab of tabs) tab.classList.toggle('active', tab.dataset.view === view);

  const ctx = {
    trophies: state.trophies,
    sources: state.sources,
    roadmap: state.roadmap,
    earned: state.earned,
    spoilerOn: state.spoilerOn,
    filters: state.filters,
    selectedId: state.selectedId,
    onToggle: (name, checked) => {
      if (checked) state.earned.add(name);
      else state.earned.delete(name);
      saveProgress(state.earned);
      refreshMasthead();
      render();
    },
    onSelect: (id) => {
      location.hash = `#/trophy/${id}`;
    },
    onFilterChange: (patch) => {
      Object.assign(state.filters, patch);
      render();
    },
    onSpoilerChange: (on) => {
      state.spoilerOn = on;
      saveSpoilerSetting(on);
      render();
    },
    onExport: () => exportProgress(state.earned),
    onImport: async (file) => {
      try {
        state.earned = await importProgressFile(file, state.trophies.map((t) => t.name));
        saveProgress(state.earned);
        refreshMasthead();
        render();
      } catch (error) {
        alert(`Could not import that file: ${error.message}`);
      }
    },
  };

  if (view === 'roadmap') renderRoadmapView(viewRoot, ctx);
  else if (view === 'missables') renderMissablesView(viewRoot, ctx);
  else if (view === 'sources') renderSourcesView(viewRoot, ctx);
  else renderChecklistView(viewRoot, ctx);
}

async function bootGuide() {
  const [trophyDoc, roadmapDoc] = await Promise.all([
    (await fetch('data/trophies.json')).json(),
    (await fetch('data/roadmap.json')).json(),
  ]);
  state.trophies = trophyDoc.trophies;
  state.sources = trophyDoc.sources;
  state.roadmap = roadmapDoc;
  state.earned = loadProgress(state.trophies.map((t) => t.name));
  state.spoilerOn = loadSpoilerSetting();
  window.addEventListener('hashchange', render);
  refreshMasthead();
  render();
}

bootGuide();
