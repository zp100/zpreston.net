// Sends data back to the server.
function to_server(action) {
    // Check which action to do.
    switch (action) {
        // Log in.
        case 'login': {
            // Add loading message.
            login_loading()

            // Make request JSON object.
            const request_json = {
                'username': document.querySelector('input[name="username"]').value,
                'password': document.querySelector('input[name="password"]').value,
            }

            // POST for "login".
            fetch_json_post(`${session_url}?action=login`, request_json, response_json => {
                // Do "login" callback.
                login_callback(response_json)
            })
        } break

        // Sign up.
        case 'signup': {
            // Add loading message.
            login_loading()

            // Make request JSON object.
            const request_json = {
                'username': document.querySelector('input[name="username"]').value,
                'password': document.querySelector('input[name="password"]').value,
            }

            // POST for "signup".
            fetch_json_post(`${session_url}?action=signup`, request_json, response_json => {
                // Do "login" callback.
                login_callback(response_json)
            })
        } break

        // Extra lists.
        case 'extra_lists': {
            // Check if the user is logged in, and opted to save extra lists.
            if (user_record.username !== '<guest>' && user_record.save_extra) {
                // Make request JSON object.
                const request_json = extra_lists

                // POST for "extra_lists".
                fetch_json_post(`${session_url}?action=extra_lists`, request_json)
            }
        } break

        // Log out.
        case 'logout': {
            // POST for "logout".
            fetch_json_post(`${session_url}?action=logout`, {}, response_json => {
                // Do "logout" callback.
                logout_callback(response_json)
            })
        } break

        // Update user.
        case 'update_user': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // Update the user record.
                user_record.default_volume = document.querySelector(`#account-tab input[name="default-volume"]`).value
                if (Number.isNaN(user_record.default_volume) || user_record.default_volume === '') user_record.default_volume = 100
                if (document.querySelector(`#account-tab button.true[name="save-extra"]`).classList.contains('selected')) user_record.save_extra = true
                else if (document.querySelector(`#account-tab button.false[name="save-extra"]`).classList.contains('selected')) user_record.save_extra = false

                // Make request JSON object.
                const request_json = user_record

                // POST for "update_user".
                fetch_json_post(`${user_record_url}?action=update_user`, request_json)
            }
        } break

        // Change password.
        case 'change_password': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // Make request JSON object.
                const request_json = {
                    'current_password': document.querySelector('input[name="current-password"]').value,
                    'new_password': document.querySelector('input[name="new-password"]').value,
                }
    
                // POST for "change_password".
                fetch_json_post(`${user_record_url}?action=change_password`, request_json, response_json => {
                    // Do "change_password" callback.
                    change_password_callback(response_json)
                })
            }
        } break

        // Add track.
        case 'add': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // Make request JSON object.
                const request_json = {
                    'index': document.querySelector(`#new-tab input[name="index"]`).value,
                    'title': document.querySelector(`#new-tab input[name="title"]`).value,
                    'tags': document.querySelector(`#new-tab input[name="tags"]`).value,
                    'url': document.querySelector(`#new-tab input[name="url"]`).value,
                    'volume': document.querySelector(`#new-tab input[name="volume"]`).value,
                    'start_time': document.querySelector(`#new-tab input[name="start-time"]`).value,
                    'fade_in_sec': document.querySelector(`#new-tab input[name="fade-in-sec"]`).value,
                    'fade_out_sec': document.querySelector(`#new-tab input[name="fade-out-sec"]`).value,
                    'end_time': document.querySelector(`#new-tab input[name="end-time"]`).value,
                }

                // POST for "add".
                fetch_json_post(`${tracks_url}?action=add`, request_json, response_json => {
                    // Do "track" callback.
                    track_callback(response_json)

                    // Open the new track to edit.
                    edit_key = response_json.track_id
                    switch_options_tab('edit-tab')
                })
            } else {
                // Make track from inputs, with new ID.
                const track = {
                    'track_id': crypto.randomUUID(),
                    'owner': user_record.username,
                    'index': parse_index(document.querySelector(`#new-tab input[name="index"]`).value),
                    'title': document.querySelector(`#new-tab input[name="title"]`).value,
                    'tags': document.querySelector(`#new-tab input[name="tags"]`).value,
                    'url': document.querySelector(`#new-tab input[name="url"]`).value,
                    'volume': document.querySelector(`#new-tab input[name="volume"]`).value,
                    'start_time': document.querySelector(`#new-tab input[name="start-time"]`).value,
                    'fade_in_sec': document.querySelector(`#new-tab input[name="fade-in-sec"]`).value,
                    'fade_out_sec': document.querySelector(`#new-tab input[name="fade-out-sec"]`).value,
                    'end_time': document.querySelector(`#new-tab input[name="end-time"]`).value,
                }

                // Sort the list of tracks by index.
                track_list.sort((t1, t2) => t1.index - t2.index)

                // Insert the track at its index.
                track_list.splice(track.index - 1, 0, track)

                // Update the index of every track.
                for (const i in track_list) {
                    // Set index based on its position in the list.
                    track_list[i].index = Number(i) + 1
                }

                // Reload the list.
                reload_list_tab()

                // Open the new track to edit.
                edit_key = track.track_id
                switch_options_tab('edit-tab')
            }
        } break

        // Save track.
        case 'save': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // Make request JSON object.
                const request_json = {
                    'track_id': edit_key,
                    'index': document.querySelector(`#edit-tab input[name="index"]`).value,
                    'title': document.querySelector(`#edit-tab input[name="title"]`).value,
                    'tags': document.querySelector(`#edit-tab input[name="tags"]`).value,
                    'url': document.querySelector(`#edit-tab input[name="url"]`).value,
                    'volume': document.querySelector(`#edit-tab input[name="volume"]`).value,
                    'start_time': document.querySelector(`#edit-tab input[name="start-time"]`).value,
                    'fade_in_sec': document.querySelector(`#edit-tab input[name="fade-in-sec"]`).value,
                    'fade_out_sec': document.querySelector(`#edit-tab input[name="fade-out-sec"]`).value,
                    'end_time': document.querySelector(`#edit-tab input[name="end-time"]`).value,
                }

                // POST for "save".
                fetch_json_post(`${tracks_url}?action=save`, request_json, response_json => {
                    // Do "track" callback.
                    track_callback(response_json)
                })
            } else {
                // Make track from inputs.
                const track = {
                    'track_id': edit_key,
                    'owner': user_record.username,
                    'index': parse_index(document.querySelector(`#edit-tab input[name="index"]`).value),
                    'title': document.querySelector(`#edit-tab input[name="title"]`).value,
                    'tags': document.querySelector(`#edit-tab input[name="tags"]`).value,
                    'url': document.querySelector(`#edit-tab input[name="url"]`).value,
                    'volume': document.querySelector(`#edit-tab input[name="volume"]`).value,
                    'start_time': document.querySelector(`#edit-tab input[name="start-time"]`).value,
                    'fade_in_sec': document.querySelector(`#edit-tab input[name="fade-in-sec"]`).value,
                    'fade_out_sec': document.querySelector(`#edit-tab input[name="fade-out-sec"]`).value,
                    'end_time': document.querySelector(`#edit-tab input[name="end-time"]`).value,
                }

                // Sort the list of tracks by index.
                track_list.sort((t1, t2) => t1.index - t2.index)

                // Delete the old instance of the track.
                track_list.splice(track_list.findIndex(t => t.track_id === edit_key), 1)

                // Insert the track at its index.
                track_list.splice(track.index - 1, 0, track)

                // Update the index of every track.
                for (const i in track_list) {
                    // Set index based on its position in the list.
                    track_list[i].index = Number(i) + 1
                }

                // Reload the list.
                reload_list_tab()
            }
        } break

        // Delete track.
        case 'delete': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // Make request JSON object.
                const request_json = {
                    'track_id': edit_key,
                }

                // POST for "delete".
                fetch_json_post(`${tracks_url}?action=delete`, request_json, response_json => {
                    // Do "track" callback.
                    track_callback(response_json)
                })
            } else {
                // Delete the old instance of the track.
                track_list.splice(track_list.findIndex(t => t.track_id === edit_key), 1)

                // Update the index of every track.
                for (const i in track_list) {
                    // Set index based on its position in the list.
                    track_list[i].index = i + 1
                }

                // Reload the list.
                reload_list_tab()
            }
        } break

        // Import track(s).
        case 'import': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // Get the extra tags for the tracks.
                const import_tags = document.querySelector('input[name="import-tags"]').value

                // Loop through the imported files.
                const file_list = document.querySelector('input[name="import-file"]').files
                for (const file of file_list) {
                    // Read the file as text.
                    const file_reader = new FileReader()
                    file_reader.addEventListener('load', ev => {
                        // Loop through the tracks in the text.
                        const tracks = JSON.parse(ev.target.result).tracks
                        for (const track of tracks) {
                            // Add the extra tags to the track.
                            if (import_tags !== '' && track.tags !== '') track.tags = track.tags.concat(', ')
                            track.tags = track.tags.concat(import_tags)

                            // Add a blank "index" field.
                            track.index = ''

                            // POST for "add".
                            fetch_json_post(`${tracks_url}?action=add`, track, response_json => {
                                // Do "track" callback.
                                track_callback(response_json)
                            })
                        }
                    })
                    file_reader.readAsText(file)
                }
            }
        } break

        // Unrecognized action.
        default: {
            // Error.
            console.error('Unrecognized action.')
        }
    }
}



