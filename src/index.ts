import {ComponentManifestHandler, ComponentManifestHandlerFS, ComponentManifestHandlerInline, ComponentManifestHandlerAuto} from "./ComponentManifestHandler"
import {ComponentManifestRetriever, ComponentManifestRetrieverFS} from "./ComponentManifestRetriever"
import {Page} from "./Page"
import {CSSNamespace} from "./CSSNamespace"
import {isolateCSS} from "./isolateCSS"

// Enable source map suport on node.js
require("source-map-support").install()
process.on("unhandledRejection", console.error)

export {
	Page,
	ComponentManifestHandler,
	ComponentManifestHandlerFS,
	ComponentManifestHandlerInline,
	ComponentManifestHandlerAuto,
	ComponentManifestRetriever,
	ComponentManifestRetrieverFS,
	CSSNamespace,
	isolateCSS,
}
