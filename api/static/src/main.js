"use strict";

// Elements.
const S = Object.freeze({
    NEUTRAL: 0,
    LOW: 1,
    HIGH: 2,
    ACTIVE: 3,
})
const elements = {}
const inputs = {}

// Camera.
const MIN_ZOOM = 2**-6
const ZOOM_BG_LIMIT = 2**2
const MAX_ZOOM = 2**10
const camera = {
    grid_x: 8,
    grid_y: 8,
    zoom: 32,
}



function main() {
    // Create elements.
    const test_component = [
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'S ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'L ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', 'S ', 'W ', 'W ', 'B1', 'W ', 'W ', 'G ', 'N ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', 'D ', '  ', '  ', '  ', '  ', '  ', '  ', ],
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

                let base_state = S.NEUTRAL
                if (el_type === 'D')            base_state = S.LOW
                if (el_type === 'S')            base_state = S.HIGH

                // Add it to elements, keyed using its coordinates.
                if (!(grid_x in elements))      elements[grid_x] = {}
                elements[grid_x][grid_y] = {
                    type: el_type,
                    value: el_value,
                    state: base_state,
                    pull: [
                        base_state, // up
                        base_state, // right
                        base_state, // down
                        base_state, // left
                    ],
                    is_blocked: (el_type === 'N' || el_type === 'B'),
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
            const el = elements[grid_x][grid_y]
            if (el.type !== 'S' && el.type !== 'D') {
                // Get the pull for each edge.
                calc_pull(el, old_elements[grid_x]?.[Number(grid_y) + 1], 0) // up
                calc_pull(el, old_elements[Number(grid_x) + 1]?.[grid_y], 1) // right
                calc_pull(el, old_elements[grid_x]?.[Number(grid_y) - 1], 2) // down
                calc_pull(el, old_elements[Number(grid_x) - 1]?.[grid_y], 3) // left

                // Determine if the element is blocked.
                el.is_blocked = (
                    (el.type === 'N' && !el.pull.includes(S.ACTIVE)) ||
                    (el.type === 'P' && el.pull.includes(S.ACTIVE)) ||
                    (el.type === 'B' && !(el.value in inputs))
                )

                // Determine the state from the edges.
                el.state = (
                    el.pull.includes(S.LOW) && !el.pull.includes(S.HIGH) ? S.LOW :
                    !el.pull.includes(S.LOW) && el.pull.includes(S.HIGH) ? S.HIGH :
                    el.pull.includes(S.LOW) && el.pull.includes(S.HIGH) ? S.ACTIVE :
                    S.NEUTRAL
                )
            }
        }
    }
}



