import * as fs from "fs"

import {FilesystemComposer} from "./filesystemComposer"
import {Page} from "./Page"

// Enable source map suport on node.js
require("source-map-support").install()
process.on("unhandledRejection", console.error)

function buildTestHelloWorldPage () {
	const page = new Page(fs.readFileSync("./examples/hello-world/index.html", "utf-8"), new FilesystemComposer("./examples/hello-world"))

	// once the page is ready, write the page to build
	page.ready.then(() => {
		fs.writeFileSync("build/hello-world.html", page.render())
	})
}

buildTestHelloWorldPage()
