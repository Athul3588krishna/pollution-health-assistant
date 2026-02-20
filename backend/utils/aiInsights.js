function getRiskDirection(recentHistory) {
  if (recentHistory.length < 2) return 'stable';

  const latest = recentHistory[0].healthRisk.score;
  const prev = recentHistory[1].healthRisk.score;
  const delta = latest - prev;

  if (delta > 5) return 'worsening';
  if (delta < -5) return 'improving';
  return 'stable';
}

function buildActions(latestEntry, direction) {
  const actions = [];
  const aqi = latestEntry.pollutionData.aqi;
  const riskLevel = latestEntry.healthRisk.level;

  if (aqi >= 4 || riskLevel === 'Very High' || riskLevel === 'Severe') {
    actions.push('Limit outdoor exposure for the next 24 hours.');
    actions.push('Use an N95 mask if outdoor travel is required.');
  }

  if (latestEntry.userHealthProfile?.conditions?.includes('asthma')) {
    actions.push('Keep rescue inhaler accessible and avoid exertion outdoors.');
  }

  if (direction === 'worsening') {
    actions.push('Your trend is worsening; prioritize indoor air quality and reduce exposure.');
  }

  if (actions.length === 0) {
    actions.push('Current trend is manageable. Continue regular monitoring once daily.');
  }

  return actions;
}

exports.generateInsights = (recentHistory) => {
  if (!recentHistory || recentHistory.length === 0) {
    return {
      summary: 'No checks available yet. Run your first analysis to generate AI insights.',
      trend: 'no-data',
      actions: ['Analyze at least one location to unlock personalized guidance.']
    };
  }

  const latestEntry = recentHistory[0];
  const direction = getRiskDirection(recentHistory);

  const summary = `Latest check in ${latestEntry.location.city} is ${
    latestEntry.healthRisk.level
  } risk (score ${latestEntry.healthRisk.score}/100), trend is ${direction}.`;

  return {
    summary,
    trend: direction,
    actions: buildActions(latestEntry, direction)
  };
};
