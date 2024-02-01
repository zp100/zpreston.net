function load_tree() {
    const tree_el = document.querySelector('#tree')

    node_el = document.createElement('div')
    node_el.classList.add('node')
    node_el.insertAdjacentHTML('beforeend', get_dot_xml('check', 'green'))
    node_el.insertAdjacentHTML('beforeend', '<textarea rows="1"></textarea>')
    node_el.lastElementChild.addEventListener('input', textarea_input)
    tree_el.appendChild(node_el)

    node_el = document.createElement('div')
    node_el.classList.add('node')
    node_el.insertAdjacentHTML('beforeend', get_dot_xml('X', 'red'))
    node_el.insertAdjacentHTML('beforeend', '<textarea rows="1"></textarea>')
    node_el.lastElementChild.addEventListener('input', textarea_input)
    tree_el.appendChild(node_el)
}



function textarea_input(ev) {
    // Reset the text box's height so that scrollHeight is accurate.
    ev.target.style.height = '0px'

    // Set the height to be equal to the scroll height.
    ev.target.style.height = (ev.target.scrollHeight) + 'px'
}



function get_dot_xml(type, color) {
    // Start with an empty SVG image.
    let shapes = ''

    // Branch based on the type of dot.
    switch (type) {
        // Bullet point.
        case 'bullet': {
            shapes = `
                <circle cx="16" cy="16" r="9" />
            `
        } break

        // Empty circle.
        case 'empty': {
            shapes = `
                <circle class="${color}" cx="16" cy="16" r="16" />
                <circle cx="16" cy="16" r="9" />
            `
        } break

        // Half-filled circle.
        case 'half': {
            shapes = `
                <circle class="${color}" cx="16" cy="16" r="16" />
                <circle cx="16" cy="16" r="9" />
                <rect class="${color}" x="6" y="16" width="20" height="10" />        
            `
        } break

        // Full circle.
        case 'full': {
            shapes = `
                <circle class="${color}" cx="16" cy="16" r="16" />
            `
        } break

        // Check mark.
        case 'check': {
            shapes = `
                <circle class="${color}" cx="16" cy="16" r="16" />
                <line x1="10" y1="17" x2="14" y2="21" />
                <line x1="14" y1="21" x2="22" y2="13" />
            `
        } break

        // X mark.
        case 'X': {
            shapes = `
                <circle class="${color}" cx="16" cy="16" r="16" />
                <line x1="11" y1="11" x2="21" y2="21" />
                <line x1="11" y1="21" x2="21" y2="11" />
                    `
        } break

        // Arrow.
        case 'arrow': {
            shapes = `
                <circle class="${color}" cx="16" cy="16" r="16" />
                <line x1="10" y1="17" x2="14" y2="21" />
                <line x1="14" y1="21" x2="22" y2="13" />
            `
        } break

        // Numbered.
        case 'number': {
            shapes = `
                <circle class="${color}" cx="16" cy="16" r="16" />
                <line x1="10" y1="17" x2="14" y2="21" />
                <line x1="14" y1="21" x2="22" y2="13" />
            `
        } break
    }

    // Return the full SVG image.
    return `
        <svg class="dot" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            ${shapes}
        </svg>
    `
}



load_tree()
