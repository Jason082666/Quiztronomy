const decayFactor = 0.5;
const decayWindow = 604800000;

function gaussian(x, sigma) {
  return Math.exp(-(x ** 2) / (2 * sigma ** 2));
}

export function calculatePopularity(
  currentLikes,
  previousPopularity,
  lastUpdate
) {
  const currentTime = Date.now();
  const popularityAge = currentTime - lastUpdate;
  const decay = gaussian(popularityAge, decayWindow);
  return (
    (1 - decayFactor) * currentLikes + decayFactor * decay * previousPopularity
  );
}
