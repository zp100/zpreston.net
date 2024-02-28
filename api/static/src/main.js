"use strict";

// Elements.
const S = Object.freeze({
    LOW: 0,
    BLOCKED: 1,
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
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'S ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'L ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', 'S ', 'W ', 'W ', 'B1', 'W ', 'C ', 'W ', 'L ', 'W ', 'W ', 'D ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'B2', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'D ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
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

                // Set the starting state and edge pulls based on the element type.
                let start_state = S.BLOCKED
                let start_pull = S.BLOCKED
                switch (el_type) {
                    // Cross.
                    case 'C': {
                        start_state = {
                            vert: S.BLOCKED,
                            hori: S.BLOCKED,
                        }
                    } break

                    // Drain.
                    case 'D': {
                        start_pull = S.LOW
                        start_state = S.LOW
                    } break

                    // Source.
                    case 'S': {
                        start_pull = S.HIGH
                        start_state = S.HIGH
                    } break
                }

                // Add it to elements, keyed using its coordinates.
                if (!(grid_x in elements)) elements[grid_x] = {}
                elements[grid_x][grid_y] = {
                    type: el_type,
                    value: el_value,
                    state: start_state,
                    pull: [
                        start_pull, // up
                        start_pull, // right
                        start_pull, // down
                        start_pull, // left
                    ],
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
                el.pull[0] = calc_pull(el, old_elements[grid_x]?.[Number(grid_y) + 1], 0) // up
                el.pull[1] = calc_pull(el, old_elements[Number(grid_x) + 1]?.[grid_y], 1) // right
                el.pull[2] = calc_pull(el, old_elements[grid_x]?.[Number(grid_y) - 1], 2) // down
                el.pull[3] = calc_pull(el, old_elements[Number(grid_x) - 1]?.[grid_y], 3) // left

                // Determine the state from the edges.
                if (el.type === 'C') {
                    const vert_pull = [el.pull[0], el.pull[2]]
                    if (vert_pull.includes(S.LOW) && !vert_pull.includes(S.HIGH)) {
                        el.state.vert = S.LOW
                    } else if (!vert_pull.includes(S.LOW) && vert_pull.includes(S.HIGH)) {
                        el.state.vert = S.HIGH
                    } else if (vert_pull.includes(S.LOW) && vert_pull.includes(S.HIGH)) {
                        el.state.vert = S.ACTIVE
                    }

                    const hori_pull = [el.pull[1], el.pull[3]]
                    if (hori_pull.includes(S.LOW) && !hori_pull.includes(S.HIGH)) {
                        el.state.hori = S.LOW
                    } else if (!hori_pull.includes(S.LOW) && hori_pull.includes(S.HIGH)) {
                        el.state.hori = S.HIGH
                    } else if (hori_pull.includes(S.LOW) && hori_pull.includes(S.HIGH)) {
                        el.state.hori = S.ACTIVE
                    }
                } else if (
                    (el.type === 'N' && !el.pull.includes(S.ACTIVE)) ||
                    (el.type === 'P' && el.pull.includes(S.ACTIVE)) ||
                    (el.type === 'B' && !(el.value in inputs))
                ) {
                    el.state = S.BLOCKED
                } else if (el.pull.includes(S.LOW) && !el.pull.includes(S.HIGH)) {
                    el.state = S.LOW
                } else if (!el.pull.includes(S.LOW) && el.pull.includes(S.HIGH)) {
                    el.state = S.HIGH
                } else if (el.pull.includes(S.LOW) && el.pull.includes(S.HIGH)) {
                    el.state = S.ACTIVE
                }
            }
        }
    }
}



