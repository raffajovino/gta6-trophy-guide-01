// Checklist view v2: the trophy list with filters on top, the selected trophy's
// guide — now as numbered cited steps — and its dated sources in a detail pane.
// Rows are dense so the cover screenshot shows more of the official list at a glance.
import { filterTrophies, isSpoilerHidden, kindLabels } from './trophyFilters.js';

function gradeDot(trophy) {
  const dot = document.createElement('span');
  dot.className = `grade-dot ${trophy.grade}`;
  dot.title = trophy.grade;
  return dot;
}

function kindTag(trophy) {
  const label = trophy.kind === 'story' ? 'Story' : trophy.kind === 'collectible' ? 'Collectible' : 'Activity';
  return { text: label, cls: trophy.kind === 'story' ? 'story-tag' : '' };
}

function tagRow(trophy) {
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const add = (text, cls) => {
    const tag = document.createElement('span');
    tag.className = `tag ${cls}`;
    tag.textContent = text;
    tags.append(tag);
  };
  const kind = kindTag(trophy);
  add(kind.text, kind.cls);
  if (trophy.hidden) add('Hidden', 'hidden-tag');
  if (trophy.missable) add('Missable', 'missable');
  if (trophy.watch) add('One-time moment', 'watch');
  return tags;
}

function trophyRow(trophy, ctx) {
  const earned = ctx.earned.has(trophy.name);
  const hidden = isSpoilerHidden(trophy, ctx.spoilerOn, ctx.earned);
  const row = document.createElement('button');
  row.type = 'button';
  row.className = `trophy-row${earned ? ' earned' : ''}${ctx.selectedId === trophy.id ? ' selected' : ''}`;
  row.addEventListener('click', () => ctx.onSelect(trophy.id));

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  box.addEventListener('click', (event) => {
    event.stopPropagation();
    ctx.onToggle(trophy.name, box.checked);
  });
  row.append(box, gradeDot(trophy));

  const body = document.createElement('span');
  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden trophy' : trophy.name;
  const desc = document.createElement('span');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Earn it to reveal its name and description.' : trophy.description;
  body.append(name, document.createElement('br'), desc);
  if (!hidden) body.append(tagRow(trophy));
  row.append(body);

  const pill = document.createElement('span');
  pill.className = `grade-pill ${trophy.grade}`;
  pill.textContent = trophy.grade;
  row.append(pill);
  return row;
}

// The detail pane: official name and description, the missable callout read from the
// trophy's own data, the guide as numbered steps, then the dated sources.
function detailPane(trophy, ctx) {
  const pane = document.createElement('aside');
  pane.className = 'detail';
  if (!trophy) {
    pane.innerHTML = '<h2>Pick a trophy</h2><p>Select any trophy on the left to read its guide and sources here.</p>';
    return pane;
  }
  const earned = ctx.earned.has(trophy.name);
  const hidden = isSpoilerHidden(trophy, ctx.spoilerOn, ctx.earned);

  const kicker = document.createElement('p');
  kicker.innerHTML = `<span class="tag">${trophy.grade}</span> <span class="tag">${trophy.kind}</span>`;
  pane.append(kicker);

  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden trophy' : trophy.name;
  pane.append(title);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = hidden ? 'This story trophy stays hidden until you earn it. Turn spoilers off in the toolbar to reveal it.' : trophy.description;
  pane.append(desc);

  if (!hidden) {
    if (trophy.missable && trophy.missableNote) {
      const warn = document.createElement('div');
      warn.className = 'callout';
      const strong = document.createElement('strong');
      strong.textContent = 'Missable. ';
      warn.append(strong, document.createTextNode(trophy.missableNote));
      pane.append(warn);
    }
    if (trophy.watch) {
      const warn = document.createElement('div');
      warn.className = 'callout watch-callout';
      warn.innerHTML = '<strong>One-time moment.</strong> This trophy is tied to a single event or choice — do it when the moment comes up, because there may be no second chance to trigger it.';
      pane.append(warn);
    }

    const guideHead = document.createElement('h3');
    guideHead.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    pane.append(guideHead, guide);

    const steps = trophy.steps || [];
    if (steps.length > 0) {
      const stepsHead = document.createElement('p');
      stepsHead.className = 'steps-count';
      stepsHead.textContent = `${steps.length} cited steps`;
      const list = document.createElement('ol');
      list.className = 'steps-list';
      for (const step of steps) {
        const item = document.createElement('li');
        item.textContent = step;
        list.append(item);
      }
      pane.append(stepsHead, list);
    }

    const sourcesHead = document.createElement('h3');
    sourcesHead.textContent = 'Sources';
    const list = document.createElement('ul');
    list.className = 'source-list';
    for (const key of trophy.sources) {
      const source = ctx.sources[key];
      if (!source) continue;
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      if (source.accessed) {
        const date = document.createElement('span');
        date.className = 'source-date';
        date.textContent = ` · accessed ${source.accessed}`;
        item.append(date);
      }
      list.append(item);
    }
    const ownNote = document.createElement('li');
    ownNote.textContent = 'Guide text: our own words, written from the official description above.';
    list.append(ownNote);
    pane.append(sourcesHead, list);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn earned-button';
  toggle.textContent = earned ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => ctx.onToggle(trophy.name, !earned));
  pane.append(toggle);
  return pane;
}

