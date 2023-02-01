import type {Children, Props} from './lib/dom.js';
import CSS from './lib/css.js';
import {amendNode} from './lib/dom.js';
import {mouseDragEvent} from './lib/events.js';
import Fraction from './lib/fraction.js';
import {div, slot} from './lib/html.js';
import {Pickup} from './lib/inter.js';
import {ns as svgNS} from './lib/svg.js';
import {ShellElement, WindowElement, desktop as adesktop, windows as awindows} from './lib/windows.js';
import lang from './language.js';

export {WindowElement} from './lib/windows.js';

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
			"height": "100%",
			"z-index": 2,
			":nth-of-type(1),:nth-of-type(2)": {
				"background-color": "#000",
				"cursor": "col-resize",
				"width": "2px"
			},
			":nth-of-type(1)": {
				"left": "min(max(100px, var(--left-width, 200px)), 40%)"
			},
			":nth-of-type(2)": {
				"left": "max(60%, min(calc(100% - 100px), calc(100% - var(--right-width, 200px))))"
			},
			":nth-of-type(3),:nth-of-type(4)": {
				"pointer-events": "none",
				">div": {
					"pointer-events": "auto",
					"position": "absolute",
					"left": 0,
					"right": 0,
					"height": "2px",
					"background-color": "#000",
					"cursor": "row-resize"
				}
			},
			":nth-of-type(3)": {
				"width": "min(max(100px, var(--left-width, 200px)), 40%)"
			},
			":nth-of-type(4)": {
				"left": "max(60%, min(calc(100% - 100px), calc(100% - var(--right-width, 200px))))",
				"right": 0
			}
		}
	},
	"::slotted(windows-window)": {
		"--taskmanager-on": "none"
	},
	"::slotted(dock-window[docked]),::slotted(dock-window:last-child),::slotted(windows-window:last-child)": {
		"--overlay-on": "none"
	},
	"::slotted(dock-window),::slotted(windows-window)": {
		"z-index": 3
	},
	"::slotted(dock-window[docked])": {
		"z-index": 1
	}
      })],
      dockWindowStyle = new CSS().add({
	":host([docked])": {
		">div:nth-child(2)": {
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
		">div:nth-child(3)": {
			"overflow": "auto"
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
	#leftDiv: HTMLDivElement;
	#rightDiv: HTMLDivElement;
	#leftSplitters: HTMLDivElement;
	#rightSplitters: HTMLDivElement;
	constructor() {
		super();
		const [leftDragStart] = mouseDragEvent(0, (e: MouseEvent) => amendNode(this, {"style": {"--left-width": (100 * e.clientX / this.clientWidth) + "%"}})),
		      [rightDragStart] = mouseDragEvent(0, (e: MouseEvent) => amendNode(this, {"style": {"--right-width": (100 * (this.clientWidth - e.clientX) / this.clientWidth) + "%"}}));
		amendNode(this.attachShadow({"mode": "closed"}), [
			slot({"name": "desktop"}),
			this.#leftDiv = div({"style": "display: none", "onmousedown": (e: MouseEvent) => {
				if (e.button === 0) {
					leftDragStart();
				}
			}}),
			this.#rightDiv = div({"style": "display: none", "onmousedown": (e: MouseEvent) => {
				if (e.button === 0) {
					rightDragStart();
				}
			}}),
			this.#leftSplitters = div(),
			this.#rightSplitters = div(),
			slot()
		]).adoptedStyleSheets = dockShellStyle;
	}
	#reformat() {
		let last = Fraction.zero;
		amendNode(this.#leftDiv, {"style": {"display": this.#left.length ? undefined : "none"}});
		amendNode(this.#rightDiv, {"style": {"display": this.#right.length ? undefined : "none"}});
		for (let i = 0; i < this.#left.length; i++) {
			const s = this.#leftSplits[i];
			amendNode(this.#left[i][0], {"style": {"--window-top": +last + "%", "--window-height": +s.sub(last) + "%"}});
			amendNode(this.#leftSplitters.children[i], {"style": {"top": +s + "%"}});
			last = s;
		}
		last = Fraction.zero;
		for (let i = 0; i < this.#right.length; i++) {
			const s = this.#rightSplits[i];
			amendNode(this.#right[i][0], {"style": {"--window-top": +last + "%", "--window-height": +s.sub(last) + "%"}});
			amendNode(this.#rightSplitters.children[i], {"style": {"top": +s + "%"}});
			last = s;
		}
	}
	[dock](d: DockWindow, side: Side) {
		const splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      l = splits.length,
		      mul = new Fraction(BigInt(l), BigInt(l + 1));
		(side === 1 ? this.#right : this.#left).push([d, ...["left", "top", "width", "height"].map(s => d.style.getPropertyValue("--window-" + s)) as [string | undefined, string | undefined, string | undefined, string | undefined]]);
		splits.splice(0, l, ...splits.map(n => n.mul(mul).simplify()), hundred);
		amendNode(d, {"style": {"--window-left": side === 1 ? "calc(100% - min(40%, max(100px, var(--right-width, 200px))))" : 0, "--window-width": side === 1 ? "min(40%, var(--right-width, 200px))" : "min(40%, var(--left-width, 200px))"}});
		if (splits.length > 1) {
			amendNode(side === 1 ? this.#rightSplitters : this.#leftSplitters, div());
		}
		this.#reformat();
	}
	[undock](d: DockWindow, side: Side) {
		const arr = side === 1 ? this.#right : this.#left,
		      splits = side === 1 ? this.#rightSplits : this.#leftSplits,
		      pos = arr.findIndex(([w]) => w === d),
		      [, x, y, w, h] = arr.splice(pos, 1)[0];
		amendNode(d, {"style": {"--window-left": x, "--window-top": y, "--window-width": w, "--window-height": h}});
		splits.splice(pos, 1);
		(side === 1 ? this.#rightSplitters : this.#leftSplitters).firstChild?.remove();
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
			[arr[pos], arr[newPos]] = [arr[newPos], arr[pos]];
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
		this.addControlButton(`data:image/svg+xml,%3Csvg xmlns='${svgNS}' viewBox='0 0 2 2'%3E%3Cpolygon points='0,0 2,0 1,2' fill='%23000' /%3E%3C/svg%3E`, () => this.#move(1), lang["CONTROL_DOCK_DOWN"]);
		this.addControlButton(`data:image/svg+xml,%3Csvg xmlns='${svgNS}' viewBox='0 0 2 2'%3E%3Cpolygon points='2,2 0,2 1,0' fill='%23000' /%3E%3C/svg%3E`, () => this.#move(-1), lang["CONTROL_DOCK_UP"]);
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
	focus() {
		if (!this.hasAttribute("docked")) {
			super.focus();
		}
	}
}

customElements.define("dock-shell", DockShell);
customElements.define("dock-window", DockWindow);

export const desktop = adesktop(),
shell = amendNode(new DockShell(), {"snap": 50}, desktop),
dockWindow = (props?: Props, children?: Children) => amendNode(amendNode(new DockWindow(), props, children), {"hide-maximise": true}),
windows = (props?: Props, children?: Children) => amendNode(awindows(props, children), {"hide-maximise": true});