function draw_cell(ctx, elements, grid_x, grid_y) {
    const color_map = {
        'W': { // wire: gray
            [S.NEUTRAL]: '#222',
            [S.LOW]: '#222',
            [S.HIGH]: '#222',
            [S.ACTIVE]: '#223',
        },
        'C': { // cross: gray
            [S.NEUTRAL]: '#222',
            [S.LOW]: '#222',
            [S.HIGH]: '#222',
            [S.ACTIVE]: '#223',
        },
        'D': { // drain: black
            [S.NEUTRAL]: '#002',
            [S.LOW]: '#002',
            [S.HIGH]: '#002',
            [S.ACTIVE]: '#002',
        },
        'S': { // source: light-blue
            [S.NEUTRAL]: '#446',
            [S.LOW]: '#446',
            [S.HIGH]: '#446',
            [S.ACTIVE]: '#446',
        },
        'G': { // gate: magenta
            [S.NEUTRAL]: '#202',
            [S.LOW]: '#202',
            [S.HIGH]: '#424',
            [S.ACTIVE]: '#202',
        },
        'N': { // n-type FET: green
            [S.NEUTRAL]: '#020',
            [S.LOW]: '#020',
            [S.HIGH]: '#020',
            [S.ACTIVE]: '#242',
        },
        'P': { // p-type FET: red
            [S.NEUTRAL]: '#200',
            [S.LOW]: '#200',
            [S.HIGH]: '#200',
            [S.ACTIVE]: '#422',
        },
        'B': { // button: cyan
            [S.NEUTRAL]: '#022',
            [S.LOW]: '#022',
            [S.HIGH]: '#022',
            [S.ACTIVE]: '#244',
        },
        'L': { // light: yellow
            [S.NEUTRAL]: '#220',
            [S.LOW]: '#220',
            [S.HIGH]: '#220',
            [S.ACTIVE]: '#ff6',
        },
    }

    const center_x = (ctx.canvas.width / 2) + (grid_x - camera.grid_x) * camera.zoom
    const center_y = (ctx.canvas.height / 2) - (grid_y - camera.grid_y) * camera.zoom
    const draw_x = (ctx.canvas.width / 2) + (grid_x - camera.grid_x - 0.5) * camera.zoom
    const draw_y = (ctx.canvas.height / 2) - (grid_y - camera.grid_y + 0.5) * camera.zoom
    const draw_size = camera.zoom
    const el = elements[grid_x]?.[grid_y]
    if (el) {
        // Element color.
        ctx.fillStyle = (
            el.is_blocked ? color_map[el.type][S.NEUTRAL] :
            color_map[el.type][el.state]
        )
        ctx.fillRect(draw_x, draw_y, draw_size, draw_size)

        // Dividers for cross.
        if (el.type === 'C') {
            ctx.strokeStyle = '#111'
            ctx.beginPath()
            ctx.moveTo(draw_x, draw_y)
            ctx.lineTo(draw_x + draw_size, draw_y + draw_size)
            ctx.moveTo(draw_x + draw_size, draw_y)
            ctx.lineTo(draw_x, draw_y + draw_size)
            ctx.stroke()
        }

        // Input for button.
        if (el.type === 'B') {
            ctx.font = `${camera.zoom / 2}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = (el.state === S.ACTIVE ? '#fff' : '#666')
            ctx.fillText(el.value, center_x, center_y)
        }

        // // DEBUG
        // const colors = {
        //     [S.NEUTRAL]: '#808080',
        //     [S.LOW]: '#000',
        //     [S.HIGH]: '#fff',
        //     [S.ACTIVE]: '#00f',
        // }
        // ctx.fillStyle = colors[S.NEUTRAL]
        // ctx.fillRect(draw_x, draw_y, 12, 12)
        // ctx.fillStyle = colors[el.state]
        // ctx.fillRect(draw_x + 4, draw_y + 4, 4, 4)
        // ctx.fillStyle = colors[el.pull[0]]
        // ctx.fillRect(draw_x + 4, draw_y, 4, 4)
        // ctx.fillStyle = colors[el.pull[1]]
        // ctx.fillRect(draw_x + 8, draw_y + 4, 4, 4)
        // ctx.fillStyle = colors[el.pull[2]]
        // ctx.fillRect(draw_x + 4, draw_y + 8, 4, 4)
        // ctx.fillStyle = colors[el.pull[3]]
        // ctx.fillRect(draw_x, draw_y + 4, 4, 4)

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



function calc_pull(el, adj_el, direction) {
    if (adj_el && !adj_el.is_blocked) {
        let is_low = false
        let is_high = false

        for (let i = 0; i < 4; i++) {
            // Skip if it's the edge connecting to the current element.
            if (i === (direction + 2) % 4)      continue

            if (adj_el.pull[i] === S.LOW)       is_low = true
            else if (adj_el.pull[i] === S.HIGH) is_high = true
        }

        if (adj_el.type === 'G') {
            if (!is_low && is_high)             el.pull[direction] = S.ACTIVE
            else                                el.pull[direction] = S.NEUTRAL
        } else {
            if (!is_low && !is_high)            el.pull[direction] = S.NEUTRAL
            else if (is_low && !is_high)        el.pull[direction] = S.LOW
            else if (!is_low && is_high)        el.pull[direction] = S.HIGH
            // if adj is both low and high, don't change state
        }
    } else {
        el.pull[direction] = S.NEUTRAL
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
