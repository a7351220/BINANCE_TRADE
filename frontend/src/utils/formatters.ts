export const formatNumber = (num: number) => {
  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (Math.abs(num) >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  return num.toFixed(2);
};

export const formatVolume = (volume: number | undefined): string => {
  if (volume === undefined || volume === null) {
    return '$0.00';  // 或者返回 '-' 或其他預設值
  }

  if (Math.abs(volume) >= 1000000) {
    return `$${(volume / 1000000).toFixed(2)}M`;
  } else if (Math.abs(volume) >= 1000) {
    return `$${(volume / 1000).toFixed(2)}K`;
  }
  return `$${volume.toFixed(2)}`;
}; 