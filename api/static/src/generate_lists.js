// Generates the given type of list tab.
function generate_list_tabs() {
    // Declare.
    let message_el, key_list

    // Add "Mix" tab.
    [message_el, key_list] = get_song_list_items()
    add_list_tab_html('song-list-tab', message_el, key_list);

    // Add "Queue" tab.
    [message_el, key_list] = get_queue_items()
    add_list_tab_html('queue-tab', message_el, key_list);

    // Add "All tracks" tab.
    [message_el, key_list] = get_sorted_items()
    add_list_tab_html('sorted-tab', message_el, key_list);

    // Add "Recent" tab.
    [message_el, key_list] = get_recent_items()
    add_list_tab_html('recent-tab', message_el, key_list)
}



// Generates the HTML for a tab, based on the items provided.
function add_list_tab_html(tab_id, message_el, key_list) {
    // Create tab div.
    const tab_el = document.createElement('div')
    tab_el.id = tab_id
    tab_el.classList.add('list-tab')
    tab_el.hidden = true

    // Append message to tab.
    tab_el.appendChild(message_el)
    tab_el.insertAdjacentHTML('beforeend', '<hr>')

    // Check if the key list has items.
    if (key_list.length > 0) {
        // Loop through the song keys.
        for (const k of key_list) {
            // Create song list item.
            const item_el = document.createElement('section')
            item_el.classList.add('list-item')
            item_el.setAttribute('name', k)

            // Add move button.
            item_el.insertAdjacentHTML('beforeend', '<button class="move" title="Press and drag to re-order track">⠿</button>')
            item_el.lastElementChild.addEventListener('mousedown', (ev) => move_mousedown(tab_id, k, ev))

            // Create song button.
            const song_el = document.createElement('button')
            song_el.classList.add('song-button')
            song_el.addEventListener('click', () => song_button_click(tab_id, k))

            // Check if this is the current song.
            if (k === key) {
                // Add extra class.
                song_el.classList.add('selected')
            }

            // Create song text.
            const song_text_el = document.createElement('div')
            song_text_el.classList.add('song-text')
            let index = from_id(k).index
            song_text_el.insertAdjacentHTML('beforeend', `<span class="song-index">${index}.&nbsp;&nbsp; </span>`)

            // Create song title and tags.
            const song_title_el = document.createElement('div')
            song_title_el.insertAdjacentHTML('beforeend', `${from_id(k).title}&nbsp;&nbsp; `)

            // Check if the tag list has no errors.
            const tag_list = tokenize_tags(from_id(k).tags)
            if (tag_list !== null) {
                // Add tags.
                for (const tag of tag_list) {
                    song_title_el.insertAdjacentHTML('beforeend', `<span class="tag">${tag.replaceAll(' ', '&nbsp;')}</span>&nbsp;&nbsp; `)
                }
            } else {
                // Add error message.
                song_title_el.insertAdjacentHTML('beforeend', '<span class="tag">{TAGS&nbsp;ERROR}</span>&nbsp;&nbsp; ')
            }

            // Append song title and tags to song text.
            song_text_el.appendChild(song_title_el)

            // Append song text to song button.
            song_el.appendChild(song_text_el)

            // Append song button to list item.
            item_el.appendChild(song_el)

            // Check if this is the queue list.
            const side_buttons_el = document.createElement('div')
            side_buttons_el.classList.add('side-buttons')
            if (tab_id === 'queue-tab') {
                // Add queue's buttons.
                side_buttons_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Move to top of queue">🔝</button>')
                side_buttons_el.lastElementChild.addEventListener('click', () => queue_move_button_click(tab_id, k))
                side_buttons_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Remove from queue">❌</button>')
                side_buttons_el.lastElementChild.addEventListener('click', () => queue_delete_button_click(tab_id, k))
                side_buttons_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Edit without playing video">✏️</button>')
                side_buttons_el.lastElementChild.addEventListener('click', () => edit_button_click(tab_id, k))
            } else {
                // Add normal buttons.
                side_buttons_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Add to end of queue">☰</button>')
                side_buttons_el.lastElementChild.addEventListener('click', () => queue_button_click(tab_id, k))
                side_buttons_el.insertAdjacentHTML('beforeend', '<button class="mini" title="Edit without playing video">✏️</button>')
                side_buttons_el.lastElementChild.addEventListener('click', () => edit_button_click(tab_id, k))
            }

            // Append side buttons to list item.
            item_el.appendChild(side_buttons_el)

            // Append list item to tab.
            tab_el.appendChild(item_el)
        }
    } else {
        // Create song list item.
        const item_el = document.createElement('section')
        item_el.classList.add('list-item')
        item_el.classList.add('empty')
        item_el.insertAdjacentHTML('beforeend', '<i>Tracks for this list will appear here</i>')

        // Append list item to tab.
        tab_el.appendChild(item_el)
    }

    // Append marker for the bottom of the list.
    tab_el.insertAdjacentHTML('beforeend', '<hr>')

    // Append tab to list box.
    document.querySelector('#list-box').appendChild(tab_el)
}



// Shows the specified tab in the list box.
function switch_list_tab(tab_id) {
    // Hide all tabs.
    const list_tab_el_list = document.querySelectorAll('.list-tab')
    for (const el of list_tab_el_list) {
        // Hide.
        el.hidden = true
    }

    // Show the specified tab.
    reload_list_tab(tab_id)
    scroll_to_selected()
    document.querySelector(`#${tab_id}`).hidden = false
}



