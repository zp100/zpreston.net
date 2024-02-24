"use strict";
const elements = {}
const camera = {
    grid_x: 8,
    grid_y: 8,
    zoom: 32,
}
const inputs = {}



function main() {
    // Create elements.
    const test_component = [
        ['S ', 'P ', 'P ', 'P ', 'L ', 'P ', 'P ', 'P ', 'J ', 'P ', 'P ', 'P ', 'D ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'B1', '  ', '  ', '  ', '  ', ],
    ]
    component_to_elements(test_component)

    // Draw loop and update loop.
    requestAnimationFrame(draw_rec)
    const loop_handler = setInterval(update, 10)
}



function component_to_elements(comp=[]) {
    for (const row in comp) {
        for (const col in comp[row]) {
            const el_type = comp[row][col][0]
            const el_input = comp[row][col][1]
            if (el_type !== ' ') {
                // Rename variables for readability.
                const grid_x = col
                const grid_y = comp.length - 1 - row

                // Add to elements, keyed using its coordinates.
                if (!(grid_x in elements)) {
                    elements[grid_x] = {}
                }
                elements[grid_x][grid_y] = {
                    type: el_type,
                    input: el_input,
                    is_blocked: (el_type === 'J'),
                    has_outflow: {
                        to_up: false,
                        to_down: false,
                        to_right: false,
                        to_left: false,
                    },
                    is_pressurized: false,
                    is_flowing: false,
                }
            }
        }
    }
}



function draw_rec() {
    const color_map = {
        'P': {
            default: '#222',
            pressurized: '#223',
            flowing: '#224',
        },
        'S': {
            default: '#446',
        },
        'D': {
            default: '#002',
        },
        'J': {
            default: '#242',
            blocked: '#020',
        },
        'G': {
            default: '#422',
            blocked: '#200',
        },
        'V': {
            default: '#202',
            pressurized: '#424',
        },
        'B': {
            default: '#022',
            pressurized: '#244',
        },
        'L': {
            default: '#220',
            flowing: '#ff0',
        },
    }

    const canvas_el = document.querySelector('canvas.grid')
    canvas_el.width = canvas_el.clientWidth
    canvas_el.height = canvas_el.clientHeight
    const ctx = canvas_el.getContext('2d')

    // Fill background if zoomed out too much to load the checkered bg.
    const zoom_bg_limit = 3
    if (camera.zoom < zoom_bg_limit) {
        ctx.fillStyle = '#040404'
        ctx.fillRect(0, 0, canvas_el.width, canvas_el.height)
    }

    const max_grid_x = (canvas_el.width / 2) / camera.zoom
    const max_grid_y = (canvas_el.height / 2) / camera.zoom
    for (let grid_x = Math.round(camera.grid_x - max_grid_x); grid_x <= Math.round(camera.grid_x + max_grid_x); grid_x++) {
        for (let grid_y = Math.round(camera.grid_y - max_grid_y); grid_y <= Math.round(camera.grid_y + max_grid_y); grid_y++) {
            const draw_x = (canvas_el.width / 2) + (grid_x - camera.grid_x - 0.5) * camera.zoom
            const draw_y = (canvas_el.height / 2) - (grid_y - camera.grid_y + 0.5) * camera.zoom
            const el = elements[grid_x]?.[grid_y]
            if (el) {
                // Element.
                if (el.is_flowing && 'flowing' in color_map[el.type]) {
                    ctx.fillStyle = color_map[el.type]['flowing']
                } else if (el.is_pressurized && 'pressurized' in color_map[el.type]) {
                    ctx.fillStyle = color_map[el.type]['pressurized']
                } else if (el.is_blocked && 'blocked' in color_map[el.type]) {
                    ctx.fillStyle = color_map[el.type]['blocked']
                } else {
                    ctx.fillStyle = color_map[el.type]['default']
                }
                ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)

                // // DEBUG
                // ctx.fillStyle = '#000'
                // ctx.fillRect(draw_x, draw_y, 9, 9)
                // ctx.fillStyle = '#fff'
                // if (el.has_outflow.to_up) ctx.fillRect(draw_x + 3, draw_y, 3, 3)
                // if (el.has_outflow.to_down) ctx.fillRect(draw_x + 3, draw_y + 6, 3, 3)
                // if (el.has_outflow.to_right) ctx.fillRect(draw_x + 6, draw_y + 3, 3, 3)
                // if (el.has_outflow.to_left) ctx.fillRect(draw_x, draw_y + 3, 3, 3)

            } else if (grid_x === 0 || grid_y === 0) {
                // Axis lines.
                if ((grid_x + grid_y) % 2 === 0) {
                    ctx.fillStyle = '#081008'
                    ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
                } else {
                    ctx.fillStyle = '#101810'
                    ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
                }
            } else if (camera.zoom >= zoom_bg_limit && (grid_x + grid_y) % 2 !== 0) {
                // Checkered grid background.
                ctx.fillStyle = '#080808'
                ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
            }
        }
    }

    // Recursive call for animation.
    requestAnimationFrame(draw_rec)
}



