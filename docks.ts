import CSS from './lib/css.js';
import {amendNode, bindElement} from './lib/dom.js';
import {div, ns, slot} from './lib/html.js';
import {Pickup} from './lib/inter.js';
import {checkInt} from './lib/misc.js';
import {ShellElement, WindowElement, desktop as adesktop} from './lib/windows.js';
import lang from './language.js';

type Side = -1 | 0 | 1;

let dockStyles: CSSStyleSheet[];

const dockShellStyle = [new CSS().add({
	":host": {
		"display": "block",
		"position": "relative",
		"overflow": "hidden",
		"width": "var(--shell-width, 100%)",
		"height": "var(--shell-height, 100%)"
	},
	"::slotted(dock-window)": {
		"--taskmanager-on": "none"
	},
	"::slotted(dock-window:last-of-type)": {
		"--overlay-on": "none"
	}
      })],
      dockWindowStyle = new CSS().add({
	":host([docked])>div:nth-child(2)": {
		"pointer-events": "none",
		" button": {
			"pointer-events": "auto"
		},
		" span>button": {
			":nth-of-type(1),:nth-of-type(2)": {
				"display": "none"
			}
		}
	},
	":host(:not([docked]))>div:nth-child(2) span>button": {
		":nth-of-type(3),:nth-of-type(4),:nth-of-type(5)": {
			"display": "none"
		}
	},
	":host>div:nth-child(2)>div>button": {
		":nth-of-type(1),:nth-of-type(2),:nth-of-type(3)": {
			"display": "none"
		}
	}
      }),
      shadow = new Pickup<ShadowRoot>();

class DockShell extends ShellElement {
	#left: [DockWindow, number, number, number, number][] = [];
	#right: [DockWindow, number, number, number, number][] = [];
	#leftSplits: number[] = [];
	#rightSplits: number[] = [];
	constructor() {
		super();
		amendNode(this.attachShadow({"mode": "closed"}), [
			slot({"name": "desktop"}),
			div(slot())
		]).adoptedStyleSheets = dockShellStyle;
	}
	#reformatDocks() {
	}
	dock(d: DockWindow, side: Side) {
		const arr = side === 1 ? this.#right : this.#left,
		      [x, y, w, h] = ["left", "top", "width", "height"].map(s => checkInt(parseInt(d.style.getPropertyValue("--window-" + s))));
		arr.push([d, x, y, w, h]);
		this.#reformatDocks();
	}
	undock(d: DockWindow, side: Side) {
		const arr = side === 1 ? this.#right : this.#left,
		      splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      pos = arr.findIndex(([w]) => w === d),
		      [, x, y, w, h] = arr.splice(pos, 1)[0];
		amendNode(d, {"--window-left": x, "--window-top": y, "--window-width": w, "--window-height": h});
		splits.splice(pos, 1);
		this.#reformatDocks();
	}
}

class DockWindow extends WindowElement {
	#side: Side = 0;
	constructor() {
		super();
		const s = shadow.get()!;
		s.adoptedStyleSheets = dockStyles ??= [...s.adoptedStyleSheets, dockWindowStyle];
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='0,0 2,1 0,2' fill='%23000' /%3E%3C/svg%3E", () => this.#dock(1), lang["CONTROL_DOCK_RIGHT"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='2,0 0,1 2,2' fill='%23000' /%3E%3C/svg%3E", () => this.#dock(-1), lang["CONTROL_DOCK_LEFT"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15'%3E%3Cpath d='M7,1 H1 V14 H14 V8 M9,1 h5 v5 m0,-5 l-6,6' stroke-linejoin='round' fill='none' stroke='%23000' /%3E%3C/svg%3E", () => this.#undock(), lang["CONTROL_DOCK_OUT"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='0,0 2,0 1,2' fill='%23000' /%3E%3C/svg%3E", () => {}, lang["CONTROL_DOCK_DOWN"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='2,2 0,2 1,0' fill='%23000' /%3E%3C/svg%3E", () => {}, lang["CONTROL_DOCK_UP"]);
	}
	attachShadow(init: ShadowRootInit) {
		return shadow.set(super.attachShadow(init));
	}
	#undock() {
		if (this.parentNode instanceof DockShell) {
			this.parentNode.undock(this, this.#side);
			this.#side = 0;
		}
	}
	#dock(side: -1 | 1) {
		if (this.parentNode instanceof DockShell) {
			this.parentNode.dock(this, this.#side = side);
		}
	}
}

customElements.define("dock-shell", DockShell);
customElements.define("dock-window", DockWindow);

export const desktop = adesktop(),
shell = amendNode(new DockShell(), desktop),
dockWindow = bindElement<DockWindow>(ns, "dock-window");
