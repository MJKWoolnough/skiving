import CSS from './lib/css.js';
import {amendNode, bindElement} from './lib/dom.js';
import {mouseDragEvent} from './lib/events.js';
import Fraction from './lib/fraction.js';
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
		"height": "var(--shell-height, 100%)",
		">div": {
			"position": "absolute",
			"width": "2px",
			"height": "100%",
			"background-color": "#000",
			"cursor": "col-resize"
		}
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
      hundred = new Fraction(100n);

class DockShell extends ShellElement {
	#left: DockDetails[] = [];
	#right: DockDetails[] = [];
	#leftSplits: Fraction[] = [];
	#rightSplits: Fraction[] = [];
	#leftWidth = 200;
	#rightWidth = 200;
	#leftDiv: HTMLDivElement;
	#rightDiv: HTMLDivElement;
	constructor() {
		super();
		const [leftDragStart] = mouseDragEvent(0, (e: MouseEvent) => {
			console.log(e);
		      }),
		      [rightDragStart] = mouseDragEvent(0, (e: MouseEvent) => {
			console.log(e);
		      });
		amendNode(this.attachShadow({"mode": "closed"}), [
			slot({"name": "desktop"}),
			this.#leftDiv = div({"style": "left: 200px", "onmousedown": (e: MouseEvent) => {
				if (e.button === 0) {
					leftDragStart();
				}
			}}),
			this.#rightDiv = div({"style": "left: calc(100% - 200px)", "onmousedown": (e: MouseEvent) => {
				if (e.button === 0) {
					rightDragStart();
				}
			}}),
			slot()
		]).adoptedStyleSheets = dockShellStyle;
	}
	#reformat() {
		let last = Fraction.zero;
		const leftWidth = this.#leftWidth + "px",
		      rightWidth = this.#rightWidth + "px";
		amendNode(this.#leftDiv, {"style": {"left": leftWidth}});
		amendNode(this.#rightDiv, {"style": {"left": `calc(100% - ${leftWidth})`}});
		for (let i = 0; i < this.#left.length; i++) {
			const s = this.#leftSplits[i];
			amendNode(this.#left[i][0], {"style": {"--window-left": 0, "--window-top": +last + "%", "--window-width": leftWidth, "--window-height": s + "%"}});
			last.add(s);
		}
		last = Fraction.zero;
		for (let i = 0; i < this.#right.length; i++) {
			const s = this.#rightSplits[i];
			amendNode(this.#right[i][0], {"style": {"--window-left": `calc(100% - ${rightWidth}`, "--window-top": +last + "%", "--window-width": rightWidth, "--window-height": s + "%"}});
			last.add(s);
		}
	}
	[dock](d: DockWindow, side: Side) {
		const arr = side === 1 ? this.#right : this.#left,
		      [x, y, w, h] = ["left", "top", "width", "height"].map(s => d.style.getPropertyValue("--window-" + s)),
		      splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      l = splits.length,
		      mul = new Fraction(BigInt(l), BigInt(l + 1));
		arr.push([d, x, y, w, h]);
		splits.splice(0, l, ...splits.map(n => n.mul(mul).simplify()), hundred);
		this.#reformat();
	}
	[undock](d: DockWindow, side: Side) {
		const arr = side === 1 ? this.#right : this.#left,
		      splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      pos = arr.findIndex(([w]) => w === d),
		      [, x, y, w, h] = arr.splice(pos, 1)[0];
		amendNode(d, {"style": {"--window-left": x, "--window-top": y, "--window-width": w, "--window-height": h}});
		splits.splice(pos, 1);
		if (splits.length) {
			splits[splits.length-1] = hundred;
		}
		this.#reformat();
	}
	[move](d: DockWindow, side: Side, way: -1 | 1) {
		const arr = side === 1 ? this.#right : this.#left,
		      splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      pos = arr.findIndex(([w]) => w === d),
		      newPos = pos + way;
		if (newPos >= 0 && newPos < splits.length) {
			[arr[pos], arr[newPos], splits[pos], splits[newPos]] = [arr[newPos], arr[pos], splits[newPos], splits[pos]];
			this.#reformat();
		}
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
