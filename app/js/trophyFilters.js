// trophyFilters.js — the checklist's filter state and the spoiler rule.
// Spoiler rule: a hidden trophy shows as "Hidden trophy" until it is earned,
// and only while the spoiler setting is on. Earned trophies always show.
export const KIND_LABELS = {
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
};

export function freshFilterState() {
  return { query: "", kind: "all", grade: "all", spoiler: false };
}

export function trophyIsMasked(trophy, earned, state) {
  return Boolean(state.spoiler && trophy.hidden && !earned.has(trophy.id));
}

export function filterTrophies(trophies, earned, state) {
  const needle = state.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.kind !== "all" && trophy.kind !== state.kind) return false;
    if (state.grade !== "all" && trophy.grade !== state.grade) return false;
    if (!needle) return true;
    const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    return haystack.includes(needle);
  });
}

export function countByKind(trophies, kind) {
  return trophies.filter((trophy) => trophy.kind === kind).length;
}

export function countEarnedIn(trophies, earned, ids) {
  return ids.filter((id) => earned.has(id)).length;
}
