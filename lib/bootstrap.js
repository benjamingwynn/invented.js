/*
	A tiny Javascript file to do the required work to use Invented components.
	(C) Benjamin Gwynn (http://benj.pw), 2017

	A component of Invented.js (https://github.com/benjamingwynn/invented.js)

	Future:
		* Required polyfills for older browsers
		* Minification of this file
*/

(function () {
	// Show all items which are hidden when Javascript is disabled
	var $nojs = document.getElementById("invented-hide-nojs-stylesheet")

	if ($nojs.removeNode) { // IE Legacy Support
		$nojs.removeNode(true)
	} else {
		$nojs.remove()
	}
}())
