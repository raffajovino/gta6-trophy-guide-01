// sourcesView.js — the source matrix: which sources each guide cites, and how
// many trophies each source backs. Every guide names its sources and the date
// they were checked, so a reader can follow any fact to its origin.
export const SOURCE_LINKS = {
  Exophase: "https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/",
  PSNProfiles: "https://psnprofiles.com/trophies/43531-grand-theft-auto-vi",
};

export function renderSources(container, trophies, accessed) {
  container.replaceChildren();
  const head = document.createElement("div");
  head.className = "view-head";
  const title = document.createElement("h2");
  title.textContent = "Sources";
  const sub = document.createElement("p");
  sub.textContent = `Every guide on this page is written in our own words and cites its sources — checked ${accessed}. Trophy names and descriptions are PlayStation's own, as listed by Exophase and PSNProfiles.`;
  head.append(title, sub);
  container.append(head);

  const counts = new Map();
  for (const trophy of trophies) {
    for (const source of trophy.sources) {
      counts.set(source, (counts.get(source) ?? 0) + 1);
    }
  }
  const table = document.createElement("table");
  table.className = "source-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const label of ["Source", "What it backs", "Trophies"]) {
    const th = document.createElement("th");
    th.textContent = label;
    if (label === "Trophies") th.className = "num";
    headerRow.append(th);
  }
  thead.append(headerRow);
  const tbody = document.createElement("tbody");
  const roles = {
    Exophase: "The official trophy list — names, descriptions, grades",
    PSNProfiles: "The official list, plus PSN's tracked counts",
    PowerPyx: "Trophy guide and roadmap conventions",
    "GTA-Zone": "Leonida map — all 52 areas",
  };
  for (const [source, count] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const link = SOURCE_LINKS[source];
    if (link) {
      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.textContent = source;
      anchor.rel = "noopener";
      nameCell.append(anchor);
    } else {
      nameCell.textContent = source;
    }
    const roleCell = document.createElement("td");
    roleCell.textContent = roles[source] ?? "Cited by the guides";
    const countCell = document.createElement("td");
    countCell.className = "num";
    countCell.textContent = String(count);
    row.append(nameCell, roleCell, countCell);
    tbody.append(row);
  }
  table.append(thead, tbody);
  container.append(table);

  const note = document.createElement("p");
  note.className = "sources-line";
  note.textContent = `Total: ${trophies.length} guides · ${trophies.reduce((sum, t) => sum + t.steps.length, 0)} cited steps · ${counts.size} sources · every guide cites its sources.`;
  container.append(note);
}
