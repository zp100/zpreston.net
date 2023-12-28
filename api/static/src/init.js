// Global variables.
'use strict'
let username
let all_songs
let song_key_list
let queue_key_list
let recent_key_list
let default_volume
let save_extra
let logout_url
let database_url
let extra_lists_url
let password_url
let login_url
let video_fade_url
let key
let edit_key
let finished_song_count = 0
let player



// Initialize values.
function init(u, ud, lourl, durl, elurl, purl, liurl, vfurl) {
    // Grab data.
    username = u
    all_songs = ud['all_songs']
    song_key_list = ud['song_key_list']
    default_volume = ud['default_volume']
    save_extra = ud['save_extra']
    logout_url = lourl
    database_url = durl
    extra_lists_url = elurl
    password_url = purl
    login_url = liurl
    video_fade_url = vfurl

    // Copy extra lists if they're stored.
    queue_key_list = ud['queue_key_list'] ?? []
    recent_key_list = ud['recent_key_list'] ?? []

    // Load the video setup.
    window.addEventListener('keydown', window_keydown)
    add_view_selection_callbacks()

    // Load the options tabs.
    add_options_tab_callbacks()
    generate_options_tabs()
    if (username === '<guest>') switch_options_tab('account-tab')
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
