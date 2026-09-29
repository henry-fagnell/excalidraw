import { KEYS } from "@excalidraw/common";

import { Excalidraw } from "../index";
import * as restore from "../data/restore";

import { findShapeByKey } from "../components/Tools";

import { API } from "./helpers/api";
import { Keyboard, UI } from "./helpers/ui";
import { render } from "./test-utils";

import type { AppClassProperties } from "../types";

describe("star tool", () => {
  const h = window.h;

  beforeEach(async () => {
    localStorage.clear();
    await render(<Excalidraw handleKeyboardGlobally={true} />);
  });

  it("creates a star element when drawing with the toolbar tool", () => {
    const star = UI.createElement("star", {
      x: 50,
      y: 50,
      width: 100,
      height: 80,
    });

    expect(star.type).toBe("star");
    expect(h.elements.filter((e) => e.type === "star")).toHaveLength(1);
  });

  it("activates via the W keyboard shortcut", () => {
    Keyboard.keyPress(KEYS.W);
    expect(h.state.activeTool.type).toBe("star");
  });

  it("is registered in findShapeByKey", () => {
    const app = {
      state: { preferredSelectionTool: { type: "selection" } },
    } as AppClassProperties;

    expect(findShapeByKey(KEYS.W, app)).toBe("star");
  });

  it("round-trips through restore", () => {
    const star = API.createElement({ type: "star", width: 80, height: 80 });
    const restored = restore.restoreElements([star], null);
    expect(restored).toHaveLength(1);
    expect(restored[0].type).toBe("star");
  });
});
