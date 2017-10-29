import {generateRandomHexString} from "./stringUtil"
import {CSSNamespace} from "./CSSNamespace"

import * as jsdom from "jsdom"
import * as css from "css"

const document = null

export class Component {
	public dom:jsdom.JSDOM
	public cssNamespace:CSSNamespace = new CSSNamespace()

	constructor (public tag:string, html:string, public css?:string, public js?:string) {
		// Construct the DOM
		this.dom = new jsdom.JSDOM(html)

		console.log(`>> Constructed a new ${tag} Component, how exciting. This should only be called once per component type.`)
	}
}

export class UnknownComponent extends Component {
	constructor (tag:string) {
		console.log("Unknown type, using UnknownComponent for", tag)
		super(tag, "<slot></slot>")
	}
}


export class ComponentInstance {
	public uid:string
	public dom:jsdom.JSDOM

	constructor (private node:HTMLUnknownElement, public component:Component) {
		// Generate a unique ID for this component
		this.uid = generateRandomHexString()
		this.dom = new jsdom.JSDOM(component.dom.serialize()) // clone the DOM from the component

		const document = this.dom.window.document

		document.querySelectorAll("slot").forEach((slot:HTMLSlotElement) => {
			const slotReplacement = document.createElement("div")

			// inherit innerhtml
			slotReplacement.innerHTML = node.innerHTML

			// inherit attributes
			for (let i = 0; i < slot.attributes.length; i += 1) {
				slotReplacement.setAttribute(slot.attributes[i].name, slot.attributes[i].value)
			}

			// replace
			slot.outerHTML = slotReplacement.outerHTML
		})

		// render the html and overwrite this node
		node.outerHTML = this.renderHTML()

		console.log(`Constructed a new ComponentInstance of type ${component.tag}, it has a UID of ${this.uid}.`)
	}

	// Create the wrapper
	private render () : HTMLDivElement {
		const document = this.dom.window.document
		const wrapper = document.createElement("div")

		wrapper.dataset.inventedName = this.component.tag

		if (this.component.js) {
			wrapper.dataset.inventedId = this.uid
		}

		wrapper.innerHTML = document.body.innerHTML

		if (this.component.css) {
			wrapper.classList.add(this.component.cssNamespace.namespace)
		}

		return wrapper
	}

	private renderHTML () : string {
		return this.render().outerHTML
	}
}
