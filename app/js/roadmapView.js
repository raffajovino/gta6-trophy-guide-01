// Platinum roadmap view: five stages in order, each with its trophies, its time, and
// the counts the official descriptions and the cited guides give for it.
export function renderRoadmapView(container, ctx) {
  container.replaceChildren();

  const intro = document.createElement('div');
  intro.className = 'note-box';
  intro.innerHTML = `<strong>${ctx.roadmap.title}.</strong> ${ctx.roadmap.summary}`;
  container.append(intro);

  const byId = new Map(ctx.trophies.map((t) => [t.id, t]));
  for (const stage of ctx.roadmap.stages) {
    const card = document.createElement('section');
    card.className = 'stage';
    const earnedInStage = stage.trophyIds.filter((id) => ctx.earned.has(byId.get(id).name)).length;

    const title = document.createElement('h2');
    title.textContent = `Stage ${stage.stage}: ${stage.title}`;
    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = `${stage.hours} · ${earnedInStage} of ${stage.trophyIds.length} earned in this stage`;
    const note = document.createElement('p');
    note.textContent = stage.note;
    card.append(title, meta, note);

    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const id of stage.trophyIds) {
      const trophy = byId.get(id);
      const chip = document.createElement('a');
      chip.className = `stage-chip${ctx.earned.has(trophy.name) ? ' earned' : ''}`;
      chip.href = `#/trophy/${trophy.id}`;
      chip.textContent = `${trophy.name} (${trophy.grade})`;
      chips.append(chip);
    }
    card.append(chips);
    container.append(card);
  }

  const platinum = ctx.trophies.find((t) => t.grade === 'platinum');
  const end = document.createElement('section');
  end.className = 'stage';
  end.innerHTML = `<h2>The platinum</h2><p class="stage-meta">Pops automatically</p><p><strong>${platinum.name}</strong> — ${platinum.description} Earn the other 54 trophies in the stages above and the platinum is yours. No online trophies, no DLC required.</p>`;
  container.append(end);
}
