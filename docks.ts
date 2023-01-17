import CSS from './lib/css.js';
import {amendNode, bindElement} from './lib/dom.js';
import {div, ns, slot} from './lib/html.js';
import {Pickup} from './lib/inter.js';
import {ShellElement, WindowElement, desktop as adesktop} from './lib/windows.js';
import lang from './language.js';

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
	constructor() {
		super();
		amendNode(this.attachShadow({"mode": "closed"}), [
			slot({"name": "desktop"}),
			div(slot())
		]).adoptedStyleSheets = dockShellStyle;
	}
}

class DockWindow extends WindowElement {
	constructor() {
		super();
		const s = shadow.get()!;
		s.adoptedStyleSheets = dockStyles ??= [...s.adoptedStyleSheets, dockWindowStyle];
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='0,0 2,1 0,2' fill='%23000' /%3E%3C/svg%3E", () => {}, lang["CONTROL_DOCK_RIGHT"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='2,0 0,1 2,2' fill='%23000' /%3E%3C/svg%3E", () => {}, lang["CONTROL_DOCK_LEFT"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 15 15'%3E%3Cpath d='M7,1 H1 V14 H14 V8 M9,1 h5 v5 m0,-5 l-6,6' stroke-linejoin='round' fill='none' stroke='%23000' /%3E%3C/svg%3E", () => {}, lang["CONTROL_DOCK_OUT"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='0,0 2,0 1,2' fill='%23000' /%3E%3C/svg%3E", () => {}, lang["CONTROL_DOCK_DOWN"]);
		this.addControlButton("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Cpolygon points='2,2 0,2 1,0' fill='%23000' /%3E%3C/svg%3E", () => {}, lang["CONTROL_DOCK_UP"]);
	}
	attachShadow(init: ShadowRootInit) {
		return shadow.set(super.attachShadow(init));
	}
}

customElements.define("dock-shell", DockShell);
customElements.define("dock-window", DockWindow);

export const desktop = adesktop(),
shell = amendNode(new DockShell(), desktop),
dockWindow = bindElement<DockWindow>(ns, "dock-window");
