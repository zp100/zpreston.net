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
    // Check if a song is selected.
    if (key ?? false) {
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
}



// Exports a song as a JSON file.
function do_edit_export() {
    // Get the track to export.
    const track = from_id(edit_key)

    // Convert the track to a list (with only that track).
    const tracks = [
        {
            'title': track['title'],
            'tags': track['tags'],
            'url': track['url'],
            'volume': track['volume'],
            'start_time': track['start_time'],
            'fade_in_sec': track['fade_in_sec'],
            'fade_out_sec': track['fade_out_sec'],
            'end_time': track['end_time'],
        },
    ]

    // Export the track.
    const filename = track.title
    export_songs(filename, tracks)
}



// Deletes a song.
function do_edit_delete() {
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

    // Check if the song being deleted is the one currently playing.
    if (key === edit_key) {
        // Skip to the next song.
        do_mix_skip()
    }

    // Switch back to the "Mix" tab.
    switch_options_tab('mix-tab')

    // Delete the song.
    to_server('delete')

    // Store extra lists.
    to_server('extra_lists')

    // Un-set the edit key and re-disable the edit tab.
    edit_key = undefined
    document.querySelector('button.mini[name="edit-tab"]').disabled = true
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



// Imports a list of songs.
function do_account_import() {
    // Import the tracks.
    to_server('import')
}



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
    // Check if a song is selected.
    if (key ?? false) {
        // Recent.
        add_to_recent(key)

        // Check if scrolling was specified.
        if (is_scroll) {
            // Reload the scroll.
            scroll_to_selected()
        }

        // Load the video.
        load_video()
    } else {
        // Load a fake video to get the other code to work properly.
        player.cueVideoById({'videoId': '{URL&nbsp;ERROR}'})

        // Update page title.
        document.title = `${user_record.username}'s tracks | YouTune`

        // Update track info.
        const track_name_el = document.querySelector('span.main-name[name="track-info"]')
        track_name_el.innerHTML = '<i>No track selected</i>'
        track_name_el.title = 'No track selected'

        // Replace video player with placeholder.
        document.querySelector('#video').hidden = 1
        document.querySelector('#video-placeholder').hidden = 0
    }

    // Reload the options and list.
    reload_options_tab()
    reload_list_tab()

    // Store extra lists.
    to_server('extra_lists')
}



// Exports a list of songs as a JSON file.
function export_songs(filename, tracks) {
    // Convert track list to JSON file contents.
    const contents = encodeURIComponent(
        JSON.stringify(
            {
                'tracks': tracks,
            }
        )
    )

    // Create a download link.
    const download_el = document.createElement('a')
    download_el.style.display = 'none'
    download_el.setAttribute('href', 'data:text/json;charset=utf-8,' + contents)
    download_el.setAttribute('download', filename + '.json')

    // Click the link.
    document.body.appendChild(download_el)
    download_el.click()
    document.body.removeChild(download_el)
}



// Queues a song.
function add_to_queue(value_key) {
    // Check if the song is already in the queue.
    if (extra_lists.queue_key_list.includes(value_key)) {
        // Delete the original item.
        old_ix = extra_lists.queue_key_list.indexOf(value_key)
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
