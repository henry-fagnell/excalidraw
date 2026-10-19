import { vi } from "vitest";

import { exportCanvas, prepareElementsForExport } from "../../data";
import { getDefaultAppState } from "../../appState";

import { API } from "../helpers/api";

import type { AppState } from "../../types";

const captured = vi.hoisted(() => ({
  elements: undefined as readonly { id: string; type: string }[] | undefined,
  canvas: undefined as HTMLCanvasElement | undefined,
}));

vi.mock("../../scene/export", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../scene/export")>();
  return {
    ...actual,
    exportToCanvas: (async (elements, appState, files, options) => {
      captured.elements = elements;
      const canvas = await actual.exportToCanvas(
        elements,
        appState,
        files,
        options,
      );
      captured.canvas = canvas;
      return canvas;
    }) as typeof actual.exportToCanvas,
  };
});

vi.mock("../../data/blob", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../data/blob")>();
  return {
    ...actual,
    canvasToBlob: async (
      canvas: HTMLCanvasElement | Promise<HTMLCanvasElement>,
    ) => {
      await canvas;
      return new Blob();
    },
  };
});

vi.mock("../../data/filesystem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../data/filesystem")>();
  return {
    ...actual,
    fileSave: vi.fn(async (blob: Blob | Promise<Blob>) => {
      await blob;
    }),
  };
});

describe("exportCanvas", () => {
  it("includes the last element when exporting to PNG", async () => {
    const rectangles = [0, 1, 2].map((index) =>
      API.createElement({
        type: "rectangle",
        x: index * 120,
        y: 0,
        width: 100,
        height: 100,
      }),
    );
    const circle = API.createElement({
      type: "ellipse",
      x: 400,
      y: 0,
      width: 80,
      height: 80,
    });
    const elements = [...rectangles, circle];
    const { exportedElements } = prepareElementsForExport(
      elements,
      { selectedElementIds: {} },
      false,
    );

    await exportCanvas(
      "png",
      exportedElements,
      {
        ...getDefaultAppState(),
        exportEmbedScene: false,
        name: "test",
      } as AppState,
      {},
      {
        exportBackground: true,
        viewBackgroundColor: "#ffffff",
        exportingFrame: null,
      },
    );

    expect(captured.elements?.map((element) => element.id)).toEqual(
      elements.map((element) => element.id),
    );
    // Three 100px rectangles end at x=340. The circle ends at x=480.
    expect(captured.canvas).toBeDefined();
    expect(captured.canvas!.width).toBeGreaterThanOrEqual(480);
    expect(captured.canvas!.height).toBeGreaterThanOrEqual(80);
  });
});
