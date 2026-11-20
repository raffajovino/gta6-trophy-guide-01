// roadmapView.js — the five-stage platinum roadmap, built from the trophy data.
// Each stage shows its chapter, a progress bar, and a chip per trophy (grade in
// the tooltip); earned chips are struck through. Chips jump to the trophy's guide.
import { countEarnedIn } from "./trophyFilters.js";

const GRADE_ORDER = ["platinum", "gold", "silver", "bronze"];

function byGradeThenName(byId) {
  return (a, b) => {
    const ga = GRADE_ORDER.indexOf(byId.get(a).grade);
    const gb = GRADE_ORDER.indexOf(byId.get(b).grade);
    if (ga !== gb) return ga - gb;
    return byId.get(a).name.localeCompare(byId.get(b).name);
  };
}

export function renderRoadmap(container, roadmap, trophies, earned, hooks) {
  container.replaceChildren();
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const head = document.createElement("div");
  head.className = "view-head";
  const title = document.createElement("h2");
  title.textContent = roadmap.title;
  const sub = document.createElement("p");
  sub.textContent = roadmap.note;
  head.append(title, sub);
  container.append(head);

  for (const stage of roadmap.stages) {
    const section = document.createElement("section");
    section.className = "stage";
    const stageHead = document.createElement("div");
    stageHead.className = "stage-head";
    const name = document.createElement("h3");
    name.textContent = `Stage ${stage.id} — ${stage.name}`;
    const chapter = document.createElement("span");
    chapter.className = "chapter";
    chapter.textContent = stage.chapter;
    stageHead.append(name, chapter);
    const blurb = document.createElement("p");
    blurb.className = "blurb";
    blurb.textContent = stage.blurb;

    const done = countEarnedIn(trophies, earned, stage.trophies);
    const bar = document.createElement("div");
    bar.className = "stage-bar";
    const fill = document.createElement("span");
    fill.style.width = `${Math.round((done / stage.trophies.length) * 100)}%`;
    bar.append(fill);
    const count = document.createElement("p");
    count.className = "stage-count";
    count.textContent = `${done} of ${stage.trophies.length} earned in this stage`;

    const chips = document.createElement("div");
    chips.className = "chips";
    const ordered = [...stage.trophies].sort(byGradeThenName(byId));
    for (const id of ordered) {
      const trophy = byId.get(id);
      if (!trophy) continue;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      if (earned.has(id)) chip.classList.add("earned");
      chip.textContent = trophy.name;
      chip.title = `${trophy.grade} · ${trophy.description}`;
      chip.addEventListener("click", () => hooks.onSelect(trophy.id));
      chips.append(chip);
    }
    section.append(stageHead, blurb, bar, count, chips);
    container.append(section);
  }
}
