// Sources view: the source matrix — which guide or list each fact comes from, and
// an honest note about what this guide's own words are built on.
export function renderSourcesView(container, ctx) {
  container.replaceChildren();

  const note = document.createElement('div');
  note.className = 'note-box';
  note.innerHTML = '<strong>How this guide cites.</strong> Every trophy’s guide names its sources beside it. Names, descriptions, grades and counts come from the official list as Exophase and PSNProfiles publish it. Methods and roadmaps draw on PowerPyx’s trophy guide and roadmap, and on GTA-Zone’s trophy list. The guide text itself is written for this page from the official descriptions — a source is cited, never copied. Where the guide writers have not yet pinned a method down, the guide says so.';
  container.append(note);

  const table = document.createElement('table');
  table.className = 'source-table';
  table.innerHTML = `<thead><tr><th>Source</th><th>What it covers here</th><th>Trophies citing it</th></tr></thead>`;
  const body = document.createElement('tbody');
  const coverage = {
    exophase: 'Official trophy names, descriptions and grades for all 55 trophies.',
    psnprofiles: 'Official list, grades, and PSN progress targets (counts such as the 42 Shooting Range challenges and the 500-choice count).',
    powerpyx: 'Trophy methods, the platinum roadmap, time and difficulty estimates, and the one confirmed missable.',
    gtazone: 'Trophy list and the meditation-spot count (18 spots in 10 locations).',
  };
  for (const [key, source] of Object.entries(ctx.sources)) {
    const count = ctx.trophies.filter((t) => t.sources.includes(key)).length;
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    nameCell.append(link);
    const whatCell = document.createElement('td');
    whatCell.textContent = coverage[key] || '';
    const countCell = document.createElement('td');
    countCell.textContent = `${count} of 55`;
    row.append(nameCell, whatCell, countCell);
    body.append(row);
  }
  table.append(body);
  container.append(table);
}