function toolbar(ctx) {
  const bar = document.createElement('div');
  bar.className = 'toolbar';

  const search = document.createElement('input');
  search.type = 'text';
  search.placeholder = 'Search trophies…';
  search.value = ctx.filters.query;
  search.setAttribute('aria-label', 'Search trophies');
  search.addEventListener('input', () => ctx.onFilterChange({ query: search.value }));
  bar.append(search);

  const chips = document.createElement('div');
  chips.className = 'chips';
  for (const kind of ['all', 'story', 'missable', 'collectible', 'activity', 'online']) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip${ctx.filters.kind === kind ? ' active' : ''}`;
    chip.textContent = kindLabels[kind];
    chip.addEventListener('click', () => ctx.onFilterChange({ kind }));
    chips.append(chip);
  }
  bar.append(chips);

  const grade = document.createElement('select');
  grade.setAttribute('aria-label', 'Filter by grade');
  for (const value of ['all', 'platinum', 'gold', 'silver', 'bronze']) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value === 'all' ? 'All grades' : value[0].toUpperCase() + value.slice(1);
    if (ctx.filters.grade === value) option.selected = true;
    grade.append(option);
  }
  grade.addEventListener('change', () => ctx.onFilterChange({ grade: grade.value }));
  bar.append(grade);

  const spoiler = document.createElement('label');
  spoiler.className = 'spoiler-toggle';
  const spoilerBox = document.createElement('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = ctx.spoilerOn;
  spoilerBox.addEventListener('change', () => ctx.onSpoilerChange(spoilerBox.checked));
  spoiler.append(spoilerBox, document.createTextNode('Hide story spoilers'));
  bar.append(spoiler);

  const exportButton = document.createElement('button');
  exportButton.type = 'button';
  exportButton.className = 'btn ghost';
  exportButton.textContent = 'Export progress';
  exportButton.addEventListener('click', ctx.onExport);
  bar.append(exportButton);

  const importLabel = document.createElement('label');
  importLabel.className = 'btn ghost';
  importLabel.textContent = 'Import progress';
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json';
  importInput.style.display = 'none';
  importInput.addEventListener('change', () => {
    if (importInput.files[0]) ctx.onImport(importInput.files[0]);
    importInput.value = '';
  });
  importLabel.append(importInput);
  bar.append(importLabel);

  const count = document.createElement('span');
  count.className = 'result-count';
  count.textContent = `${ctx.visibleCount} of 55 shown`;
  bar.append(count);
  return bar;
}

// Render the whole checklist view into the container.
export function renderChecklistView(container, ctx) {
  container.replaceChildren();
  const visible = filterTrophies(ctx.trophies, ctx.filters, ctx.earned);
  const viewCtx = { ...ctx, visibleCount: visible.length };
  container.append(toolbar(viewCtx));

  const split = document.createElement('div');
  split.className = 'split';
  const list = document.createElement('div');
  list.className = 'trophy-list';
  if (visible.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-note';
    empty.textContent = ctx.filters.kind === 'online'
      ? 'No online trophies — all 55 are single-player and offline.'
      : 'No trophies match these filters.';
    list.append(empty);
  } else {
    for (const trophy of visible) list.append(trophyRow(trophy, viewCtx));
  }
  const selected = ctx.trophies.find((t) => t.id === ctx.selectedId) || visible[0];
  split.append(list, detailPane(selected, viewCtx));
  container.append(split);
}
