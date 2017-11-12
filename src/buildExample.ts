import * as fs from "fs"

import {ComponentManifestRetrieverFS} from "./ComponentManifestRetriever"
import {ComponentManifestHandlerFS} from "./ComponentManifestHandler"
import {Page} from "./Page"

// Enable source map suport on node.js
require("source-map-support").install()
process.on("unhandledRejection", console.error)

function buildTestHelloWorldPage () {
	const page = new Page(
		fs.readFileSync("./examples/hello-world-2/index.html", "utf-8"),
		new ComponentManifestRetrieverFS("./examples/hello-world-2/components/"),
		new ComponentManifestHandlerFS("./examples/hello-world-2/components/"
	), () => {
		fs.writeFileSync("./build/hello-world-2.html", page.render())
	})
}

buildTestHelloWorldPage()
