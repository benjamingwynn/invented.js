import {generateRandomAlphabeticalCharacter} from "./stringUtil"

const usedCSSNamespaces:{[index:string] : boolean} = {}

export class CSSNamespace {
	public namespace:string = ""

	constructor () {
		let ns:string = ""

		while (!ns || usedCSSNamespaces[ns]) {
			ns = generateRandomAlphabeticalCharacter() + generateRandomAlphabeticalCharacter()
		}

		this.namespace = ns.toLowerCase()
	}
}
