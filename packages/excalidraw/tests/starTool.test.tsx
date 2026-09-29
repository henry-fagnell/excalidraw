import { KEYS } from "@excalidraw/common";

import { Excalidraw } from "../index";

import { findShapeByKey } from "../components/Tools";

import { API } from "./helpers/api";
import { Keyboard, Pointer, UI } from "./helpers/ui";
import { act, GlobalTestState, render } from "./test-utils";

import type { AppClassProperties } from "../types";

describe("star tool", () => {
  const h = window.h;
  const mouse = new Pointer("mouse");

  beforeEach(async () => {
    localStorage.clear();
    await render(<Excalidraw handleKeyboardGlobally={true} />);
  });

  it("creates a star element when drawing with the toolbar tool", () => {
    UI.clickTool("star");
    expect(h.state.activeTool.type).toBe("star");

    mouse.downAt(50, 50);
    mouse.upAt(150, 130);

    expect(h.elements).toHaveLength(1);
    expect(h.elements[0].type).toBe("star");
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
    const restored = API.restoreElements([star], null);
    expect(restored).toHaveLength(1);
    expect(restored[0].type).toBe("star");
  });
});
