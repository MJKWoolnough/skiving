import CSS from './lib/css.js';
import {bindElement} from './lib/dom.js';
import {ns} from './lib/html.js';
import {WindowElement, desktop as adesktop, shell as ashell} from './lib/windows.js';

let dockStyles: CSSStyleSheet[];

const dockStyle = new CSS();

class DockWindow extends WindowElement {
	#shadow!: ShadowRoot;
	constructor() {
		super();
		this.#shadow.adoptedStyleSheets = dockStyles ??= [...this.#shadow.adoptedStyleSheets, dockStyle];
	}
	attachShadow(init: ShadowRootInit) {
		const shadow = super.attachShadow(init)
		this.#shadow ??= shadow;
		return shadow;
	}
}

customElements.define("windows-dock", DockWindow);

export const desktop = adesktop(),
shell = ashell(desktop),
dockWindow = bindElement(ns, "window-dock")
