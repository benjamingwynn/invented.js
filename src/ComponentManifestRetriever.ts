import ComponentManifest from "./ComponentManifest"
import * as fs from "fs-extra"

export abstract class ComponentManifestRetriever {
	public abstract getManifest (componentName:string) : Promise <ComponentManifest>
	public abstract doesManifestExist (componentName:string) : Promise <boolean>
}

//class ComponentManifestRetrieverFS extends ComponentManifestRetriever {
	// ... copy FileSystemComposer to here ...

//}

export class ComponentManifestRetrieverFS extends ComponentManifestRetriever {
	constructor (private workingDirectory:string) {
		super()
	}

	private generatePath (componentName:string) : string {
		return this.workingDirectory + componentName + ".json"
	}

	doesManifestExist (componentName:string) : Promise <boolean> {
		return new Promise(async resolve => {
			resolve(await Boolean(fs.access(this.generatePath(componentName), fs.constants.R_OK)))
		})
	}

	getManifest (componentName:string) : Promise <ComponentManifest> {
		return new Promise(async (resolve) => {
			resolve(await fs.readJSON(this.generatePath(componentName)))
		})
	}
}