import {Component} from "./Component"
import ComponentComposer from "./ComponentComposer"

export class InheritanceComposer extends ComponentComposer {
	public checkForComponent (componentName:string) : Promise <boolean> {
		return new Promise ((resolve, reject) => {

		})
	}

	public composeComponent (componentName:string, existingHTML?:string) : Promise <Component> {
		return new Promise ((resolve, reject) => {

		})

	}

}