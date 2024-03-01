import * as Render from './modules/render.js'
import * as Simulate from './modules/simulate.js'
import * as Controls from './modules/controls.js'



function main() {
    // Create elements.
    // NAND gate:
    const elements = component_to_elements([
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'D ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', '  ', '  ', 'W ', 'W ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', 'W ', 'W ', 'W ', 'G ', 'P ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', 'W ', '  ', '  ', '  ', 'W ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', 'W ', '  ', 'W ', 'W ', 'C ', 'G ', 'P ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['D ', 'N ', 'W ', '  ', 'W ', '  ', 'W ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', 'B1', 'W ', '  ', 'W ', '  ', 'W ', 'W ', 'W ', 'W ', 'G ', '  ', '  ', '  ', '  ', '  ', ],
        ['S ', 'P ', 'W ', 'W ', 'C ', 'G ', 'N ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', '  ', '  ', '  ', 'W ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['D ', 'N ', 'W ', 'W ', 'W ', 'G ', 'N ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['  ', 'B2', 'W ', '  ', '  ', '  ', 'W ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
        ['S ', 'P ', 'W ', '  ', '  ', '  ', 'S ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', '  ', ],
    ])

    // Draw loop and update loop.
    Controls.add_handlers()
    Render.draw_loop(elements)
    setInterval(() => Simulate.update(elements), 0)
}



function component_to_elements(comp=[]) {
    const elements = {}
    for (const row in comp) {
        for (const col in comp[row]) {
            const el_type = comp[row][col][0]
            const el_value = comp[row][col][1]
            if (el_type !== ' ') {
                // Rename variables for readability.
                const grid_x = col
                const grid_y = comp.length - 1 - row

                // Set the starting values based on the element type.
                let start_state = Simulate.NEUTRAL
                let start_pull = Simulate.NEUTRAL
                let blocked = false
                let mutable = false
                let controller = false
                switch (el_type) {
                    // Cross.
                    case 'C': {
                        start_state = {
                            vert: Simulate.NEUTRAL,
                            hori: Simulate.NEUTRAL,
                        }
                    } break

                    // Source.
                    case 'S': {
                        start_pull = Simulate.LOW
                        start_state = Simulate.LOW
                    } break

                    // Drain.
                    case 'D': {
                        start_pull = Simulate.HIGH
                        start_state = Simulate.HIGH
                    } break

                    // Switch.
                    case 'N':
                    case 'P': {
                        blocked = true
                        mutable = true
                    } break

                    // Detector.
                    case 'G':
                    case 'B': {
                        controller = true
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
                    is_blocked: blocked,
                    is_mutable: mutable,
                    is_controller: controller,
                }
            }
        }
    }

    return elements
}



// Boilerplate.
main()
