/* Contains bootstrap and context object */
/* In the future, this file will be built and minified for production use */

(function () {
	window._inventedComponents = window._inventedComponents || {};

	var limitedDocument = {}

	// properties which components are allowed to use
	var allowedDocumentProperties = [
		"createElement",
	]

	function notAllowedDocument () {
		throw new Error("Not allowed")
	}

	function arrayContains (array, containsWhat) {
		for (var i = 0; i < array.length; i += 1) {
			if (array[i] === containsWhat) {
				return true
			}
		}

		return false
	}

	for (var ref in document) {
		if (arrayContains(allowedDocumentProperties, ref)) {
			// inherit
			limitedDocument[ref] = function (a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z) {
				document[ref](a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z)
			}
		} else {
			// flag error
			limitedDocument[ref] = notAllowedDocument
		}
	}

	window._inventedLimitedDocument = limitedDocument

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

	Context.prototype.createElement = function createElement (tag) {
		return document.createElement(tag)
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
