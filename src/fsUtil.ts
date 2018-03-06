import * as fs from "fs-extra"

export function isFileReadable (path:string) : Promise <boolean> {
	console.log("Checking if file exists and is readable:", path)

	return new Promise((resolve) => {
		try {
			fs.access(path, fs.constants.R_OK, (error) => {
				resolve(!error)
			})
		} catch (ex) {
			resolve(false)
		}
	})
}
