import ComponentManifest from "./ComponentManifest"
import * as fs from "fs-extra"

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
		return new Promise(async resolve => {
			resolve(await Boolean(fs.access(this.generatePath(componentName), fs.constants.R_OK)))
		})
	}

	getManifest (componentName:string) : Promise <ComponentManifest> {
		return new Promise(async (resolve, reject) => {
			const json = await fs.readJSON(this.generatePath(componentName))

			// safety
			if (!json.code) reject("no code object")
			if (!json.code.html) reject("no code.html")

			// string to array
			if (typeof json.code.html === "string") json.code.html = [json.code.html]
			if (typeof json.code.css === "string") json.code.css = [json.code.css]
			if (typeof json.code.js === "string") json.code.js = [json.code.js]

			resolve(json)
		})
	}
}
