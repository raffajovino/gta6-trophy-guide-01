// checklistView.js — the trophy checklist and the guide detail pane beside it.
// The checklist shows every trophy's official name, description and grade;
// the detail pane shows the selected trophy's guide, numbered steps, sources
// and missable warning. Spoiler-on rows hide hidden trophies until earned.
import { filterTrophies, trophyIsMasked, KIND_LABELS } from "./trophyFilters.js";

function gradePill(grade) {
  const pill = document.createElement("span");
  pill.className = `pill ${grade}`;
  pill.textContent = grade;
  return pill;
}

function kindTag(kind) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = KIND_LABELS[kind] ?? kind;
  return tag;
}

export function renderChecklist(container, trophies, earned, state, selectedId, hooks) {
  container.replaceChildren();
  const head = document.createElement("div");
  head.className = "view-head";
  const title = document.createElement("h2");
  title.textContent = "Checklist";
  const sub = document.createElement("p");
  sub.textContent = "Tick a trophy off when you earn it — progress is saved in this browser. Click a row to read its guide.";
  head.append(title, sub);
  container.append(head);

  const rows = filterTrophies(trophies, earned, state);
  if (rows.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No trophies match those filters. Clear the search or pick another kind.";
    container.append(empty);
    return;
  }
  for (const trophy of rows) {
    const row = document.createElement("div");
    row.className = "trophy-row";
    if (earned.has(trophy.id)) row.classList.add("earned");
    if (trophy.id === selectedId) row.classList.add("selected");
    row.dataset.trophyId = String(trophy.id);

    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = earned.has(trophy.id);
    box.setAttribute("aria-label", `Mark ${trophy.name} earned`);
    box.addEventListener("click", (event) => event.stopPropagation());
    box.addEventListener("change", () => hooks.onToggle(trophy.id));

    const body = document.createElement("div");
    const name = document.createElement("div");
    name.className = "trophy-name";
    if (trophyIsMasked(trophy, earned, state)) {
      const hidden = document.createElement("span");
      hidden.className = "hidden-name";
      hidden.textContent = "Hidden trophy";
      name.append(hidden);
    } else {
      name.textContent = trophy.name;
    }
    const desc = document.createElement("div");
    desc.className = "trophy-desc";
    desc.textContent = trophyIsMasked(trophy, earned, state)
      ? "Earn it to reveal the name and description."
      : trophy.description;
    const meta = document.createElement("div");
    meta.className = "trophy-meta";
    meta.append(gradePill(trophy.grade), kindTag(trophy.kind));
    if (trophy.count != null) {
      const count = document.createElement("span");
      count.className = "tag count";
      count.textContent = `× ${trophy.count.toLocaleString("en-US")}`;
      meta.append(count);
    }
    if (trophy.missable) {
      const flag = document.createElement("span");
      flag.className = "tag missable";
      flag.textContent = "Missable";
      meta.append(flag);
    }
    body.append(name, desc, meta);
    row.append(box, body);
    row.addEventListener("click", () => hooks.onSelect(trophy.id));
    container.append(row);
  }
}

export function renderDetail(pane, trophy, earned, accessed, spoilerOn) {
  pane.replaceChildren();
  if (!trophy) {
    const hint = document.createElement("div");
    hint.className = "detail-card";
    const p = document.createElement("p");
    p.textContent = "Click any trophy in the checklist to read its guide — numbered steps, where to go, and where each fact comes from.";
    hint.append(p);
    pane.append(hint);
    return;
  }
  if (spoilerOn && trophy.hidden && !earned.has(trophy.id)) {
    const card = document.createElement("div");
    card.className = "detail-card";
    const name = document.createElement("h2");
    name.textContent = "Hidden trophy";
    const note = document.createElement("p");
    note.textContent = "Spoilers are on, and this trophy is hidden on PlayStation until it is earned. Turn the spoiler setting off — or earn the trophy — to read its guide.";
    card.append(name, note);
    pane.append(card);
    return;
  }
  const card = document.createElement("div");
  card.className = "detail-card";
  const name = document.createElement("h2");
  name.textContent = trophy.name;
  const official = document.createElement("p");
  official.className = "official";
  official.textContent = `“${trophy.description}” — official PlayStation description · ${trophy.grade}`;
  card.append(name, official);

  if (trophy.missable && trophy.missableNote) {
    const callout = document.createElement("p");
    callout.className = "missable-callout";
    const strong = document.createElement("strong");
    strong.textContent = "Missable — read this first. ";
    callout.append(strong, document.createTextNode(trophy.missableNote));
    card.append(callout);
  }

  const guideHead = document.createElement("h3");
  guideHead.textContent = "Guide";
  const guideText = document.createElement("p");
  guideText.className = "guide-text";
  guideText.textContent = trophy.guide;
  card.append(guideHead, guideText);

  const stepsHead = document.createElement("h3");
  stepsHead.textContent = `Steps — ${trophy.steps.length}`;
  const list = document.createElement("ol");
  for (const step of trophy.steps) {
    const item = document.createElement("li");
    item.textContent = step;
    list.append(item);
  }
  card.append(stepsHead, list);

  const sources = document.createElement("p");
  sources.className = "sources-line";
  const label = document.createElement("b");
  label.textContent = "Sources: ";
  sources.append(label, document.createTextNode(`${trophy.sources.join(" · ")} — accessed ${accessed}.`));
  card.append(sources);

  const state = document.createElement("p");
  state.className = "sources-line";
  state.textContent = earned.has(trophy.id) ? "✓ Earned — ticked in your checklist." : "Not earned yet — tick it off in the checklist when it pops.";
  card.append(state);
  pane.append(card);
}
