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
    queue_key_list = []

    // Reload the list.
    reload_list_tab()

    // Store extra lists.
    send_to_extra_lists()
}



// Save the changes to the song.
function do_new_save() {
    // Get the entered values.
    const song = {}
    for (const field of ['url', 'title', 'tags', 'volume', 'start-time', 'fade-in-sec', 'fade-out-sec', 'end-time']) {
        // Get the "Add track" tab input for each save field.
        song[field] = document.querySelector(`#new-tab input[name="${field}"]`).value
    }

    // Add the new song.
    all_songs.push(song)

    // Add the new song's key.
    edit_key = all_songs.length - 1
    const new_index = Number(document.querySelector('#new-tab input[name="index"]').value) - 1
    if (!Number.isNaN(new_index) && new_index > 0) {
        // Add at the provided index.
        song_key_list.splice(new_index, 0, edit_key)
    } else {
        // Add to the end of the list.
        song_key_list.push(edit_key)
    }

    // Open the new song to edit.
    switch_options_tab('edit-tab')

    // Reload the list.
    reload_list_tab()

    // Update the database.
    send_to_database()
}



// Plays a song.
function do_edit_play() {
    // Set the key.
    key = edit_key

    // Reload.
    reload_all()
}



// Queues a song
function do_edit_queue() {
    // Queue.
    add_to_queue(edit_key)

    // Store extra lists.
    send_to_extra_lists()
}



// Save the changes to the song.
function do_edit_save() {
    // Get the entered values.
    const song = {}
    for (const field of ['url', 'title', 'tags', 'volume', 'start-time', 'end-time', 'fade-in-sec', 'fade-out-sec']) {
        // Get the "Edit track" tab input for each save field.
        song[field] = document.querySelector(`#edit-tab input[name="${field}"]`).value
    }

    // Update the song.
    const new_index = Number(document.querySelector('#edit-tab input[name="index"]').value) - 1
    const new_key = update_song(edit_key, song, new_index)

    // Check if the song being edited is the currently-playing song.
    if (edit_key === key) {
        // Update the key as well.
        key = new_key
    }

    // Update the edit key.
    edit_key = new_key

    // Reload the list.
    reload_list_tab()
}



// Exports a song as a JSON file.
function do_edit_export() {
    // Get the file name and song, and export.
    let filename = all_songs[edit_key].title
    const song_list = [all_songs[edit_key]]
    export_songs(filename, song_list)
}



// Deletes a song.
function do_edit_delete() {
    // Delete the song.
    do_delete(edit_key)

    // Switch back to the "Mix" tab.
    switch_options_tab('mix-tab')

    // Reload the list.
    reload_list_tab()

    // Update the database, and store extra lists.
    send_to_extra_lists()
    send_to_database()
}



// Logs out of the current account.
function do_account_logout() {
    // Redirect to logout page.
    window.location.href = logout_url
}



// Updates the account settings.
function do_account_update() {
    // Update values using option fields.
    default_volume = document.querySelector(`#account-tab input[name="default-volume"]`).value
    if (Number.isNaN(default_volume) || default_volume === '') default_volume = 100
    if (document.querySelector(`#account-tab button.true[name="save-extra"]`).classList.contains('selected')) {
        save_extra = true
    } else if (document.querySelector(`#account-tab button.false[name="save-extra"]`).classList.contains('selected')) {
        save_extra = false
    }

    // Update the database.
    send_to_database()
}



// Changes the password.
function do_account_change() {
    // Get the old and new passwords.
    const password = document.querySelector('input[name="password"]').value
    const new_password = document.querySelector('input[name="new-password"]').value

    // Change the password.
    send_to_password(password, new_password)
}



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



// Logs into an existing account.
function do_account_login() {
    // Get the username and password.
    const try_username = document.querySelector('input[name="username"]').value
    const try_password = document.querySelector('input[name="password"]').value

    // Attempt to log in.
    send_to_login('login', try_username, try_password)
}



// Signs up with a new account.
function do_account_signup() {
    // Get the username and password.
    const try_username = document.querySelector('input[name="username"]').value
    const try_password = document.querySelector('input[name="password"]').value

    // Attempt to sign up.
    send_to_login('signup', try_username, try_password)
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
    send_to_extra_lists()
}



// Updates a song in the song list.
function update_song(value_key, song, new_index) {
    // Add the new entry to the list of songs.
    all_songs.push(song)

    // Get the song's new key.
    const new_key = all_songs.length - 1

    // Delete the song from the list.
    let old_index = song_key_list.indexOf(value_key)
    if (old_index >= 0) {
        song_key_list.splice(old_index, 1)
    }

    // Re-insert the song in the list at the given index.
    song_key_list.splice(new_index, 0, new_key)

    // Update the song in the queue key list.
    old_index = queue_key_list.indexOf(value_key)
    if (old_index >= 0) {
        queue_key_list.splice(old_index, 1, new_key)
    }

    // Update the song in the recent key list.
    old_index = recent_key_list.indexOf(value_key)
    while (old_index >= 0) {
        recent_key_list.splice(old_index, 1, new_key)
        old_index = recent_key_list.indexOf(value_key)
    }

    // Update the database, and store extra lists.
    send_to_extra_lists()
    send_to_database()

    // Return the song's new key.
    return new_key
}



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



// Deletes a song in the song list.
function delete_song(value_key) {
    // Delete the song from the list.
    let old_index = song_key_list.indexOf(value_key)
    if (old_index >= 0) {
        song_key_list.splice(old_index, 1)
    }

    // Delete the song from the queue key list.
    old_index = queue_key_list.indexOf(value_key)
    if (old_index >= 0) {
        queue_key_list.splice(old_index, 1)
    }

    // Delete the song from the recent key list.
    old_index = recent_key_list.indexOf(value_key)
    while (old_index >= 0) {
        recent_key_list.splice(old_index, 1)
        old_index = recent_key_list.indexOf(value_key)
    }
}



// Queues a song.
function add_to_queue(value_key) {
    // Check if the song is already in the queue.
    if (queue_key_list.includes(value_key)) {
        // Delete the original item.
        let old_index = queue_key_list.indexOf(value_key)
        if (old_index >= 0) {
            queue_key_list.splice(old_index, 1)
        }
    }

    // Check if the queue is not full (999 songs).
    if (queue_key_list.length < 999) {
        // Add the song to the end of the queue.
        queue_key_list.push(value_key)
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
    recent_key_list.unshift(value_key)

    // Check if the recent list is full (999 songs).
    if (recent_key_list.length > 999) {
        // Remove the last song.
        recent_key_list.pop()
    }

    // Reload the list.
    reload_list_tab()
}
