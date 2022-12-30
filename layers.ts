import {amendNode} from './lib/dom.js';
import e from './lib/elements.js';
import {details, div, summary} from './lib/html.js';
import {setAndReturn} from './lib/misc.js';

const item = e({"name": "svg-item"}, e => {
	const name = new Text(" ");
	let item: SVGGeometryElement | null = null;
	e.act("item", (i: SVGGeometryElement) => {
		if (i instanceof SVGGeometryElement) {
			const id = i.getAttribute("id");
			if (id) {
				idSet(i).add(id);
			}
			name.textContent = i.getAttribute("name") ?? " ";
			item = i;
		}
	});
	return div(name);
      }),
      layer = e({"name": "svg-layer", "classOnly": true}, e => {
	const name = new Text(" "),
	      d = details(summary(name));
	let group: SVGGElement | SVGSVGElement | null = null;
	e.act("svg", (s: SVGElement) => {
		if (s instanceof SVGGElement || s instanceof SVGSVGElement) {
			const add: HTMLElement[] = [],
			      id = s.getAttribute("id");
			if (id) {
				idSet(s).add(id);
			}
			for (const c of s.children) {
				if (c instanceof SVGGElement) {
					add.push(amendNode(new layer(), {"svg": c}))
				} else if (c instanceof SVGDefsElement) {
				} else if (c instanceof SVGGeometryElement) {
					add.push(item({"item": c}));
				}
			}
			group = s;
			name.textContent = s.getAttribute("name") ?? " ";
			d.append(...add);
		}
	});
	return d;
      }),
      idSets = new WeakMap<SVGElement, Set<string>>(),
      idSet = (l: SVGElement) => {
	while (l.parentNode instanceof SVGElement) {
		l = l.parentNode;
	}
	const s = idSets.get(l);
	if (s) {
		return s;
	}
	return setAndReturn(idSets, l, new Set());
      };

export default (svg: SVGSVGElement) => amendNode(new layer(), {svg});
