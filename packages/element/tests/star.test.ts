import { pointFrom, pointRotateRads } from "@excalidraw/math";
import { API } from "@excalidraw/excalidraw/tests/helpers/api";

import type { GlobalPoint, Radians } from "@excalidraw/math";

import { getElementLineSegments, getStarPoints } from "../src/bounds";
import { hitElementItself } from "../src/collision";

import type { ExcalidrawElement } from "../src/types";

const hit = (element: ExcalidrawElement, x: number, y: number) =>
  hitElementItself({
    point: pointFrom<GlobalPoint>(x, y),
    element,
    threshold: 1,
    elementsMap: new Map([[element.id, element]]),
  });

describe("getStarPoints", () => {
  it("returns 10 vertices filling the element's box, top point first", () => {
    const points = getStarPoints({ width: 200, height: 100 });

    expect(points).toHaveLength(10);
    expect(points[0][0]).toBeCloseTo(100);
    expect(points[0][1]).toBeCloseTo(0);

    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    expect(Math.min(...xs)).toBeCloseTo(0);
    expect(Math.max(...xs)).toBeCloseTo(200);
    expect(Math.min(...ys)).toBeCloseTo(0);
    expect(Math.max(...ys)).toBeCloseTo(100);
  });

  it("alternates outer and inner vertices", () => {
    const points = getStarPoints({ width: 100, height: 100 });
    const cx = 50;
    const cy = 55;
    const dist = ([x, y]: readonly number[]) => Math.hypot(x - cx, y - cy);

    for (let i = 0; i < points.length; i += 2) {
      expect(dist(points[i])).toBeGreaterThan(dist(points[i + 1]) * 2);
    }
  });
});

describe("star hit testing", () => {
  const createStar = (opts: { backgroundColor?: string; angle?: number }) =>
    API.createElement({
      type: "star",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      backgroundColor: opts.backgroundColor ?? "transparent",
      angle: (opts.angle ?? 0) as Radians,
    });

  it("hits the inside of a filled star but not the empty box corners", () => {
    const star = createStar({ backgroundColor: "#ffc9c9" });

    expect(hit(star, 50, 55)).toBe(true);
    expect(hit(star, 50, 5)).toBe(true);
    expect(hit(star, 3, 3)).toBe(false);
    expect(hit(star, 97, 97)).toBe(false);
    // between the two bottom points
    expect(hit(star, 50, 95)).toBe(false);
  });

  it("hits only the outline of a transparent star", () => {
    const star = createStar({});
    const [p0, p1] = getStarPoints(star);

    expect(hit(star, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2)).toBe(true);
    expect(hit(star, 50, 55)).toBe(false);
  });

  it("accounts for rotation", () => {
    const angle = Math.PI as Radians;
    const star = createStar({ backgroundColor: "#ffc9c9", angle });
    const center = pointFrom<GlobalPoint>(50, 50);
    const rotated = (x: number, y: number) =>
      pointRotateRads(pointFrom<GlobalPoint>(x, y), center, angle);

    // the upright star's top tip is at the bottom once rotated by 180°
    const [tipX, tipY] = rotated(50, 5);
    expect(hit(star, tipX, tipY)).toBe(true);
    expect(hit(star, 50, 5)).toBe(false);
  });

  it("produces one line segment per side", () => {
    const star = createStar({});

    expect(
      getElementLineSegments(star, new Map([[star.id, star]])),
    ).toHaveLength(10);
  });
});
