/* Contains bootstrap and context object */
/* In the future, this file will be built and minified for production use */

(function () {
	window._inventedComponents = window._inventedComponents || {};

	function Context (uid) {
		this.uid = uid
		this.$root = document.querySelector(`[data-invented-id="${uid}"]`)
	}

	Context.prototype.getElement = function getElement (selector) {
		return this.$root.querySelector(selector)
	}

	window._inventedContext = Context

	// Show all items which are hidden when Javascript is disabled
	document.getElementById("invented-hide-nojs-stylesheet").remove()
}())
