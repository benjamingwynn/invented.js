import {ComponentManifestHandlerFS} from "./ComponentManifestHandler"
import {ComponentManifestRetrieverFS} from "./ComponentManifestRetriever"
import {Page} from "./Page"
import {CSSNamespace} from "./CSSNamespace"
import {isolateCSS} from "./isolateCSS"

// Enable source map suport on node.js
require("source-map-support").install()
process.on("unhandledRejection", console.error)

export {Page, ComponentManifestHandlerFS, ComponentManifestRetrieverFS, CSSNamespace, isolateCSS}
