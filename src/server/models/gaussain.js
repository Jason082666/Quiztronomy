// 设置衰减常数和衰减时间窗口
const decayFactor = 0.5;
const decayWindow = 604800000;
// 一年的毫秒數

// 计算高斯函数的衰减因子
function gaussian(x, sigma) {
  return Math.exp(-(x ** 2) / (2 * sigma ** 2));
}

// 计算popularity值
export function calculatePopularity(
  currentLikes,
  previousPopularity,
  lastUpdate
) {
  const date = new Date(Date.parse(lastUpdate)).getTime();
  const currentTime = Date.now();
  const popularityAge = currentTime - date;
  const decay = gaussian(popularityAge, decayWindow);
  return (
    (1 - decayFactor) * currentLikes + decayFactor * decay * previousPopularity
  );
}