// Sends JSON data to the server with a POST request.
function fetch_json_post(url, request_json, response_func=response_json=>{}) {
    // Create settings for the request with the data.
    const options = {
        'method': 'POST',
        'headers': {
            'Content-Type': 'application/json',
        },
        'credentials': 'include',
        'body': JSON.stringify(request_json),
    }

    // Send the request to the server as a POST, and process the response.
    fetch(url, options).then(response => {
        // Return JSON.
        return response.json()
    }).then(response_json => {
        // Check if an error occured.
        if ('error' in response_json) {
            // Log the error.
            console.error(response_json.error)
        }

        // Return JSON.
        return response_json
    }).then(response_func)
}



// Adds a loading message for login features.
function login_loading() {
    // Display the message above the "Log in" button.
    const login_message_el = document.querySelector('i[name="login-message"]')
    if (login_message_el) {
        // Update the message.
        login_message_el.innerHTML = 'Loading...'
        login_message_el.classList.remove('text-danger')
        login_message_el.classList.add('text-info')
    } else {
        // Create the message if its element doesn't exist.
        const password_el = document.querySelector('input[name="password"]')
        password_el.insertAdjacentHTML('afterend', `<i name="login-message" class="text-info">Loading...</i>`)
    }
}



// Callback function for "login" and "signup" actions.
function login_callback(response_json) {
    // Check if an error occured.
    if ('error' in response_json) {
        // Format the error.
        const error_message = `Error: ${response_json.error}`

        // Display the error above the "Log in" button.
        const login_message_el = document.querySelector('i[name="login-message"]')
        if (login_message_el) {
            // Update the error.
            login_message_el.innerHTML = error_message
            login_message_el.classList.remove('text-info')
            login_message_el.classList.add('text-danger')
        } else {
            // Create the error if its element doesn't exist.
            const password_el = document.querySelector('input[name="password"]')
            password_el.insertAdjacentHTML('afterend', `<i name="login-message" class="text-danger">${error_message}</i>`)
        }
    } else {
        // Reload the page.
        window.location.reload()
    }
}



