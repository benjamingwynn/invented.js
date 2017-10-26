"use strict"

const fs = require("fs")
const util = require("util")
const JSDOM = require("jsdom").JSDOM
const css = require("css")
const genUnique = require("unique-string")

const COMPONENT_DIRECTORY = "./components/"
const PAGE_DIRECTORY = "./"

function toProperCase (string) {
	const split = string.split("")
	const first = split.shift()
	return first.toUpperCase() + split.join("")
}

function kebabToCamelCase (kebab) {
	const split = kebab.split("-")
	let result = split[0]
	kebab.split("-").forEach((part, index) => {if (index > 0) result += toProperCase(part)})
	return result
}

function buildComponent (componentName, callback) {
	fs.readFile(`${COMPONENT_DIRECTORY}${componentName}.html`, (error, contents) => {
		if (error) throw error

		const htmlRaw = contents.toString()

		// parse the HTML as a tree
		const dom = new JSDOM(htmlRaw)

		const doc = dom.window.document

		// load CSS
		// TODO check for css before loading it
		fs.readFile(`${COMPONENT_DIRECTORY}${componentName}.css`, (error, contents) => {
			if (error) throw error

			const cssRaw = contents.toString()

			// parse the css
			const cssTree = css.parse(cssRaw)

			// look for css rules
			// console.log(cssTree)
			const elementStyles = []

			cssTree.stylesheet.rules.forEach((rule) => {
				// console.log(rule)

				let style = ""
				// selectors[]

				rule.declarations.forEach((declartion) => {
					style += `${declartion.property}:${declartion.value};`
				})

				// console.log(style)

				rule.selectors.forEach((selector) => {
					elementStyles[selector] = elementStyles[selector] || ""
					elementStyles[selector] += style
				})
			})

			// console.log(elementStyles)

			// console.log(elementStyles[":root"])

			// // hack for root
			// const root = doc.querySelector("body")
			// root.setAttribute("style", elementStyles[":root"])
			// const root = doc.querySelector("template")

			const selectors = Object.keys(elementStyles)

			selectors.forEach((selector) => {
				if (selector === ":root") return

				// console.log(selector, doc.querySelector(selector))

				doc.querySelectorAll(selector).forEach((node) => {
					// console.log(node)
					node.setAttribute("style", elementStyles[selector])
				})

				// console.log("...")
			})

			const uid = genUnique()
			const htmlOut = `
			<div data-component-composer-name="${componentName}" data-component-composer-id="${uid}" style="${elementStyles[":root"]}">
				${doc.body.innerHTML}
			</div>`

			// console.log("\n\n", htmlOut)
			callback(null, htmlOut.trim(), uid)
		})
	})
}

function promiseBuildComponent (componentRef, componentName) {
	return new Promise((resolve, reject) => {
		buildComponent(componentName, (error, html, uid) => {
			if (error) {
				reject(error)
			} else {
				resolve({componentRef, html, uid, componentName})
			}
		})
	})
}

function generateComponentJS (script, componentName) {
	return new Promise((resolve, reject) => {
		fs.readFile(`${COMPONENT_DIRECTORY}${componentName}.js`, (error, contents) => {
			if (error) throw error

			const scriptContent = contents.toString()

			script.innerHTML = `window._ccComponents["${componentName}"] = function (context) {${scriptContent}}`
			resolve()
		})
	})
}

function buildPage (pageName) {
	fs.readFile(`${PAGE_DIRECTORY}${pageName}.html`, (error, contents) => {
		if (error) throw error

		const htmlRaw = contents.toString()

		// parse the HTML as a tree
		const dom = new JSDOM(htmlRaw)

		const doc = dom.window.document

		const promises = []
		const componentsBuilt = {}

		// add the bootstrap and context object
		fs.readFile("./Context.js", (error, contents) => {
			if (error) throw error

			const script = doc.createElement("script")
			script.innerHTML = contents.toString()
			doc.body.appendChild(script)


			doc.querySelectorAll("*").forEach((node) => {
				const isUnknown = node.toString() === "[object HTMLUnknownElement]"
				// console.log(node.tagName, isUnknown)

				if (isUnknown) {
					// i dont know what element this is, so construct its component
					const nameInCamelCase = kebabToCamelCase(node.tagName.toLowerCase())
					promises.push(promiseBuildComponent(node, nameInCamelCase))

					componentsBuilt[nameInCamelCase] = true
				}
			})

			Promise.all(promises).then((resolve, reject) => {
				if (reject) throw reject

				const jsPromises = []

				// add scripts for each of the components built
				Object.keys(componentsBuilt).forEach((componentName) => {
					// load script into dom and mark it with the type
					const script = doc.createElement("script")
					script.dataset.componentComposerFor = componentName

					jsPromises.push(generateComponentJS(script, componentName))
					//script.innerHTML = generateComponentJS(componentName)

					// apend it to the end of the body
					doc.body.appendChild(script)

					// console.log("BLUGH")
				})

				Promise.all(jsPromises).then((jsResolve, reject) => {
					if (reject) throw reject

					// console.log(resolve)
					resolve.forEach((component) => {
						component.componentRef.outerHTML = component.html

						// load script for this component
						const script = doc.createElement("script")
						script.innerHTML = `window._ccComponents["${component.componentName}"](new _ccContext("${component.uid}"))`
						doc.body.appendChild(script)
					})

					// console.log("... done all builds ...")
					console.log(dom.serialize())
				})
			})
		})
	})
}

// buildComponent("helloWorld")

buildPage("index")
