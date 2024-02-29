import * as Render from './render.js'

const inputs = {}



function add_handlers() {
    addEventListener('contextmenu', (ev) => ev.preventDefault()) // prevents right-click menu
    addEventListener('wheel', wheel_cb, {passive: false}) // no passive prevents Ctrl + Scroll to zoom as well
    addEventListener('mousemove', mousemove_cb)
    addEventListener('mouseup', mouseup_cb)
    addEventListener('keydown', keydown_cb)
    addEventListener('keyup', keyup_cb)
}



function wheel_cb(ev) {
    ev.preventDefault()

    const wheel_scalar = -0.5
    if (ev.ctrlKey) {
        Render.zoom(wheel_scalar * ev.deltaY)
    } else {
        Render.pan(wheel_scalar * ev.deltaX, wheel_scalar * ev.deltaY)
    }
}



function mousemove_cb(ev) {
    const canvas_el = document.querySelector('canvas.grid')
    if (ev.buttons === 4) {
        // Middle click drag.
        canvas_el.style.cursor = 'zoom-in'
        Render.zoom(ev.movementY)
    } else if (ev.buttons === 2) {
        // Right click drag.
        canvas_el.style.cursor = 'all-scroll'
        Render.pan(ev.movementX, ev.movementY)
    }
}



function mouseup_cb(ev) {
    const canvas_el = document.querySelector('canvas.grid')
    canvas_el.style.cursor = 'auto'
}



function keydown_cb(ev) {
    inputs[ev.key] = true
}



function keyup_cb(ev) {
    delete inputs[ev.key]
}



export { inputs, add_handlers }