function draw_cell(ctx, elements, grid_x, grid_y) {
    const color_map = {
        'W': { // wire: gray
            [S.LOW]: '#222',
            [S.BLOCKED]: '#222',
            [S.HIGH]: '#222',
            [S.ACTIVE]: '#223',
        },
        'C': { // cross: gray
            [S.LOW]: '#222',
            [S.BLOCKED]: '#222',
            [S.HIGH]: '#222',
            [S.ACTIVE]: '#223',
        },
        'D': { // drain: black
            [S.LOW]: '#002',
            [S.BLOCKED]: '#002',
            [S.HIGH]: '#002',
            [S.ACTIVE]: '#002',
        },
        'S': { // source: light-blue
            [S.LOW]: '#446',
            [S.BLOCKED]: '#446',
            [S.HIGH]: '#446',
            [S.ACTIVE]: '#446',
        },
        'G': { // gate: magenta
            [S.LOW]: '#202',
            [S.BLOCKED]: '#202',
            [S.HIGH]: '#424',
            [S.ACTIVE]: '#424',
        },
        'N': { // n-type FET: green
            [S.LOW]: '#242',
            [S.BLOCKED]: '#020',
            [S.HIGH]: '#242',
            [S.ACTIVE]: '#242',
        },
        'P': { // p-type FET: red
            [S.LOW]: '#422',
            [S.BLOCKED]: '#200',
            [S.HIGH]: '#422',
            [S.ACTIVE]: '#422',
        },
        'B': { // button: cyan
            [S.LOW]: '#022',
            [S.BLOCKED]: '#022',
            [S.HIGH]: '#022',
            [S.ACTIVE]: '#244',
        },
        'L': { // light: yellow
            [S.LOW]: '#220',
            [S.BLOCKED]: '#220',
            [S.HIGH]: '#220',
            [S.ACTIVE]: '#ff6',
        },
    }

    const draw_x = (ctx.canvas.width / 2) + (grid_x - camera.grid_x - 0.5) * camera.zoom
    const draw_y = (ctx.canvas.height / 2) - (grid_y - camera.grid_y + 0.5) * camera.zoom
    const du = camera.zoom / 6
    const el = elements[grid_x]?.[grid_y]
    if (el) {
        if (el.type === 'C') {
            ctx.strokeStyle = '#181818'
            ctx.lineWidth = 1
            
            ctx.fillStyle = color_map[el.type][el.state.vert]
            ctx.beginPath()
            ctx.moveTo(draw_x, draw_y)
            ctx.quadraticCurveTo(draw_x + 5*du, draw_y + 3*du, draw_x, draw_y + 6*du)
            ctx.lineTo(draw_x + 6*du, draw_y + 6*du)
            ctx.quadraticCurveTo(draw_x + 1*du, draw_y + 3*du, draw_x + 6*du, draw_y)
            ctx.lineTo(draw_x, draw_y)
            ctx.stroke()
            ctx.fill()

            ctx.fillStyle = color_map[el.type][el.state.hori]
            ctx.beginPath()
            ctx.moveTo(draw_x, draw_y)
            ctx.quadraticCurveTo(draw_x + 3*du, draw_y + 5*du, draw_x + 6*du, draw_y)
            ctx.lineTo(draw_x + 6*du, draw_y + 6*du)
            ctx.quadraticCurveTo(draw_x + 3*du, draw_y + 1*du, draw_x, draw_y + 6*du)
            ctx.lineTo(draw_x, draw_y)
            ctx.stroke()
            ctx.fill()
        } else {
            ctx.fillStyle = color_map[el.type][el.state]
            ctx.fillRect(draw_x, draw_y, 6*du, 6*du)
        
            // Input for button.
            if (el.type === 'B') {
                ctx.font = `${camera.zoom / 2}px Arial`
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = (el.state === S.BLOCKED ? '#666' : '#fff')
                ctx.fillText(el.value, draw_x + 3*du, draw_y + 3*du)
            }
        }

        // // DEBUG
        // const colors = {
        //     [S.LOW]: '#000',
        //     [S.BLOCKED]: '#808080',
        //     [S.HIGH]: '#fff',
        //     [S.ACTIVE]: '#00f',
        // }
        // ctx.fillStyle = colors[S.BLOCKED]
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
        ctx.fillRect(draw_x, draw_y, 6*du, 6*du)
    } else if (camera.zoom >= ZOOM_BG_LIMIT && (grid_x + grid_y) % 2 !== 0) {
        // Checkered grid background.
        ctx.fillStyle = '#080808'
        ctx.fillRect(draw_x, draw_y, 6*du, 6*du)
    }
}



function calc_pull(el, adj_el, direction) {
    if (
        !adj_el ||
        adj_el.state === S.BLOCKED ||
        (el.type === 'G' && (adj_el.type === 'N' || adj_el.type === 'P'))
    ) {
        return S.BLOCKED
    } else if ((el.type === 'N' || el.type === 'P') && adj_el.type === 'G') {
        return (adj_el.state === S.HIGH ? S.ACTIVE : S.BLOCKEDs)
    }

    let is_low = false
    let is_high = false
    
    for (let i = 0; i < 4; i++) {
        // Skip if it's the edge connecting to the current element.
        if (i === (direction + 2) % 4)              continue

        // Skip if it's an edge that this part of the cross doesn't go to.
        if (adj_el.type === 'C' && i !== direction) continue

        if (adj_el.pull[i] === S.LOW)               is_low = true
        else if (adj_el.pull[i] === S.HIGH)         is_high = true
    }
    
    if (is_low && !is_high)                         return S.LOW
    else if (!is_low && !is_high)                   return S.BLOCKED
    else if (!is_low && is_high)                    return S.HIGH
    else                                            return el.state
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
