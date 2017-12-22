/* global context */

var slides = context.getElements("slide")

var activeSlide = 0
var lastActiveSlide = 0
var slideCounter = 0

var $dotContainer = context.getElement(".page-dots")

var $slideshow = context.getElement(".slides")

var backgrounds = context.getElements(".background")

var $background = backgrounds[0]

var AUTO_SLIDE_TIME = 3000

function updateSlideshowPosition () {
	$slideshow.style.marginLeft = "-" + (activeSlide * 100) + "%"
}

function updateSlideshowBackground () {
	if (slides[activeSlide].dataset.bg) {
		// fade the background in
		$background.style.backgroundImage = "url(" + slides[activeSlide].dataset.bg + ")"
		$background.style.opacity = "1"
	}
}

function setSlide (dotN) {
	lastActiveSlide = activeSlide
	activeSlide = dotN
	slideCounter += 1

	$background.style.opacity = "0"
	$background = backgrounds[slideCounter % 2]

	updateDots()
	updateSlideshowPosition()
	updateSlideshowBackground()
}

var autoSlideTimer

function autoSlide () {
	if (activeSlide === slides.length - 1) {
		setSlide(0)
	} else {
		setSlide(activeSlide + 1)
	}

	autoSlideTimer = window.setTimeout(autoSlide, AUTO_SLIDE_TIME)
}

autoSlideTimer = window.setTimeout(autoSlide, AUTO_SLIDE_TIME)

for (var i = 0; i < slides.length; i += 1) {
	var $dot = document.createElement("div")
	$dot.className = "dot"
	$dot.dataset.slide = i
	$dot.addEventListener("click", function clickHandler () {
		console.log("click!", this.dataset.slide)
		clearTimeout(autoSlideTimer)
		autoSlideTimer = window.setTimeout(autoSlide, AUTO_SLIDE_TIME)
		setSlide(parseInt(this.dataset.slide))
	})
	$dotContainer.appendChild($dot)
}

setSlide(0)

function updateDots () {
	for (var i = 0; i < $dotContainer.children.length; i += 1) {
		$dotContainer.children[i].classList[i === activeSlide ? "add" : "remove"]("active")
	}
}
