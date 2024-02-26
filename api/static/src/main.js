"use strict";
const MIN_ZOOM = 2**-6
const ZOOM_BG_LIMIT = 2**2
const MAX_ZOOM = 2**10
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
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', 'S ', 'W ', 'W ', 'L ', 'W ', 'W ', 'D ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
    ]
    component_to_elements(test_component)

    // Draw loop and update loop.
    requestAnimationFrame(draw_rec)
    setInterval(update, 0)
}



function component_to_elements(comp=[]) {
    for (const row in comp) {
        for (const col in comp[row]) {
            const el_type = comp[row][col][0]
            const el_value = comp[row][col][1]
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
                    value: el_value,
                    is_blocked: (el_type === 'N' || el_type === 'B'),
                    high_pull: {
                        up: false,
                        down: false,
                        right: false,
                        left: false,
                    },
                    low_pull: {
                        up: false,
                        down: false,
                        right: false,
                        left: false,
                    },
                    state: 'n',
                }
            }
        }
    }
}



function draw_rec() {
    const canvas_el = document.querySelector('canvas.grid')
    canvas_el.width = canvas_el.clientWidth
    canvas_el.height = canvas_el.clientHeight
    const ctx = canvas_el.getContext('2d')

    const max_grid_x = (canvas_el.width / 2) / camera.zoom
    const max_grid_y = (canvas_el.height / 2) / camera.zoom
    const min_x = Math.round(camera.grid_x - max_grid_x)
    const max_x = Math.round(camera.grid_x + max_grid_x)
    const min_y = Math.round(camera.grid_y - max_grid_y)
    const max_y = Math.round(camera.grid_y + max_grid_y)
    if (camera.zoom < ZOOM_BG_LIMIT) {
        // Fill background if zoomed out too much to load the checkered bg.
        ctx.fillStyle = '#040404'
        ctx.fillRect(0, 0, canvas_el.width, canvas_el.height)

        // Loop through cells with elements.
        for (const grid_x in elements) {
            if (grid_x >= min_x && grid_x <= max_x) {
                for (const grid_y in elements[grid_x]) {
                    if (grid_y >= min_y && grid_y <= max_y) {
                        draw_cell(ctx, elements, grid_x, grid_y)
                    }
                }
            }
        }

        // Draw center lines.
        for (let grid_x = min_x; grid_x <= max_x; grid_x++) {
            draw_cell(ctx, elements, grid_x, 0)
        }
        for (let grid_y = min_y; grid_y <= max_y; grid_y++) {
            draw_cell(ctx, elements, 0, grid_y)
        }
    } else {
        // Loop through all cells on-screen.
        for (let grid_x = min_x; grid_x <= max_x; grid_x++) {
            for (let grid_y = min_y; grid_y <= max_y; grid_y++) {
                draw_cell(ctx, elements, grid_x, grid_y)
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
            const new_el = elements[grid_x][grid_y]

            calc_flow(old_elements, old_el, new_el, 'up', grid_x, Number(grid_y) + 1)
            calc_flow(old_elements, old_el, new_el, 'down', grid_x, Number(grid_y) - 1)
            calc_flow(old_elements, old_el, new_el, 'right', Number(grid_x) + 1, grid_y)
            calc_flow(old_elements, old_el, new_el, 'left', Number(grid_x) - 1, grid_y)

            const low = Object.values(new_el.low_pull).includes(true)
            const high = Object.values(new_el.high_pull).includes(true)
            if (low && !high) {
                new_el.state = 'l'
            } else if (!low && high) {
                new_el.state = 'h'
            } else if (low && high) {
                // Check that the low and high pulls are from different directions.
                if (
                    new_el.low_pull['up'] !== new_el.high_pull['up'] ||
                    new_el.low_pull['down'] !== new_el.high_pull['down'] ||
                    new_el.low_pull['right'] !== new_el.high_pull['right'] ||
                    new_el.low_pull['left'] !== new_el.high_pull['left']
                ) {
                    new_el.state = 'f'
                }
            }
        }
    }
}



function draw_cell(ctx, elements, grid_x, grid_y) {
    const color_map = {
        'W': { // wire: gray
            default: '#222',
            flowing: '#223',
        },
        'C': { // cross: gray
            default: '#222',
            flowing: '#223',
        },
        'S': { // source: light-blue
            default: '#446',
        },
        'D': { // drain: black
            default: '#002',
        },
        'N': { // n-type FET: green
            blocked: '#020',
            default: '#242',
            flowing: '#464',
        },
        'P': { // p-type FET: red
            blocked: '#200',
            default: '#422',
            flowing: '#644',
        },
        'G': { // gate: magenta
            blocked: '#202',
            default: '#424',
        },
        'B': { // button: cyan
            blocked: '#022',
            default: '#244',
        },
        'L': { // light: yellow
            default: '#220',
            flowing: '#ff6',
        },
    }

    const center_x = (ctx.canvas.width / 2) + (grid_x - camera.grid_x) * camera.zoom
    const center_y = (ctx.canvas.height / 2) - (grid_y - camera.grid_y) * camera.zoom
    const draw_x = (ctx.canvas.width / 2) + (grid_x - camera.grid_x - 0.5) * camera.zoom
    const draw_y = (ctx.canvas.height / 2) - (grid_y - camera.grid_y + 0.5) * camera.zoom
    const draw_size = camera.zoom
    const el = elements[grid_x]?.[grid_y]
    if (el) {
        // Element.
        if (el.is_blocked && 'blocked' in color_map[el.type]) {
            ctx.fillStyle = color_map[el.type]['blocked']
        } else if (el.state === 'f' && 'flowing' in color_map[el.type]) {
            ctx.fillStyle = color_map[el.type]['flowing']
        } else {
            ctx.fillStyle = color_map[el.type]['default']
        }
        ctx.fillRect(draw_x, draw_y, draw_size, draw_size)

        if (el.type === 'C') {
            ctx.strokeStyle = '#111'
            ctx.beginPath()
            ctx.moveTo(draw_x, draw_y)
            ctx.lineTo(draw_x + draw_size, draw_y + draw_size)
            ctx.moveTo(draw_x + draw_size, draw_y)
            ctx.lineTo(draw_x, draw_y + draw_size)
            ctx.stroke()
        }

        if (el.type === 'B') {
            ctx.font = `${camera.zoom / 2}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = (el.is_flowing ? '#fff' : '#666')
            ctx.fillText(el.value, center_x, center_y)
        }
    } else if (grid_x === 0 || grid_y === 0) {
        // Axis lines.
        ctx.fillStyle = ((grid_x + grid_y) % 2 !== 0 ? '#101810' : '#081008')
        ctx.fillRect(draw_x, draw_y, draw_size, draw_size)
    } else if (camera.zoom >= ZOOM_BG_LIMIT && (grid_x + grid_y) % 2 !== 0) {
        // Checkered grid background.
        ctx.fillStyle = '#080808'
        ctx.fillRect(draw_x, draw_y, draw_size, draw_size)
    }
}



function calc_flow(old_elements, old_el, new_el, flow_direction, adj_x, adj_y) {
    const adj_el = old_elements[adj_x]?.[adj_y]
    if (old_el.type === 'S') {
        new_el.low_pull[flow_direction] = false
        new_el.high_pull[flow_direction] = true
    } else if (old_el.type === 'D') {
        new_el.low_pull[flow_direction] = true
        new_el.high_pull[flow_direction] = false
    } else if (adj_el) {
        if (!old_el.is_blocked) {
            // Pulled low if adjacent cell is pulled low on any other sides.
            new_el.low_pull[flow_direction] = (
                (flow_direction !== 'up' && adj_el.low_pull['down']) ||
                (flow_direction !== 'down' && adj_el.low_pull['up']) ||
                (flow_direction !== 'right' && adj_el.low_pull['left']) ||
                (flow_direction !== 'left' && adj_el.low_pull['right'])
            )

            // Pulled high if adjacent cell is pulled high on any other sides.
            new_el.high_pull[flow_direction] = (
                (flow_direction !== 'up' && adj_el.high_pull['down']) ||
                (flow_direction !== 'down' && adj_el.high_pull['up']) ||
                (flow_direction !== 'right' && adj_el.high_pull['left']) ||
                (flow_direction !== 'left' && adj_el.high_pull['right'])
            )
        } else {
            new_el.low_pull[flow_direction] = false
            new_el.high_pull[flow_direction] = false
        }

        // Become unblocked (or blocked) under certain conditions.
        if (old_el.type === 'N' && adj_el.type === 'G' && adj_el.state === 'h') {
            new_el.is_blocked = false
        } else if (old_el.type === 'P' && adj_el.type === 'G' && adj_el.state === 'h') {
            new_el.is_blocked = true
        } else if (old_el.type === 'G' && adj_el.state === 'h') {
            new_el.is_blocked = false
        } else if (old_el.type === 'B' && old_el.value in inputs) {
            new_el.is_blocked = false
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
    if (camera.zoom < MIN_ZOOM) camera.zoom = MIN_ZOOM
    if (camera.zoom > MAX_ZOOM) camera.zoom = MAX_ZOOM
}



// Boilerplate.
main()
