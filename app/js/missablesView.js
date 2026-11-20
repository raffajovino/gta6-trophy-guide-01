// missablesView.js — the one confirmed missable, up front, then the one-time
// moments: story beats you can only hit on your first pass. Only the first
// entry is confirmed permanently missable; the rest are "do it while you are
// there" moments, and the page says so plainly.
export function renderMissables(container, roadmap, trophies, hooks) {
  container.replaceChildren();
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const head = document.createElement("div");
  head.className = "view-head";
  const title = document.createElement("h2");
  title.textContent = "Missables & one-time moments";
  const sub = document.createElement("p");
  sub.textContent = "Exactly one trophy is confirmed permanently missable. The rest of this page is story beats that only happen once — do them while you are there, because there is no replay of the moment itself.";
  head.append(title, sub);
  container.append(head);

  const missable = trophies.find((trophy) => trophy.missable);
  if (missable) {
    const callout = document.createElement("section");
    callout.className = "moment confirmed";
    const name = document.createElement("h3");
    name.textContent = `⚠ ${missable.name} — the only confirmed missable`;
    const when = document.createElement("p");
    when.className = "when";
    when.textContent = "Chapter 1, before the chapter closes";
    const note = document.createElement("p");
    note.textContent = missable.missableNote;
    const go = document.createElement("p");
    const link = document.createElement("button");
    link.type = "button";
    link.className = "chip";
    link.textContent = "Read the full guide →";
    link.addEventListener("click", () => hooks.onSelect(missable.id));
    go.append(link);
    callout.append(name, when, note, go);
    container.append(callout);
  }

  const momentsHead = document.createElement("div");
  momentsHead.className = "view-head";
  const momentsTitle = document.createElement("h2");
  momentsTitle.textContent = "One-time moments";
  const momentsSub = document.createElement("p");
  momentsSub.textContent = "Twelve beats that play out once per playthrough. None of these lock a trophy except the first — but each is worth doing on your first pass.";
  momentsHead.append(momentsTitle, momentsSub);
  container.append(momentsHead);

  for (const moment of roadmap.oneTimeMoments) {
    const section = document.createElement("section");
    section.className = "moment";
    if (moment.confirmed) section.classList.add("confirmed");
    const name = document.createElement("h3");
    name.textContent = moment.title;
    const when = document.createElement("p");
    when.className = "when";
    when.textContent = moment.when;
    const detail = document.createElement("p");
    detail.textContent = moment.detail;
    section.append(name, when, detail);
    const trophy = byId.get(moment.trophy);
    if (trophy) {
      const go = document.createElement("p");
      const link = document.createElement("button");
      link.type = "button";
      link.className = "chip";
      link.textContent = `Guide: ${trophy.name} →`;
      link.addEventListener("click", () => hooks.onSelect(moment.trophy));
      go.append(link);
      section.append(go);
    }
    container.append(section);
  }
}
