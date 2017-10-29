export function domMoveChilden (oldParent:Element, newParent:Element) {
	while (oldParent.childNodes.length > 0) {
		newParent.appendChild(oldParent.childNodes[0])
	}
}