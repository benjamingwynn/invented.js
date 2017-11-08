import {ComponentComposer} from "./ComponentComposer"
import {FilesystemComposer} from "./filesystemComposer"
import {Page} from "./Page"
import {CSSNamespace} from "./CSSNamespace"
import {isolateCSS} from "./isolateCSS"

// Enable source map suport on node.js
require("source-map-support").install()
process.on("unhandledRejection", console.error)

export {Page, FilesystemComposer, ComponentComposer, CSSNamespace, isolateCSS}