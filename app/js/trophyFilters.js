// Trophy filters v2: kind, grade, text search, the spoiler rule, and the citation
// counters the masthead stats strip reads (guides, cited steps, sources).
// A story trophy stays hidden (name and description replaced) while spoilers are on
// and it is unearned.
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
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide} ${(trophy.steps || []).join(' ')}`.toLowerCase();
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

// How many numbered, cited steps the whole guide holds (every step belongs to a
// guide that names its sources beside it).
export function countCitedSteps(trophies) {
  let total = 0;
  for (const trophy of trophies) total += (trophy.steps || []).length;
  return total;
}

// How many trophies cite each source key — the footer strip and the sources view
// read this so the counts are never typed by hand.
export function countSourceCitations(trophies) {
  const counts = {};
  for (const trophy of trophies) {
    for (const key of trophy.sources || []) counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
