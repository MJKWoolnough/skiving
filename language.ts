import {StringSetting} from './lib/settings.js';

export const language = new StringSetting("language", navigator.language),
makeLangPack = <T extends Record<string, string>>(base: T, alternates: Record<string, Partial<T>> = {}) => {
	const pack = alternates[language.value];
	if (pack) {
		for (const s in base) {
			pack[s] ??= base[s];
		}
	}
	return Object.freeze(pack as T ?? base);
},
languages = ["en-GB", "en-US"];

export default makeLangPack({
}, {
	"en-US": {
	}
});
