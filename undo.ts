import type {Bind} from './lib/dom.js';
import {button, h1, li, ul} from './lib/html.js';
import {queue} from './lib/misc.js';
import {NodeArray, node} from './lib/nodes.js';
import {IntSetting} from './lib/settings.js';
import {dockWindow} from './docks.js';
import lang from './language.js';

type Fn = () => Fn;

type FnDesc = {
	fn: Fn;
	[node]: HTMLLIElement;
}

const undoLimit = new IntSetting("undoLimit", 100, -1),
      undos = new NodeArray<FnDesc>(ul()),
      redos = new NodeArray<FnDesc>(ul()),
      undoObj = {
	"add": (fn: Fn, description: string | Bind) => {
		queue(async () => {
			redos.splice(0, redos.length);
			if (undoLimit.value === 0) {
				undos.splice(0, undos.length);
				return;
			}
			if (undoLimit.value !== -1 && undos.length >= undoLimit.value) {
				undos.splice(0, undos.length - undoLimit.value);
			}
			undos.push({
				fn,
				[node]: li(description)
			});
		});
	},
	"clear": () => {
		queue(async () => {
			undos.splice(0, undos.length);
			redos.splice(0, redos.length);
		});
	},
	"undo": () => {
		queue(async () => {
			const fnDesc = undos.pop();
			if (fnDesc) {
				fnDesc.fn = fnDesc.fn();
				redos.unshift(fnDesc);
			}
		});
	},
	"redo": () => {
		queue(async () => {
			const fnDesc = redos.shift();
			if (fnDesc) {
				fnDesc.fn = fnDesc.fn();
				undos.push(fnDesc);
			}
		});
	}
      };

export const undoWindow = dockWindow({"window-title": lang["UNDO_WINDOW_TITLE"], "style": "--window-left: 0px; --window-top: 0px; --window-width: 200px; --window-height: 600px", "window-data": "undo-window-settings", "resizable": true}, [
	button({"onclick": undoObj.undo}, lang["UNDO_UNDO"]),
	button({"onclick": undoObj.redo}, lang["UNDO_REDO"]),
	h1(lang["UNDO_WINDOW_UNDOS"]),
	undos[node],
	h1(lang["UNDO_WINDOW_REDOS"]),
	redos[node]
]);

export default undoObj;
