// Missables view: the one confirmed missable, flagged from the cited guides, plus the
// one-time moments worth doing when they come up. Built from the official descriptions.
export function renderMissablesView(container, ctx) {
  container.replaceChildren();

  const intro = document.createElement('div');
  intro.className = 'note-box';
  intro.innerHTML = '<strong>Good news: almost nothing here can be missed.</strong> There is no mission replay and no New Game+, but the guide writers report only one trophy that can truly be missed. The rest below are one-time moments — do them when they come up, just in case.';
  container.append(intro);

  const missables = ctx.trophies.filter((t) => t.missable);
  const heading = document.createElement('h2');
  heading.textContent = `Confirmed missable — ${missables.length} trophy`;
  container.append(heading);
  for (const trophy of missables) {
    const card = document.createElement('section');
    card.className = 'stage missable-card';
    card.innerHTML = `<h2>${trophy.name} <span class="tag missable">Missable</span></h2>
      <p class="stage-meta">${trophy.grade} · ${trophy.description}</p>
      <p>${trophy.guide}</p>
      <p><strong>Sources:</strong> ${trophy.sources.map((key) => ctx.sources[key].name).join(' · ')}</p>`;
    container.append(card);
  }

  const watchList = ctx.trophies.filter((t) => t.watch);
  const watchHeading = document.createElement('h2');
  watchHeading.textContent = `One-time moments to watch — ${watchList.length} trophies`;
  container.append(watchHeading);
  const watchNote = document.createElement('p');
  watchNote.textContent = 'These are tied to a single event or choice. None is confirmed missable by the guide writers, but each is easiest done the first time the moment appears.';
  container.append(watchNote);
  for (const trophy of watchList) {
    const card = document.createElement('section');
    card.className = 'stage watch-card';
    const link = document.createElement('a');
    link.href = `#/trophy/${trophy.id}`;
    link.textContent = trophy.name;
    const title = document.createElement('h2');
    title.append(link);
    const tag = document.createElement('span');
    tag.className = 'tag watch';
    tag.textContent = 'One-time moment';
    title.append(' ', tag);
    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = `${trophy.grade} · ${trophy.description}`;
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    card.append(title, meta, guide);
    container.append(card);
  }
}
