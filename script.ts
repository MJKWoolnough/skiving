import {add, at, render} from './lib/css.js';
import {amendNode, clearNode} from './lib/dom.js';
import pageLoad from './lib/load.js';
import {circle, g, rect, svg, title} from './lib/svg.js';
import {desktop, dockWindow, shell} from './docks.js';
import lang from './language.js';
import layers from './layers.js';
import {symbols} from './symbols.js';

pageLoad.then(() => {
	add({
		"html,body": {
			"background-color": "#fff",
			"color": "#000"
		},
		"dock-shell": {
			"position": "absolute",
			"top": 0,
			"left": 0,
			"right": 0,
			"bottom": 0,
			"overflow": "clip"
		}
	});
	at("@media (prefers-color-scheme: dark)", {
		"html,body": {
			"background-color": "#000",
			"color": "#fff"
		}
	});
	document.head.append(render());
	const s = svg();
	clearNode(document.head.getElementsByTagName("title")[0], lang["TITLE"]) ?? (document.title = lang["TITLE"] + "");
	clearNode(document.body, [
		symbols,
		shell
	]);
	amendNode(desktop, s);
	amendNode(shell, dockWindow({"window-title": lang["DOCK_LAYERS"]}, [
		layers({"svg": s}),
		s
	]));
});
