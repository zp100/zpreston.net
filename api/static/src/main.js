"use strict";
const P_FIDELITY = 65536
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
        [' ', 'S', 'P', 'P', 'P', 'P', 'P', 'P', ' ', ],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', 'P', ' ', ],
        [' ', 'D', ' ', 'P', 'P', 'P', 'P', 'P', ' ', ],
        [' ', 'P', ' ', 'P', ' ', ' ', ' ', ' ', ' ', ],
        [' ', 'P', ' ', 'P', 'P', 'P', 'P', 'P', ' ', ],
        [' ', 'P', ' ', ' ', ' ', ' ', ' ', 'P', ' ', ],
        [' ', 'P', 'P', 'P', 'P', 'P', 'P', 'P', ' ', ],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ],
    ]
    component_to_elements(test_component)

    // Draw loop and update loop.
    requestAnimationFrame(draw_rec)
    const loop_handler = setInterval(update, 20)
}



function component_to_elements(comp=[]) {
    for (const row in comp) {
        for (const col in comp[row]) {
            const el_type = comp[row][col]
            if (el_type !== ' ') {
                // Rename variables for readability.
                const grid_x = col
                const grid_y = comp.length - 1 - row

                // Set pressure.
                let base_pressure = 0
                if (el_type == 'S') {
                    base_pressure = P_FIDELITY
                } else if (el_type == 'D') {
                    base_pressure = -P_FIDELITY
                }

                // Add to elements, keyed using its coordinates.
                if (!(grid_x in elements)) {
                    elements[grid_x] = {}
                }
                elements[grid_x][grid_y] = {
                    type: el_type,
                    pressure: base_pressure,
                }
            }
        }
    }
}



function draw_rec() {
    const color_map = {
        'S': '#0cc',
        'D': '#003',
        'P': '#669',
        'G': '#0f0',
        'V': '#c0c',
        'C': '#f00',
    }

    const canvas_el = document.querySelector('canvas.grid')
    canvas_el.width = canvas_el.clientWidth
    canvas_el.height = canvas_el.clientHeight
    const ctx = canvas_el.getContext('2d')

    const max_grid_x = (canvas_el.width / 2) / camera.zoom
    const max_grid_y = (canvas_el.height / 2) / camera.zoom
    for (let grid_x = Math.round(camera.grid_x - max_grid_x); grid_x <= Math.round(camera.grid_x + max_grid_x); grid_x++) {
        for (let grid_y = Math.round(camera.grid_y - max_grid_y); grid_y <= Math.round(camera.grid_y + max_grid_y); grid_y++) {
            const draw_x = (canvas_el.width / 2) + (grid_x - camera.grid_x - 0.5) * camera.zoom
            const draw_y = (canvas_el.height / 2) - (grid_y - camera.grid_y + 0.5) * camera.zoom 
            const el = elements[grid_x]?.[grid_y]
            if (el) {
                // Element.
                if (el.type === 'P') {
                    // For pipes, scale brightness and blue-ness with pressure.
                    const p_scaled = (el.pressure / P_FIDELITY + 1) / 2
                    const rg = Math.ceil(p_scaled * 102 + 51)
                    const blue = Math.ceil(p_scaled * 204 + 51)
                    ctx.fillStyle = `rgb(${rg}, ${rg}, ${blue})`
                } else {
                    ctx.fillStyle = color_map[el.type]
                }
                ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)

                // Text test.
                ctx.font = `${camera.zoom / 4}px Arial`
                ctx.fillStyle = '#fff'
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillText(el.pressure, draw_x + 0.5 * camera.zoom, draw_y + 0.5 * camera.zoom)
            } else if (grid_x === 0 || grid_y === 0) {
                // Axis lines.
                if ((grid_x + grid_y) % 2 === 0) {
                    ctx.fillStyle = '#eeb'
                    ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
                } else {
                    ctx.fillStyle = '#ffc'
                    ctx.fillRect(draw_x, draw_y, camera.zoom, camera.zoom)
                }
            } else if (camera.zoom > 4 && (grid_x + grid_y) % 2 === 0) {
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
    // Deep-copy elements to new mapping.
    const new_elements = structuredClone(elements)

    // Average out the pressure for each element.
    const flow_speed = 0.5 // higher than 0.5 causes "waves" where the pressure oscillates before settling
    for (const grid_x in elements) {
        for (const grid_y in elements[grid_x]) {
            const el = elements[grid_x][grid_y]
            let total_pressure = 0
            let adj_count = 0

            const up_el = elements[grid_x][Number(grid_y) + 1]
            if (up_el) {
                total_pressure += up_el.pressure
                adj_count++
            }

            const down_el = elements[grid_x][Number(grid_y) - 1]
            if (down_el) {
                total_pressure += down_el.pressure
                adj_count++
            }

            const right_el = elements[Number(grid_x) + 1]?.[grid_y]
            if (right_el) {
                total_pressure += right_el.pressure
                adj_count++
            }

            const left_el = elements[Number(grid_x) - 1]?.[grid_y]
            if (left_el) {
                total_pressure += left_el.pressure
                adj_count++
            }

            if (adj_count !== 0) {
                const avg_pressure = total_pressure / adj_count
                new_elements[grid_x][grid_y].pressure += true_round((avg_pressure - el.pressure) * flow_speed)
                if (up_el) {
                    new_elements[grid_x][Number(grid_y) + 1].pressure += true_round((avg_pressure - up_el.pressure) * flow_speed)
                }
                if (down_el) {
                    new_elements[grid_x][Number(grid_y) - 1].pressure += true_round((avg_pressure - down_el.pressure) * flow_speed)
                }
                if (right_el) {
                    new_elements[Number(grid_x) + 1][grid_y].pressure += true_round((avg_pressure - right_el.pressure) * flow_speed)
                }
                if (left_el) {
                    new_elements[Number(grid_x) - 1][grid_y].pressure += true_round((avg_pressure - left_el.pressure) * flow_speed)
                }
            }
        }
    }

    // Deep-copy new elements to old mapping.
    for (const grid_x in elements) {
        for (const grid_y in elements[grid_x]) {
            if (elements[grid_x][grid_y].type !== 'S' && elements[grid_x][grid_y].type !== 'D') {
                elements[grid_x][grid_y] = new_elements[grid_x][grid_y]
            }
        }
    }
}



addEventListener('wheel', (ev) => {
    ev.preventDefault()
    if (ev.ctrlKey) {
        camera.zoom *= 1 + (0.0005 * ev.deltaY)
        if (camera.zoom < 2) camera.zoom = 2
        if (camera.zoom > 256) camera.zoom = 256
    } else {
        camera.grid_x += 0.5 * ev.deltaX / camera.zoom
        camera.grid_y -= 0.5 * ev.deltaY / camera.zoom
    }
}, {passive: false}) // prevents Ctrl + Scroll to zoom as well



// Rounds half-increments away from 0 instead of towards +Inf.
function true_round(num) {
    return Math.sign(num) * Math.round(Math.abs(num))
}



// Boilerplate.
main()
