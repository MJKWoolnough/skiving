import type {Binding, Bound} from './lib/dom.js';
import {bind} from './lib/dom.js';
import {StringSetting} from './lib/settings.js';

export const language = new StringSetting("language", navigator.language),
makeLangPack = <T extends Record<string, string>>(base: T, alternates: Record<string, Partial<T>> = {}) => {
	const pack = {} as Record<keyof T, Bound<string>>;
	for (const s in base) {
		pack[s] = bind("");
	}
	language.wait(l => {
		const p = alternates[l];
		for (const s in base) {
			pack[s].value = p?.[s] ?? base[s];
		}
	});
	return Object.freeze(pack as Record<keyof T, Binding>);
},
languages = ["en-GB", "en-US"];

export default makeLangPack({
	"COLOUR": "Colour",
	"COLOUR_ALPHA": "Alpha",
	"COLOUR_UPDATE": "Update Colour",
	"CONTROL_DOCK_DOWN": "Move Down",
	"CONTROL_DOCK_LEFT": "Dock to Left",
	"CONTROL_DOCK_OUT": "Undock",
	"CONTROL_DOCK_RIGHT": "Dock to Right",
	"CONTROL_DOCK_UP": "Move Up",
	"DOCK_LAYERS": "Layers",
	"TITLE": "Skiving - SVG Generator",
	"TITLE_CIRCLE": "Circle",
	"TITLE_ELLIPSE": "Ellipse",
	"TITLE_LAYER": "Layer",
	"TITLE_LINE": "Line",
	"TITLE_PATH": "Path",
	"TITLE_POLYGON": "Polygon",
	"TITLE_POLYLINE": "Polyline",
	"TITLE_RECT": "Rectangle",
	"TITLE_USE": "Use",
	"UNDO_REDO": "Redo",
	"UNDO_UNDO": "Undo",
	"UNDO_WINDOW_REDOS": "Redo List",
	"UNDO_WINDOW_TITLE": "Undo",
	"UNDO_WINDOW_UNDOS": "Undo List"
}, {
	"en-US": {
	}
});
