// Trophy filters: kind, grade, text search, and the spoiler rule.
// A story trophy stays hidden (name and description replaced) while spoilers are on and it is unearned.
export const kindLabels = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectibles',
  activity: 'Activities',
  online: 'Online',
};

// True when the spoiler setting hides this trophy's name and description.
export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

// Apply every active filter to the trophy list, in display order.
export function filterTrophies(trophies, filters, earned) {
  const query = (filters.query || '').trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (filters.kind === 'story' && trophy.kind !== 'story') return false;
    if (filters.kind === 'missable' && !trophy.missable && !trophy.watch) return false;
    if (filters.kind === 'collectible' && trophy.kind !== 'collectible') return false;
    if (filters.kind === 'activity' && trophy.kind !== 'activity') return false;
    if (filters.kind === 'online') return false;
    if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// Count earned trophies per grade for the masthead.
export function countEarnedByGrade(trophies, earned) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earned.has(trophy.name)) counts[trophy.grade] += 1;
  }
  return counts;
}
