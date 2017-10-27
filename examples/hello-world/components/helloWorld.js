/* global context */

/*
	An object called `context` will be passed to this file.
	Please try to avoid modifying objects directly and instead, use the `context` object.

	!! This file will be executed every time a new instance of the component is declared.

	You can use the `context` object like so:

		Functions:
			context.getElement - gets an element via a selector

		Refs:
			context.$root - the root element of the context

		-- more to come --
*/


function test (event) {
	const msg = context.getElement("#input_box_1").value

	context.getElement("#foo").innerHTML = msg

	event.preventDefault()
}

context.getElement("#bar").addEventListener("submit", test)

