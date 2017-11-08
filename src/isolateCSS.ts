import * as css from "css"

import {CSSNamespace} from "./CSSNamespace"
import {purgeString} from "./stringUtil"

export function isolateCSS (namespace:CSSNamespace, stylesheet:string) : string | null {
	// TODO: Scoped animations

	const cssTree = css.parse(stylesheet)

	// look for css rules
	const elementStyles = []

	if (!cssTree.stylesheet || !cssTree.stylesheet.rules) {
		console.warn("CSS appears to not have any valid rules.")
		return null
	}

	cssTree.stylesheet.rules.forEach((node:css.Rule | any) => {
		if (node.type !== "rule") return

		if (!node.selectors) {
			console.warn("Weird. node.selectors isn't defined")
			return
		}

		for (var i = 0; i < node.selectors.length; i += 1) {
			if (node.selectors[i] === ":root") {
				node.selectors[i] = `.${namespace.namespace}`
			} else {
				// remove :root
				node.selectors[i] = purgeString(`.${namespace.namespace} ${node.selectors[i]}`, ":root ")
			}
		}
	})

	// add CSS to the DOM
	return css.stringify(cssTree)
}