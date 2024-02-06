const test_tree = {
    'node_id': '#0',
    'dot_type': 'bullet',
    'dot_value': 'light',
    'content': 'Class Name<br>',
    'collapsed': false,
    'children': [
        {
            'node_id': '#1',
            'dot_type': 'check',
            'dot_value': 'light',
            'content': 'Assignment 1<br>',
            'collapsed': false,
            'children': [
                {
                    'node_id': '#4',
                    'dot_type': 'check',
                    'dot_value': 'light',
                    'content': 'Step 1<br>',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#5',
                    'dot_type': 'check',
                    'dot_value': 'light',
                    'content': 'Step 2<br>',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#6',
                    'dot_type': 'X',
                    'dot_value': 'light',
                    'content': 'Step 3<br>',
                    'collapsed': false,
                    'children': [],        
                },
            ],
        },
        {
            'node_id': '#2',
            'dot_type': 'empty',
            'dot_value': 'green',
            'content': 'Assignment 2<br>',
            'collapsed': false,
            'children': [],
        },
        {
            'node_id': '#3',
            'dot_type': 'half',
            'dot_value': 'yellow',
            'content': 'Assignment 3<br>',
            'collapsed': false,
            'children': [
                {
                    'node_id': '#7',
                    'dot_type': 'bullet',
                    'dot_value': 'light',
                    'content': 'Info 1<br>',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#8',
                    'dot_type': 'bullet',
                    'dot_value': 'light',
                    'content': 'Info 2<br>',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#9',
                    'dot_type': 'half',
                    'dot_value': 'yellow',
                    'content': 'Step 1<br>',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#10',
                    'dot_type': 'empty',
                    'dot_value': 'light',
                    'content': 'Step 2<br>',
                    'collapsed': false,
                    'children': [],        
                },
            ],
        },
    ],
}



// Loads and displays the tree.
function load_tree() {
    // Load the tree into the document.
    const tree_html = get_tree_html(test_tree)
    document.querySelector('#tree').innerHTML = tree_html

    // Update its dots' stems.
    update_dots()
}



// Creates the elements for a given tree.
function get_tree_html(tree) {
    // Recursively create the tree and return it.
    const tree_html = rec_get_tree_html(tree)
    return tree_html
}



// Creates and returns the elements for a part of the tree.
function rec_get_tree_html(subtree) {
    // Create an SVG image for the node's dot.
    let dot_html = get_dot_html(subtree.dot_type, subtree.dot_value)

    // Create an editable div that updates the dots when it's edited.
    let content_html = `<span class="content" contenteditable="true" oninput="update_dots()">${subtree.content}</span>`

    // Loop through the children to recursively create their nodes.
    let children_html = ''
    for (child of subtree.children) {
        // Add this node's HTML.
        children_html += rec_get_tree_html(child)
    }

    // Combine and return the HTML.
    return `
        <div class="node">
            ${dot_html}
            <div class="items">
                ${content_html}
                ${children_html}
            </div>
        </div>
    `
}



// Dynamically creates an SVG image for the dot that has the given type and value.
function get_dot_html(type, value) {
    // Start with an empty image.
    let shapes = ''

    // Branch based on the type of dot to add its shapes.
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
                <circle class="${value}" cx="16" cy="16" r="16" />
                <circle cx="16" cy="16" r="9" />
            `
        } break

        // Half-filled circle.
        case 'half': {
            shapes = `
                <circle class="${value}" cx="16" cy="16" r="16" />
                <circle cx="16" cy="16" r="9" />
                <rect class="${value}" x="6" y="16" width="20" height="10" />
            `
        } break

        // Full circle.
        case 'full': {
            shapes = `
                <circle class="${value}" cx="16" cy="16" r="16" />
            `
        } break

        // Check mark.
        case 'check': {
            shapes = `
                <circle class="${value}" cx="16" cy="16" r="16" />
                <line x1="10" y1="17" x2="14" y2="21" style="stroke-width: 7" />
                <line x1="14" y1="21" x2="22" y2="13" style="stroke-width: 7" />
            `
        } break

        // X mark.
        case 'X': {
            shapes = `
                <circle class="${value}" cx="16" cy="16" r="16" />
                <line x1="11" y1="11" x2="21" y2="21" style="stroke-width: 7" />
                <line x1="11" y1="21" x2="21" y2="11" style="stroke-width: 7" />
            `
        } break

        // Arrow.
        case 'arrow': {
            shapes = `
                <circle class="${value}" cx="16" cy="16" r="16" />
                <line x1="10" y1="17" x2="14" y2="21" style="stroke-width: 7" />
                <line x1="14" y1="21" x2="22" y2="13" style="stroke-width: 7" />
            `
        } break

        // Numbered.
        case 'number': {
        } break
    }

    // Return the full SVG image.
    return `
        <svg class="dot" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <line class="stem" x1="16" y1="16" x2="16" y2="16" style="stroke-width: 7" />
            ${shapes}
        </svg>        
    `
}



// Draws the dot and stem for each node.
function update_dots() {
    // Recursively update the stem for the first node's dot and child nodes.
    // The dots must be updated with this recursive depth-first post-order search,
    // so that child nodes are resized before their parents.
    const node_el = document.querySelector('div.node')
    rec_update_dots(node_el)
}



// Recursive call for updating nodes' dots.
function rec_update_dots(node_el) {
    // Loop through the node's children.
    const child_node_el_list = node_el.querySelectorAll('div.node')
    for (const el of child_node_el_list) {
        // Recurse.
        rec_update_dots(el)
    }

    // Get the dot for this node.
    const dot_el = node_el.querySelector('svg.dot')

    // Get the size of the dot (first shrink it so that it gets the correct measurements).
    dot_el.setAttribute('viewBox', `0 0 32 32`)
    const width = dot_el.clientWidth
    const height = dot_el.clientHeight
    const box_height = 32 * height / width

    // Update its view box to maintain proportional size.
    dot_el.setAttribute('viewBox', `0 0 32 ${box_height}`)

    // Update the length of its stem.
    dot_el.querySelector('line.stem').setAttribute('y2', box_height - 16)
}



load_tree()
