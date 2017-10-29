/* Contains bootstrap and context object */
/* In the future, this file will be built and minified for production use */

(function () {
	window._inventedComponents = window._inventedComponents || {};

	function Context (uid) {
		this.uid = uid
		this.$root = document.querySelector("[data-invented-id=\"" + uid + "\"]")
	}

	Context.prototype.getElement = function getElement (selector) {
		return this.$root.querySelector(selector + ", [data-invented-name=\"" + selector + "\"]")
	}
	
	Context.prototype.getElements = function getElement (selector) {
		return this.$root.querySelectorAll(selector + ", [data-invented-name=\"" + selector + "\"]")
	}

	window._inventedContext = Context

	// Show all items which are hidden when Javascript is disabled
	var $nojs = document.getElementById("invented-hide-nojs-stylesheet")

	if ($nojs.removeNode) { // internet explorer
		$nojs.removeNode(true)
	} else {
		$nojs.remove()
	}
}())
