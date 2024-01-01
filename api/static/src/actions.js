// Reloads the current song.
function do_mix_reload() {
    // Reload all.
    reload_all()
}



// Skips to the next song.
function do_mix_skip() {
    // Check which play mode was selected.
    const mode = document.querySelector('select[name="play-mode"]').value
    switch (mode) {
        // Mode that doesn't select a new song.
        case 'none':
        case 'loop': {
            // Play the next song.
            load_next_song('auto')
        } break

        // General case.
        default: {
            // Play normally.
            load_next_song(mode)
        } break
    }
}



// Edits the current song.
function do_mix_edit() {
    // Check if a song is playing.
    if (key !== null) {
        // Update the edit key.
        edit_key = key

        // Open the selected song and load its values.
        switch_options_tab('edit-tab')
    }
}



// Empties the song queue.
function do_mix_empty_queue() {
    // Empty the queue.
    extra_lists.queue_key_list = []

    // Reload the list.
    reload_list_tab()

    // Store extra lists.
    to_server('extra_lists')
}



// Save the changes to the song.
function do_new_save() {
    // Add the song.
    to_server('add')

    // Open the new song to edit.
    switch_options_tab('edit-tab')

    // Reload the list.
    reload_list_tab()
}



// Plays a song.
function do_edit_play() {
    // Set the key.
    key = edit_key

    // Reload.
    reload_all()
}



// Queues a song.
function do_edit_queue() {
    // Queue.
    add_to_queue(edit_key)

    // Store extra lists.
    to_server('extra_lists')
}



// Saves the changes to the song.
function do_edit_save() {
    // Update the song.
    to_server('save')

    // Reload the list.
    reload_list_tab()
}

/*

// Exports a song as a JSON file.
function do_edit_export() {
    // Get the file name and song, and export.
    const export_track = from_id(edit_key)
    let filename = export_track.title
    const song_list = [export_track]
    export_songs(filename, song_list)
}

*/

// Deletes a song.
function do_edit_delete() {
    // Check if the song being deleted is the one currently playing.
    if (key === edit_key) {
        // Skip to the next song.
        do_mix_skip()
    }

    // Delete the song from the queue key list.
    old_ix = extra_lists.queue_key_list.indexOf(edit_key)
    if (old_ix >= 0) {
        extra_lists.queue_key_list.splice(old_ix, 1)
    }

    // Delete the song from the recent key list.
    old_ix = extra_lists.recent_key_list.indexOf(edit_key)
    while (old_ix >= 0) {
        extra_lists.recent_key_list.splice(old_ix, 1)
        old_ix = extra_lists.recent_key_list.indexOf(edit_key)
    }

    // Update the edit key to the track with the next index.
    edit_key = from_index(
        from_id(edit_key).index % track_list.length + 1
    ).track_id

    // Delete the song.
    to_server('delete')

    // Switch back to the "Mix" tab.
    switch_options_tab('mix-tab')

    // Reload the list.
    reload_list_tab()

    // Store extra lists.
    to_server('extra_lists')
}



// Logs out of the current account.
function do_account_logout() {
    // Log out.
    to_server('logout')
}



// Updates the account settings.
function do_account_update() {
    // Update the user.
    to_server('update_user')
}



// Changes the password.
function do_account_change() {
    // Attempt to change the password.
    to_server('change_password')
}

/*

// Imports a list of songs.
function do_account_import() {
    // Get the extra tags for the songs.
    const import_tags = document.querySelector('input[name="import-tags"]').value

    // Loop through the imported files.
    const file_list = document.querySelector('input[name="import-file"]').files
    for (const file of file_list) {
        // Read the file as text.
        const file_reader = new FileReader()
        file_reader.addEventListener('load', (ev) => {
            // Loop through the songs in the text.
            const song_list = JSON.parse(ev.target.result).song_list
            for (const song of song_list) {
                // Add the extra tags to the song.
                if (import_tags !== '' && song.tags !== '') song.tags = song.tags.concat(', ')
                song.tags = song.tags.concat(import_tags)

                // Add the new song.
                all_songs.push(song)

                // Add the new song's key.
                edit_key = all_songs.length - 1
                song_key_list.push(edit_key)
            }

            // Reload the list.
            reload_list_tab()

            // Update the database.
            send_to_database()
        })
        file_reader.readAsText(file)
    }
}

*/

// Logs into an existing account.
function do_account_login() {
    // Attempt to log in.
    to_server('login')
}



// Signs up with a new account.
function do_account_signup() {
    // Attempt to sign up.
    to_server('signup')
}



// Reloads the current song and the song list.
function reload_all(is_scroll=true) {
    // Recent.
    add_to_recent(key)

    // Reload the options and list.
    reload_options_tab()
    reload_list_tab()

    // Check if scrolling was specified.
    if (is_scroll) {
        // Reload the scroll.
        scroll_to_selected()
    }

    // Load the video.
    load_video()

    // Store extra lists.
    to_server('extra_lists')
}

/*

// Exports a list of songs as a JSON file.
function export_songs(filename, song_list) {
    // Convert song list to JSON file contents.
    const contents = encodeURIComponent(
        JSON.stringify(
            {
                'song_list': song_list,
            }
        )
    )

    // Create a download link.
    const download_el = document.createElement('a')
    download_el.setAttribute('href', 'data:text/json;charset=utf-8,' + contents)
    download_el.setAttribute('download', filename + '.json')
    download_el.style.display = 'none'

    // Click the link.
    document.body.appendChild(download_el)
    download_el.click()
    document.body.removeChild(download_el)
}

*/

// Queues a song.
function add_to_queue(value_key) {
    // Check if the song is already in the queue.
    if (extra_lists.queue_key_list.includes(value_key)) {
        // Delete the original item.
        let old_ix = extra_lists.queue_key_list.indexOf(value_key)
        if (old_ix >= 0) {
            extra_lists.queue_key_list.splice(old_ix, 1)
        }
    }

    // Check if the queue is not full (999 songs).
    if (extra_lists.queue_key_list.length < 999) {
        // Add the song to the end of the queue.
        extra_lists.queue_key_list.push(value_key)
    }

    // Check which play mode is selected.
    const mode = document.querySelector('select[name="play-mode"]').value
    switch (mode) {
        // Non-queue mode.
        case 'none':
        case 'loop':
        case 'auto':
        case 'shuffle': {
            // Change the play mode.
            document.querySelector('select[name="play-mode"]').value = 'queue'
        } break
    }

    // Reload the list.
    reload_list_tab()
}



// Adds a song to the recent songs.
function add_to_recent(value_key) {
    // Add the song to the beginning of the list.
    extra_lists.recent_key_list.unshift(value_key)

    // Check if the recent list is full (999 songs).
    if (extra_lists.recent_key_list.length > 999) {
        // Remove the last song.
        extra_lists.recent_key_list.pop()
    }

    // Reload the list.
    reload_list_tab()
}
