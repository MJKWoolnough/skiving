import {clearNode} from './lib/dom.js';
import pageLoad from './lib/load.js';
import lang from './language.js';

pageLoad.then(() => {
	const title = document.head.getElementsByTagName("title")[0];
	if (title) {
		clearNode(title, lang["TITLE"]);
	} else {
		document.title = lang["TITLE"] + "";
	}
});
