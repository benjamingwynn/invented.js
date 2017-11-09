import * as fs from "fs"
import * as jsdom from "jsdom"
import * as css from "css"

import {Component, ComponentInstance} from "./Component"
import {ComponentComposer} from "./ComponentComposer"
import {CSSNamespace} from "./CSSNamespace"
import {purgeString} from "./stringUtil"
import {isolateCSS} from "./isolateCSS"

import {domMoveChilden} from "./domUtil"

// Document is not a global.
const document = null

// load the built context to inject
const CONTEXT_JS = fs.readFileSync(`${__dirname}/../lib/Context.js`).toString()

const noJSClass = new CSSNamespace().namespace

export class Page {
	public dom:jsdom.JSDOM
	private componentInstances:Array<ComponentInstance> = []

	public ready:Promise<Component[]>

	private getDOMUnknowns (callback : (node:HTMLUnknownElement) => void) : number {
		let n:number = 0

		console.log("Finding unknown objects...")

		/*
			Any element which isn't a default HTML element
		*/
		this.dom.window.document.querySelectorAll("*:not(html):not(head):not(link):not(meta):not(base):not(script):not(style):not(title):not(body):not(address):not(article):not(aside):not(footer):not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(header):not(hgroup):not(nav):not(section):not(blockquote):not(cite):not(dd):not(dl):not(div):not(dt):not(figcaption):not(figure):not(hr):not(li):not(ol):not(ul):not(menu):not(main):not(p):not(pre):not(a):not(abbr):not(b):not(bdi):not(bdo):not(br):not(code):not(data):not(time):not(dfn):not(em):not(i):not(kbd):not(mark):not(q):not(rp):not(ruby):not(rt):not(rtc):not(rb):not(s):not(del):not(ins):not(samp):not(small):not(span):not(strong):not(sub):not(sup):not(u):not(var):not(wbr):not(area):not(map):not(audio):not(source):not(img):not(track):not(video):not(embed):not(object):not(param):not(picture):not(canvas):not(noscript):not(caption):not(table):not(col):not(colgroup):not(tbody):not(tr):not(td):not(tfoot):not(th):not(thead):not(button):not(datalist):not(option):not(fieldset):not(label):not(form):not(input):not(legend):not(meter):not(optgroup):not(select):not(output):not(progress):not(textarea):not(details):not(dialog):not(menuitem):not(summary):not(content):not(slot):not(element):not(shadow):not(template):not(acronym):not(applet):not(basefont):not(font):not(big):not(blink):not(center):not(command):not(dir):not(frame):not(frameset):not(image):not(isindex):not(keygen):not(listing):not(marquee):not(multicol):not(nextid):not(noembed):not(plaintext):not(spacer):not(strike):not(tt):not(xmp)").forEach((node:any) => {
			console.log("Found unknown - unknown no.", n)

			n += 1
			callback(node)
		})

		console.log("Total", n, "unknown DOMobjects")

		return n
	}

	constructor (html:string, composer:ComponentComposer, callback:(constructedPage:Page) => void) {
		// Construct DOM
		this.dom = new jsdom.JSDOM(html)
		const document = this.dom.window.document

		const that = this

		// Store the promises for the components
		const componentBuilders:{[index:string] : Promise<Component>} = {}

		let loadedContextJS:boolean

		console.log("Injecting common CSS into the page")

		const style = document.createElement("style")
		style.innerHTML = `.${noJSClass}{display: none}`
		style.id = "invented-hide-nojs-stylesheet"
		document.head.appendChild(style)

		let nBuilt = 0

		console.log("Injected CSS")

		function finishedBuilding () {
			console.log("!!! Finished all promises for page building !!!")

			// use <div> for registered custom elements and slots
			while (true) { // lol
				const oldElement:Element|null = document.querySelector("slot, [data-invented-name]:not(div)")

				if (!oldElement) break

				const newElement:Element = document.createElement("div")

				// inherit attributes
				for (let i = 0; i < oldElement.attributes.length; i += 1) {
					newElement.setAttribute(oldElement.attributes[i].name, oldElement.attributes[i].value)
				}

				domMoveChilden(oldElement, newElement)

				oldElement.outerHTML = newElement.outerHTML
			}

			document.querySelectorAll("[js-only]").forEach((node) => {
				console.log("Found node which should only be shown when JS is enabled")
				node.classList.add(noJSClass)
			})

			if (callback) {
				callback(that)
			}
		}

		// Iterate through components looking for unknown elements
		const nTotal = this.getDOMUnknowns(async (node) => {
			console.log("Constructing component...")

			// I don't know what element this is, so construct its component
			const componentName:string = node.tagName.toLowerCase()

			const componentExists = await composer.checkForComponent(componentName)

			if (componentExists) {
				console.log("The component exists, so that's good.", componentName)
			} else {
				console.warn("Your composer does not have the component requested:", componentName)

				nBuilt += 1

				if (nBuilt === nTotal) finishedBuilding()

				return
			}

			if (!componentBuilders[componentName]) {
				console.log("Requesting component construction for", componentName)

				// Request the component be built
				const promise:Promise<Component> = composer.composeComponent(componentName, node.innerHTML)

				componentBuilders[componentName] = promise

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

					const isolated:string|null = isolateCSS(component.cssNamespace, component.css)

					if (!isolated) {
						console.warn("The component", component.tag, "doesn't seem to have any CSS")

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

				this.componentInstances.push(componentInstance)

				if (component.js) {
					// console.log("Added a component. Asking it to load its JS too.", component.tag, componentInstance.uid)

					const script = document.createElement("script")
					script.innerHTML = `window._inventedComponents["${component.tag}"](new _inventedContext("${componentInstance.uid}"))`
					document.body.appendChild(script)
				}

				nBuilt += 1

				console.log("nBuilt", nBuilt)

				if (nBuilt === nTotal) {
					finishedBuilding()
				}
			})
		})

		// If there are no components then the above logic will never fire, which is lame, so fire it manually
		if (nTotal === 0) {
			finishedBuilding()
		}
	}

	public render () : string {
		return this.dom.serialize()
	}
}
