import ComponentManifest from "./ComponentManifest"
import * as filesystem from "fs-extra"
import * as JSDOM from "jsdom"

export abstract class ComponentManifestHandler {
	public constructor () {
		// ...
	}

	public abstract html (manifest:ComponentManifest) : Promise<JSDOM.JSDOM>
	public abstract css (manifest:ComponentManifest) : Promise<string|undefined>
	public abstract js (manifest:ComponentManifest) : Promise<string|undefined>
}

/** Loads the manifest from the Filesystem */
export class ComponentManifestHandlerFS extends ComponentManifestHandler {
	public constructor (private workingDirectory:string) {
		super()
	}

	public html (manifest:ComponentManifest) : Promise<JSDOM.JSDOM> {
		return new Promise (async (resolve) => {
			// TODO: inherit multiple files using JSDOM
			resolve(new JSDOM.JSDOM((await filesystem.readFile(this.workingDirectory + manifest.code.html[0])).toString()))
		})
	}

	public css () : Promise<string|undefined> {
		return new Promise ((resolve) => {
			// TODO
			resolve("")
		})
	}

	public js () : Promise<string|undefined> {
		return new Promise ((resolve) => {
			// TODO
			resolve("")
		})
	}
}