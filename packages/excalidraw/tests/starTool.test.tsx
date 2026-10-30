import React from "react";

import { KEYS, reseed } from "@excalidraw/common";

import { Excalidraw } from "../index";

import { Keyboard, Pointer, UI } from "./helpers/ui";
import { fireEvent, GlobalTestState, render, waitFor } from "./test-utils";

const { h } = window;

const mouse = new Pointer("mouse");

const toolTestIds = (root: Element) =>
  Array.from(root.querySelectorAll("[data-testid^='toolbar-']")).map((el) =>
    el.getAttribute("data-testid"),
  );

describe("star tool", () => {
  beforeEach(() => {
    localStorage.clear();
    mouse.reset();
    reseed(7);
  });

  describe("desktop", () => {
    beforeEach(async () => {
      await render(<Excalidraw handleKeyboardGlobally={true} />);
    });

    it("is placed immediately after diamond in the toolbar", () => {
      const toolbar =
        GlobalTestState.renderResult.container.querySelector(".App-toolbar")!;
      const ids = toolTestIds(toolbar);

      expect(ids.indexOf("toolbar-star")).toBe(
        ids.indexOf("toolbar-diamond") + 1,
      );
    });

    it("is activated by the N shortcut", () => {
      Keyboard.keyPress(KEYS.N);
      expect(h.state.activeTool.type).toBe("star");
    });

    it("keeps stars as stars through duplicate and undo/redo", () => {
      UI.clickTool("star");
      mouse.down(10, 10);
      mouse.up(100, 80);

      expect(h.elements).toHaveLength(1);
      expect(h.elements[0].type).toBe("star");

      Keyboard.withModifierKeys({ ctrl: true }, () => {
        Keyboard.keyPress(KEYS.D);
      });
      expect(h.elements.map((el) => el.type)).toEqual(["star", "star"]);

      Keyboard.undo();
      expect(h.elements.filter((el) => !el.isDeleted)).toHaveLength(1);

      Keyboard.redo();
      expect(
        h.elements.filter((el) => !el.isDeleted).map((el) => el.type),
      ).toEqual(["star", "star"]);
    });
  });

  describe("mobile", () => {
    it("is offered right after diamond in the shapes popover", async () => {
      const { container } = await render(
        <Excalidraw UIOptions={{ getFormFactor: () => "phone" }} />,
      );
      fireEvent.resize(window);
      await waitFor(() =>
        expect(h.app.editorInterface.formFactor).toBe("phone"),
      );

      const mobileToolbar = await waitFor(() => {
        const el = container.querySelector(".mobile-toolbar");
        expect(el).not.toBe(null);
        return el!;
      });

      fireEvent.click(
        mobileToolbar.querySelector("[data-testid='toolbar-rectangle']")!,
      );

      const popover = await waitFor(() => {
        const el = container.querySelector(".tool-popover-content");
        expect(el).not.toBe(null);
        return el!;
      });
      const ids = toolTestIds(popover);
      expect(ids.indexOf("toolbar-star")).toBe(
        ids.indexOf("toolbar-diamond") + 1,
      );

      fireEvent.click(popover.querySelector("[data-testid='toolbar-star']")!);
      expect(h.state.activeTool.type).toBe("star");
    });
  });
});
