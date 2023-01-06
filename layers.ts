import e from './lib/elements.js';
import {details, div, summary} from './lib/html.js';
import {setAndReturn} from './lib/misc.js';

const item = e({"name": "svg-item", "args": ["item"]}, (_, item: SVGGeometryElement) => {
	const name = new Text(item.getAttribute("name") ?? " "),
	      id = item.getAttribute("id");
	if (id) {
		idSet(item).add(id);
	}
	return div(name);
      }),
      layer = e({"name": "svg-layer", "args": ["svg"]}, (_, s: SVGGElement | SVGSVGElement) => {
	const name = new Text(s.getAttribute("name") ?? " "),
	      d = details(summary(name)),
	      add: HTMLElement[] = [],
	      id = s.getAttribute("id");
	if (id) {
		idSet(s).add(id);
	}
	for (const c of s.children) {
		if (c instanceof SVGGElement) {
			add.push(layer({"svg": c}))
		} else if (c instanceof SVGDefsElement) {
		} else if (c instanceof SVGGeometryElement) {
			add.push(item({"item": c}));
		}
	}
	d.append(...add);
	return d;
      }),
      idSets = new WeakMap<SVGElement, Set<string>>(),
      idSet = (l: SVGElement) => {
	while (l.parentNode instanceof SVGElement) {
		l = l.parentNode;
	}
	return idSets.get(l) ?? setAndReturn(idSets, l, new Set());
      };

export default (svg: SVGSVGElement) => layer({svg});
