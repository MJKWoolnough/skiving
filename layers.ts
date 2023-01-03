import e from './lib/elements.js';
import {details, div, summary} from './lib/html.js';
import {setAndReturn} from './lib/misc.js';

const item = e({"name": "svg-item", "args": ["item"]}, item => {
	const name = new Text(" ");
	if (item instanceof SVGGeometryElement) {
		const id = item.getAttribute("id");
		if (id) {
			idSet(item).add(id);
		}
		name.textContent = item.getAttribute("name") ?? " ";
	}
	return div(name);
      }),
      layer = e({"name": "svg-layer", "classOnly": true, "args": ["svg"]}, s => {
	const name = new Text(" "),
	      d = details(summary(name));
	if (s instanceof SVGGElement || s instanceof SVGSVGElement) {
		const add: HTMLElement[] = [],
		      id = s.getAttribute("id");
		if (id) {
			idSet(s).add(id);
		}
		for (const c of s.children) {
			if (c instanceof SVGGElement) {
				add.push(new layer(c))
			} else if (c instanceof SVGDefsElement) {
			} else if (c instanceof SVGGeometryElement) {
				add.push(item({"item": c}));
			}
		}
		name.textContent = s.getAttribute("name") ?? " ";
		d.append(...add);
	}
	return d;
      }),
      idSets = new WeakMap<SVGElement, Set<string>>(),
      idSet = (l: SVGElement) => {
	while (l.parentNode instanceof SVGElement) {
		l = l.parentNode;
	}
	return idSets.get(l) ?? setAndReturn(idSets, l, new Set());
      };

export default (svg: SVGSVGElement) => new layer(svg);
