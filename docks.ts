import CSS from './lib/css.js';
import {bindElement} from './lib/dom.js';
import {ns} from './lib/html.js';
import {Pickup} from './lib/inter.js';
import {WindowElement, desktop as adesktop, shell as ashell} from './lib/windows.js';

let dockStyles: CSSStyleSheet[];

const dockStyle = new CSS(),
      shadow = new Pickup<ShadowRoot>();


class DockWindow extends WindowElement {
	constructor() {
		super();
		const s = shadow.get()!;
		s.adoptedStyleSheets = dockStyles ??= [...s.adoptedStyleSheets, dockStyle];
	}
	attachShadow(init: ShadowRootInit) {
		return shadow.set(super.attachShadow(init));
	}
}

customElements.define("windows-dock", DockWindow);

export const desktop = adesktop(),
shell = ashell(desktop),
dockWindow = bindElement<DockWindow>(ns, "windows-dock");
