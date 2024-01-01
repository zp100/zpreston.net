// Gets the track at the given index.
function from_index(index) {
    // Return the track with the given index.
    const track = track_list.find(item => item.index === index)
    return track
}



// Gets the track with the given track ID.
function from_id(track_id) {
    // Return the track with the given ID.
    const track = track_list.find(item => item.track_id === track_id)
    return track
}



// Gets the full list of track IDs.
function get_key_list() {
    // Return the list of IDs.
    const key_list = track_list.map(track => track.track_id)
    return key_list
}



// Loads the next song based on the play mode.
function load_next_song(mode) {
    // Get the filtered list of songs.
    const filter_tree = filters_syntax_tree()
    const filter_title = document.querySelector('input[name="filter-title"]').value
    let new_key_list = filtered_key_list(get_key_list(), filter_tree, filter_title)

    // Check if an autoplay mode was selected.
    switch (mode) {
        // Loop.
        case 'loop': {
            // Reload the video.
            load_video()
        } break

        // Next.
        case 'auto': {
            // Go to the next video.
            let index = new_key_list.indexOf(key)
            index = (index + 1) % new_key_list.length
            key = new_key_list[index]
            reload_all()
        } break

        // Shuffle.
        case 'shuffle': {
            // Choose a random song.
            const new_key = random_song(new_key_list)
            if (new_key !== null) {
                // Select the new song.
                key = new_key
                reload_all()
            }
        } break

        // Queue.
        case 'queue': {
            // Check if the queue has songs.
            if (queue_key_list.length > 0) {
                // Play the next song in the queue.
                key = queue_key_list.shift()
                to_server('extra_lists')
                reload_all()
            }
        } break

        // Shuffle queue.
        case 'shuffle-queue': {
            // Check if the queue has songs.
            if (queue_key_list.length > 0) {
                // Choose a random song from the queue.
                const new_key = random_song(queue_key_list)
                if (new_key !== null) {
                    // Play the new song.
                    let index = queue_key_list.indexOf(new_key)
                    queue_key_list.splice(index, 1)
                    key = new_key
                    to_server('extra_lists')
                    reload_all()
                }
            }
        } break

        // Queue, then shuffle.
        case 'queue-shuffle': {
            // Check if the queue has songs.
            if (queue_key_list.length > 0) {
                // Play the next song in the queue.
                key = queue_key_list.shift()
                to_server('extra_lists')
                reload_all()
            } else {
                // Choose a random song.
                const new_key = random_song(new_key_list)
                if (new_key !== null) {
                    // Play the new song.
                    key = new_key
                    reload_all()
                }
            }
        } break

        // Shuffle queue, then shuffle.
        case 'shuffle-queue-shuffle': {
            // Check if the queue has songs.
            if (queue_key_list.length > 0) {
                // Choose a random song from the queue.
                const new_key = random_song(queue_key_list)
                if (new_key !== null) {
                    // Play the new song.
                    let index = queue_key_list.indexOf(new_key)
                    queue_key_list.splice(index, 1)
                    key = new_key
                    to_server('extra_lists')
                    reload_all()
                }
            } else {
                // Choose a random song.
                const new_key = random_song(new_key_list)
                if (new_key !== null) {
                    // Play the new song.
                    key = new_key
                    reload_all()
                }
            }
        } break
    }
}



// Loads the video for the current key.
function load_video() {
    // Skip if no song is selected.
    if (key === null) {
        return
    }

    // Get the video ID and store it in an object.
    const load_obj = {
        'videoId': parse_video_id(from_id(key).url),
    }

    // Check if valid start time was provided.
    const start_sec = parse_time(from_id(key).start_time)
    if (!Number.isNaN(start_sec)) {
        // Add start time to the object.
        load_obj.startSeconds = start_sec
    }

    // Check if valid end time was provided.
    const end_sec = parse_time(from_id(key).end_time)
    if (!Number.isNaN(end_sec)) {
        // Add end time to the object.
        load_obj.endSeconds = end_sec
    }

    // Load and cue the video using the created object.
    player.cueVideoById(load_obj)

    // Update page title.
    document.title = `${from_id(key).title} | ${user_record.username}'s tracks | YouTune`

    // Update track info.
    const track_name_el = document.querySelector('span.main-name[name="track-info"]')
    track_name_el.innerHTML = from_id(key).title
    track_name_el.title = `${from_id(key).title} (${from_id(key).tags})`

    // Replace placeholder with video player.
    document.querySelector('#video').hidden = 0
    document.querySelector('#video-placeholder').hidden = 1
}



