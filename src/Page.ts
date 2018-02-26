import * as fs from "fs"
import * as jsdom from "jsdom"
import * as css from "css"

import {Component, ComponentInstance} from "./Component"
import {CSSNamespace} from "./CSSNamespace"
import {purgeString} from "./stringUtil"
import {isolateCSS} from "./isolateCSS"
import ComponentManifest from "./ComponentManifest"
import {ComponentManifestRetriever} from "./ComponentManifestRetriever"
import {ComponentManifestHandler} from "./ComponentManifestHandler"

import {domMoveChilden, copyDOMAttributes} from "./domUtil"

// Document is not a global. This is mainly to flag errors in Typescript when trying to use it as such
const document = null

// Load the bootstrap file. We'll inject this into our page. This doesn't need to be done syncronously, but it's easier to do so.
const BOOTSTRAP_JS = fs.readFileSync(`${__dirname}/../lib/bootstrap.js`).toString()

const noJSClass = new CSSNamespace().namespace

export class Page {
	public dom:jsdom.JSDOM
	private componentInstances:Array<ComponentInstance> = []

	public ready:Promise<Component[]>

	private getUnconstructedElements (callback : (node:HTMLUnknownElement) => void) : number {
		let n:number = 0

		//console.log("Finding invented elements...")

		/*
			Any element which isn't a default HTML element
		*/
		this.dom.window.document.querySelectorAll("invention").forEach((node:any) => {
			//console.log("Found invented obj no.", n)

			n += 1
			callback(node)
		})

		//console.log("Total", n, "invented DOMobjects")

		return n
	}

