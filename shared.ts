import type { Children, PropsObject} from './lib/dom.js';
import {id} from './lib/css.js';
import {amendNode} from './lib/dom.js';
import {label} from './lib/html.js';

type Input = HTMLInputElement | HTMLButtonElement | HTMLTextAreaElement | HTMLSelectElement;

interface Labeller {
	<T extends Input>(name: Children, input: T, props?: PropsObject): [HTMLLabelElement, T];
	<T extends Input>(input: T, name: Children, props?: PropsObject): [T, HTMLLabelElement];
}

export const labels = ((name: Children | Input, input: Input | Children, props: PropsObject = {}) => {
	const iProps = {"id": props["for"] = id()};
	return name instanceof HTMLInputElement || name instanceof HTMLButtonElement || name instanceof HTMLTextAreaElement || name instanceof HTMLSelectElement ? [amendNode(name, iProps), label(props, input)] : [label(props, name), amendNode(input as Input, iProps)];
}) as Labeller;
