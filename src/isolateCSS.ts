import * as css from "css"

import {CSSNamespace} from "./CSSNamespace"
import {purgeString} from "./stringUtil"

export function isolateCSS (namespace:CSSNamespace, stylesheet:string) : string | null {
	// TODO: Scoped animations

	const cssTree = css.parse(stylesheet)

	// console.log(cssTree.stylesheet)

	// look for css rules

	if (!cssTree.stylesheet || !cssTree.stylesheet.rules) {
		console.warn("CSS appears to not have any valid rules.")
		return null
	}

	let elementStyles = cssTree.stylesheet.rules

	for (let i = 0; i < elementStyles.length; i += 1) {
		const node:css.Rule| any = elementStyles[i]

		console.log(node)

		if (node.rules) {
			elementStyles = elementStyles.concat(node.rules)
		}

		if (node.type !== "rule") continue

		if (!node.selectors) {
			console.warn("Weird. node.selectors isn't defined")
			continue
		}

		for (let i = 0; i < node.selectors.length; i += 1) {
			if (node.selectors[i].indexOf(":root ") === -1 && node.selectors[i].indexOf(":root") === 0) {
				// rename :root to the namespace
				node.selectors[i] = node.selectors[i].replace(":root", `.${namespace.namespace}`)
			} else {
				// remove the root declaration and add namespace
				node.selectors[i] = purgeString(`.${namespace.namespace} ${node.selectors[i]}`, ":root ")
			}
		}
	}

	// add CSS to the DOM
	return css.stringify(cssTree)
}
