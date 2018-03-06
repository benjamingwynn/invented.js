import ComponentManifest from "./ComponentManifest"
import * as fs from "fs-extra"
import * as fsUtil from "./fsUtil"

export abstract class ComponentManifestRetriever {
	public abstract getManifest (componentName:string) : Promise <ComponentManifest>
	public abstract doesManifestExist (componentName:string) : Promise <boolean>
}

//class ComponentManifestRetrieverFS extends ComponentManifestRetriever {
	// ... copy FileSystemComposer to here ...

//}

/** Get the manifest from the filesystem */
export class ComponentManifestRetrieverFS extends ComponentManifestRetriever {
	constructor (private workingDirectory:string) {
		super()
	}

	private generatePath (componentName:string) : string {
		return this.workingDirectory + componentName + "/index.json"
	}

	doesManifestExist (componentName:string) : Promise <boolean> {
		console.log("Checking if manifest exists:", componentName)
		return fsUtil.isFileReadable(this.generatePath(componentName))
	}

	getManifest (componentName:string) : Promise <ComponentManifest> {
		return new Promise(async (resolve, reject) => {
			try {
				const json = await fs.readJSON(this.generatePath(componentName))

				if (!json.code) {
					json.code = {}
				}

				// string to array
				if (typeof json.code.html === "string") json.code.html = [json.code.html]
				if (typeof json.code.css === "string") json.code.css = [json.code.css]
				if (typeof json.code.js === "string") json.code.js = [json.code.js]

				const cDir:string = this.workingDirectory + componentName + "/"

				if (typeof json.code.html === "undefined") {
					if (await fsUtil.isFileReadable(cDir + "index.html")) {
						json.code.html = ["./index.html"]
					} else {
						throw new Error("No index provided, and default index.html does not exist. Consult the documentation.")
					}
				}

				if (typeof json.code.js === "undefined") json.code.js = [(await fsUtil.isFileReadable(cDir + "index.js")) ? "index.js" : ""]
				if (typeof json.code.css === "undefined") json.code.css = [(await fsUtil.isFileReadable(cDir + "index.css")) ? "index.css" : ""]

				console.log(json)

				resolve(json)
			} catch (ex) {
				reject(ex)
			}
		})
	}
}
