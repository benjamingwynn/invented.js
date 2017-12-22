import ComponentManifest from "./ComponentManifest"
import * as fs from "fs-extra"
import * as jsdom from "jsdom"

export abstract class ComponentManifestHandler {
	public constructor () {
		// ...
	}

	public abstract html (manifest:ComponentManifest, componentName:string) : Promise<jsdom.JSDOM>
	public abstract css (manifest:ComponentManifest, componentName:string) : Promise<string|undefined>
	public abstract js (manifest:ComponentManifest, componentName:string) : Promise<string|undefined>
}

function stackDOMS () {

}

/** Loads the manifest assets from the Filesystem */
export class ComponentManifestHandlerFS extends ComponentManifestHandler {
	public constructor (private workingDirectory:string) {
		super()
	}

	private generatePath (componentName:string) {
		return this.workingDirectory + componentName + "/"
	}

	public html (manifest:ComponentManifest, componentName:string) : Promise<jsdom.JSDOM> {
		return new Promise (async (resolve) => {
			try {
				let dom:jsdom.JSDOM|null = null

				const len = manifest.code.html.length
				for (let i = 0; i < len; i += 1) {
					const blob = await fs.readFile(this.generatePath(componentName) + manifest.code.html[i])

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
					throw "Missing DOM. Is HTML declared in your manifest?"
				}

				resolve (dom)

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

					if (!Boolean(await fs.access(path, fs.constants.R_OK))) {
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
	public html(manifest: ComponentManifest, componentName: string): Promise<jsdom.JSDOM> {
		// TODO: DOM Stacking
		return new Promise((resolve) => {
			resolve(new jsdom.JSDOM(manifest.code.html.join("\n")))
		})
	}

	public css(manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		return new Promise((resolve) => {
			resolve(manifest.code.css.join("\n"))
		})
	}

	public js(manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		return new Promise((resolve) => {
			resolve(manifest.code.js.join("\n"))
		})
	}
}

/** Automatically decides which component manifest handler to use based on the string. Slower than using the manifest handlers directly, but easier to use. */
export class ComponentManifestHandlerAuto extends ComponentManifestHandler {
	public html(manifest: ComponentManifest, componentName: string): Promise<jsdom.JSDOM> {
		throw new Error("Method not implemented.");
	}
	public css(manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		throw new Error("Method not implemented.");
	}
	public js(manifest: ComponentManifest, componentName: string): Promise<string | undefined> {
		throw new Error("Method not implemented.");
	}
}