// Reloads the given song list.
function reload_list_tab(tab_id=null) {
    // Declare.
    let message_el, key_list

    // Check if no tab ID was provided.
    if (tab_id === null) {
        // Get current list tab.
        tab_id = document.querySelector('#view-box select[name="view"]').value
    }

    // Check which tab is being reloaded.
    switch (tab_id) {
        // "Mix" tab.
        case 'song-list-tab': {
            [message_el, key_list] = get_song_list_items()
        } break

        // "Queue" tab.
        case 'queue-tab': {
            [message_el, key_list] = get_queue_items()
        } break

        // "All tracks" tab.
        case 'sorted-tab': {
            [message_el, key_list] = get_sorted_items()
        } break

        // "Recent" tab.
        case 'recent-tab': {
            [message_el, key_list] = get_recent_items()
        } break
    }

    // Replace the tab.
    document.querySelector(`#${tab_id}`).remove()
    add_list_tab_html(`${tab_id}`, message_el, key_list)
    document.querySelector(`#${tab_id}`).hidden = false
}



// Scrolls to the currently-playing song.
function scroll_to_selected() {
    // Check the current list tab and the selected list items.
    const tab_id = document.querySelector('#view-box select[name="view"]').value
    const selected_el_list = document.querySelectorAll('button.song-button.selected')
    if ((tab_id === 'song-list-tab' || tab_id === 'sorted-tab') && selected_el_list.length > 0) {
        // Scroll to it.
        const selected_el = selected_el_list[selected_el_list.length - 1]
        selected_el.scrollIntoView({'block': 'start', 'behavior': 'instant'})

        // Get the distance from the top of the screen (in case it can't scroll any lower).
        const scroll_gap = selected_el.getBoundingClientRect().top

        // Scroll up a little.
        window.scrollBy({'top': scroll_gap - 85, 'behavior': 'instant'})
    } else {
        // Scroll to top.
        window.scrollTo({'top': 0, 'behavior': 'instant'})
    }
}



// Gets the items for the "Mix" tab.
function get_song_list_items() {
    // Get filters for songs.
    const filter_tree = filters_syntax_tree()
    const filter_title = document.querySelector('input[name="filter-title"]').value

    // Filter the keys.
    let new_key_list = filtered_key_list(get_key_list(), filter_tree, filter_title)

    // Create mix results message element.
    const message_el = document.createElement('section')
    message_el.classList.add('list-item')
    message_el.classList.add('message')
    message_el.insertAdjacentHTML('beforeend', `Tracks in mix: <span class="emph">${new_key_list.length}</span>`)

    // Return the items.
    return [message_el, new_key_list]
}



// Gets the items for the "Queue" tab.
function get_queue_items() {
    // Create queue count message element.
    const message_el = document.createElement('section')
    message_el.classList.add('list-item')
    message_el.classList.add('message')
    message_el.insertAdjacentHTML('beforeend', `Tracks in queue: <span class="emph">${extra_lists.queue_key_list.length}</span>`)

    // Return the items.
    return [message_el, extra_lists.queue_key_list]
}



// Gets the items for the "All tracks" tab.
function get_sorted_items() {
    // Get a list of song keys, sorted by title.
    let new_key_list = get_key_list(sort=['tags', 'title'])

    // Check if search values were used.
    const search_tree = filters_syntax_tree('search-tags')
    const search_title = document.querySelector('input[name="search-title"]').value
    if ((search_tree !== null && search_tree !== '') || search_title !== '') {
        // Display search results.
        new_key_list = filtered_key_list(new_key_list, search_tree, search_title)
    }

    // Create track results message element.
    const message_el = document.createElement('section')
    message_el.classList.add('list-item')
    message_el.classList.add('message')
    message_el.insertAdjacentHTML('beforeend', `Tracks in results: <span class="emph">${new_key_list.length}</span>`)
    message_el.insertAdjacentHTML('beforeend', `<br>`)

    // Get the counts of all tags.
    const count_tag_list = load_count_tags(new_key_list)
    if (count_tag_list.length > 0) {
        // Sort the tags by count descending.
        count_tag_list.sort((count_tag1, count_tag2) => count_tag2.count - count_tag1.count)

        // Loop through the tag counts.
        message_el.insertAdjacentHTML('beforeend', 'Tags: ')
        for (const count_tag of count_tag_list) {
            // Append tag and count to message.
            const tag_el = document.createElement('span')
            tag_el.classList.add('tag')
            tag_el.insertAdjacentHTML('beforeend', count_tag.name.replaceAll(' ', '&nbsp;'))
            message_el.appendChild(tag_el)
            message_el.insertAdjacentHTML('beforeend', '&times' + count_tag.count + '&nbsp;&nbsp ')
        }
    }

    // Return the items.
    return [message_el, new_key_list]
}



// Gets the items for the "Recent" tab.
function get_recent_items() {
    // Create recent count message element.
    const message_el = document.createElement('section')
    message_el.classList.add('list-item')
    message_el.classList.add('message')
    message_el.insertAdjacentHTML('beforeend', `Tracks finished this session (including duplicates): <span class="emph">${finished_song_count}</span>`)

    // Return the items.
    return [message_el, extra_lists.recent_key_list]
}



// Create a list of all tags and their counts for the user.
function load_count_tags(key_list) {
    // Start with an empty list.
    const count_tag_list = []

    // Loop through the songs to get their tags.
    for (const k of key_list) {
        // Get the tags.
        const tag_list = tokenize_tags(from_id(k).tags)
        for (const tag of tag_list) {
            // Check if the tag is already in the count-tags list.
            old_ix = count_tag_list.findIndex(count_tag => count_tag.name === tag)
            if (old_ix >= 0) {
                // Add to the tag count.
                count_tag_list[old_ix].count++
            } else {
                // Add the tag.
                count_tag_list.push({
                    'name': tag,
                    'count': 1,
                })
            }
        }
    }

    // Return the finished list.
    return count_tag_list
}
