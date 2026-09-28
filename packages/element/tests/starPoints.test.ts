import { describe, expect, it } from "vitest";

import { STAR_INNER_RADIUS_RATIO, getStarPoints } from "../src/bounds";
import { API } from "../../excalidraw/tests/helpers/api";

describe("getStarPoints", () => {
  it("returns 10 vertices scaled to the element bounding box", () => {
    const element = API.createElement({
      type: "star",
      width: 100,
      height: 80,
    });

    const points = getStarPoints(element);
    expect(points).toHaveLength(10);

    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(100);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(80);
  });

  it("uses the configured inner-to-outer radius ratio in unit space", () => {
    for (let k = 0; k < 5; k++) {
      const outerTheta = -Math.PI / 2 + k * ((2 * Math.PI) / 5);
      const innerTheta = outerTheta + Math.PI / 5;
      const outerDist = Math.hypot(Math.cos(outerTheta), Math.sin(outerTheta));
      const innerDist = Math.hypot(
        STAR_INNER_RADIUS_RATIO * Math.cos(innerTheta),
        STAR_INNER_RADIUS_RATIO * Math.sin(innerTheta),
      );
      expect(innerDist / outerDist).toBeCloseTo(STAR_INNER_RADIUS_RATIO, 5);
    }
  });
});
