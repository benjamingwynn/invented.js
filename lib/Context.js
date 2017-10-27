/* Contains bootstrap and context object */

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
}())