// Callback function for "logout" action.
function logout_callback(response_json) {
    // Reload the page.
    window.location.reload()
}



// Callback function for "change_password" action.
function change_password_callback(response_json) {
    // Check if an error occured.
    if ('error' in response_json) {
        // Format the error.
        const error_message = `Error: ${response_json.error}`

        // Display the error above the "Change" button.
        const password_error_el = document.querySelector('i[name="password-error"]')
        if (password_error_el) {
            // Update the error.
            password_error_el.innerHTML = error_message
        } else {
            // Create the error if its element doesn't exist.
            const new_password_el = document.querySelector('input[name="new-password"]')
            new_password_el.insertAdjacentHTML('afterend', `<i name="password-error" class="text-danger">${error_message}</i>`)
        }
    } else {
        // Remove the error.
        const password_error_el = document.querySelector('i[name="password-error"]')
        if (password_error_el) password_error_el.remove()
    }
}



// Callback function for "add", "save", and "delete" actions.
function track_callback(response_json) {
    // Check if the track list was included.
    if ('track_list' in response_json) {
        // Update the track list.
        track_list = response_json.track_list

        // Reload the list.
        reload_list_tab()
    } else {
        // Error.
        console.error('Track list not in response JSON.')
    }
}



// Converts an index string into a valid index.
function parse_index(index_str) {
    // Get the end index.
    const end_index = track_list.length + 1

    // Check if the index is an integer.
    let index = parseInt(index_str)
    if (!Number.isNaN(index) && index === Number(index_str)) {
        // Check if it's out-of-bounds.
        if (index < 1) {
            // Clamp up to 1.
            index = 1
        } else if (index > end_index) {
            // Clamp down to end index.
            index = end_index
        }
    } else {
        // Default to end index.
        index = end_index
    }

    // Return the final index.
    return index
}
