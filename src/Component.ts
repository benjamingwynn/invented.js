import {generateRandomHexString} from "./stringUtil"
import {domMoveChilden} from "./domUtil"
import {CSSNamespace} from "./CSSNamespace"

import * as jsdom from "jsdom"
import * as css from "css"

const document = null

export class Component {
	public readonly dom:jsdom.JSDOM
	public readonly cssNamespace:CSSNamespace = new CSSNamespace()

	constructor (public tag:string, html:string, public css?:string, public js?:string) {
		// Construct the DOM
		this.dom = new jsdom.JSDOM(html)

		console.log(`>> Constructed a new ${tag} Component, how exciting. This should only be called once per component type.`)
	}
}

export class ComponentInstance {
	public readonly uid:string
	// public readonly dom:jsdom.JSDOM

	constructor (private node:HTMLUnknownElement, public component:Component) {
		// Generate a unique ID for this component
		this.uid = generateRandomHexString()
		
		const templateBody = new jsdom.JSDOM(component.dom.serialize()).window.document.body // clone the DOM from the component

		// Create a temp space for holding the template components
		const tempSpace = node.ownerDocument.createElement("div")

		// Move children from template component copy to temp space
		domMoveChilden(templateBody, tempSpace)

		const slot:Element|null = tempSpace.querySelector("slot")

		// If we have a slot, move all the current children to it
		if (slot) {
			domMoveChilden(node, slot)
		}
		
		// Move everything from tempSpace to the actual node
		domMoveChilden(tempSpace, node)
		
		// Add special attributes
		node.dataset.inventedName = this.component.tag

		if (this.component.js) {
			// used to target nodes with JS
			node.dataset.inventedId = this.uid
		}

		if (this.component.css) {
			// used to target nodes with CSS
			node.classList.add(this.component.cssNamespace.namespace)
		}

		console.log(`Constructed a new ComponentInstance of type ${component.tag}, it has a UID of ${this.uid}.`)
	}
}
