import type {PropsObject} from './lib/dom.js';
import {id} from './lib/css.js';
import {Binding, amendNode} from './lib/dom.js';
import {circle, ellipse, g, path, rect, svg, svgData, symbol, title, use} from './lib/svg.js';

export const symbols = svg({"style": "width: 0"}),
addSymbol = (s: SVGSymbolElement): [(props?: PropsObject) => SVGSVGElement, string] => {
	const i = id();
	amendNode(symbols, amendNode(s, {"id": i}));
	return [
		(props: PropsObject = {}) => svg(props, [
			props["title"] instanceof Binding ? title(props["title"]) : [],
			use({"href": `#${i}`})
		]),
		svgData(s)
	];
},
[copy, copyStr] = addSymbol(symbol({"viewBox": "0 0 34 37"}, path({"d": "M14,6 h-13 v30 h21 v-22 z v8 h8 M12,6 v-5 h13 l8,8 v22 h-11 m11,-22 h-8 v-8 M6,20 h11 m-11,5 h11 m-11,5 h11", "stroke": "currentColor", "fill": "none"}))),
[folderClosed, folderClosedStr] = addSymbol(symbol({"viewBox": "0 0 37 28"}, path({"d": "M32,27 h-30 v-20 h2 l5,-5 h5 l5,5 h13 v3 M31,27 h1 v-20 h-30", "stroke-width": 2, "stroke": "currentColor", "fill": "none", "stroke-linejoin": "round"}))),
[folderOpen, folderOpenStr] = addSymbol(symbol({"viewBox": "0 0 37 28"}, path({"d": "M32,27 h-30 v-20 h2 l5,-5 h5 l5,5 h13 v3 M31,27 h1 l5,-16 h-30 l-5,16", "stroke-width": 2, "stroke": "currentColor", "fill": "none", "stroke-linejoin": "round"}))),
[newFolder, newFolderStr] = addSymbol(symbol({"viewBox": "0 0 24 20"}, path({"d": "M1,4 h22 v15 h-22 Z m2,0 l3,-3 h5 l3,3 m3,2 v12 m-6,-6 h12", "stroke": "currentColor", "fill": "none", "stroke-linejoin": "round"}))),
[remove, removeStr] = addSymbol(symbol({"viewBox": "0 0 32 34"}, path({"d": "M10,5 v-3 q0,-1 1,-1 h10 q1,0 1,1 v3 m8,0 h-28 q-1,0 -1,1 v2 q0,1 1,1 h28 q1,0 1,-1 v-2 q0,-1 -1,-1 m-2,4 v22 q0,2 -2,2 h-20 q-2,0 -2,-2 v-22 m2,3 v18 q0,1 1,1 h3 q1,0 1,-1 v-18 q0,-1 -1,-1 h-3 q-1,0 -1,1 m7.5,0 v18 q0,1 1,1 h3 q1,0 1,-1 v-18 q0,-1 -1,-1 h-3 q-1,0 -1,1 m7.5,0 v18 q0,1 1,1 h3 q1,0 1,-1 v-18 q0,-1 -1,-1 h-3 q-1,0 -1,1", "stroke": "currentColor", "fill": "none"}))),
[rename, renameStr] = addSymbol(symbol({"viewBox": "0 0 30 20"}, path({"d": "M1,5 v10 h28 v-10 Z M17,1 h10 m-5,0 V19 m-5,0 h10", "stroke": "currentColor", "stroke-linejoin": "round", "fill": "none"}))),
[visibility, visibilityStr] = addSymbol(symbol({"viewBox": "0 0 100 70"}, [
	ellipse({"cx": 50, "cy": 35, "rx": 49, "ry": 34, "stroke-width": 2, "stroke": "#000", "fill": "#fff"}),
	g({"style": "display: var(--invisible, block)"}, [
		circle({"cx": 50, "cy": 35, "r": 27, "stroke": "#888", "stroke-width": 10}),
		circle({"cx": 59, "cy": 27, "r": 10, "fill": "#fff"})
	])
])),
[lock, lockStr] = addSymbol(symbol({"viewBox": "0 0 70 100", "style": "stroke: currentColor", "stroke-width": 2, "stroke-linejoin": "round"}, [
	path({"d": "M15,45 v-20 a1,1 0,0,1 40,0 a1,1 0,0,1 -10,0 a1,1 0,0,0 -20,0 v20 z", "fill": "#ccc", "style": "display: var(--unlocked, block)"}),
	path({"d": "M15,45 v-20 a1,1 0,0,1 40,0 v20 h-10 v-20 a1,1 0,0,0 -20,0 v20 z", "fill": "#ccc", "style": "display: var(--locked, none)"}),
	rect({"x": 5, "y": 45, "width": 60, "height": 50, "fill": "#aaa", "stroke-width": 4, "rx": 10}),
	path({"d": "M30,78 l2,-8 c-7,-12 13,-12 6,0 l2,8 z", "fill": "#666", "stroke": "#000", "stroke-linejoin": "round"})
]));
