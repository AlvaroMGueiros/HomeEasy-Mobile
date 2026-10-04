export const fps = 60;
export const beat = 30;
export const overlap = beat;
export const boundaries = [
  0, 360, 780, 1200, 1560, 1980, 2340, 2700, 3060, 3420, 3720, 4020, 4500,
] as const;
export const sceneStarts = boundaries
  .slice(0, -1)
  .map((boundary, index) => (index === 0 ? boundary : boundary - overlap));
export const sceneDurations = sceneStarts.map(
  (start, index) => boundaries[index + 1] - start,
);
export const totalFrames = boundaries[boundaries.length - 1];
