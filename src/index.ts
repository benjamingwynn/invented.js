import {generateRandomHexString} from "./stringUtil"
import {CSSNamespace} from "./CSSNamespace"

import * as jsdom from "jsdom"
import * as css from "css"
import * as fs from "fs"

// flags errors when trying to use document as a global
const document = null

// load the built context to inject
const CONTEXT_JS = fs.readFileSync("./lib/Context.js").toString()

export class Component {
	public dom:jsdom.JSDOM
	public cssNamespace:CSSNamespace = new CSSNamespace()

	constructor (public tag:string, html:string, public css?:string, public js?:string) {
		// Construct the DOM
		this.dom = new jsdom.JSDOM(html)

		console.log(`Constructed a new ${tag} Component, how exciting.`)
	}
}

class ComponentInstance {
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

class Page {
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

				promise.then((component) => {
					console.log("Constructed a new component, checking for JS")

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
					console.log("Constructed a new component, checking for CSS")

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
							node.selectors[i] = `.${component.cssNamespace.namespace} ${node.selectors}`
						}
					})

					console.log(cssTree.stylesheet.rules)

					// add CSS to the DOM
					const style = document.createElement("style")

					style.innerHTML = css.stringify(cssTree)

					// TODO: Scoped animations

					document.body.appendChild(style)
				})

				// push it to an array so we can do Promise.all on it
				componentBuilders[componentName] = promise
				componentBuildersArray.push(promise)
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

export abstract class ComponentComposer {
	abstract composeComponent (componentName:string, existingHTML?:string) : Promise <Component>
}

// A sample composer that can only compose hard-coded test components
class helloWorldComposer extends ComponentComposer {
	composeComponent (componentName:string) {
		return new Promise <Component> ((resolve, reject) => {
			setTimeout(() => {
				if (componentName === "hello-world") {
					resolve(new Component(componentName, "<h1>Hello World!</h1><p>Look at how blue that is!</p>", "h1 { color: blue; }"))
				} else if (componentName === "another-world") {
					resolve(new Component(componentName, "<h1>Hello World!</h1><p>This element doesn't have any CSS."))
				} else if (componentName === "test-form") {
					resolve(new Component(
						componentName,
						"<h1>Hello World Form</h1><form id='cont'><input id='input' type='text'><button type='submit'>Submit</button><p id='output'></p></form>",
						"form {background:yellow} h1 {color: red}",
						`
							function test (event) {
								const msg = context.getElement("#input").value

								context.getElement("#output").innerHTML = msg

								event.preventDefault()
							}

							context.getElement("#cont").addEventListener("submit", test)
						`
					))
				} else {
					reject(new Error("This test can only build hello-world components."))
				}
			}, (1500 * Math.random()) + 500)
		})
	}
}

function buildTestHelloWorldPage () {
	const page = new Page(`
		<!doctype html>
		<head>
			<title>Hello World Test</title>
		</head>
		<body>
			<test-form></test-form>
			<another-world></another-world>
			<hello-world></hello-world>
			<hello-world></hello-world>
			<another-world></another-world>
			<test-form></test-form>
		</body>
	`, new helloWorldComposer())

	// once the page is ready, render it and log that rendering to the console
	page.ready.then(() => {
		// console.log("\n\n......\n\n", page.render())
		fs.writeFileSync("build/test.html", page.render())
	})
}

buildTestHelloWorldPage()
