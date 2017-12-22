export default interface ComponentManifest {
	meta: {
		name?:string,
	},

	code: {
		html:string[],
		css:string[],
		js:string[],
	}
}