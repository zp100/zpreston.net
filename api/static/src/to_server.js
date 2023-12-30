// Sends data back to the server.
function to_server(action, request_json={}) {
    // Check which action to do.
    switch (action) {
        // Log in.
        case 'login': {
            // POST for "login".
            fetch_json_post(`${session_url}?action=login`, request_json, response_json => {
                // Do "login" callback.
                login_callback(response_json)
            })
        } break

        // Sign up.
        case 'signup': {
            // POST for "signup".
            fetch_json_post(`${session_url}?action=signup`, request_json, response_json => {
                // Do "login" callback.
                login_callback(response_json)
            })
        } break

        // Extra lists.
        case 'extra_lists': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // POST for "extra_lists".
                fetch_json_post(`${session_url}?action=extra_lists`, request_json)
            }
        } break

        // Log out.
        case 'logout': {
            // POST for "logout".
            fetch_json_post(`${session_url}?action=logout`, request_json, response_json => {
                // Do "logout" callback.
                logout_callback(response_json)
            })
        } break

        // Update user.
        case 'update_user': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // POST for "update_user".
                fetch_json_post(`${user_record_url}?action=update_user`, request_json)
            }
        } break

        // Change password.
        case 'change_password': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
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
                // POST for "add".
                fetch_json_post(`${tracks_url}?action=add`, request_json)
            }
        } break

        // Save track.
        case 'save': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // POST for "save".
                fetch_json_post(`${tracks_url}?action=save`, request_json)
            }
        } break

        // Delete track.
        case 'delete': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // POST for "delete".
                fetch_json_post(`${tracks_url}?action=delete`, request_json)
            }
        } break

        // Reload track list.
        case 'reload_track_list': {
            // Check if the user is logged in.
            if (user_record.username !== '<guest>') {
                // POST for "reload_track_list".
                fetch_json_post(reload_track_list_url, request_json, response_json => {
                    // Do "reload_track_list" callback.
                    reload_track_list_callback(response_json)
                })
            }
        } break
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



// Callback function for "login" and "signup" actions.
function login_callback(response_json) {
    // Check if an error occured.
    if ('error' in response_json) {
        // Format the error.
        const error_message = `Error: ${response_json.error}`

        // Display the error above the "Log in" button.
        const login_error_el = document.querySelector('i[name="login-error"]')
        if (login_error_el) {
            // Update the error.
            login_error_el.innerHTML = error_message
        } else {
            // Create the error if its element doesn't exist.
            const new_password_el = document.querySelector('input[name="password"]')
            new_password_el.insertAdjacentHTML('afterend', `<i name="login-error" class="text-danger">${error_message}</i>`)
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



// Callback function for "reload_track_list" action.
function reload_track_list_callback(response_json) {
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
