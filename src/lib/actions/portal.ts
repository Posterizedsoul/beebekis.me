/**
 * Moves the element to <body> so fixed overlays escape ancestor stacking
 * contexts (e.g. a page container with z-index that would let the site nav
 * paint above the overlay).
 */
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}
