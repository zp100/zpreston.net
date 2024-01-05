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
