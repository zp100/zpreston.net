// Generates the given type of options tab.
function generate_options_tabs() {
    // Declare.
    let group_list

    // Add "Mix" tab.
    group_list = get_mix_items()
    add_options_tab_html('mix-tab', group_list)

    // Add "Add track" tab.
    group_list = get_new_items()
    add_options_tab_html('new-tab', group_list)

    // Add "Edit track" tab.
    group_list = get_edit_items()
    add_options_tab_html('edit-tab', group_list)

    // Add "Edit results" tab.
    group_list = get_results_items()
    add_options_tab_html('results-tab', group_list)

    // Add "Account" tab.
    if (user_record.username === '<guest>') group_list = get_guest_items()
    else group_list = get_account_items()
    add_options_tab_html('account-tab', group_list)

    // Add "Info" tab.
    group_list = get_info_items()
    add_options_tab_html('info-tab', group_list)

    // DEBUG: Disable "Import" and "Export" buttons.
    button_el_list = document.querySelectorAll('#account-tab button.action')
    button_el_list[3].disabled = true
    button_el_list = document.querySelectorAll('#edit-tab button.action')
    button_el_list[3].disabled = true
}



// Generates the HTML for a tab, based on the items provided.
function add_options_tab_html(tab_id, group_list) {
    // Create tab div.
    const tab_el = document.createElement('div')
    tab_el.id = tab_id
    tab_el.classList.add('options-tab')
    tab_el.hidden = true

    // Loop through the groups.
    for (const group of group_list) {
        // Create group div.
        const group_el = document.createElement('section')
        group_el.classList.add('group')

        // Loop through the items.
        for (const item of group) {
            // Create item div.
            const item_el = document.createElement('div')
            item_el.classList.add('item')

            // Check which class of item it is.
            switch (item.item_type) {
                // Text, number, or password input.
                case 'field': {
                    // Add tag.
                    item_el.classList.add('field')

                    // Add HTML and event listeners.
                    item_el.insertAdjacentHTML('beforeend', '<label for="' + item.value + '">' + item.display + '</label>')
                    item_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Clear input">❌</button>')
                    item_el.lastElementChild.addEventListener('click', () => clear_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<button class="mini" title="More information">❓</button>')
                    item_el.lastElementChild.addEventListener('click', () => info_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<input type="' + item.type + '" name="' + item.value + '">')
                    item_el.lastElementChild.addEventListener('input', () => text_input(tab_id, item.value))
                } break

                // File upload.
                case 'file-upload': {
                    // Add tag.
                    item_el.classList.add('field')

                    // Add HTML and event listeners.
                    item_el.insertAdjacentHTML('beforeend', '<label for="' + item.value + '">' + item.display + '</label>')
                    item_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Clear input">❌</button>')
                    item_el.lastElementChild.addEventListener('click', () => clear_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<button class="mini" title="More information">❓</button>')
                    item_el.lastElementChild.addEventListener('click', () => info_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<input type="file" accept=".json" multiple=1 id="' + item.value + '" name="' + item.value + '">')
                    item_el.lastElementChild.addEventListener('input', () => text_input(tab_id, item.value))
                } break

                // Modifier input.
                case 'modifier-field': {
                    // Add tag.
                    item_el.classList.add('field')

                    // Add HTML and event listeners.
                    item_el.insertAdjacentHTML('beforeend', '<label for="' + item.value + '">' + item.display + '</label>')
                    item_el.insertAdjacentHTML('beforeend', `<button name="${item.value}" class="set mini" title="Set value to input">🟰</button>`)
                    item_el.lastElementChild.addEventListener('click', () => set_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', `<button name="${item.value}" class="add mini" title="Add input to value">➕</button>`)
                    item_el.lastElementChild.addEventListener('click', () => add_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', `<button name="${item.value}" class="remove mini" title="Remove input from value">➖</button>`)
                    item_el.lastElementChild.addEventListener('click', () => remove_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Clear input">❌</button>')
                    item_el.lastElementChild.addEventListener('click', () => clear_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<button class="mini" title="More information">❓</button>')
                    item_el.lastElementChild.addEventListener('click', () => info_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<input type="' + item.type + '" name="' + item.value + '">')
                    item_el.lastElementChild.addEventListener('input', () => text_input(tab_id, item.value))
                } break

                // Dropdown input.
                case 'dropdown': {
                    // Add tag.
                    item_el.classList.add('field')

                    // Add HTML and event listeners.
                    item_el.insertAdjacentHTML('beforeend', '<label for="' + item.value + '">' + item.display + '</label>')
                    item_el.insertAdjacentHTML('beforeend', '<button class="mini" title="More information">❓</button>')
                    item_el.lastElementChild.addEventListener('click', () => info_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', '<select name="' + item.value + '">')
                    for (const selection of item.selection_list) {
                        item_el.lastElementChild.insertAdjacentHTML('beforeend', '<option value="' + selection.value + '">' + selection.display + '</option>')
                    }
                    item_el.insertAdjacentHTML('beforeend', '</select>')
                    item_el.lastElementChild.addEventListener('input', () => select_input(tab_id, item.value))
                } break

                // True/false checkbox.
                case 'boolean': {
                    // Add tag.
                    item_el.classList.add('field')

                    // Add HTML and event listeners.
                    item_el.insertAdjacentHTML('beforeend', '<label for="' + item.value + '">' + item.display + '</label>')
                    item_el.insertAdjacentHTML('beforeend', `<button name="${item.value}" class="false mini" title="Set input to false">✖️</button>`)
                    item_el.lastElementChild.addEventListener('click', () => false_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', `<button name="${item.value}" class="true mini" title="Set input to true">✔️</button>`)
                    item_el.lastElementChild.addEventListener('click', () => true_button_click(tab_id, item.value))
                    item_el.insertAdjacentHTML('beforeend', `<button class="mini" title="More information">❓</button>`)
                    item_el.lastElementChild.addEventListener('click', () => info_button_click(tab_id, item.value))
                } break

                // Button.
                case 'action': {
                    // Add HTML and event listeners.
                    item_el.insertAdjacentHTML('beforeend', '<button class="action" title="' + item.title + '">' + item.display + '</button>')
                    item_el.lastElementChild.addEventListener('click', () => action_button_click(tab_id, item.value))
                } break

                // Field info.
                case 'info': {
                    // Add HTML.
                    item_el.insertAdjacentHTML('beforeend', '<h5 id="info-header">' + item.header + '</h5>')
                    item_el.insertAdjacentHTML('beforeend', '<p id="info-content">' + item.content + '</p>')
                } break

                // Track info.
                case 'track': {
                    // Add tag.
                    item_el.classList.add('main-info')

                    // Add HTML.
                    item_el.insertAdjacentHTML('beforeend', '<span name="' + item.value + '" class="main-name" title="' + item.title + '">' + item.display + '</span>')
                    item_el.insertAdjacentHTML('beforeend', '&nbsp;<span name="' + item.value + '" class="track-before" title="' + item.title + '">' + item.time.before + '</span>')
                    item_el.insertAdjacentHTML('beforeend', '&nbsp;/&nbsp;<span name="' + item.value + '" class="track-total" title="' + item.title + '">' + item.time.total + '</span>')
                    item_el.insertAdjacentHTML('beforeend', '&nbsp;/&nbsp;<span name="' + item.value + '" class="track-after" title="' + item.title + '">' + item.time.after + '</span>')
                } break

                // User info.
                case 'user': {
                    // Add tag.
                    item_el.classList.add('main-info')

                    // Add HTML.
                    item_el.insertAdjacentHTML('beforeend', '<span name="' + item.value + '" class="main-name">' + item.display + '</span>')
                } break
            }

            // Append item to group.
            group_el.appendChild(item_el)
        }

        // Append group to tab.
        tab_el.appendChild(group_el)
    }

    // Append tab to options box.
    document.querySelector('#options-box').appendChild(tab_el)
}



// Shows the specified tab in the options box.
function switch_options_tab(tab_id) {
    // Hide all tabs.
    const options_tab_el_list = document.querySelectorAll('.options-tab')
    for (const el of options_tab_el_list) {
        // Hide.
        el.hidden = true
    }

    // De-select all tab buttons.
    const options_tab_box_el_list = document.querySelector('#options-tab-box').children
    for (const el of options_tab_box_el_list) {
        // De-select.
        el.classList.remove('selected')
    }

    // Show the specified tab and select its tab button.
    reload_options_tab(tab_id)
    document.querySelector(`#${tab_id}`).hidden = false
    document.querySelector(`button[name="${tab_id}"]`).disabled = false
    document.querySelector(`button[name="${tab_id}"]`).classList.add('selected')
}



// Reloads the inputs for the given options box.
function reload_options_tab(tab_id=null) {
    // Check if no tab ID was provided.
    if (tab_id === null) {
        // Get current options tab.
        tab_id = document.querySelector('div.options-tab:not([hidden])').id
    }

    // Check which tab is being reloaded.
    switch (tab_id) {
        // "Add track" tab.
        case 'new-tab': {
            // Loop through the fields.
            for (const field of ['url', 'title', 'tags', 'volume', 'start-time', 'fade-in-sec', 'fade-out-sec', 'end-time']) {
                // Add value to options.
                document.querySelector(`#new-tab input[name="${field}"]`).value = ''
            }

            // Set index.
            document.querySelector(`#new-tab input[name="index"]`).value = ''
        } break

        // "Edit track" tab.
        case 'edit-tab': {
            // Loop through the fields.
            for (const field of ['url', 'title', 'tags', 'volume', 'start-time', 'fade-in-sec', 'fade-out-sec', 'end-time']) {
                // Add value to options.
                document.querySelector(`#edit-tab input[name="${field}"]`).value = (edit_key !== null ? all_songs[edit_key][field] : '')
            }

            // Set index.
            document.querySelector(`#edit-tab input[name="index"]`).value = song_key_list.indexOf(edit_key) + 1
        } break

        // "Edit results" tab.
        case 'results-tab': {
        } break

        // "Account" tab.
        case 'account-tab': {
            // Check if the user is not a guest.
            if (user_record.username !== '<guest>') {
                // Add values to options.
                document.querySelector(`#account-tab input[name="default-volume"]`).value = default_volume
                if (save_extra) {
                    document.querySelector(`#account-tab button.true[name="save-extra"]`).classList.add('selected')
                } else {
                    document.querySelector(`#account-tab button.false[name="save-extra"]`).classList.add('selected')
                }
            }
        } break

        // "Info" tab.
        case 'info-tab': {
            // No reloading needed.
        } break
    }
}



// Gets the items for the "Mix" tab.
function get_mix_items() {
    // Return the items.
    return [
        // Current song settings.
        [
            // Track info.
            {
                'item_type': 'track',
                'value': 'track-info',
                'display': '<i>No track selected</i>',
                'title': 'No track selected',
                'time': {
                    'before': '&ndash;:&ndash;&ndash;',
                    'total': '&ndash;:&ndash;&ndash;',
                    'after': '&ndash;:&ndash;&ndash;',
                },
            },

            // Reload.
            {
                'item_type': 'action',
                'value': 'reload',
                'display': 'Reload',
                'title': 'Reload this track',
            },

            // Skip.
            {
                'item_type': 'action',
                'value': 'skip',
                'display': 'Skip',
                'title': 'Skip this track',
            },

            // Edit.
            {
                'item_type': 'action',
                'value': 'edit',
                'display': 'Edit',
                'title': 'Edit this track',
            },
        ],

        // Mix settings.
        [
            // Filter mix by title.
            {
                'item_type': 'field',
                'value': 'filter-title',
                'display': 'Filter mix by title',
                'type': 'text',
            },

            // Filter mix by tags.
            {
                'item_type': 'field',
                'value': 'filter-tags',
                'display': 'Filter mix by tags',
                'type': 'text',
            },

            // Auto-play mode.
            {
                'item_type': 'dropdown',
                'value': 'play-mode',
                'display': 'Auto-play mode',
                'selection_list': [
                    {
                        'value': 'none',
                        'display': 'None',
                    },
                    {
                        'value': 'loop',
                        'display': 'Loop',
                    },
                    {
                        'value': 'auto',
                        'display': 'Next',
                    },
                    {
                        'value': 'shuffle',
                        'display': 'Shuffle',
                    },
                    {
                        'value': 'queue',
                        'display': 'Queue',
                    },
                    {
                        'value': 'shuffle-queue',
                        'display': 'Shuffle queue',
                    },
                    {
                        'value': 'queue-shuffle',
                        'display': 'Queue, then shuffle',
                    },
                    {
                        'value': 'shuffle-queue-shuffle',
                        'display': 'Shuffle queue, then shuffle',
                    },
                ],
            },

            // Empty queue.
            {
                'item_type': 'action',
                'value': 'empty-queue',
                'display': 'Empty queue',
                'title': 'Remove all tracks from the queue',
            },
        ],

        // Display settings.
        [
            // Search by title.
            {
                'item_type': 'field',
                'value': 'search-title',
                'display': 'Search by title',
                'type': 'text',
            },

            // Search by tags.
            {
                'item_type': 'field',
                'value': 'search-tags',
                'display': 'Search by tags',
                'type': 'text',
            },
        ],
    ]
}



// Gets the items for the "Add track" tab.
function get_new_items() {
    // Return the items.
    return [
        [
            // Video URL.
            {
                'item_type': 'field',
                'value': 'url',
                'display': 'Video URL',
                'type': 'text',
            },

            // Title.
            {
                'item_type': 'field',
                'value': 'title',
                'display': 'Title',
                'type': 'text',
            },

            // List index.
            {
                'item_type': 'field',
                'value': 'index',
                'display': 'List index',
                'type': 'number',
            },

            // Tags.
            {
                'item_type': 'field',
                'value': 'tags',
                'display': 'Tags',
                'type': 'text',
            },

            // Volume percentage.
            {
                'item_type': 'field',
                'value': 'volume',
                'display': 'Volume percentage',
                'type': 'number',
            },

            // Start time.
            {
                'item_type': 'field',
                'value': 'start-time',
                'display': 'Start time',
                'type': 'text',
            },

            // Fade-in seconds.
            {
                'item_type': 'field',
                'value': 'fade-in-sec',
                'display': 'Fade-in seconds',
                'type': 'number',
            },

            // Fade-out seconds.
            {
                'item_type': 'field',
                'value': 'fade-out-sec',
                'display': 'Fade-out seconds',
                'type': 'number',
            },

            // End time.
            {
                'item_type': 'field',
                'value': 'end-time',
                'display': 'End time',
                'type': 'text',
            },

            // Add.
            {
                'item_type': 'action',
                'value': 'save',
                'display': 'Add',
                'title': 'Add track to list',
            },
        ],
    ]
}



// Gets the items for the "Edit track" tab.
function get_edit_items() {
    // Return the items.
    return [
        [
            // Video URL.
            {
                'item_type': 'field',
                'value': 'url',
                'display': 'Video URL',
                'type': 'text',
            },

            // Title.
            {
                'item_type': 'field',
                'value': 'title',
                'display': 'Title',
                'type': 'text',
            },

            // List index.
            {
                'item_type': 'field',
                'value': 'index',
                'display': 'List index',
                'type': 'number',
            },

            // Tags.
            {
                'item_type': 'field',
                'value': 'tags',
                'display': 'Tags',
                'type': 'text',
            },

            // Volume percentage.
            {
                'item_type': 'field',
                'value': 'volume',
                'display': 'Volume percentage',
                'type': 'number',
            },

            // Start time.
            {
                'item_type': 'field',
                'value': 'start-time',
                'display': 'Start time',
                'type': 'text',
            },

            // Fade-in seconds.
            {
                'item_type': 'field',
                'value': 'fade-in-sec',
                'display': 'Fade-in seconds',
                'type': 'number',
            },

            // Fade-out seconds.
            {
                'item_type': 'field',
                'value': 'fade-out-sec',
                'display': 'Fade-out seconds',
                'type': 'number',
            },

            // End time.
            {
                'item_type': 'field',
                'value': 'end-time',
                'display': 'End time',
                'type': 'text',
            },

            // Play.
            {
                'item_type': 'action',
                'value': 'play',
                'display': 'Play',
                'title': 'Replace the playing track with this one',
            },

            // Queue.
            {
                'item_type': 'action',
                'value': 'queue',
                'display': 'Queue',
                'title': 'Add track to queue',
            },

            // Save.
            {
                'item_type': 'action',
                'value': 'save',
                'display': 'Save',
                'title': 'Save changes to track',
            },

            // Export.
            {
                'item_type': 'action',
                'value': 'export',
                'display': 'Export',
                'title': 'Download track as file',
            },

            // Delete.
            {
                'item_type': 'action',
                'value': 'delete',
                'display': 'Delete',
                'title': 'Permanently delete track',
            },
        ],
    ]
}



// Gets the items for the "Edit results" tab.
function get_results_items() {
    // Return the items.
    return [
        [
            // List index.
            {
                'item_type': 'modifier-field',
                'value': 'index',
                'display': 'List index',
                'type': 'number',
            },

            // Tags.
            {
                'item_type': 'modifier-field',
                'value': 'tags',
                'display': 'Tags',
                'type': 'text',
            },

            // Volume percentage.
            {
                'item_type': 'modifier-field',
                'value': 'volume',
                'display': 'Volume percentage',
                'type': 'number',
            },

            // Start seconds.
            {
                'item_type': 'modifier-field',
                'value': 'start-sec',
                'display': 'Start seconds',
                'type': 'text',
            },

            // End seconds.
            {
                'item_type': 'modifier-field',
                'value': 'end-sec',
                'display': 'End seconds',
                'type': 'text',
            },

            // Fade-in seconds.
            {
                'item_type': 'modifier-field',
                'value': 'fade-in-sec',
                'display': 'Fade-in seconds',
                'type': 'number',
            },

            // Fade-out seconds.
            {
                'item_type': 'modifier-field',
                'value': 'fade-out-sec',
                'display': 'Fade-out seconds',
                'type': 'number',
            },

            // Queue.
            {
                'item_type': 'action',
                'value': 'queue',
                'display': 'Queue',
                'title': 'Add track to queue',
            },

            // Save.
            {
                'item_type': 'action',
                'value': 'save',
                'display': 'Save',
                'title': 'Save changes to track',
            },

            // Export.
            {
                'item_type': 'action',
                'value': 'export',
                'display': 'Export',
                'title': 'Download track as file',
            },
        ],
    ]
}



// Gets the items for the "Account" tab.
function get_account_items() {
    // Return the items.
    return [
        // Account.
        [
            // User info.
            {
                'item_type': 'user',
                'value': 'username',
                'display': `Username: ${user_record.username}`,
            },

            // Log out button.
            {
                'item_type': 'action',
                'value': 'logout',
                'display': 'Log out',
                'title': 'Sign out of this account',
            },
        ],

        // User settings.
        [
            // Save extra lists.
            {
                'item_type': 'boolean',
                'value': 'save-extra',
                'display': 'Save extra lists',
            },

            // Default volume percentage.
            {
                'item_type': 'field',
                'value': 'default-volume',
                'display': 'Default volume percentage',
                'type': 'number',
            },

            // Update button.
            {
                'item_type': 'action',
                'value': 'update',
                'display': 'Update',
                'title': 'Update user settings',
            },
        ],

        // Password settings.
        [
            // Re-type current password.
            {
                'item_type': 'field',
                'value': 'current-password',
                'display': 'Re-type current password',
                'type': 'password',
            },

            // New password.
            {
                'item_type': 'field',
                'value': 'new-password',
                'display': 'New password',
                'type': 'password',
            },

            // Change button.
            {
                'item_type': 'action',
                'value': 'change',
                'display': 'Change',
                'title': 'Change password',
            },
        ],

        // Import settings.
        [
            // Track list file.
            {
                'item_type': 'file-upload',
                'value': 'import-file',
                'display': 'Track list file',
            },

            // Extra tags for imports.
            {
                'item_type': 'field',
                'value': 'import-tags',
                'display': 'Extra tags for imports',
                'type': 'text',
            },

            // Import button.
            {
                'item_type': 'action',
                'value': 'import',
                'display': 'Import',
                'title': 'Add the file\'s tracks to your list',
            },
        ],
    ]
}



// Gets the items for the "Account" tab, if the user is a guest.
function get_guest_items() {
    // Return the items.
    return [
        // Account.
        [
            // User info.
            {
                'item_type': 'user',
                'value': 'logged-out',
                'display': `<i>Currently logged out</i>`,
            },

            // Username.
            {
                'item_type': 'field',
                'value': 'username',
                'display': 'Username',
                'type': 'text',
            },

            // Password.
            {
                'item_type': 'field',
                'value': 'password',
                'display': 'Password',
                'type': 'password',
            },

            // Log in button.
            {
                'item_type': 'action',
                'value': 'login',
                'display': 'Log in',
                'title': 'Sign in to an existing account',
            },

            // Change button.
            {
                'item_type': 'action',
                'value': 'signup',
                'display': 'Sign up',
                'title': 'Create a new account',
            },
        ],
    ]
}



// Gets the items for the "Info" tab.
function get_info_items() {
    // Return the items.
    return [
        [
            // Info.
            {
                'item_type': 'info',
                'header': '',
                'content': '<i>When an info button is clicked, the information will display here.</i>',
            },
        ],
    ]
}
