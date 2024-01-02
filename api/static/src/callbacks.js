// Callback function for key pressed.
function window_keydown(ev) {
    // Check if it's the spacebar.
    if (ev.key === ' ' && ev.target === document.body) {
        // Prev the default behavior (scrolling the page).
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



// Callback function for clicking options tab selection buttons.
function options_tab_button_click(value) {
    // Switch to the selected options tab.
    switch_options_tab(value)
}



// Callback function for clicking jump buttons.
function jump_button_click(value) {
    // Check which button was clicked.
    if (value === 'jump-top') {
        // Jump to top.
        window.scrollTo({'top': 0, 'behavior': 'instant'})
    } else if (value === 'jump-selected') {
        // Jump to selected song.
        scroll_to_selected()
    } else if (value === 'jump-bottom') {
        // Jump to bottom.
        window.scrollTo({'top': document.body.scrollHeight, 'behavior': 'instant'})
    }
}



// Callback function for clicking action buttons.
function action_button_click(tab_id, value) {
    // Check which button what clicked.
    if (tab_id === 'mix-tab' && value === 'reload') {
        // Reload.
        do_mix_reload()
    } else if (tab_id === 'mix-tab' && value === 'skip') {
        // Skip.
        do_mix_skip()
    } else if (tab_id === 'mix-tab' && value === 'edit') {
        // Edit.
        do_mix_edit()
    } else if (tab_id === 'mix-tab' && value === 'empty-queue') {
        // Empty queue.
        do_mix_empty_queue()
    } else if (tab_id === 'new-tab' && value === 'save') {
        // Save.
        do_new_save()
    } else if (tab_id === 'edit-tab' && value === 'play') {
        // Edit play.
        do_edit_play()
    } else if (tab_id === 'edit-tab' && value === 'queue') {
        // Edit queue.
        do_edit_queue()
    } else if (tab_id === 'edit-tab' && value === 'save') {
        // Edit save.
        do_edit_save()
    } else if (tab_id === 'edit-tab' && value === 'export') {
        // Edit export.
        do_edit_export()
    } else if (tab_id === 'edit-tab' && value === 'delete') {
        // Edit delete.
        do_edit_delete()
    } else if (tab_id === 'account-tab' && value === 'update') {
        // Account update.
        do_account_update()
    } else if (tab_id === 'account-tab' && value === 'change') {
        // Account change password.
        do_account_change()
    } else if (tab_id === 'account-tab' && value === 'import') {
        // Account import.
        do_account_import()
    } else if (tab_id === 'account-tab' && value === 'logout') {
        // Account logout.
        do_account_logout()
    } else if (tab_id === 'account-tab' && value === 'login') {
        // Account go to login.
        do_account_login()
    } else if (tab_id === 'account-tab' && value === 'signup') {
        // Account go to login.
        do_account_signup()
    }
}



// Callback function for clicking clear buttons.
function clear_button_click(tab_id, value) {
    // Clear the value.
    document.querySelector(`#${tab_id} input[name="${value}"]`).value = ''

    // Check which input was changed.
    if (tab_id === 'mix-tab' && (value === 'filter-title' || value === 'filter-tags' || value === 'search-title' || value === 'search-tags')) {
        // Reload the list, and reload the scroll.
        reload_list_tab()
        scroll_to_selected()
    }
}



// Callback function for clicking info buttons.
function info_button_click(tab_id, value) {
    // Define headers and content for each info button.
    const info = {
        'filter-title': {
            'header': 'Filter mix by title',
            'content': `Limits the "Mix" list to only include tracks that contain the search entry in their titles. This field is not case-sensitive, but the title must contain the entire search entry. This option be combined with "Filter mix by tags" below to limit the results even more.`,
        },
        'filter-tags': {
            'header': 'Filter mix by tags',
            'content': `Limits the "Mix" list to only include tracks that have all of the listed tags, separated by <kbd>,</kbd>commas. This field is case-sensitive, and each tag must match exactly. To instead filter to tracks that have any of the listed tags, separate them with <kbd>|</kbd>vertical bars. You can use a mix of these filters by using <kbd>(</kbd><kbd>)</kbd>parentheses to group tags together. Use <kbd>~</kbd>tildes before tags to exclude tracks that have those tags. For example,
                <div style="text-align: center;"><span class="emph">(Tag A | Tag B), ~Tag C</span></div>
                will include all tracks that have either Tag A or Tag B, but don't have Tag C. If the filters are formatted improperly, they will have no effect. This option can be combined with "Filter mix by title" above to limit the results even more.`,
        },
        'play-mode': {
            'header': 'Auto-play mode',
            'content': `Determines which track to play next whenever the current one ends. The options are:
                <ul>
                    <li>None: Don't play another track.</li>
                    <li>Loop: Reload the same track and play it again.</li>
                    <li>Next: Play the next track down in the "Mix" list.</li>
                    <li>Shuffle: Play a random track.</li>
                    <li>Queue: Play the next track in the queue. Click the <span class="emph">☰</span> button to the right of a track to add it to the queue.</li>
                    <li>Shuffle queue: Play a random track in the queue.</li>
                    <li>Queue, then shuffle: Play the next track in the queue. If the queue is empty, instead play a random track.</li>
                    <li>Shuffle queue, then shuffle: Play a random track in the queue. If the queue is empty, instead play a random track.</li>
                </ul>
                The shuffle algorithm will try to avoid similar tracks for the sake of variety.`,
        },
        'search-title': {
            'header': 'Search by title',
            'content': `Switches to the "All tracks" list, and limits it to only include tracks that contain the search entry in their titles. This field is not case-sensitive, but the title must contain the entire search entry. This option be combined with "Search by tags" below to limit the results even more.`,
        },
        'search-tags': {
            'header': 'Search by tags',
            'content': `Switches to the "All tracks" list, and limits it to only include tracks that have all of the listed tags, separated by <kbd>,</kbd>commas. This field is case-sensitive, and each tag must match exactly. To instead display tracks that have any of the listed tags, separate them with <kbd>|</kbd>vertical bars. You can use a mix of these filters by using <kbd>(</kbd><kbd>)</kbd>parentheses to group tags together. Use <kbd>~</kbd>tildes before tags to exclude tracks that have those tags. For example,
                <div style="text-align: center;"><span class="emph">(Tag A | Tag B), ~Tag C</span></div>
                will show all tracks that have either Tag A or Tag B, but don't have Tag C. If the filters are formatted improperly, they will have no effect. This option can be combined with "Search by title" above to limit the results even more.`,
        },
        'url': {
            'header': 'Video URL',
            'content': `The URL of the track's YouTube video. If an invalid URL is used, the video will display the error <span class="emph">This video is unavailable</span>.`,
        },
        'title': {
            'header': 'Title',
            'content': `The title of the track. Displayed in all of the track lists and the browser tab's title.`,
        },
        'index': {
            'header': 'List index',
            'content': `The position of the track within the mix list. Change the list index to rearrange the playlist. Leave it blank to move the track to the end of the mix.`,
        },
        'tags': {
            'header': 'Tags',
            'content': `<i>Optional</i></p><p>
                A list of tags for the track, separated by <kbd>,</kbd>commas. Tags cannot contain <kbd>,</kbd>commas, <kbd>|</kbd>vertical bars, <kbd>~</kbd>tildes, or <kbd>(</kbd><kbd>)</kbd>parentheses. Tags can contain spaces, but spaces at the start or end of a tag will be ignored. If the tags are formatted improperly, they will display as <span class="emph">{TAGS&nbsp;ERROR}</span>.`,
        },
        'volume': {
            'header': 'Volume percentage',
            'content': `<i>Optional</i></p><p>
                The volume level percentage that the video will be loaded at. Can range from 1 to 100. If the volume field is left blank or it's invalid, it defaults to 50. The default volume can be changed in the "Account" tab.`,
        },
        'start-time': {
            'header': 'Start time',
            'content': `<i>Optional</i></p><p>
                The timestamp that the video will skip to when it loads. Useful for cutting out video intros. This value can be a number of seconds, MM:SS format, or HH:MM:SS format.`,
        },
        'fade-in-sec': {
            'header': 'Fade-in seconds',
            'content': `<i>Optional</i></p><p>
                The video will start at 0% volume, and will spend this many seconds to gradually increase up to the volume percentage. Useful for tracks that have abrupt beginnings to their videos. If a start time is specified, the fade-in will start at that time. May not work correctly if parts of the video are manually skipped or replayed.`,
        },
        'fade-out-sec': {
            'header': 'Fade-out seconds',
            'content': `<i>Optional</i></p><p>
                At this many seconds before the end of the video, the volume will gradually decrease down to 0% until the video ends. Useful for tracks that have abrupt endings to their videos. If an end time is specified, the fade-out will start before that time. May not work correctly if parts of the video are manually skipped or replayed.`,
        },
        'end-time': {
            'header': 'End time',
            'content': `<i>Optional</i></p><p>
                The timestamp that the video will end at. Useful for cutting out video outros. Note that if a start time is used as well, the duration of the track will be shorter than the end time. This value can be a number of seconds, MM:SS format, or HH:MM:SS format.`,
        },
        'username': {
            'header': 'Username',
            'content': `The unique name to identify this account. Used when signing in and displayed in the browser tab's title. Must be 3 to 20 characters long and can include letters, numbers, <kbd>-</kbd>dashes, and <kbd>_</kbd>underscores. Not case-sensitive, and can't be the same as any existing usernames.`,
        },
        'password': {
            'header': 'Password',
            'content': `The password used to secure this account. Used when signing in. Must be 6 to 64 characters long and can include any characters. Case-sensitive.</p><p>
                <div><span class="emph">IMPORTANT:</span> Make sure that your password is different from any existing passwords you use on other websites. If it's the same, a hacker that stole your password from this website could use it to access your accounts on other websites.</div>`,
        },
        'default-volume': {
            'header': 'Default volume percentage',
            'content': `The default volume that's used for videos, if a volume percentage isn't provided for that track.`,
        },
        'save-extra': {
            'header': 'Save extra lists',
            'content': `A toggle that determines if the "Queue" and "Recent" lists should be stored between sessions. The lists are stored by the browser, and will eventually be deleted automatically if the site isn't visited often.`,
        },
        'current-password': {
            'header': 'Re-type password',
            'content': `Enter your current password in order to change it to a new one.`,
        },
        'new-password': {
            'header': 'New password',
            'content': `A new password for this account that's used for signing in. The current password must be re-typed in the field above this one in order to change it to a new one.`,
        },
        'import-file': {
            'header': 'Track list file',
            'content': `Uploads a file ending in ".json" that was previously downloaded using the "Export" button. Adds the imported track(s) to the end of the "Mix" list.`,
        },
        'import-tags': {
            'header': 'Extra tags for imports',
            'content': `<i>Optional</i></p><p>
                A list of tags for the track(s) being imported, separated by <kbd>,</kbd>commas. Tags cannot contain <kbd>,</kbd>commas, <kbd>|</kbd>vertical bars, <kbd>~</kbd>tildes, or <kbd>(</kbd><kbd>)</kbd>parentheses. Tags can contain spaces, but spaces at the start or end of a tag will be ignored. If the tags are formatted improperly, they will display as <span class="emph">{TAGS&nbsp;ERROR}</span>.`,
        },
    }

    // Check if this info is defined.
    if (value in info) {
        // Display info.
        document.querySelector('#info-header').innerHTML = info[value].header
        document.querySelector('#info-content').innerHTML = info[value].content
    } else {
        // Default info.
        document.querySelector('#info-header').innerHTML = value
        document.querySelector('#info-content').innerHTML = '(No information for this field yet.)'
    }

    // Switch to the info tab.
    switch_options_tab('info-tab')
}



// Callback function for clicking set buttons.
function set_button_click(tab_id, value) {
    alert('set button | ' + tab_id + ' | ' + value)
}



// Callback function for clicking add buttons.
function add_button_click(tab_id, value) {
    alert('add button | ' + tab_id + ' | ' + value)
}



// Callback function for clicking remove buttons.
function remove_button_click(tab_id, value) {
    alert('remove button | ' + tab_id + ' | ' + value)
}



// Callback function for clicking set-false buttons.
function false_button_click(tab_id, value) {
    // Check which button what clicked.
    if (tab_id === 'account-tab' && value === 'save-extra') {
        // Disable save extra.
        // De-select value's buttons.
        const value_el_list = document.querySelectorAll(`#account-tab button[name="${value}"]`)
        for (const el of value_el_list) {
            // De-select.
            el.classList.remove('selected')
        }

        // Enable this one.
        document.querySelector(`#account-tab button.false[name="${value}"]`).classList.add('selected')
    }
}



// Callback function for clicking set-true buttons.
function true_button_click(tab_id, value) {
    // Check which button what clicked.
    if (tab_id === 'account-tab' && value === 'save-extra') {
        // Enable save extra.
        // De-select value's buttons.
        const value_el_list = document.querySelectorAll(`#account-tab button[name="${value}"]`)
        for (const el of value_el_list) {
            // De-select.
            el.classList.remove('selected')
        }

        // Enable this one.
        document.querySelector(`#account-tab button.true[name="${value}"]`).classList.add('selected')
    }
}



// Callback function for changing text inputs.
function text_input(tab_id, value) {
    // Check which input was changed.
    if (tab_id === 'mix-tab' && (value === 'filter-title' || value === 'filter-tags')) {
        // Reload the list.
        reload_list_tab()
    } else if (tab_id === 'mix-tab' && (value === 'search-title' || value === 'search-tags')) {
        // Check if the current tab is NOT "All tracks".
        const view_el = document.querySelector('#view-box select[name="view"]')
        if (view_el.value !== 'sorted-tab') {
            // Switch to the "All tracks" tab.
            view_el.value = 'sorted-tab'
            switch_list_tab(view_el.value)
        }

        // Reload the list.
        reload_list_tab()
    }
}



// Callback function for changing number inputs.
function number_input(tab_id, value) {
    // ...
}



// Callback function for changing the selections of dropdowns.
function select_input(tab_id, value) {
    // Check which selection was changed.
    if (value === 'view') {
        // Switch to the selected list tab.
        const list_tab_select = document.querySelector('#view-box select[name="view"]').value
        switch_list_tab(list_tab_select)
    }
}



// Callback function for clicking song buttons.
function song_button_click(tab_id, value) {
    // Update the current key.
    key = value

    // Check if the song was selected from the queue.
    if (tab_id === 'queue-tab') {
        // Remove the song from the queue.
        let old_ix = extra_lists.queue_key_list.indexOf(value)
        if (old_ix >= 0) {
            extra_lists.queue_key_list.splice(old_ix, 1)
        }
    }

    // Play the current song and reload.
    reload_all(false)
}



// Callback function for clicking queue buttons.
function queue_button_click(tab_id, value) {
    // Queue.
    add_to_queue(value)

    // Store extra lists.
    to_server('extra_lists')
}



// Callback function for clicking queue move buttons.
function queue_move_button_click(tab_id, value) {
    // Delete the original item.
    let old_ix = extra_lists.queue_key_list.indexOf(value)
    if (old_ix >= 0) {
        extra_lists.queue_key_list.splice(old_ix, 1)
    }

    // Copy the song to the top.
    extra_lists.queue_key_list.unshift(value)

    // Reload the list.
    reload_list_tab()

    // Store extra lists.
    to_server('extra_lists')
}



// Callback function for clicking queue delete buttons.
function queue_delete_button_click(tab_id, value) {
    // Delete the item.
    let old_ix = extra_lists.queue_key_list.indexOf(value)
    if (old_ix >= 0) {
        extra_lists.queue_key_list.splice(old_ix, 1)
    }

    // Reload the list.
    reload_list_tab()

    // Store extra lists.
    to_server('extra_lists')
}



// Callback function for clicking edit buttons.
function edit_button_click(tab_id, value) {
    // Update the edit key.
    edit_key = value

    // Open the selected song and load its values.
    switch_options_tab('edit-tab')
}
