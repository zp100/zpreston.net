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
        ['  ', '  ', '  ', '  ', 'L ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', 'P ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', 'P ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', 'P ', '  ', '  ', ],
        ['S ', 'P ', 'L ', 'P ', 'P ', 'P ', 'D ', ],
        ['  ', 'P ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', 'P ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', 'V ', '  ', '  ', '  ', '  ', '  ', ],
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
                    flow: {
                        up: 'n',
                        down: 'n',
                        right: 'n',
                        left: 'n',
                    },
                    is_pressurized: false,
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
    if (camera.zoom < ZOOM_BG_LIMIT) {
        // Fill background if zoomed out too much to load the checkered bg.
        ctx.fillStyle = '#040404'
        ctx.fillRect(0, 0, canvas_el.width, canvas_el.height)

        // Only loop through cells with elements.
        for (const grid_x in elements) {
            for (const grid_y in elements[grid_x]) {
                draw_cell(ctx, elements, grid_x, grid_y)
            }
        }
    } else {
        // Loop through all cells on-screen.
        for (let grid_x = Math.round(camera.grid_x - max_grid_x); grid_x <= Math.round(camera.grid_x + max_grid_x); grid_x++) {
            for (let grid_y = Math.round(camera.grid_y - max_grid_y); grid_y <= Math.round(camera.grid_y + max_grid_y); grid_y++) {
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
            const el = elements[grid_x][grid_y]

            el.is_blocked = (el.type === 'J')

            calc_flow(old_elements, elements, old_el, el, 'up', grid_x, Number(grid_y) + 1)
            calc_flow(old_elements, elements, old_el, el, 'down', grid_x, Number(grid_y) - 1)
            calc_flow(old_elements, elements, old_el, el, 'right', Number(grid_x) + 1, grid_y)
            calc_flow(old_elements, elements, old_el, el, 'left', Number(grid_x) - 1, grid_y)

            el.is_pressurized = (Object.values(el.flow).includes('o') || Object.values(el.flow).includes('b'))
            el.is_flowing = (Object.values(el.flow).includes('o') && Object.values(el.flow).includes('i'))
        }
    }
}



function draw_cell(ctx, elements, grid_x, grid_y) {
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

        // // DEBUG: Draw outflow directions.
        // ctx.fillStyle = '#7f7f7f'
        // ctx.fillRect(draw_x, draw_y, 9, 9)
        // ctx.fillStyle = '#000'
        // if (el.flow.up === 'o') ctx.fillRect(draw_x + 3, draw_y, 3, 3)
        // if (el.flow.down === 'o') ctx.fillRect(draw_x + 3, draw_y + 6, 3, 3)
        // if (el.flow.right === 'o') ctx.fillRect(draw_x + 6, draw_y + 3, 3, 3)
        // if (el.flow.left === 'o') ctx.fillRect(draw_x, draw_y + 3, 3, 3)
        // ctx.fillStyle = '#fff'
        // if (el.flow.up === 'i') ctx.fillRect(draw_x + 3, draw_y, 3, 3)
        // if (el.flow.down === 'i') ctx.fillRect(draw_x + 3, draw_y + 6, 3, 3)
        // if (el.flow.right === 'i') ctx.fillRect(draw_x + 6, draw_y + 3, 3, 3)
        // if (el.flow.left === 'i') ctx.fillRect(draw_x, draw_y + 3, 3, 3)
        // ctx.fillStyle = '#4040ff'
        // if (el.flow.up === 'b') ctx.fillRect(draw_x + 3, draw_y, 3, 3)
        // if (el.flow.down === 'b') ctx.fillRect(draw_x + 3, draw_y + 6, 3, 3)
        // if (el.flow.right === 'b') ctx.fillRect(draw_x + 6, draw_y + 3, 3, 3)
        // if (el.flow.left === 'b') ctx.fillRect(draw_x, draw_y + 3, 3, 3)

    } else if (grid_x === 0 || grid_y === 0) {
        // Axis lines.
        if ((grid_x + grid_y) % 2 === 0) {
            ctx.fillStyle = '#081008'
            ctx.fillRect(draw_x, draw_y, draw_size, draw_size)
        } else {
            ctx.fillStyle = '#101810'
            ctx.fillRect(draw_x, draw_y, draw_size, draw_size)
        }
    } else if (camera.zoom >= ZOOM_BG_LIMIT && (grid_x + grid_y) % 2 !== 0) {
        // Checkered grid background.
        ctx.fillStyle = '#080808'
        ctx.fillRect(draw_x, draw_y, draw_size, draw_size)
    }
}



function calc_flow(old_elements, elements, old_el, el, flow_direction, adj_x, adj_y) {
    const adj_el = old_elements[adj_x]?.[adj_y]
    if (old_el.type === 'S') {
        el.flow[flow_direction] = 'o'
    } else if (old_el.type === 'D') {
        el.flow[flow_direction] = 'i'
    } else if (adj_el) {
        if (!old_el.is_blocked && adj_el.type !== 'V' && adj_el.type !== 'B') {
            // Has outflow into adjacent cell if that cell has outflow (or balanced) on any other sides.
            const has_outflow = (
                (flow_direction !== 'up' && (adj_el.flow['down'] === 'o' || adj_el.flow['down'] === 'b')) ||
                (flow_direction !== 'down' && (adj_el.flow['up'] === 'o' || adj_el.flow['up'] === 'b')) ||
                (flow_direction !== 'right' && (adj_el.flow['left'] === 'o' || adj_el.flow['left'] === 'b')) ||
                (flow_direction !== 'left' && (adj_el.flow['right'] === 'o' || adj_el.flow['right'] === 'b'))
            )

            // Has inflow from adjacent cell if that cell has inflow (or balanced) on any other sides.
            const has_inflow = (
                (flow_direction !== 'up' && (adj_el.flow['down'] === 'i' || adj_el.flow['down'] === 'b')) ||
                (flow_direction !== 'down' && (adj_el.flow['up'] === 'i' || adj_el.flow['up'] === 'b')) ||
                (flow_direction !== 'right' && (adj_el.flow['left'] === 'i' || adj_el.flow['left'] === 'b')) ||
                (flow_direction !== 'left' && (adj_el.flow['right'] === 'i' || adj_el.flow['right'] === 'b'))
            )

            if (!has_outflow && !has_inflow) el.flow[flow_direction] = 'n'
            if (has_outflow && !has_inflow) el.flow[flow_direction] = 'o'
            if (!has_outflow && has_inflow) el.flow[flow_direction] = 'i'
            if (has_outflow && has_inflow) el.flow[flow_direction] = 'b'
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
    if (camera.zoom < MIN_ZOOM) camera.zoom = MIN_ZOOM
    if (camera.zoom > MAX_ZOOM) camera.zoom = MAX_ZOOM
}



// Boilerplate.
main()
