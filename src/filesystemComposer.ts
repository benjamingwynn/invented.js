import * as fs from "fs"
import {Component, ComponentComposer} from "./index"
import {kebabToCamelCase} from "./stringUtil"

const COMPONENT_DIRECTORY = "./components/"

class filesystemComposer extends ComponentComposer {
	composeComponent (componentName:string) {
		return new Promise <Component> ((resolve, reject) => {
			const path = `${COMPONENT_DIRECTORY}${kebabToCamelCase(componentName)}`

			// TODO: support for .htm
			fs.readFile(`${path}.html`, "utf-8", (error, data) => {
				if (error) return reject(error)

				Promise.all([
					new Promise ((resolve, reject) => {
						fs.readFile(`${path}.css`, "utf-8", (error, data) => {
							if (error) {
								console.warn(error)
								resolve()
							} else {
								resolve(data)
							}
						})
					}),
					new Promise ((resolve, reject) => {
						fs.readFile(`${path}.js`, "utf-8", (error, data) => {
							if (error) {
								console.warn(error)
								resolve()
							} else {
								resolve(data)
							}
						})
					})
				]).then((promises) => {
					console.log(promises)
				})
			})
		})
	}
}