	constructor (html:string, manifestRetriever:ComponentManifestRetriever, manifestHandler:ComponentManifestHandler, callback:(constructedPage:Page) => void) {
		// Construct DOM
		this.dom = new jsdom.JSDOM(html)
		const document = this.dom.window.document

		const that = this

		// Store the promises for the components
		const componentBuilders:{[index:string] : Promise<Component>} = {}

		let loadedContextJS:boolean

		//console.log("Injecting common CSS into the page")

		const style = document.createElement("style")
		style.innerHTML = `.${noJSClass}{display: none}`
		style.id = "invented-hide-nojs-stylesheet"
		document.head.appendChild(style)

		let nBuilt = 0

		// Iterate through components looking for unknown elements
		let nTotal = this.getUnconstructedElements((node) => {
			constructNode(node)
		})

		//console.log("Injected CSS")

		function finishedBuilding () {
			//console.log("Finished required component construction.")

			// inherit
			while (true) { // lol
				const oldElement:Element|null = document.querySelector("[invention-slot], [data-invented-name]:not([data-invented-built])")

				if (!oldElement) break

				oldElement.removeAttribute("invention-slot")

				//console.log(oldElement.tagName)
				// const newElement:Element = document.createElement("div")
				const newElement:Element = document.createElement(oldElement.tagName === "INVENTION" ? "DIV" : oldElement.tagName)

				// inherit attributes
				copyDOMAttributes(oldElement, newElement)

				domMoveChilden(oldElement, newElement)

				newElement.setAttribute("data-invented-built", Date.now().toString())
				oldElement.outerHTML = newElement.outerHTML
			}

			//console.log("Moved nodes to new element from <invention> ")

			document.querySelectorAll("[invention-jsonly]").forEach((node) => {
				node.removeAttribute("invention-jsonly")
				//console.log("Found node which should only be shown when JS is enabled")
				node.classList.add(noJSClass)
			})

			// Find any unconstructed nodes and construct them.
			// FUTURE: there is probably a better way to do this
			const unconstructedNodes:NodeListOf<Element> = document.querySelectorAll("invention")
			for (let nodeI = 0; nodeI < unconstructedNodes.length; nodeI += 1) {
				//console.log("[!] An invention still exists that hasn't been constructed. I'm going to try and construct it")
				nTotal += 1 // add one to total so that this callback will be called again
				constructNode(<HTMLElement> unconstructedNodes[nodeI])
				return
			}

			//console.log("... no more additional inventions to construct ...")

			// handle custom root declarations
			document.querySelectorAll("[invention-root]").forEach((node) => {
				console.warn("[!] WARNING: invention-root was found. This might not work correctly")

				const parent = node.parentElement

				if (parent) {
					//console.log("OKAY", parent)
					// node.removeAttribute("invention-root")

					// copy all of the attributes from the nodes parent to the node
					copyDOMAttributes(parent, node, true)
					//console.log(node.outerHTML)

					// create the concatenated class string
					const realClass:string = parent.className + " " + node.className

					// set the class name as the concatenated class string
					parent.className = realClass.trim()
					node.className = realClass.trim()

					// set the node parent outer html to the nodes outer html
					parent.outerHTML = node.outerHTML
					//console.log("New class name is ", realClass)
				} else {
					throw new Error("Weird. No parentElement found on an [invention-root] node. Are you using the invention-root attribute correctly?")
				}

			})

			if (callback) {
				//console.log("[DONE] Firing callback")
				callback(that)
			}
		}

		function composeComponent (componentName:string, innerHTML?:string) : Promise<Component> {
			// TODO: innerHTML handling
			return new Promise (async (resolve) => {
				const manifest:ComponentManifest = await manifestRetriever.getManifest(componentName)
				//const manifestHandler:ComponentManifestHandler = new ManifestHandler()

				resolve(
					new Component(
						componentName,
						await manifestHandler.html(manifest, componentName),
						await manifestHandler.css(manifest, componentName),
						await manifestHandler.js(manifest, componentName)
					)
				)
			})
		}

		function constructNode (node:HTMLElement) {
			//console.log("Constructing component...")

			// I don't know what element this is, so construct its component
			const componentName:string = <string> node.getAttribute("name") // TODO: throw exception if component is not defined on element

			// const componentExists = await composer.checkForComponent(componentName)
			manifestRetriever.doesManifestExist(componentName).then((exists) => {
				if (exists) {
					//console.log("The component manifest exists, so that's good.", componentName)
				} else {
					console.warn("Could not find the manifest for:", componentName)

					nBuilt += 1

					if (nBuilt === nTotal) finishedBuilding()

					return
				}

				if (!componentBuilders[componentName]) {
					//console.log("Requesting component construction for", componentName)

					// Request the component be built
					const promise:Promise<Component> = composeComponent(componentName, node.innerHTML)

					componentBuilders[componentName] = promise

					promise.then((component) => {
						//console.log("Constructed a new component, checking for JS", componentName)

						if (!component.js) {
							console.warn("The component", component.name, "doesn't seem to have any Javascript")
							return
						}

						//console.log("This component is Javascript enabled...")

						/* Add the page bootstrap if we don't already have it! */
						if (!loadedContextJS) {
							//console.log("Injecting Context.js into the page")

							const script = document.createElement("script")
							script.innerHTML = BOOTSTRAP_JS
							document.body.appendChild(script)

							loadedContextJS = true
						}

						const script = document.createElement("script")
						script.innerHTML = `window._inventedComponents["${componentName}"] = function ($invention) {${component.js}}`
						document.body.appendChild(script)
					})

					promise.then((component) => {
						//console.log("Constructed a new component, checking for CSS", componentName)

						if (!component.css) {
							console.warn("The component", component.name, "doesn't seem to have any CSS")
							return
						}

						const isolated:string|null = isolateCSS(component.cssNamespace, component.css)

						if (!isolated) {
							console.warn("The component", component.name, "doesn't seem to have any CSS")

							return
						}

						// add CSS to the DOM
						const style = document.createElement("style")

						style.innerHTML = isolated

						document.body.appendChild(style)
					})
				}

				// Once the requested component is built, construct an instance of it
				componentBuilders[componentName].then((component:Component) => {
					const componentInstance = new ComponentInstance(node, component)

					that.componentInstances.push(componentInstance)

					if (component.js) {
						// //console.log("Added a component. Asking it to load its JS too.", component.tag, componentInstance.uid)

						const script = document.createElement("script")
						script.innerHTML = `window._inventedComponents["${component.name}"](document.querySelector("[data-invented-id='${componentInstance.uid}']"))`
						document.body.appendChild(script)
					}

					nBuilt += 1

					//console.log("nBuilt", nBuilt)

					if (nBuilt === nTotal) {
						finishedBuilding()
					}
				})
			})
		}

		// If there are no components then the above logic will never fire, which is lame, so fire it manually
		if (nTotal === 0) {
			finishedBuilding()
		}
	}

	public render () : string {
		return this.dom.serialize()
	}
}
