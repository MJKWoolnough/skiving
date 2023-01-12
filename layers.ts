import CSS from './lib/css.js';
import {amendNode} from './lib/dom.js';
import e from './lib/elements.js';
import {details, div, summary} from './lib/html.js';
import {addAndReturn, setAndReturn} from './lib/misc.js';
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
      shape = e({"name": "svg-shape", "args": ["shape"], "styles": defaultCSS}, (_, shape: SVGGeometryElement) => {
	const name = new Text(shape.getAttribute("name") ?? "");
	fixIDs(shape);
	for (const c of shape.children) {
		if (c instanceof SVGAnimationElement) { // animate, animateMotion, animateTransform, mpath, set
		} else if (c instanceof SVGDescElement || c instanceof SVGMetadataElement || c instanceof SVGTitleElement) { // Descriptive elements
		}
	}
	return div({"title": lang["TITLE_" + shape.tagName.toUpperCase() as keyof typeof lang]}, name);
      }),
      use = e({"name": "svg-use", "args": ["use"], "styles": defaultCSS}, (_, use: SVGUseElement) => {
	const name = new Text(use.getAttribute("name") ?? "");
	fixIDs(use);
	for (const c of use.children) {
		if (c instanceof SVGAnimationElement) { // animate, animateMotion, animateTransform, mpath, set
		} else if (c instanceof SVGDescElement || c instanceof SVGMetadataElement || c instanceof SVGTitleElement) { // Descriptive elements
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
      })]}, (_, s: SVGGElement | SVGSVGElement) => {
	const name = new Text(s.getAttribute("name") ?? ""),
	      d = details({"open": true}, summary({"title": lang["TITLE_LAYER"]}, name)),
	      add: HTMLElement[] = [];
	fixIDs(s);
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
		} else if (c instanceof SVGDescElement || c instanceof SVGMetadataElement || c instanceof SVGTitleElement) { // Descriptive elements
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