// Parses a video ID string into an ID.
function parse_video_id(video_id_string) {
    // Split up the video ID string using the URL separator(s).
    const split_list = video_id_string.split('/')

    // Get the last part of the URL and remove the "watch?v=" if needed.
    const page = split_list.pop().replace('watch?v=', '')

    // Split up the page string using the parameter separator.
    const page_split_list = page.split('?')

    // Remove the parameters.
    const pre_video_id = page_split_list[0]

    // Split up the video ID using the new parameter separator.
    const video_id_split_list = pre_video_id.split('&')

    // Remove the parameters.
    const video_id = video_id_split_list[0]

    // Return the result.
    return video_id
}



// Parses a time string into a number of seconds.
function parse_time(time_string) {
    // Stop if the time string is empty.
    if (time_string === '') {
        return NaN
    }

    // Split up the time string using the colon separator(s).
    const split_list = time_string.split(':')

    // Check how many parts were provided.
    let seconds = 0
    switch (split_list.length) {
        // Add hours, minutes, and/or seconds depending on the parts.
        case 3: seconds += Number(split_list[split_list.length - 3]) * 3600
        case 2: seconds += Number(split_list[split_list.length - 2]) * 60
        case 1: seconds += Number(split_list[split_list.length - 1])
        break

        // Error.
        default: return NaN
    }

    // Return the result (will return NaN if a part was invalid).
    return seconds
}



// Creates a list of keys that only includes songs matching the search/filters.
function filtered_key_list(key_list, filter_tree, search) {
    // Declare variables.
    let new_key_list = []

    // Loop through the songs to create HTML for the div to display the song list.
    for (const k of key_list) {
        // Get the tag list.
        const tag_list = tokenize_tags(from_id(k).tags)

        // Check if this song matches the filters.
        if (
          (filter_tree === null || filter_tree === '' || (tag_list !== null && is_tag_list_match_filters(tag_list, filter_tree)))
          && (search === '' || from_id(k).title.toLowerCase().includes(search.toLowerCase()))
        ) {
            // Add its key to the new key list.
            new_key_list.push(k)
        }
    }

    // Return the new key list.
    return new_key_list
}



// Creates a syntax tree based on the specified filters.
function filters_syntax_tree(input_name='filter-tags') {
    // Get the filters.
    const filters = document.querySelector(`input[name="${input_name}"]`).value
    if (filters === '') {
        // No filters.
        return ''
    }

    // Convert the filters into tokens.
    const token_list = tokenize_filters(filters)
    if (token_list === null) {
        // Syntax error.
        return null
    }

    // Convert the tokens into a syntax tree.
    const filter_tree = parse_token_list(token_list)

    // Return the syntax tree.
    return filter_tree
}



// Tests if a song's tags match the current filters.
function is_tag_list_match_filters(tag_list, filter_tree) {
    // Check if it's a single tag.
    if (typeof filter_tree === 'string') {
        // Return true if the tag is in the song's tag list.
        return tag_list.includes(filter_tree)
    }

    // Check which operator is used.
    switch (filter_tree.op) {
        // Test if the left or right node matches.
        case 'or': return is_tag_list_match_filters(tag_list, filter_tree.left)
            || is_tag_list_match_filters(tag_list, filter_tree.right)

        // Test if the left and right node match.
        case 'and': return is_tag_list_match_filters(tag_list, filter_tree.left)
            && is_tag_list_match_filters(tag_list, filter_tree.right)

        // Test if the node doesn't match.
        case 'not': return !is_tag_list_match_filters(tag_list, filter_tree.unary)
    }
}
