"use strict";
const elements = {}
const camera = {
    grid_x: 8,
    grid_y: 8,
    zoom: 32,
}



function main() {
    // Create elements.
    const test_component = [
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ],
        [' ', 'S', 'P', 'L', 'P', 'P', 'L', 'P', ' ', ],
        [' ', ' ', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ],
        [' ', ' ', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ],
        [' ', ' ', ' ', ' ', 'L', ' ', ' ', ' ', ' ', ],
        [' ', ' ', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ],
        [' ', ' ', ' ', ' ', 'P', ' ', ' ', ' ', ' ', ],
        [' ', 'L', 'P', 'P', 'P', 'P', 'P', 'D', ' ', ],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ],
    ]
    component_to_elements(test_component)

    // Draw loop and update loop.
    requestAnimationFrame(draw_rec)
    const loop_handler = setInterval(update, 10)
}



function component_to_elements(comp=[]) {
    for (const row in comp) {
        for (const col in comp[row]) {
            const el_type = comp[row][col]
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
                    outflow: {
                        to_up: (el_type === 'D'),
                        to_down: (el_type === 'D'),
                        to_right: (el_type === 'D'),
                        to_left: (el_type === 'D'),
                    },
                    is_pressurized: (el_type === 'S'),
                    is_flowing: (el_type === 'S'),
                }
            }
        }
    }
}



function draw_rec() {
    const color_map = {
        'S': '#99f',
        'D': '#003',
        'P': '#333',
        'P_pressurized': '#666',
        'P_flowing': '#669',
        'L': '#330',
        'L_flowing': '#ff0',
        // other elements
    }

    const canvas_el = document.querySelector('canvas.grid')
    canvas_el.width = canvas_el.clientWidth
    canvas_el.height = canvas_el.clientHeight
    const ctx = canvas_el.getContext('2d')

    // Fill background if zoomed out too much to load the checkered bg.
    const zoom_bg_limit = 3
    if (camera.zoom < zoom_bg_limit) {
        ctx.fillStyle = '#f7f7f7'
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
                ctx.fillStyle = color_map[el.type]
                if (el.type === 'P' && el.is_flowing) {
                    ctx.fillStyle = color_map.P_flowing
                } else if (el.type === 'P' && el.is_pressurized) {
                    ctx.fillStyle = color_map.P_pressurized
                } else if (el.type === 'L' && el.is_flowing) {
                    ctx.fillStyle = color_map.L_flowing
                }
                ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
            } else if (grid_x === 0 || grid_y === 0) {
                // Axis lines.
                if ((grid_x + grid_y) % 2 === 0) {
                    ctx.fillStyle = '#eeb'
                    ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
                } else {
                    ctx.fillStyle = '#ffc'
                    ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
                }
            } else if (camera.zoom >= zoom_bg_limit && (grid_x + grid_y) % 2 === 0) {
                // Checkered grid background.
                ctx.fillStyle = '#eee'
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

            const up_el = old_elements[grid_x]?.[Number(grid_y) + 1]
            if (up_el) {
                if (up_el.outflow.to_up || up_el.outflow.to_right || up_el.outflow.to_left) {
                    el.outflow.to_up = true
                }
                if (up_el.is_pressurized) {
                    el.is_pressurized = true
                }
                if (old_el.is_flowing && old_el.outflow.to_up) {
                    elements[grid_x][Number(grid_y) + 1].is_flowing = true
                }
            }

            const down_el = old_elements[grid_x]?.[Number(grid_y) - 1]
            if (down_el) {
                if (down_el.outflow.to_down || down_el.outflow.to_right || down_el.outflow.to_left) {
                    el.outflow.to_down = true
                }
                if (down_el.is_pressurized) {
                    el.is_pressurized = true
                }
                if (old_el.is_flowing && old_el.outflow.to_down) {
                    elements[grid_x][Number(grid_y) - 1].is_flowing = true
                }
            }

            const right_el = old_elements[Number(grid_x) + 1]?.[grid_y]
            if (right_el) {
                if (right_el.outflow.to_up || right_el.outflow.to_down || right_el.outflow.to_right) {
                    el.outflow.to_right = true
                }
                if (right_el.is_pressurized) {
                    el.is_pressurized = true
                }
                if (old_el.is_flowing && old_el.outflow.to_right) {
                    elements[Number(grid_x) + 1][grid_y].is_flowing = true
                }
            }

            const left_el = old_elements[Number(grid_x) - 1]?.[grid_y]
            if (left_el) {
                if (left_el.outflow.to_up || left_el.outflow.to_down || left_el.outflow.to_left) {
                    el.outflow.to_left = true
                }
                if (left_el.is_pressurized) {
                    el.is_pressurized = true
                }
                if (old_el.is_flowing && old_el.outflow.to_left) {
                    elements[Number(grid_x) - 1][grid_y].is_flowing = true
                }
            }
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



// Rounds half-increments away from 0 instead of towards +Inf.
function true_round(num) {
    return Math.sign(num) * Math.round(Math.abs(num))
}



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
