/* Contains bootstrap for ComponentComposer and context object */
(function () {
	window._ccComponents = window._ccComponents || {};

	function Context (uid) {
		this.uid = uid
		this.$root = document.querySelector(`[data-component-composer-id="${uid}"]`)
	}

	Context.prototype.getElement = function getElement (selector) {
		return this.$root.querySelector(selector)
	}

	window._ccContext = Context
}())
