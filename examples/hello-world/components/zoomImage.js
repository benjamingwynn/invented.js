/* global context */

const $container = context.getElement(".container")
const $image = context.getElement(".container img")
const $zoomAmount = context.getElement(".zoom-amount")

const ZOOM_SENSITIVITY = 0.2
const ZOOM_MIN = 1.4
const ZOOM_MAX = 8
const ZOOM_DEFAULT = 2

let zoomAmount = ZOOM_DEFAULT
let x, y, started, over, lastX, lastY, lastZoomAmount, zoomTimeout

$container.addEventListener("mousemove", function mousemove (event) {
	over = true

	function setCoords () {
		x = event.clientX - $container.offsetLeft
		y = event.clientY - $container.offsetTop + window.scrollY
	}

	if (started) {
		setCoords()
	} else {
		setCoords()

		// start
		started = true
		onFrame()
	}

	event.stopPropagation()
})

$container.addEventListener("mouseleave", function mouseleave (event) {
	$image.style.transform = ""
	over = false
})

$container.addEventListener("wheel", function mousewheel (event) {
	if (event.deltaY > 0) {
		zoomAmount -= ZOOM_SENSITIVITY
	} else {
		zoomAmount += ZOOM_SENSITIVITY
	}
	zoomAmount = Math.min(Math.max(ZOOM_MIN, zoomAmount), ZOOM_MAX)

	event.stopPropagation()
	event.preventDefault()
})

function onFrame () {
	if (lastZoomAmount !== zoomAmount) {
		$zoomAmount.innerHTML = zoomAmount.toFixed(1)

		$zoomAmount.classList.remove("hidden")

		if (zoomTimeout) clearTimeout(zoomTimeout)
		zoomTimeout = setTimeout(function () {
			$zoomAmount.classList.add("hidden")
		}, 1000)
	}

	if (over && (lastX !== x || lastY !== y || lastZoomAmount !== zoomAmount)) {
		$image.style.transform = "translate(" + -(x*(zoomAmount-1)) + "px," + -(y*(zoomAmount-1)) + "px) scale(" + (zoomAmount) + ")"
		// console.log(x, y)

	}

	lastX = x
	lastY = y
	lastZoomAmount = zoomAmount

	window.requestAnimationFrame(onFrame)
}
