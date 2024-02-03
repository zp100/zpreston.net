const test_tree = {
    'node_id': '#0',
    'dot_type': 'bullet',
    'dot_value': 'light',
    'content': 'Class Name',
    'collapsed': false,
    'children': [
        {
            'node_id': '#1',
            'dot_type': 'check',
            'dot_value': 'light',
            'content': 'Assignment 1',
            'collapsed': false,
            'children': [
                {
                    'node_id': '#4',
                    'dot_type': 'check',
                    'dot_value': 'light',
                    'content': 'Step 1',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#5',
                    'dot_type': 'check',
                    'dot_value': 'light',
                    'content': 'Step 2',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#6',
                    'dot_type': 'X',
                    'dot_value': 'light',
                    'content': 'Step 3',
                    'collapsed': false,
                    'children': [],        
                },
            ],
        },
        {
            'node_id': '#2',
            'dot_type': 'empty',
            'dot_value': 'green',
            'content': 'Assignment 2',
            'collapsed': false,
            'children': [],
        },
        {
            'node_id': '#3',
            'dot_type': 'half',
            'dot_value': 'yellow',
            'content': 'Assignment 3',
            'collapsed': false,
            'children': [
                {
                    'node_id': '#7',
                    'dot_type': 'bullet',
                    'dot_value': 'light',
                    'content': 'Info 1',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#8',
                    'dot_type': 'bullet',
                    'dot_value': 'light',
                    'content': 'Info 2',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#9',
                    'dot_type': 'half',
                    'dot_value': 'yellow',
                    'content': 'Step 1',
                    'collapsed': false,
                    'children': [],        
                },
                {
                    'node_id': '#10',
                    'dot_type': 'empty',
                    'dot_value': 'light',
                    'content': 'Step 2',
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
}



// Creates the elements for a given tree.
function get_tree_html(tree) {
    // Recursively create the tree and return it.
    const tree_html = get_tree_html_rec(tree)
    return tree_html
}



// Creates and returns the elements for a part of the tree.
function get_tree_html_rec(subtree) {
    //
    let dot_html = get_dot_html(subtree.dot_type, subtree.dot_value)

    //
    let content_html = `<div class="content" contenteditable="true">${subtree.content}</div>`

    //
    let children_html = ''
    for (child of subtree.children) {
        //
        children_html += get_tree_html_rec(child)
    }

    //
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
                <line x1="10" y1="17" x2="14" y2="21" />
                <line x1="14" y1="21" x2="22" y2="13" />
            `
        } break

        // X mark.
        case 'X': {
            shapes = `
                <circle class="${value}" cx="16" cy="16" r="16" />
                <line x1="11" y1="11" x2="21" y2="21" />
                <line x1="11" y1="21" x2="21" y2="11" />
            `
        } break

        // Arrow.
        case 'arrow': {
            shapes = `
                <circle class="${value}" cx="16" cy="16" r="16" />
                <line x1="10" y1="17" x2="14" y2="21" />
                <line x1="14" y1="21" x2="22" y2="13" />
            `
        } break

        // Numbered.
        case 'number': {
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
