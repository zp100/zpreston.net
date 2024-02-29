import * as Controls from './controls.js'

const LOW = 0
const BLOCKED = 1
const HIGH = 2
const ACTIVE = 3



function update(elements) {
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
                    if (vert_pull.includes(LOW) && !vert_pull.includes(HIGH)) {
                        el.state.vert = LOW
                    } else if (!vert_pull.includes(LOW) && vert_pull.includes(HIGH)) {
                        el.state.vert = HIGH
                    } else if (vert_pull.includes(LOW) && vert_pull.includes(HIGH)) {
                        el.state.vert = ACTIVE
                    }

                    const hori_pull = [el.pull[1], el.pull[3]]
                    if (hori_pull.includes(LOW) && !hori_pull.includes(HIGH)) {
                        el.state.hori = LOW
                    } else if (!hori_pull.includes(LOW) && hori_pull.includes(HIGH)) {
                        el.state.hori = HIGH
                    } else if (hori_pull.includes(LOW) && hori_pull.includes(HIGH)) {
                        el.state.hori = ACTIVE
                    }
                } else if (
                    (el.type === 'N' && !el.pull.includes(ACTIVE)) ||
                    (el.type === 'P' && el.pull.includes(ACTIVE)) ||
                    (el.type === 'B' && !(el.value in Controls.inputs))
                ) {
                    el.state = BLOCKED
                } else if (el.pull.includes(LOW) && !el.pull.includes(HIGH)) {
                    el.state = LOW
                } else if (!el.pull.includes(LOW) && el.pull.includes(HIGH)) {
                    el.state = HIGH
                } else if (el.pull.includes(LOW) && el.pull.includes(HIGH)) {
                    el.state = ACTIVE
                }
            }
        }
    }
}



function calc_pull(el, adj_el, direction) {
    if (
        !adj_el ||
        adj_el.state === BLOCKED ||
        (el.type === 'G' && (adj_el.type === 'N' || adj_el.type === 'P'))
    ) {
        return BLOCKED
    } else if ((el.type === 'N' || el.type === 'P') && adj_el.type === 'G') {
        return (adj_el.state === HIGH ? ACTIVE : BLOCKED)
    }

    let is_low = false
    let is_high = false

    for (let i = 0; i < 4; i++) {
        // Skip if it's the edge connecting to the current element.
        if (i === (direction + 2) % 4)              continue

        // Skip if it's an edge that this part of the cross doesn't go to.
        if (adj_el.type === 'C' && i !== direction) continue

        if (adj_el.pull[i] === LOW)                 is_low = true
        else if (adj_el.pull[i] === HIGH)           is_high = true
    }

    if (is_low && !is_high)                         return LOW
    else if (!is_low && !is_high)                   return BLOCKED
    else if (!is_low && is_high)                    return HIGH
    else                                            return el.state
}



export { LOW, BLOCKED, HIGH, ACTIVE, update }
