import ComponentManifest from "./ComponentManifest"
import * as fs from "fs-extra"
import * as fsUtil from "./fsUtil"
import * as jsdom from "jsdom"
import * as stringUtil from "./stringUtil"

export abstract class ComponentManifestHandler {
	public constructor () {
		// ...
	}

	public abstract html (manifest:ComponentManifest, componentName:string) : Promise<jsdom.JSDOM>
	public abstract css (manifest:ComponentManifest, componentName:string) : Promise<string|undefined>
	public abstract js (manifest:ComponentManifest, componentName:string) : Promise<string|undefined>
}

function stackDOMS (htmlStrings:string[]) : jsdom.JSDOM {
	const len = htmlStrings.length
	let dom:jsdom.JSDOM|null = null

	for (let i = 0; i < len; i += 1) {
		const blob = htmlStrings[i]

		const newDom = new jsdom.JSDOM(blob.toString())

		if (dom) {
			// get elements with declared id's
			const nodes = newDom.window.document.body.querySelectorAll("*[id]")

			for (let nodeIndex = 0; nodes.length; nodeIndex += 1) {
				const node:Element = nodes[nodeIndex]
				// ...
				const existing = dom.window.document.body.querySelector(`#${node.id}`)

				if (existing) {
					// override
					existing.outerHTML = node.outerHTML
				}
			}

		} else {
			dom = newDom
		}
	}

	if (!dom) {
		throw new Error("Missing DOM. Is HTML declared in your manifest?")
	}

	return dom
}

/** Loads the manifest assets from the Filesystem */
export class ComponentManifestHandlerFS extends ComponentManifestHandler {
	public constructor (private workingDirectory:string) {
		super()
	}

	protected generatePath (componentName:string) {
		return this.workingDirectory + componentName + "/"
	}

	public html (manifest:ComponentManifest, componentName:string) : Promise<jsdom.JSDOM> {
		return new Promise (async (resolve) => {
			// Get all of the files

			try {
				const promises:Promise<string>[] = []

				const len = manifest.code.html.length
				for (let i = 0; i < len; i += 1) {
					promises.push(fs.readFile(this.generatePath(componentName) + manifest.code.html[i], "utf-8"))
				}

				// ...
				Promise.all(promises).then((result) => {
					resolve(stackDOMS(result))
				})

				// const blob = await fs.readFile(this.generatePath(componentName) + manifest.code.html[0])
				// const html = blob.toString()
				// const dom = new jsdom.JSDOM(html)

			} catch (ex) {
				throw new Error(ex)
			}
		})
	}

	private fsConcat (manifest:ComponentManifest, componentName:string, files:string[]) : Promise<string|undefined> {
		return new Promise (async (resolve) => {
			if (files[0]) {
				let css:string = ""

				for (let i = 0, n = manifest.code.css.length; i < n; i += 1) {
					const path = this.generatePath(componentName) + files[i]

					if (await fsUtil.isFileReadable(path)) {
						css += (await fs.readFile(path, "utf-8"))
					} else {
						console.warn("File declared but I can't access it, maybe it doesn't exist:", files[i])
					}
				}


				resolve(css)
			}
		})
	}

	public css (manifest:ComponentManifest, componentName:string) : Promise<string|undefined> {
		return new Promise (async (resolve) => {
			if (manifest.code.css && manifest.code.css[0]) {
				resolve(await this.fsConcat(manifest, componentName, manifest.code.css))
			} else {
				console.warn("!! - CSS not declared in the manifest")

				resolve()
			}

		})
	}

	public js (manifest:ComponentManifest, componentName:string) : Promise<string|undefined> {
		return new Promise (async (resolve) => {
			if (manifest.code.js && manifest.code.js[0]) {
				resolve(await this.fsConcat(manifest, componentName, manifest.code.js))
			} else {
				console.warn("!! - JS not declared in the manifest")

				resolve()
			}
		})
	}
}

/** Uses the string specified in the manifest as the source code to construct the invention. Useful for small components */
export class ComponentManifestHandlerInline extends ComponentManifestHandler {
	public html (manifest: ComponentManifest, componentName: string): Promise<jsdom.JSDOM> {
		// TODO: DOM Stacking
		return new Promise((resolve) => {
			resolve(new jsdom.JSDOM(manifest.code.html.join("\n")))
		})
	}

	public css (manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		return new Promise((resolve) => {
			resolve(manifest.code.css.join("\n"))
		})
	}

	public js (manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		return new Promise((resolve) => {
			resolve(manifest.code.js.join("\n"))
		})
	}
}

/** Automatically decides which component manifest handler to use based on the string. Slower than using the manifest handlers directly, but easier to use. */
export class ComponentManifestHandlerAuto extends ComponentManifestHandlerFS {
	private isValidPath (path:string, extensions:string|string[]) : Promise <boolean> {
		return new Promise((resolve) => {
			// FUTURE: if the path looks correct, try to resolve it - if it does not resolve, return false
			resolve(path.indexOf("./") === 0 || path.indexOf("/") === 0 || stringUtil.stringEndsIn(path, extensions))
		})
	}

	private handleLines (componentName: string, lines:string[], extensions:string[]|string) : Promise<string[]> {
		return new Promise(async (resolve) => {
			const promises:Promise<string>[] = []
			const n:number = lines.length

			if (n === 0) {
				// throw new Error("Array is empty.")
				return resolve([""])
			}

			for (let i:number = 0; i < n; i += 1) {
				const line:string = lines[i]

				if (await this.isValidPath(line, extensions)) {
					console.log("~ This looks like a valid path to me:", line)
					// load the path from the filesystem
					promises.push(fs.readFile(this.generatePath(componentName) + line, "utf-8"))
				} else {
					// inline
					console.log("~ This seems to be inline code:", line, extensions)

					promises.push(new Promise ((resolve) => resolve(line))) // mask as a promise to make it easier to handle completion
				}
			}

			Promise.all(promises).then((results) => resolve(results))
		})
	}

	public html (manifest: ComponentManifest, componentName: string): Promise<jsdom.JSDOM> {
		return new Promise(async (resolve) => {
			const results:string[] = await this.handleLines(componentName, manifest.code.html, [".html", ".htm", ".hbs", ".svg", ".xml"])
			resolve(stackDOMS(results))
		})
	}

	public css (manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		return new Promise(async (resolve) => {
			resolve((await this.handleLines(componentName, manifest.code.css, ".css")).join("\n"))
		})
		// throw new Error("Method not implemented.");
	}

	public js (manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		return new Promise(async (resolve) => {
			resolve((await this.handleLines(componentName, manifest.code.js, ".js")).join("\n"))
		})
		// throw new Error("Method not implemented.");
	}
}
