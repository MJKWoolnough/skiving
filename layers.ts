import type {WithAttr} from './lib/elements.js';
import CSS from './lib/css.js';
import {amendNode} from './lib/dom.js';
import e from './lib/elements.js';
import {details, div, summary} from './lib/html.js';
import {addAndReturn, setAndReturn} from './lib/misc.js';
import {title} from './lib/svg.js';
import lang from './language.js';
import {folderClosedStr, folderOpenStr} from './symbols.js';

const fixIDs = (e: SVGElement) => {
	const id = e.getAttribute("id");
	if (id) {
		const ids = idSet(e);
		if (ids.has(id)) {
			setTimeout(generateID(e, ids));
		} else {
			ids.add(id);
		}
	}
      },
      generateID = (e: SVGElement, s: Set<string>) => () => {
	let id: string;
	while(s.has(id = String.fromCharCode(...Array.from({"length": 10}, () => 97 + Math.floor(Math.random() * 26))))) {}
	amendNode(e, {"id": addAndReturn(s, id)});
      },
      defaultCSS = [new CSS().add("div:empty:after", {
	"font-style": "italic",
	"color": "#888",
	"content": "attr(title)",
      })],
      svgElement = <T extends new(...a: any[]) => HTMLElement>(c: T) => class extends c {
	#element!: SVGElement;
	set element(s: SVGElement) { this.#element ??= s; }
	get element() { return this.#element; }
      },
      svgInit = (e: HTMLElement & WithAttr & {element: SVGElement}, s: SVGElement) => {
	e.element = s;
	fixIDs(s);
	const nameAttr = document.createAttribute("name"),
	      nameNode = new Text(),
	      titles = Array.from(s.children).filter(c => c instanceof SVGTitleElement),
	      titleNode = titles[0] ?? title();
	for (const c of titles.slice(1)) {
		c.remove();
	}
	nameAttr.textContent = titleNode.textContent;
	e.setAttributeNode(nameAttr);
	e.act("name", (name: any) => {
		const n = name + "";
		nameNode.textContent = nameAttr.textContent = titleNode!.textContent = n;
		if (n) {
			if (titleNode !== s.firstChild) {
				s.insertBefore(titleNode, s.firstChild)
			}
		} else {
			titleNode!.remove();
		}
	});
	return nameNode;
      },
      shape = e({"name": "svg-shape", "args": ["shape"], "styles": defaultCSS, "extend": svgElement}, (e, shape: SVGGeometryElement) => {
	const name = svgInit(e, shape);
	for (const c of shape.children) {
		if (c instanceof SVGAnimationElement) { // animate, animateMotion, animateTransform, mpath, set
		} else if (c instanceof SVGDescElement || c instanceof SVGMetadataElement) { // Descriptive elements
		}
	}
	return div({"title": lang["TITLE_" + shape.tagName.toUpperCase() as keyof typeof lang]}, name);
      }),
      use = e({"name": "svg-use", "args": ["use"], "styles": defaultCSS, "extend": svgElement}, (e, use: SVGUseElement) => {
	const name = svgInit(e, use);
	for (const c of use.children) {
		if (c instanceof SVGAnimationElement) { // animate, animateMotion, animateTransform, mpath, set
		} else if (c instanceof SVGDescElement || c instanceof SVGMetadataElement) { // Descriptive elements
		}
	}
	return div({"title": lang["TITLE_USE"]}, name);
      }),
      layer = e({"name": "svg-layer", "args": ["svg"], "styles": [new CSS().add("details", {
	"margin-left": "1em",
	">summary": {
		"list-style": "none",
		"cursor": "pointer",
		"margin-left": "-1em",
		":empty:after": {
			"font-style": "italic",
			"color": "#888",
			"content": "attr(title)"
		}
	},
	">summary:before": {
		"content": "''",
		"display": "inline-block",
		"width": "19px",
		"height": "14px",
		"background-image": `url(${folderClosedStr})`
	},
	"[open]>summary:before": {
		"background-image": `url(${folderOpenStr})`
	}
      })], "extend": svgElement}, (e, s: SVGGElement | SVGSVGElement) => {
	const name = svgInit(e, s),
	      d = details({"open": true}, summary({"title": lang["TITLE_LAYER"]}, name)),
	      add: HTMLElement[] = [];
	for (const c of s.children) {
		if (c instanceof SVGGElement) {
			add.push(layer({"svg": c}))
		} else if (c instanceof SVGGeometryElement) { // circle, ellipse, line, path, polygon, polyline, rect
			add.push(shape({"shape": c}));
		} else if (c instanceof SVGDefsElement) {
		} else if (c instanceof SVGSVGElement) {
		} else if (c instanceof SVGSymbolElement) {
		} else if (c instanceof SVGUseElement) {
			add.push(use({"use": c}));
		} else if (c instanceof SVGAnimationElement) { // animate, animateMotion, animateTransform, mpath, set
		} else if (c instanceof SVGDescElement || c instanceof SVGMetadataElement) { // Descriptive elements
		} else if (c instanceof SVGGradientElement) { // linearGradient, radialGradient
		} else if (c instanceof SVGStopElement) {
		} else if (c instanceof SVGAElement || c instanceof SVGClipPathElement || c instanceof SVGFilterElement || c instanceof SVGForeignObjectElement || c instanceof SVGImageElement || c instanceof SVGMarkerElement || c instanceof SVGMaskElement || c instanceof SVGPatternElement || c instanceof SVGScriptElement || c instanceof SVGStyleElement || c instanceof SVGSwitchElement || c instanceof SVGTextElement || c instanceof SVGViewElement) {
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
