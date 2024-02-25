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
        ['  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', ],
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
                    flow: {
                        up: 0,
                        down: 0,
                        right: 0,
                        left: 0,
                    },
                    is_blocked: (el_type === 'V' || el_type === 'B'),
                    is_flowing: false,
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

            new_el.is_blocked = (el_type === 'V' || el_type === 'B')

            calc_flow(old_elements, old_el, new_el, 'up', grid_x, Number(grid_y) + 1)
            calc_flow(old_elements, old_el, new_el, 'down', grid_x, Number(grid_y) - 1)
            calc_flow(old_elements, old_el, new_el, 'right', Number(grid_x) + 1, grid_y)
            calc_flow(old_elements, old_el, new_el, 'left', Number(grid_x) - 1, grid_y)

            new_el.is_flowing = (
                Object.values(new_el.flow).includes(-1) &&
                Object.values(new_el.flow).includes(1)
            )
        }
    }
}



function draw_cell(ctx, elements, grid_x, grid_y) {
    const color_map = {
        'P': { // pipe: gray
            default: '#222',
            flowing: '#334',
        },
        'C': { // cross: gray
            default: '#222',
            flowing: '#334',
        },
        'S': { // source: light-blue
            default: '#446',
        },
        'D': { // drain: black
            default: '#002',
        },
        'A': { // activator: magenta
            default: '#424',
            flowing: '#646',
        },
        'V': { // valve: green
            blocked: '#020',
            default: '#242',
            flowing: '#464',
        },
        'G': { // gate: red
            blocked: '#200',
            default: '#422',
            flowing: '#644',
        },
        'B': { // button: cyan
            blocked: '#022',
            default: '#244',
            flowing: '#466',
        },
        'L': { // light: yellow
            default: '#220',
            flowing: '#ff0',
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
        if (el.is_flowing && 'flowing' in color_map[el.type]) {
            ctx.fillStyle = color_map[el.type]['flowing']
        } else if (el.is_pressurized && 'pressurized' in color_map[el.type]) {
            ctx.fillStyle = color_map[el.type]['pressurized']
        } else if (el.is_blocked && 'blocked' in color_map[el.type]) {
            ctx.fillStyle = color_map[el.type]['blocked']
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
            ctx.fillStyle = (el.is_pressurized ? '#fff' : '#000')
            ctx.fillText(el.input, center_x, center_y)
        }

        // // DEBUG: Draw outflow directions.
        // ctx.fillStyle = '#7f7f7f'
        // ctx.fillRect(draw_x, draw_y, 9, 9)
        // ctx.fillStyle = '#000'
        // if (el.flow.up === -1) ctx.fillRect(draw_x + 3, draw_y, 3, 3)
        // if (el.flow.down === -1) ctx.fillRect(draw_x + 3, draw_y + 6, 3, 3)
        // if (el.flow.right === -1) ctx.fillRect(draw_x + 6, draw_y + 3, 3, 3)
        // if (el.flow.left === -1) ctx.fillRect(draw_x, draw_y + 3, 3, 3)
        // ctx.fillStyle = '#fff'
        // if (el.flow.up === 1) ctx.fillRect(draw_x + 3, draw_y, 3, 3)
        // if (el.flow.down === 1) ctx.fillRect(draw_x + 3, draw_y + 6, 3, 3)
        // if (el.flow.right === 1) ctx.fillRect(draw_x + 6, draw_y + 3, 3, 3)
        // if (el.flow.left === 1) ctx.fillRect(draw_x, draw_y + 3, 3, 3)

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
        new_el.flow[flow_direction] = -1
    } else if (old_el.type === 'D') {
        new_el.flow[flow_direction] = 1
    } else if (adj_el) {
        if (!old_el.is_blocked) {
            // Has outflow into adjacent cell if that cell has outflow (or balanced) on any other sides.
            const has_outflow = (
                (flow_direction !== 'up' && adj_el.flow['down'] === -1) ||
                (flow_direction !== 'down' && adj_el.flow['up'] === -1) ||
                (flow_direction !== 'right' && adj_el.flow['left'] === -1) ||
                (flow_direction !== 'left' && adj_el.flow['right'] === -1)
            )

            // Has inflow from adjacent cell if that cell has inflow (or balanced) on any other sides.
            const has_inflow = (
                (flow_direction !== 'up' && adj_el.flow['down'] === 1) ||
                (flow_direction !== 'down' && adj_el.flow['up'] === 1) ||
                (flow_direction !== 'right' && adj_el.flow['left'] === 1) ||
                (flow_direction !== 'left' && adj_el.flow['right'] === 1)
            )

            if (!has_outflow && !has_inflow) el.flow[flow_direction] = 0
            if (has_outflow && !has_inflow) el.flow[flow_direction] = -1
            if (!has_outflow && has_inflow) el.flow[flow_direction] = 1
        } else {
            new_el.flow[flow_direction] = 0
        }

        // Become unblocked (or blocked) under certain conditions.
        if (old_el.type === 'V' && adj_el.type === 'A' && adj_el.is_flowing) {
            new_el.is_blocked = false
        } else if (old_el.type === 'G' && adj_el.type === 'A' && adj_el.is_flowing) {
            new_el.is_blocked = true
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
