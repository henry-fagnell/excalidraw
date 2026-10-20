import * as restore from "../data/restore";

import { Excalidraw } from "../index";

import { API } from "./helpers/api";
import { UI } from "./helpers/ui";
import { render } from "./test-utils";

const { h } = window;

describe("star tool", () => {
  beforeEach(async () => {
    localStorage.clear();
    await render(<Excalidraw handleKeyboardGlobally={true} />);
  });

  it("creates a star element when dragging on the canvas", () => {
    const star = UI.createElement("star", {
      x: 50,
      y: 60,
      width: 120,
      height: 100,
    }).get();

    expect(star.type).toBe("star");
    expect(star.width).toBe(120);
    expect(star.height).toBe(100);
    expect(h.elements.filter((el) => el.type === "star")).toHaveLength(1);
  });

  it("restores star elements with type star", () => {
    const star = API.createElement({
      type: "star",
      x: 10,
      y: 20,
      width: 80,
      height: 80,
    });

    const restored = restore.restoreElements([star], null);

    expect(restored).toHaveLength(1);
    expect(restored[0].type).toBe("star");
    expect(restored[0].width).toBe(80);
    expect(restored[0].height).toBe(80);
  });
});
