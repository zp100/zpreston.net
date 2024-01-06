// Global variables.
'use strict'
let user_record
let track_list
let extra_lists
let session_url
let user_record_url
let tracks_url
let video_fade_url
let key
let edit_key
let drag_key
let drag_top
let finished_song_count = 0
let player



// Initialize values.
function init(ur, tl, el, su, uru, tu, vfu) {
    // Grab data.
    user_record = ur
    track_list = tl
    extra_lists = el
    session_url = su
    user_record_url = uru
    tracks_url = tu
    video_fade_url = vfu

    // Load the video setup.
    window.addEventListener('keydown', window_keydown)
    window.addEventListener('mousemove', window_mousemove)
    window.addEventListener('mouseup', window_mouseup)
    document.querySelector('#options-box').addEventListener('keydown', options_keydown)
    add_view_selection_callbacks()

    // Load the options tabs.
    add_options_tab_callbacks()
    generate_options_tabs()
    if (user_record.username === '<guest>') switch_options_tab('account-tab')
    else switch_options_tab('mix-tab')

    // Load the list tabs.
    add_jump_callbacks()
    generate_list_tabs()
    switch_list_tab('song-list-tab')
}



// Adds callbacks for view selection.
function add_view_selection_callbacks() {
    // Add callbacks.
    const view_box_el_list = document.querySelector('#view-box').children
    view_box_el_list[view_box_el_list.length - 1].addEventListener('input', () => select_input(null, 'view'))
}



// Adds callbacks for options tab selection buttons.
function add_options_tab_callbacks() {
    // Loop through the options tab buttons.
    const options_tab_button_el_list = document.querySelector('#options-tab-box').children
    for (const el of options_tab_button_el_list) {
        // Add callback.
        el.addEventListener('click', () => options_tab_button_click(el.name))
    }
}



// Adds callbacks for jump buttons.
function add_jump_callbacks() {
    // Loop through the jump buttons.
    const jump_button_el_list = document.querySelector('#jump-box').children
    for (const el of jump_button_el_list) {
        // Add callback.
        el.addEventListener('click', () => jump_button_click(el.name))
    }
}



// Callback function for key pressed.
function window_keydown(ev) {
    // Check if it's the spacebar.
    if (ev.key === ' ' && ev.target === document.body) {
        // Prevent the default behavior.
        ev.preventDefault()

        // Check which state the video is in.
        if (player.getPlayerState() === 1) {
            // Pause the video.
            player.pauseVideo()
        } else if (player.getPlayerState() === 2) {
            // Play the video.
            player.playVideo()
        }
    }
}



// Callback function for moving the mouse on drag buttons.
function window_mousemove(ev) {
    // Skip if no drag button is active.
    if (!drag_key) return

    // Get the dragged list item.
    const tab_id = document.querySelector('div.list-tab:not([hidden])').id
    const drag_el = document.querySelector(`#${tab_id} section.list-item[name="${drag_key}"]`)

    // Move the list item.
    drag_top += ev.movementY
    drag_el.style.top = `${drag_top}px`
}



// Callback function for ending a click on drag buttons.
function window_mouseup(ev) {
    // Skip if no drag button is active.
    if (!drag_key) return

    // Get the dragged list item.
    const tab_id = document.querySelector('div.list-tab:not([hidden])').id
    const drag_el = document.querySelector(`#${tab_id} section.list-item[name="${drag_key}"]`)

    // Find the list item that's closest to the dragged one, and set all of them to not moving.
    let closest_el
    let closest_distance = Infinity
    document.querySelectorAll(`#${tab_id} section.list-item`).forEach(el => {
        // Check if it's not a message item.
        if (!el.classList.contains('message')) {
            // Check if it's closest to the dragged item.
            const distance = Math.abs(el.getBoundingClientRect().top - drag_el.getBoundingClientRect().top)
            if (el !== drag_el && distance < closest_distance) {
                // Update closest.
                closest_el = el
                closest_distance = distance
            }
        }

        // Remove class.
        el.classList.remove('moving')
    })

    // Check if a position to move to was found.
    if (closest_el && closest_distance < Math.abs(drag_top)) {
        // Check which list was changed.
        if (tab_id === 'song-list-tab') {
            // Make request JSON object, and set its index to that of the closest item.
            const request_json = track_list.find(t => t.track_id === drag_key)
            request_json.index = track_list.find(t => t.track_id === closest_el.getAttribute('name')).index

            // POST for "save".
            fetch_json_post(`${tracks_url}?action=save`, request_json, response_json => {
                // Do "track" callback.
                track_callback(response_json)
            })
        } else if (tab_id === 'queue-tab') {
            // Find the position of the new item.
            new_ix = extra_lists.queue_key_list.indexOf(closest_el.getAttribute('name'))

            // Delete the original item.
            old_ix = extra_lists.queue_key_list.indexOf(drag_key)
            if (old_ix >= 0) {
                extra_lists.queue_key_list.splice(old_ix, 1)
            }

            // Insert the key in the list.
            if (new_ix >= 0) {
                extra_lists.queue_key_list.splice(new_ix, 0, drag_key)
            }

            // Reload the list.
            reload_list_tab()

            // Store extra lists.
            to_server('extra_lists')
        }
    } else {
        // Reload the list.
        reload_list_tab()
    }

    // Un-set the current drag button.
    drag_key = undefined
}
