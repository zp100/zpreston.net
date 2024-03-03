import * as Controls from './controls.js'

const NEUTRAL = 0
const LOW = 1
const LOW_SET = 2
const HIGH = 3
const HIGH_SET = 4
const FLOWING = 5



function update_loop(elements) {
    setInterval(() => update(elements), 0)
}



function update(elements) {
    // Make deep-copy of old elements for reference.
    const old_elements = structuredClone(elements)

    // Determine flow.
    for (const grid_x in elements) {
        for (const grid_y in elements[grid_x]) {
            const el = elements[grid_x][grid_y]
            if (el.type !== 'D' && el.type !== 'S') {
                // Get the pull for each edge.
                el.pull[0] = calc_pull(el, old_elements[grid_x]?.[Number(grid_y) + 1], 0) // up
                el.pull[1] = calc_pull(el, old_elements[Number(grid_x) + 1]?.[grid_y], 1) // right
                el.pull[2] = calc_pull(el, old_elements[grid_x]?.[Number(grid_y) - 1], 2) // down
                el.pull[3] = calc_pull(el, old_elements[Number(grid_x) - 1]?.[grid_y], 3) // left

                // Determine the state from the edges.
                if (el.type === 'C') {
                    const vert_pull = [el.pull[0], el.pull[2]]
                    el.state.vert = (
                        vert_pull.includes(LOW) && vert_pull.includes(HIGH) ? FLOWING :
                        vert_pull.includes(LOW) ? LOW :
                        vert_pull.includes(HIGH) ? HIGH :
                        el.state.vert // no change
                    )

                    const hori_pull = [el.pull[1], el.pull[3]]
                    el.state.hori = (
                        hori_pull.includes(LOW) && hori_pull.includes(HIGH) ? FLOWING :
                        hori_pull.includes(LOW) ? LOW :
                        hori_pull.includes(HIGH) ? HIGH :
                        el.state.hori // no change
                    )
                } else {
                    el.is_blocked = (
                        (el.type === 'N' && el.pull.includes(LOW_SET) && !el.pull.includes(HIGH_SET)) ? true :
                        (el.type === 'N' && !el.pull.includes(LOW_SET) && el.pull.includes(HIGH_SET)) ? false :
                        (el.type === 'P' && el.pull.includes(LOW_SET) && !el.pull.includes(HIGH_SET)) ? false :
                        (el.type === 'P' && !el.pull.includes(LOW_SET) && el.pull.includes(HIGH_SET)) ? true :
                        el.is_blocked // no change
                    )

                    if (!el.is_blocked) {
                        el.state = (
                            el.pull.includes(LOW) && el.pull.includes(HIGH) ? FLOWING :
                            el.pull.includes(LOW) ? LOW :
                            el.pull.includes(HIGH) ? HIGH :
                            el.state // no change
                        )
                    }
                }
            }
        }
    }
}



function calc_pull(el, adj_el, direction) {
    if (!adj_el || adj_el.is_blocked || (el.is_controller && adj_el.is_mutable)) {
        return NEUTRAL
    } else if (el.type === 'B') {
        return (el.value in Controls.inputs ? HIGH : LOW)
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

    if (el.is_mutable && adj_el.is_controller) {
        return (
            !is_low && !is_high ? NEUTRAL :
            is_low && !is_high ? LOW_SET :
            !is_low && is_high ? HIGH_SET :
            el.state // no change
        )
    } else {
        return (
            !is_low && !is_high ? NEUTRAL :
            is_low && !is_high ? LOW :
            !is_low && is_high ? HIGH :
            el.state // no change
        )
    }
}



export { NEUTRAL, LOW, HIGH, FLOWING, update_loop }
