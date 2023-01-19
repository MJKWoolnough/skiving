import {add, render} from './lib/css.js';
import {amendNode, clearNode} from './lib/dom.js';
import pageLoad from './lib/load.js';
import {circle, g, rect, svg, title} from './lib/svg.js';
import {desktop, dockWindow, shell} from './docks.js';
import lang from './language.js';
import layers from './layers.js';
import {symbols} from './symbols.js';

pageLoad.then(() => {
	add({
		"dock-shell": {
			"position": "absolute",
			"top": 0,
			"left": 0,
			"right": 0,
			"bottom": 0,
			"overflow": "clip"
		}
	});
	document.head.append(render());
	const t = document.head.getElementsByTagName("title")[0],
	      s = svg();
	if (t) {
		clearNode(t, lang["TITLE"]);
	} else {
		document.title = lang["TITLE"] + "";
	}
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
