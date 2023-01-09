import {amendNode} from './lib/dom.js';
import e from './lib/elements.js';
import {details, div, summary} from './lib/html.js';
import {addAndReturn, setAndReturn} from './lib/misc.js';

const generateID = (e: SVGElement, s: Set<string>) => () => {
	let id: string;
	while(s.has(id = String.fromCharCode(...Array.from({"length": 10}, () => 97 + Math.floor(Math.random() * 26))))) {}
	amendNode(e, {"id": addAndReturn(s, id)});
      },
      item = e({"name": "svg-item", "args": ["item"]}, (_, item: SVGGeometryElement) => {
	const name = new Text(item.getAttribute("name") ?? " "),
	      id = item.getAttribute("id");
	if (id) {
		const ids = idSet(item);
		if (ids.has(id)) {
			setTimeout(generateID(item, ids));
		} else {
			ids.add(id);
		}
	}
	return div(name);
      }),
      layer = e({"name": "svg-layer", "args": ["svg"]}, (_, s: SVGGElement | SVGSVGElement) => {
	const name = new Text(s.getAttribute("name") ?? " "),
	      d = details({"open": true}, summary(name)),
	      add: HTMLElement[] = [],
	      id = s.getAttribute("id");
	if (id) {
		const ids = idSet(s);
		if (ids.has(id)) {
			setTimeout(generateID(s, ids));
		} else {
			ids.add(id);
		}
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

export default layer;
