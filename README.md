# Invented

Invented is a tiny library for building pre-rendered & reusable components.

> ⚠️ Heads up! Invented is still a work-in-progress. Although there is very little API to learn, it's not stable yet. Please do not build any production code on Invented until 1.0

With Invented, you decide what languages to use for your markup, styling and scripting. You can also decide what build system to use. Almost everything is in your hands. Invented is designed to allow developers to easily use it without having to learn an entire framework or read through massive documentation to get started. In theory, one read through this file should be all that is required.

Invented is built around **configuration over convention** - because every project has different needs and every team has different abilites. Invented encourages you to find solutions to problems and implement them as required, rather than providing kilobytes of code you may never use. If you want something that's ready for you out-of-the-box, this is not the library for you, try Vue or another similar framework.

There is no attribute binding, there is no common event message pipe, there are no polyfills. These are up to you to implement, Invented is nothing but a component composer that runs on the server or at build time.

### Browser Compatibility

Invented should be compatible with any browser as it's designed to run mostly server-side or developer-side.

(TODO - what browsers support these)

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

An attribute that specifies that an element should only be visible if the client has Javascript enabled, and has loaded the components Javascript (if it has any) successfully. This is basically the opposite of a `<noscript>` tag.

**Example**

`<h1 js-only>Javascript is enabled!</h1>`

### Styling

Any component can have styling, everything defined in a components style is scoped to it's component. A component cannot affect any styles outside of itself.

Like web components in the web components v1 specification, `:root` can be used to target the component itself.

### Javascript

Like component styling, component Javascript is scoped to the component and cannot affect the page. Access to `document` is limited, and a special `context` global is provided instead.

#### Document limitations

The `document` object is limited. Functions for finding elements such as `document.querySelector` and `document.getElementById` will not work if you try and use them. However, functions such as `document.createElement` are allowed as they do not affect the document.

#### Context API

`context` is accessible anywhere in your components script.

> ⚠️ Heads up! The context API is likely to change in the future.

`context.getElement(<string> query)` gets a single element in the component via a query selector
`context.getElements(<string> query)` gets an array of matching elements in the component via a query selector

> More API to come!

## Building your page

Once you have your components, you can build pages out of the components either via the command line or programatically.

### CLI

(TODO - the CLI is not yet implemented)

### Programatically

Install invented with NPM or Yarn.

`npm install --save invented` or `yarn add invented`

(TODO - using the API in Typescript and vanilla JS)

## Building Invented

Invented is written in Typescript. First clone the repo and install all of the required dependancies using yarn:

`yarn --dev`

Then just use the Typescript compiler, `tsc` to build Invented.
