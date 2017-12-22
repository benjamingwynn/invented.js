export function domMoveChilden (oldParent:Element, newParent:Element) {
	while (oldParent.childNodes.length > 0) {
		newParent.appendChild(oldParent.childNodes[0])
	}
}

export interface AttributeMap {[name:string]:string}

export function domAttributesToMap ($0:HTMLElement) : AttributeMap {
	const attrsObj:AttributeMap = {}

	const attrs = $0.attributes

	let i:number = 0

	for (; i < attrs.length; i += 1) {
		const a = attrs[i]

		attrsObj[a.name] = <string> a.value
	}

	return attrsObj
}


export function copyDOMAttributes (oldElement:Element, newElement:Element, onlyCopyNew?:boolean) {
	for (let i = 0; i < oldElement.attributes.length; i += 1) {
		const name = oldElement.attributes[i].name
		const value = oldElement.attributes[i].value

		const hasAttr = newElement.hasAttribute(name)

		console.log("hasAttr", name, hasAttr, "| onlyCopyNew", onlyCopyNew)

		if (!onlyCopyNew || (onlyCopyNew && !hasAttr)) {
			console.log("copying")
			newElement.setAttribute(name, value)
		}
	}
}
