import {generateRandomHexString} from "./stringUtil"
import {CSSNamespace} from "./CSSNamespace"

import * as jsdom from "jsdom"
import * as css from "css"

export class Component {
	public dom:jsdom.JSDOM
	public cssNamespace:CSSNamespace = new CSSNamespace()

	constructor (public tag:string, html:string, public css?:string, public js?:string) {
		// Construct the DOM
		this.dom = new jsdom.JSDOM(html)

		console.log(`Constructed a new ${tag} Component, how exciting.`)
	}
}

export class ComponentInstance {
	public uid:string

	constructor (private node:HTMLUnknownElement, public component:Component) {
		// Generate a unique ID for this component
		this.uid = generateRandomHexString()

		// render the html and overwrite this node
		node.outerHTML = this.renderHTML()

		console.log(`Constructed a new ComponentInstance, it has a UID of ${this.uid}.`)
	}

	// Create the wrapper
	private render () : HTMLDivElement {
		const wrapper = this.component.dom.window.document.createElement("div")

		wrapper.dataset.inventedName = this.component.tag

		if (this.component.js) {
			wrapper.dataset.inventedId = this.uid
		}

		wrapper.innerHTML = this.component.dom.window.document.body.innerHTML

		if (this.component.css) {
			wrapper.className = this.component.cssNamespace.namespace
		}

		return wrapper
	}

	private renderHTML () : string {
		return this.render().outerHTML
	}
}