function update() {
    // Make deep-copy of old elements for reference.
    const old_elements = structuredClone(elements)

    // Determine flow.
    for (const grid_x in elements) {
        for (const grid_y in elements[grid_x]) {
            const old_el = old_elements[grid_x][grid_y]
            const el = elements[grid_x][grid_y]
            el.is_blocked = (el.type === 'J')
            el.is_pressurized = false
            el.is_flowing = false
            calc_flow(old_elements, elements, old_el, el, 'to_up', grid_x, Number(grid_y) + 1)
            calc_flow(old_elements, elements, old_el, el, 'to_down', grid_x, Number(grid_y) - 1)
            calc_flow(old_elements, elements, old_el, el, 'to_right', Number(grid_x) + 1, grid_y)
            calc_flow(old_elements, elements, old_el, el, 'to_left', Number(grid_x) - 1, grid_y)
        }
    }
}



function calc_flow(old_elements, elements, old_el, el, flow_direction, adj_x, adj_y) {
    const adj_el = old_elements[adj_x]?.[adj_y]
    if (adj_el) {
        if (!old_el.is_blocked) {
            // Pull outflow from adjacent cell (unless it's a valve or button, or is flowing into this cell).
            el.has_outflow[flow_direction] = (
                adj_el.type !== 'V' && adj_el.type !== 'B' && (
                    (adj_el.type === 'D') ||
                    (flow_direction !== 'to_up' && adj_el.has_outflow['to_down']) ||
                    (flow_direction !== 'to_down' && adj_el.has_outflow['to_up']) ||
                    (flow_direction !== 'to_right' && adj_el.has_outflow['to_left']) ||
                    (flow_direction !== 'to_left' && adj_el.has_outflow['to_right'])
                )
            )

            // Become pressurized if adjacent cell is pressurized.
            if (old_el.type === 'S' || adj_el.is_pressurized || old_el.input in inputs) {
                el.is_pressurized = true
            }

            // Become flowing if a cell that flows into this one is flowing.
            const has_inflow = (
                (flow_direction === 'to_up' && adj_el.has_outflow['to_down']) ||
                (flow_direction === 'to_down' && adj_el.has_outflow['to_up']) ||
                (flow_direction === 'to_right' && adj_el.has_outflow['to_left']) ||
                (flow_direction === 'to_left' && adj_el.has_outflow['to_right'])
            )
            if (old_el.type === 'S' || (adj_el.is_flowing && has_inflow)) {
                el.is_flowing = true
            }
        }

        // Become blocked (or unblocked) under certain conditions.
        if (old_el.type === 'G' && (adj_el.type === 'V' || adj_el.type === 'B') && adj_el.is_pressurized) {
            el.is_blocked = true
        }
        if (old_el.type === 'J' && (adj_el.type === 'V' || adj_el.type === 'B') && adj_el.is_pressurized) {
            el.is_blocked = false
        }
    }
}



addEventListener('wheel', (ev) => {
    const wheel_scalar = -0.5
    ev.preventDefault()
    if (ev.ctrlKey) {
        zoom(wheel_scalar * ev.deltaY)
    } else {
        pan(wheel_scalar * ev.deltaX, wheel_scalar * ev.deltaY)
    }
}, {passive: false}) // prevents Ctrl + Scroll to zoom as well



// Prevent right-click menu.
addEventListener('contextmenu', (ev) => ev.preventDefault())



addEventListener('mousemove', (ev) => {
    const canvas_el = document.querySelector('canvas.grid')
    if (ev.buttons === 4) {
        // Middle click drag.
        canvas_el.style.cursor = 'zoom-in'
        zoom(ev.movementY)
    } else if (ev.buttons === 2) {
        // Right click drag.
        canvas_el.style.cursor = 'all-scroll'
        pan(ev.movementX, ev.movementY)
    }
})



addEventListener('mouseup', (ev) => {
    const canvas_el = document.querySelector('canvas.grid')
    canvas_el.style.cursor = 'auto'
})



addEventListener('keydown', (ev) => {
    inputs[ev.key] = true
})



addEventListener('keyup', (ev) => {
    delete inputs[ev.key]
})



function pan(x, y) {
    camera.grid_x -= x / camera.zoom
    camera.grid_y += y / camera.zoom
}



function zoom(z) {
    camera.zoom *= 1 + (-0.002 * z)
    if (camera.zoom < 1) camera.zoom = 1
    if (camera.zoom > 256) camera.zoom = 256
}



// Boilerplate.
main()
