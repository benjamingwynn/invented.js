import {Component} from "./Component"

export default abstract class ComponentComposer {
	constructor () {
		console.log("A component was constructed")
		// ...
	}

	public abstract checkForComponent (componentName:string) : Promise <boolean>
	public abstract composeComponent (componentName:string, existingHTML?:string) : Promise <Component>
}

// A sample composer that can only compose hard-coded test components
// export class helloWorldComposer extends ComponentComposer {
// 	composeComponent (componentName:string) {
// 		return new Promise <Component> ((resolve, reject) => {
// 			setTimeout(() => {
// 				if (componentName === "hello-world") {
// 					resolve(new Component(componentName, "<h1>Hello World!</h1><p>Look at how blue that is!</p>", "h1 { color: blue; }"))
// 				} else if (componentName === "another-world") {
// 					resolve(new Component(componentName, "<h1>Hello World!</h1><p>This element doesn't have any CSS."))
// 				} else if (componentName === "test-form") {
// 					resolve(new Component(
// 						componentName,
// 						"<h1>Hello World Form</h1><form id='cont'><input id='input' type='text'><button type='submit'>Submit</button><p id='output'></p></form>",
// 						"form {background:yellow} h1 {color: red}",
// 						`
// 							function test (event) {
// 								const msg = context.getElement("#input").value

// 								context.getElement("#output").innerHTML = msg

// 								event.preventDefault()
// 							}

// 							context.getElement("#cont").addEventListener("submit", test)
// 						`
// 					))
// 				} else {
// 					reject(new Error("This test can only build hello-world components."))
// 				}
// 			}, (1500 * Math.random()) + 500)
// 		})
// 	}
// }
