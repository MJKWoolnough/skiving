import type {Bind} from './lib/dom.js';
import {bind} from './lib/dom.js';
import {StringSetting} from './lib/settings.js';

export const language = new StringSetting("language", navigator.language),
makeLangPack = <T extends Record<string, string>>(base: T, alternates: Record<string, Partial<T>> = {}) => {
	const pack = {} as Record<keyof T, Bind<string>>;
	for (const s in base) {
		pack[s] = bind("");
	}
	language.wait(l => {
		const p = alternates[l];
		for (const s in base) {
			pack[s].value = p?.[s] ?? base[s];
		}
	});
	return Object.freeze(pack);
},
languages = ["en-GB", "en-US"];

export default makeLangPack({
	"EMPTY_CIRCLE": "Circle",
	"EMPTY_ELLIPSE": "Ellipse",
	"EMPTY_LAYER": "Layer",
	"EMPTY_LINE": "Line",
	"EMPTY_PATH": "Path",
	"EMPTY_POLYGON": "Polygon",
	"EMPTY_POLYLINE": "Polyline",
	"EMPTY_RECT": "Rectangle",
	"TITLE": "Skiving - SVG Generator",
	"UNDO_REDO": "Redo",
	"UNDO_UNDO": "Undo",
	"UNDO_WINDOW_REDOS": "Redo List",
	"UNDO_WINDOW_TITLE": "Undo",
	"UNDO_WINDOW_UNDOS": "Undo List",
}, {
	"en-US": {
	}
});
