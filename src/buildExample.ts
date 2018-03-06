import * as fs from "fs"

import {ComponentManifestRetrieverFS} from "./ComponentManifestRetriever"
import {ComponentManifestHandlerAuto} from "./ComponentManifestHandler"
import {Page} from "./Page"

// Enable source map suport on node.js
require("source-map-support").install()
process.on("unhandledRejection", console.error)

const PATH:string = "./examples/gwynndesign/"

function buildTestHelloWorldPage () {
	new Page(
		fs.readFileSync(PATH + "index.html", "utf-8"),
		new ComponentManifestRetrieverFS(PATH + "inventions/"),
		// new ComponentManifestHandlerFS(PATH + "inventions/"),
		new ComponentManifestHandlerAuto(PATH + "inventions/"),
	(page:Page) => {
		fs.writeFileSync("./build/index.html", page.render())
	})
}

buildTestHelloWorldPage()
