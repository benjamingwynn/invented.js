import {generateRandomHexString} from "./stringUtil"
import {domMoveChilden, domAttributesToMap, AttributeMap} from "./domUtil"
import {CSSNamespace} from "./CSSNamespace"

import * as jsdom from "jsdom"
import * as css from "css"

import * as Handlebars from "handlebars"

const document = null

export class Component {
	public readonly cssNamespace:CSSNamespace = new CSSNamespace()

	constructor (public name:string, public readonly dom:jsdom.JSDOM, public css?:string, public js?:string) {
		// Construct the DOM
		console.log(`>> Constructed a new ${name} Component, how exciting. This should only be called once per component type.`)

		// var context = {title: "My New Post", body: "This is my first post!"}
		// var html    = template(context)
	}

	public generateTemplate () : HandlebarsTemplateDelegate<AttributeMap> {
		// TODO: caching
		// Serialize, and push through handlebars
		return Handlebars.compile(this.dom.serialize())
	}
}

export class ComponentInstance {
	public readonly uid:string
	// public readonly dom:jsdom.JSDOM

	constructor (private node:HTMLElement, public component:Component) {
		// Get the attributes from the component
		const attributes:AttributeMap = domAttributesToMap(node)

		// Generate a unique ID for this component
		this.uid = generateRandomHexString()

		// generate a template from the component
		const template:HandlebarsTemplateDelegate<AttributeMap> = component.generateTemplate()

		// using the template, generate a string
		const templateString:string = template(attributes)

		// create a dom from the template string
		const templateBody:HTMLElement= new jsdom.JSDOM(templateString).window.document.body

		// Create a temp space for holding the template components
		const tempSpace:HTMLElement = node.ownerDocument.createElement("div")

		// Move children from template component copy to temp space
		domMoveChilden(templateBody, tempSpace)

		const slot:Element|null = tempSpace.querySelector("[invention-slot]")

		// If we have a slot, move all the current children to it
		if (slot) {
			domMoveChilden(node, slot)
		}

		// Move everything from tempSpace to the actual node
		domMoveChilden(tempSpace, node)

		// Add special attributes
		node.dataset.inventedName = this.component.name
		node.removeAttribute("name")

		if (this.component.js) {
			// used to target nodes with JS
			node.dataset.inventedId = this.uid
		}

		if (this.component.css) {
			// used to target nodes with CSS
			node.classList.add(this.component.cssNamespace.namespace)
		}

		console.log(`Constructed a new ComponentInstance of type ${component.name}, it has a UID of ${this.uid}.`)
	}
}
