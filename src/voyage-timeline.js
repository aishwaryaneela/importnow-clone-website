export const PORT_DISTANCE = 520;
export const DEPARTURE = .4;
export const ARRIVAL = .84;
export const STEP_THRESHOLDS = [0, .12, .24, DEPARTURE, ARRIVAL, .92];
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => value < .5 ? 4 * value ** 3 : 1 - ((-2 * value + 2) ** 3) / 2;

/** One monotonic world-space journey. Neither port moves or changes identity. */
export function voyageAt(value) {
  const progress = clamp(value);
  const seaProgress = clamp((progress - DEPARTURE) / (ARRIVAL - DEPARTURE));
  const distance = ease(seaProgress);
  const day = progress < DEPARTURE
    ? Math.round(progress / DEPARTURE * 7)
    : progress < ARRIVAL
      ? 7 + Math.round(seaProgress * 23)
      : 30 + Math.round((progress - ARRIVAL) / (1 - ARRIVAL) * 5);
  return {
    progress,
    shipX: distance * PORT_DISTANCE,
    distance,
    day,
    step: STEP_THRESHOLDS.findLastIndex(start => progress >= start),
    phase: progress < DEPARTURE ? 'shanghai' : progress < ARRIVAL ? 'sea' : 'chennai',
  };
}
