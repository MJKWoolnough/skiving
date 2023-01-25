import CSS from './lib/css.js';
import {amendNode, bindElement} from './lib/dom.js';
import {div, ns, slot} from './lib/html.js';
import {Pickup} from './lib/inter.js';
import {ns as svgNS} from './lib/svg.js';
import {ShellElement, WindowElement, desktop as adesktop} from './lib/windows.js';
import lang from './language.js';

export {WindowElement, windows} from './lib/windows.js';

type Side = -1 | 0 | 1;

type DockDetails = [DockWindow, string | undefined, string | undefined, string | undefined, string | undefined];

let dockStyles: CSSStyleSheet[];

const dockShellStyle = [new CSS().add({
	":host": {
		"display": "block",
		"position": "relative",
		"overflow": "hidden",
		"width": "var(--shell-width, 100%)",
		"height": "var(--shell-height, 100%)"
	},
	"::slotted(windows-window)": {
		"--taskmanager-on": "none"
	},
	"dock-window[docked],::slotted(dock-window:last-child),::slotted(windows-window:last-child)": {
		"--overlay-on": "none"
	},
	"dock-window[docked]": {
		"z-index": -1
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
	},
	":host>div:nth-child(3)": {
		"background-color": "#fff",
		"color": "#000"
	}
      }).at("@media (prefers-color-scheme: dark)", {
	":host": {
		"border-color": "#fff",
		">div:nth-child(3)": {
			"background-color": "#000",
			"color": "#fff"
		}
	}
      }),
      shadow = new Pickup<ShadowRoot>(),
      dock = Symbol("dock"),
      undock = Symbol("undock"),
      move = Symbol("move"),
      reformat = Symbol("reformat"),
      ro = new ResizeObserver(entries => {
	for (const {target} of entries) {
		if (target instanceof DockShell) {
			target[reformat]();
		}
	}
      });

class DockShell extends ShellElement {
	#left: DockDetails[] = [];
	#right: DockDetails[] = [];
	#leftSplits: number[] = [];
	#rightSplits: number[] = [];
	constructor() {
		super();
		amendNode(this.attachShadow({"mode": "closed"}), [
			slot({"name": "desktop"}),
			div(slot())
		]).adoptedStyleSheets = dockShellStyle;
	}
	[reformat]() {
	}
	[dock](d: DockWindow, side: Side) {
		const arr = side === 1 ? this.#right : this.#left,
		      [x, y, w, h] = ["left", "top", "width", "height"].map(s => d.style.getPropertyValue("--window-" + s));
		arr.push([d, x, y, w, h]);
		this[reformat]();
	}
	[undock](d: DockWindow, side: Side) {
		const arr = side === 1 ? this.#right : this.#left,
		      splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      pos = arr.findIndex(([w]) => w === d),
		      [, x, y, w, h] = arr.splice(pos, 1)[0];
		amendNode(d, {"style": {"--window-left": x, "--window-top": y, "--window-width": w, "--window-height": h}});
		splits.splice(pos, 1);
		this[reformat]();
	}
	[move](d: DockWindow, side: Side, way: -1 | 1) {
		const arr = side === 1 ? this.#right : this.#left,
		      splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      pos = arr.findIndex(([w]) => w === d),
		      newPos = pos + way;
		if (newPos >= 0 && newPos < splits.length) {
			[arr[pos], arr[newPos], splits[pos], splits[newPos]] = [arr[newPos], arr[pos], splits[newPos], splits[pos]];
			this[reformat]();
		}
	}
	connectedCallback() {
		ro.observe(this);
	}
	disconnectedCallback() {
		ro.unobserve(this);
	}
}

class DockWindow extends WindowElement {
	#side: Side = 0;
	constructor() {
		super();
		const s = shadow.get()!;
		s.adoptedStyleSheets = dockStyles ??= [...s.adoptedStyleSheets, dockWindowStyle];
		this.addControlButton(`data:image/svg+xml,%3Csvg xmlns='${svgNS}' viewBox='0 0 2 2'%3E%3Cpolygon points='0,0 2,1 0,2' fill='%23000' /%3E%3C/svg%3E`, () => this.#dock(1), lang["CONTROL_DOCK_RIGHT"]);
		this.addControlButton(`data:image/svg+xml,%3Csvg xmlns='${svgNS}' viewBox='0 0 2 2'%3E%3Cpolygon points='2,0 0,1 2,2' fill='%23000' /%3E%3C/svg%3E`, () => this.#dock(-1), lang["CONTROL_DOCK_LEFT"]);
		this.addControlButton(`data:image/svg+xml,%3Csvg xmlns='${svgNS}' viewBox='0 0 15 15'%3E%3Cpath d='M7,1 H1 V14 H14 V8 M9,1 h5 v5 m0,-5 l-6,6' stroke-linejoin='round' fill='none' stroke='%23000' /%3E%3C/svg%3E`, () => this.#undock(), lang["CONTROL_DOCK_OUT"]);
		this.addControlButton(`data:image/svg+xml,%3Csvg xmlns='${svgNS}' viewBox='0 0 2 2'%3E%3Cpolygon points='0,0 2,0 1,2' fill='%23000' /%3E%3C/svg%3E`, () => this.#move(-1), lang["CONTROL_DOCK_DOWN"]);
		this.addControlButton(`data:image/svg+xml,%3Csvg xmlns='${svgNS}' viewBox='0 0 2 2'%3E%3Cpolygon points='2,2 0,2 1,0' fill='%23000' /%3E%3C/svg%3E`, () => this.#move(1), lang["CONTROL_DOCK_UP"]);
	}
	attachShadow(init: ShadowRootInit) {
		return shadow.set(super.attachShadow(init));
	}
	#undock() {
		if (this.#side && this.parentNode instanceof DockShell) {
			this.parentNode[undock](this, this.#side);
			this.#side = 0;
			amendNode(this, {"docked": false});
		}
	}
	#dock(side: -1 | 1) {
		if (!this.#side && this.parentNode instanceof DockShell) {
			this.parentNode[dock](this, this.#side = side);
			amendNode(this, {"docked": true});
		}
	}
	#move(way: -1 | 1) {
		if (this.#side && this.parentNode instanceof DockShell) {
			this.parentNode[move](this, this.#side, way);
		}
	}
}

customElements.define("dock-shell", DockShell);
customElements.define("dock-window", DockWindow);

export const desktop = adesktop(),
shell = amendNode(new DockShell(), {"snap": 50}, desktop),
dockWindow = bindElement<DockWindow>(ns, "dock-window");
