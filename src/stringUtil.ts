export function toProperCase (input:string) : string {
	const split:string[] = input.split("")

	if (split.length === 0) {
		return ""
	}

	const first:string = <string> split.shift()

	return first.toUpperCase() + split.join("")
}

export function kebabToCamelCase (input:string) : string {
	const split:string[] = input.split("-")

	if (split.length === 0) {
		return ""
	}

	let result:string = <string> split[0]

	input.split("-").forEach((part:string, index:number) => {
		if (index > 0) {
			result += toProperCase(part)
		}
	})

	return result
}

export function generateRandomAlphabeticalCharacter () : string {
	return String.fromCharCode(65 + Math.floor(Math.random() * 24))
}

// TODO generateRandomAlphabeticalString

export function generateRandomHexCharacter () : string {
	const rand:number = Math.floor(Math.random() * 16)
	return String.fromCharCode(48 + (rand < 10 ? rand : rand + 7)).toLowerCase()
}

export function generateRandomHexString (characterCount:number = 16) : string {
	if (characterCount === Infinity || characterCount < 1 || characterCount % 1 !== 0) {
		throw new Error("First argument to generateRandomHexString() must be a positive integer (passed '" + characterCount + "')")
	}

	let output:string = ""

	while (output.length < characterCount) {
		output += generateRandomHexCharacter()
	}

	return output
}

export function replaceAll (target:string, replaceThis:string|Array<string>, withThis:string) : string {
	if (typeof replaceThis === "string") {
		return target.split(replaceThis).join(withThis)
	} else {
		let output = ""

		replaceThis.forEach((replaceThis2) => {
			output = replaceAll(output, replaceThis2, withThis)
		})

		return output
	}
}

export function purgeString (target:string, purgeThis:string|Array<string>) : string {
	return replaceAll(target, purgeThis, "")
}
