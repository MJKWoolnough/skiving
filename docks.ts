import CSS from './lib/css.js';
import {amendNode, bindElement} from './lib/dom.js';
import {div, ns, slot} from './lib/html.js';
import {Pickup} from './lib/inter.js';
import {ShellElement, WindowElement, desktop as adesktop} from './lib/windows.js';

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
      dockWindowStyle = new CSS(),
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
