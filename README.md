# Invented

Invented is a tiny library for building pre-rendered & reusable components.

> ⚠️ Heads up! Invented is still a work-in-progress. Although there is very little API to learn, it's not stable yet. Please do not build any production code on Invented until 1.0

With Invented, you decide what languages to use for your markup, styling and scripting. You can also decide what build system to use. Almost everything is in your hands. Invented is designed to allow developers to easily use it without having to learn an entire framework or read through massive documentation to get started. In theory, one read through this file should be all that is required.

Invented is built around **configuration over convention** - because every project has different needs and every team has different abilites. Invented encourages you to find solutions to problems and implement them as required, rather than providing kilobytes of code you may never use. If you want something that's ready for you out-of-the-box, this is not the library for you, try Vue or another similar framework.

There is no attribute binding, there is no common event message pipe, there are no polyfills. These are up to you to implement, Invented is nothing but a component composer that runs on the server or at build time.

### Browser Compatibility

(TODO)

### Performance

(TODO)

## Writing Components

Components are basically web pages that can be inserted into your main pages. Like web pages, they consist of three parts, markup, styling, and scripting. Every browser will eventually require these to be written in HTML, CSS and Javascript respectively, but if you wish to, you may can use any transpilers from other languages where required, I.E. Pug or Handlebars for markup; Less, Sass or PostCSS for styling; and Typescript, Babel or Coffescript for scripting.

For simplicity, the examples are written in plain HTML, Javascript and CSS.

### Markup

A components markup is used to specify how it is composed whenever the component is called from a page. A components markup consists of a few special tags and attributes:

> ⚠️ Heads up! These tags and attributes may change in the future. Specifically the `<slot>` tag might be renamed for compatibility with the CustomElements v1 spec.

#### Slot

The `<slot>` tag works very much like the `<slot>` tag in the CustomElements v1 spec or the Polymer library.

When the component is called from a page, the contents of the tag it is called from are inserted into the `<slot>` of the component. If no `<slot>` is defined, the inner HTML of a component call is removed.

> ⚠️ Heads up! In the future, this will warn the developer that the contents of their component was deleted prior to it being initilised, but right now there is no warning.

Only use one `<slot>` per component, as mutliple `<slot>` tags are currently ignored.

**Example**

`<slot></slot>`

#### js-only

An attribute that specifies that an element should only be visible if the client has Javascript enabled, and has loaded the components Javascript (if it has any) successfully.

**Example**

`<h1 js-only>Javascript is enabled!</h1>`

#### nojs-only

(Not yet implemented - but planned short term) Opposite of js-only.

`<h1 nojs-only>Javascript is disabled!</h1>`

#### Example

An example of a components markup and a sample page would look like so:

spin-this.html

```
	<slot class="spin-stuff"></slot>
	<button class="spin-button" type="button" js-only>Spin</button>
```

input page
```
	<spin-this>
		<h1>Is that a spin button?</h1>
	</spin-this>
```

output page
```
	<div invented-component-name="spin-this">
		<div class="spin-stuff">
			<h1>Is that a spin button?</h1>
		</div>
		<button class="spin-button" type="button" js-only></button>
	</div>
```

### Styling

(TODO: How `:root` works, how everything is scoped)

### Javascript

(TODO: How Context works, using Context)

## Building your page

As previously mentioned, Invented is easy to learn. 

### CLI

(TODO - the CLI is not yet implemented)

### Programatically

Install invented with NPM or Yarn.

`npm install --save invented` or `yarn add invented`

## Building Invented

Invented is written in Typescript. First clone the repo and install all of the required dependancies using yarn:

`yarn --dev`

Then just use the Typescript compiler, `tsc` to build Invented.