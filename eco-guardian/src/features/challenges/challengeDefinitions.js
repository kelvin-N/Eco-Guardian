const WEEKLY_CHALLENGES = [
  {
    id: "eco-actions",
    title: "Build a green routine",
    description: "Log five eco-friendly actions this week, one small step at a time.",
    activityType: "all",
    goal: 5,
    unit: "actions",
    icon: "🌱",
  },
  {
    id: "carbon-actions",
    title: "Choose lower-carbon habits",
    description: "Record three lower-carbon choices this week. Your CO₂ estimates stay personal and unverified.",
    activityType: "carbon",
    goal: 3,
    unit: "actions",
    icon: "🚲",
  },
  {
    id: "waste-reduction",
    title: "Take action on waste",
    description: "Log two waste-reduction or recycling reports this week.",
    activityType: "waste",
    goal: 2,
    unit: "reports",
    icon: "♻️",
  },
];

function getMondayUtc(date) {
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
  return monday;
}

export function getCurrentCommunityChallenges(now = new Date()) {
  const start = getMondayUtc(now);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  const periodStart = start.toISOString().slice(0, 10);

  return WEEKLY_CHALLENGES.map((challenge) => ({
    ...challenge,
    periodStart,
    start,
    end,
  }));
}

export function countChallengeProgress(challenge, activities, carbon, waste) {
  const inPeriod = (record) => {
    const date = record.createdAt?.toDate
      ? record.createdAt.toDate()
      : record.createdAt
        ? new Date(record.createdAt)
        : null;
    return date
      && !Number.isNaN(date.getTime())
      && date >= challenge.start
      && date < challenge.end;
  };

  const activityCount = activities.filter(inPeriod).length;
  const carbonCount = carbon.filter(inPeriod).length;
  const wasteCount = waste.filter(inPeriod).length;

  if (challenge.activityType === "carbon") return carbonCount;
  if (challenge.activityType === "waste") return wasteCount;
  return activityCount + carbonCount + wasteCount;
}
