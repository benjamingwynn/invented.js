import * as fs from "fs"
import {Component} from "./Component"
import {ComponentComposer} from "./ComponentComposer"
import {kebabToCamelCase} from "./stringUtil"

const COMPONENT_DIRECTORY = "/components/"

/** Compose components from the filesystem */
export class FilesystemComposer extends ComponentComposer {
	constructor (public workingDirectory:string) {
		super()
	}

	private generatePath (componentName:string) : string {
		return this.workingDirectory + COMPONENT_DIRECTORY + kebabToCamelCase(componentName)
	}

	public checkForComponent (componentName:string) : Promise <boolean> {
		return new Promise <boolean> ((resolve, reject) => {
			// TODO: support for .htm
			fs.readFile(`${this.generatePath(componentName)}.html`, "utf-8", (error, html) => {
				// TODO: maybe use stat/lstat instead of checking a read error?
				resolve(!error)
				// if (error) reject(error)
			})
		})
	}

	public composeComponent (componentName:string) : Promise <Component> {
		return new Promise <Component> ((resolve, reject) => {
			const path = this.generatePath(componentName)

			// TODO: support for .htm
			fs.readFile(`${path}.html`, "utf-8", (error, html) => {
				if (error) return reject(error)

				console.log("Loading", path, "component from filesystem")

				Promise.all([
					// Load CSS
					new Promise <string> ((resolve, reject) => {
						fs.readFile(`${path}.css`, "utf-8", (error, data) => {
							if (error) {
								// console.warn(error)
								resolve("")
							} else {
								resolve(data)
							}
						})
					}),

					// Load JS
					new Promise <string> ((resolve, reject) => {
						fs.readFile(`${path}.js`, "utf-8", (error, data) => {
							if (error) {
								// console.warn(error)
								resolve("")
							} else {
								resolve(data)
							}
						})
					})
				]).then((promises) => {
					const css:string = promises[0]
					const js:string = promises[1]

					resolve(new Component(componentName, html, css || undefined, js || undefined))
				})
			})
		})
	}
}
