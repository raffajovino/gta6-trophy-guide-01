// main.js — boot, hash routing and wiring for Leonida 55.
// Routes: #/checklist (default), #/roadmap, #/missables, #/sources, #/trophy/<id>.
// Everything is local: the data is two JSON files under app/, progress lives in
// localStorage, and the page makes no network request at run time.
import { loadEarned, saveEarned, toggleEarned, exportProgress, importProgressFile } from "./progressStore.js";
import { freshFilterState } from "./trophyFilters.js";
import { renderChecklist, renderDetail } from "./checklistView.js";
import { renderRoadmap } from "./roadmapView.js";
import { renderMissables } from "./missablesView.js";
import { renderSources } from "./sourcesView.js";

const viewEl = document.getElementById("view");
const detailEl = document.getElementById("detail");
const tabsEl = document.getElementById("tabs");
const toolbarEl = document.getElementById("toolbar");
const searchBox = document.getElementById("searchBox");
const kindFilter = document.getElementById("kindFilter");
const gradeFilter = document.getElementById("gradeFilter");
const spoilerToggle = document.getElementById("spoilerToggle");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");
const statsStrip = document.getElementById("statsStrip");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

const VIEWS = ["checklist", "roadmap", "missables", "sources"];

function parseHash() {
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  const view = VIEWS.includes(parts[0]) ? parts[0] : "checklist";
  const trophyId = parts[0] === "trophy" && Number.isInteger(Number(parts[1])) ? Number(parts[1]) : null;
  return { view: trophyId ? "checklist" : view, trophyId };
}

async function boot() {
  const [trophyDoc, roadmap] = await Promise.all([
    fetch("data/trophies.json").then((r) => r.json()),
    fetch("data/roadmap.json").then((r) => r.json()),
  ]);
  const trophies = trophyDoc.trophies;
  const accessed = trophyDoc.accessed ?? "2026-11-20";
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const knownIds = new Set(byId.keys());
  let earned = loadEarned();
  const state = freshFilterState();
  let selectedId = null;

  const totalSteps = trophies.reduce((sum, trophy) => sum + trophy.steps.length, 0);
  const sourceCount = new Set(trophies.flatMap((trophy) => trophy.sources)).size;
  statsStrip.innerHTML = "";
  const statsText = document.createElement("span");
  statsText.innerHTML = `<b>${trophies.length} guides</b> · <b>${totalSteps} cited steps</b> · <b>${sourceCount} sources</b> · every guide cites its sources`;
  statsStrip.append(statsText);

  function refreshProgress() {
    progressFill.style.width = `${Math.round((earned.size / trophies.length) * 100)}%`;
    progressText.textContent = `${earned.size} of ${trophies.length} earned`;
  }

  function render() {
    const { view, trophyId } = parseHash();
    if (trophyId && byId.has(trophyId)) selectedId = trophyId;
    for (const button of tabsEl.querySelectorAll("button")) {
      button.classList.toggle("active", button.dataset.view === view);
    }
    toolbarEl.style.display = view === "checklist" ? "" : "none";
    const hooks = {
      onToggle: (id) => {
        earned = toggleEarned(earned, id);
        refreshProgress();
        render();
      },
      onSelect: (id) => {
        selectedId = id;
        location.hash = `#/trophy/${id}`;
        render();
      },
    };
    if (view === "roadmap") {
      renderRoadmap(viewEl, roadmap, trophies, earned, hooks);
      detailEl.replaceChildren();
    } else if (view === "missables") {
      renderMissables(viewEl, roadmap, trophies, hooks);
      detailEl.replaceChildren();
    } else if (view === "sources") {
      renderSources(viewEl, trophies, accessed);
      detailEl.replaceChildren();
    } else {
      renderChecklist(viewEl, trophies, earned, state, selectedId, hooks);
      renderDetail(detailEl, selectedId ? byId.get(selectedId) : null, earned, accessed, state.spoiler);
    }
  }

  tabsEl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-view]");
    if (!button) return;
    location.hash = `#/${button.dataset.view}`;
  });
  searchBox.addEventListener("input", () => {
    state.query = searchBox.value;
    render();
  });
  kindFilter.addEventListener("change", () => {
    state.kind = kindFilter.value;
    render();
  });
  gradeFilter.addEventListener("change", () => {
    state.grade = gradeFilter.value;
    render();
  });
  spoilerToggle.addEventListener("change", () => {
    state.spoiler = spoilerToggle.checked;
    render();
  });
  exportBtn.addEventListener("click", () => exportProgress(earned));
  importFile.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      earned = await importProgressFile(file, knownIds);
      refreshProgress();
      render();
    } catch {
      alert("That file is not a Leonida 55 progress export.");
    }
    event.target.value = "";
  });
  window.addEventListener("hashchange", render);

  refreshProgress();
  render();
}

boot().catch((error) => {
  viewEl.replaceChildren();
  const message = document.createElement("p");
  message.className = "empty";
  message.textContent = `The guide could not load its data (${error.message}). Serve app/ from its own files and reload.`;
  viewEl.append(message);
});
