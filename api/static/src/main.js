"use strict";
const elements = {}
const P_FIDELITY = 1024



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
                // Set pressure.
                let base_pressure = 0
                if (el_type == 'S') {
                    base_pressure = P_FIDELITY
                } else if (el_type == 'D') {
                    base_pressure = -P_FIDELITY
                }

                // Add to elements, keyed using its coordinates.
                if (!(row in elements)) {
                    elements[row] = {}
                }
                elements[row][col] = {
                    type: el_type,
                    pressure: base_pressure,
                }
            }
        }
    }
}



function draw_rec() {
    const color_map = {
        'S': '#ccf',
        'D': '#003',
        'P': '#55b',
        'G': '#0f0',
        'V': '#f0f',
        'C': '#f73',
    }    

    // Get canvas, adjust size, and clear.
    const canvas_el = document.querySelector('canvas.grid')
    canvas_el.width = canvas_el.clientWidth
    canvas_el.height = canvas_el.clientHeight
    const ctx = canvas_el.getContext('2d')
    ctx.clearRect(0, 0, canvas_el.width, canvas_el.height)

    // Draw.
    const scalar = 64
    for (const y in elements) {
        for (const x in elements[y]) {
            const el = elements[y][x]
            if (el.type === 'P') {
                // For pipes, scale brightness and blue-ness with pressure.
                const p_scaled = (el.pressure / P_FIDELITY + 1) / 2
                const rg = Math.ceil(p_scaled * 119 + 51)
                const blue = Math.ceil(p_scaled * 204 + 51)
                ctx.fillStyle = `rgb(${rg}, ${rg}, ${blue})`
            } else {
                ctx.fillStyle = color_map[el.type]
            }
            ctx.fillRect(x * scalar, y * scalar, scalar, scalar)

            // Text test.
            ctx.font = '20px Arial'
            ctx.fillStyle = '#fff'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(el.pressure, (Number(x) + 0.5) * scalar, (Number(y) + 0.5) * scalar)
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
    for (const y in elements) {
        for (const x in elements[y]) {
            const el = elements[y][x]
            let total_pressure = 0
            let adj_count = 0

            const up_el = elements[Number(y) - 1]?.[x]
            if (up_el) {
                total_pressure += up_el.pressure
                adj_count++
            }

            const down_el = elements[Number(y) + 1]?.[x]
            if (down_el) {
                total_pressure += down_el.pressure
                adj_count++
            }

            const left_el = elements[y][Number(x) - 1]
            if (left_el) {
                total_pressure += left_el.pressure
                adj_count++
            }

            const right_el = elements[y][Number(x) + 1]
            if (right_el) {
                total_pressure += right_el.pressure
                adj_count++
            }

            if (adj_count !== 0) {
                const avg_pressure = total_pressure / adj_count
                new_elements[y][x].pressure += true_round((avg_pressure - el.pressure) * flow_speed)
                if (up_el) {
                    new_elements[Number(y) - 1][x].pressure += true_round((avg_pressure - up_el.pressure) * flow_speed)
                }
                if (down_el) {
                    new_elements[Number(y) + 1][x].pressure += true_round((avg_pressure - down_el.pressure) * flow_speed)
                }
                if (left_el) {
                    new_elements[y][Number(x) - 1].pressure += true_round((avg_pressure - left_el.pressure) * flow_speed)
                }
                if (right_el) {
                    new_elements[y][Number(x) + 1].pressure += true_round((avg_pressure - right_el.pressure) * flow_speed)
                }
            }
        }
    }

    // Deep-copy new elements to old mapping.
    for (const y in elements) {
        for (const x in elements[y]) {
            if (elements[y][x].type !== 'S' && elements[y][x].type !== 'D') {
                elements[y][x] = new_elements[y][x]
            }
        }
    }
}



// Rounds half-increments away from 0 instead of towards +Inf.
function true_round(num) {
    return Math.sign(num) * Math.round(Math.abs(num))
}



// Boilerplate.
main()
