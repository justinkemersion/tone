import { DETECT_MIN_HZ } from "../constants";
import type { PitchEstimate } from "./yin";

/**
 * If YIN still locks a harmonic on a thick string, prefer one octave down
 * when the halved frequency stays in range. Only applied below ~250 Hz.
 */
export function preferGuitarFundamental(
  estimate: PitchEstimate,
  minHz = DETECT_MIN_HZ,
): PitchEstimate {
  let hz = estimate.hz;
  const ceiling = 250;
  while (hz > 100 && hz <= ceiling && hz / 2 >= minHz) {
    // Strong high-string notes stay put; only fold likely octave errors.
    if (estimate.clarity < 0.92 && hz > 140) {
      hz /= 2;
    } else {
      break;
    }
  }
  return { ...estimate, hz };
}
