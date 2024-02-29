import * as Simulate from './simulate.js'

const MIN_ZOOM = 2**-6
const ZOOM_BG_LIMIT = 2**2
const MAX_ZOOM = 2**10
const camera = {
    grid_x: 8,
    grid_y: 8,
    zoom: 32,
}



function draw_loop(elements) {
    requestAnimationFrame(() => draw_rec(elements))
}



function draw_rec(elements) {
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
    requestAnimationFrame(() => draw_rec(elements))
}



function draw_cell(ctx, elements, grid_x, grid_y) {
    const color_map = {
        'W': { // wire: gray
            [Simulate.LOW]: '#222',
            [Simulate.BLOCKED]: '#222',
            [Simulate.HIGH]: '#222',
            [Simulate.ACTIVE]: '#223',
        },
        'C': { // cross: gray
            [Simulate.LOW]: '#222',
            [Simulate.BLOCKED]: '#222',
            [Simulate.HIGH]: '#222',
            [Simulate.ACTIVE]: '#223',
        },
        'D': { // drain: black
            [Simulate.LOW]: '#002',
            [Simulate.BLOCKED]: '#002',
            [Simulate.HIGH]: '#002',
            [Simulate.ACTIVE]: '#002',
        },
        'S': { // source: light-blue
            [Simulate.LOW]: '#446',
            [Simulate.BLOCKED]: '#446',
            [Simulate.HIGH]: '#446',
            [Simulate.ACTIVE]: '#446',
        },
        'G': { // gate: magenta
            [Simulate.LOW]: '#202',
            [Simulate.BLOCKED]: '#202',
            [Simulate.HIGH]: '#424',
            [Simulate.ACTIVE]: '#424',
        },
        'N': { // n-type FET: green
            [Simulate.LOW]: '#242',
            [Simulate.BLOCKED]: '#020',
            [Simulate.HIGH]: '#242',
            [Simulate.ACTIVE]: '#242',
        },
        'P': { // p-type FET: red
            [Simulate.LOW]: '#422',
            [Simulate.BLOCKED]: '#200',
            [Simulate.HIGH]: '#422',
            [Simulate.ACTIVE]: '#422',
        },
        'B': { // button: cyan
            [Simulate.LOW]: '#022',
            [Simulate.BLOCKED]: '#022',
            [Simulate.HIGH]: '#022',
            [Simulate.ACTIVE]: '#244',
        },
        'L': { // light: yellow
            [Simulate.LOW]: '#220',
            [Simulate.BLOCKED]: '#220',
            [Simulate.HIGH]: '#220',
            [Simulate.ACTIVE]: '#ff6',
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
                ctx.fillStyle = (el.state === Simulate.BLOCKED ? '#444' : '#fff')
                ctx.fillText(el.value, draw_x + 3*du, draw_y + 3*du)
            }
        }
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



function pan(x, y) {
    camera.grid_x -= x / camera.zoom
    camera.grid_y += y / camera.zoom
}



function zoom(z) {
    camera.zoom *= 1 + (-0.002 * z)
    if (camera.zoom < MIN_ZOOM) camera.zoom = MIN_ZOOM
    if (camera.zoom > MAX_ZOOM) camera.zoom = MAX_ZOOM
}



export { draw_loop, pan, zoom }