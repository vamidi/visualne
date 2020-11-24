import { listenWindow } from "./utils";

enum EPointerButton {
    LEFT_CLICK = 0, // Main button pressed, usually the left button or the un-initialized state
    MIDDLE_CLICK = 1, // Auxiliary button pressed, usually the wheel button or the middle button (if present)
    RIGHT_CLICK = 2, // Secondary button pressed, usually the right button
    // Fourth button, typically the Browser Back button
    // Fifth button, typically the Browser Forward button
}

export class Drag {
  pointerStart: [number, number] | null;
  el: HTMLElement;
  destroy: () => void;

  constructor(
      el: HTMLElement,
    private onTranslate = (_x: number, _y: number, _e: PointerEvent) => {},
    private onStart = (_e: PointerEvent) => {},
    private onDrag = (_e: PointerEvent) => {}
  ) {
      this.pointerStart = null;
      this.el = el;

      this.el.style.touchAction = "none";
      this.el.addEventListener("pointerdown", this.down.bind(this));

      const destroyMove = listenWindow("pointermove", this.move.bind(this));
      const destroyUp = listenWindow("pointerup", this.up.bind(this));

      this.destroy = () => {
          destroyMove();
          destroyUp();
      };
  }

  down(e: PointerEvent): void {
      if (e.pointerType === "mouse" && e.button !== EPointerButton.LEFT_CLICK) return;
      e.stopPropagation();
      this.pointerStart = [e.pageX, e.pageY];

      this.onStart(e);
  }

  move(e: PointerEvent): void {
      if (!this.pointerStart) return;
      e.preventDefault();

      const [x, y] = [e.pageX, e.pageY];

      const delta = [x - this.pointerStart[0], y - this.pointerStart[1]];

      const zoom = this.el.getBoundingClientRect().width / this.el.offsetWidth;

      this.onTranslate(delta[0] / zoom, delta[1] / zoom, e);
  }

  up(e: PointerEvent): void {
      if (!this.pointerStart) return;

      this.pointerStart = null;
      this.onDrag(e);
  }
}
