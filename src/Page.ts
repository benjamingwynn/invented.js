import * as fs from "fs"
import * as jsdom from "jsdom"
import * as css from "css"

import {Component, ComponentInstance} from "./Component"
import {ComponentComposer} from "./ComponentComposer"

// Flags errors when trying to use document as a global
const document = null

// load the built context to inject
const CONTEXT_JS = fs.readFileSync("./lib/Context.js").toString()

export class Page {
	private dom:jsdom.JSDOM
	private componentInstances:Array<ComponentInstance> = []

	public ready:Promise<Component[]>

	private getDOMUnknowns (callback : (node:HTMLUnknownElement) => void) {
		this.dom.window.document.querySelectorAll("*").forEach((node:HTMLElement) => {
			const isUnknown = node.toString() === "[object HTMLUnknownElement]"

			if (!isUnknown) {
				return
			}

			callback(node)
		})
	}

	constructor (html:string, composer:ComponentComposer) {
		// Construct DOM
		this.dom = new jsdom.JSDOM(html)

		// Store the promises for the components
		const componentBuilders:{[index:string] : Promise<Component>} = {}
		const componentBuildersArray:Array<Promise<Component>> = []

		let loadedContextJS:boolean

		// Iterate through components looking for unknown elements
		this.getDOMUnknowns((node) => { // heads up, this is a loop - it's syncronous

			// I don't know what element this is, so construct its component
			const componentName = node.tagName.toLowerCase()
			const document = this.dom.window.document

			// Construct the component if it isn't already under construction/finished construction
			if (!componentBuilders[componentName]) {
				// Request the component be built
				const promise:Promise<Component> = composer.composeComponent(componentName, node.innerHTML)

				componentBuilders[componentName] = promise
				// push it to an array too, so we can do Promise.all on it
				componentBuildersArray.push(promise)

				promise.then((component) => {
					console.log("Constructed a new component, checking for JS", componentName)

					if (!component.js) {
						console.warn("The component", component.tag, "doesn't seem to have any Javascript")
						return
					}

					console.log("This component is Javascript enabled...")

					/* Add the page bootstrap if we don't already have it! */
					if (!loadedContextJS) {
						console.log("Injecting Context.js into the page")

						const script = document.createElement("script")
						script.innerHTML = CONTEXT_JS
						document.body.appendChild(script)

						loadedContextJS = true
					}

					const script = document.createElement("script")
					script.innerHTML = `window._inventedComponents["${componentName}"] = function (context) {${component.js}}`
					document.body.appendChild(script)
				})

				promise.then((component) => {
					console.log("Constructed a new component, checking for CSS", componentName)

					if (!component.css) {
						console.warn("The component", component.tag, "doesn't seem to have any CSS")
						return
					}

					// add CSS if it exists

					const cssTree = css.parse(component.css)

					// look for css rules
					const elementStyles = []

					if (!cssTree.stylesheet || !cssTree.stylesheet.rules) {
						console.warn("CSS appears to not have any valid rules.")
						return
					}

					cssTree.stylesheet.rules.forEach((node:css.Rule) => {
						if (node.type !== "rule") return

						if (!node.selectors) {
							console.warn("Weird. node.selectors isn't defined")
							return
						}

						for (var i = 0; i < node.selectors.length; i += 1) {
							if (node.selectors[i] === ":root") {
								node.selectors[i] = `.${component.cssNamespace.namespace}`
							} else {
								node.selectors[i] = `.${component.cssNamespace.namespace} ${node.selectors[i]}`
							}
						}
					})

					console.log(cssTree.stylesheet.rules)

					// add CSS to the DOM
					const style = document.createElement("style")

					style.innerHTML = css.stringify(cssTree)

					// TODO: Scoped animations

					document.body.appendChild(style)
				})
			}

			// Once the requested component is built, construct an instance of it
			componentBuilders[componentName].then((component:Component) => {
				const componentInstance = new ComponentInstance(node, component)

				this.componentInstances.push(componentInstance)

				if (component.js) {
					console.log("Added a component. Asking it to load its JS too.", component.tag, componentInstance.uid)

					const script = document.createElement("script")
					script.innerHTML = `window._inventedComponents["${component.tag}"](new _inventedContext("${componentInstance.uid}"))`
					document.body.appendChild(script)
				}
			})

		})

		// Once all of the components are built, fire the callback
		this.ready = Promise.all(componentBuildersArray)
	}

	public render () : string {
		return this.dom.serialize()
	}
}
