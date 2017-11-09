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
			if (node.selectors[i].indexOf(":root ") === -1 && node.selectors[i].indexOf(":root") === 0) {
				// rename :root to the namespace
				node.selectors[i] = node.selectors[i].replace(":root", `.${namespace.namespace}`)
			} else {
				// remove the root declaration and add namespace
				node.selectors[i] = purgeString(`.${namespace.namespace} ${node.selectors[i]}`, ":root ")
			}
		}
	})

	// add CSS to the DOM
	return css.stringify(cssTree)
}