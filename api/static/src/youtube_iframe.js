// Tests for YouTube API ready.
// Thanks to Joao: https://stackoverflow.com/a/36048501
function check_yt() {
    // Check if YouTube API is loaded.
    if (YT.loaded){
        // Create video player.
        player = new YT.Player('video', {
            events: {
                'onStateChange': on_player_state_change
            }
        })

        // Add object for custom attributes.
        player.__custom__ = {}
    } else {
        // Continue looping.
        setTimeout(check_yt, 100)
    }
}
setTimeout(check_yt, 100)



// Callback function to detect when the video ends.
function on_player_state_change(ev) {
    // Check if the state is end of video.
    if (ev.data === 0) {
        // Bugfix: Ignore if triggered at the start of the next video.
        if (player.getCurrentTime() > 0) {
            ended_video()
        }
    }

    // Check if the state is video cued.
    if (ev.data === 5) {
        cued_video()
    }

    // Check if the video started playing.
    if (ev.data === 1 && player.__custom__.play_loop < 2) {
        started_video()
    }
}



// Runs when a video ends.
function ended_video() {
    // Allow first-play actions to be redone.
    player.__custom__.play_loop = 1
    player.__custom__.current_sec = -1

    // Add to the count of songs finished.
    finished_song_count++

    // Reload the list.
    reload_list_tab()

    // Check if a play mode was selected.
    const mode = document.querySelector('select[name="play-mode"]').value
    if (mode !== 'none') {
        // Load the next song.
        load_next_song(mode)
    }
}



// Runs when a video is cued.
function cued_video() {
    // Check if fade-in or a valid volume percent was provided.
    const fade_in_sec = Number(all_songs[key]['fade-in-sec'])
    const volume = Number(all_songs[key]['volume'])
    if (!Number.isNaN(fade_in_sec) && fade_in_sec > 0) {
        // Set volume to 0 to start fade-in.
        player.setVolume(0)
    } else if (!Number.isNaN(volume) && volume > 0 && volume <= 100) {
        // Set volume to value.
        player.setVolume(volume)
    } else {
        // Set volume to default.
        player.setVolume(default_volume)
    }

    // Play the video.
    player.playVideo()
    player.__custom__.play_loop = 0
}



// Runs when a video starts playing.
function started_video() {
    // Clear existing intervals for the video.
    clearInterval(player.__custom__.update_time)
    clearInterval(player.__custom__.test_fade_out)
    if (window.video_fade_worker) window.video_fade_worker.terminate()
    player.unMute()

    // Check if valid start time was provided, and this isn't the first time the video was started.
    const start_sec = parse_time(all_songs[key]['start-time'])
    if (!Number.isNaN(start_sec) && player.__custom__.play_loop > 0) {
        // Skip to the start time.
        player.seekTo(start_sec, true)
    }

    // Disallow first-play actions to be redone.
    player.__custom__.play_loop = 2

    // Start interval for updating timers.
    player.__custom__.update_time = setInterval(() => {
        // Check if the video time changed.
        const current_sec = Math.floor(player.getCurrentTime())
        if (current_sec != player.__custom__.current_sec) {
            // Update the track info timers.
            const start_sec = parse_time(all_songs[key]['start-time'])
            const end_sec = parse_time(all_songs[key]['end-time'])
            const duration_sec = Math.floor(player.getDuration() + 0.9)
            document.querySelector('span.track-before[name="track-info"]').innerHTML = format_time('before', start_sec, current_sec, end_sec, duration_sec)
            document.querySelector('span.track-total[name="track-info"]').innerHTML = format_time('total', start_sec, current_sec, end_sec, duration_sec)
            document.querySelector('span.track-after[name="track-info"]').innerHTML = format_time('after', start_sec, current_sec, end_sec, duration_sec)
            player.__custom__.current_sec = current_sec
        }
    }, 100)

    // Check if valid fade-in was provided.
    const fade_in_sec = Number(all_songs[key]['fade-in-sec'])
    if (!Number.isNaN(fade_in_sec) && fade_in_sec > 0 && window.Worker) {
        // Get the song's intended volume.
        player.setVolume(0)
        let target_volume = Number(all_songs[key]['volume'])
        if (!(!Number.isNaN(target_volume) && target_volume > 0 && target_volume <= 100)) {
            // If it's invalid, get the default.
            target_volume = default_volume
        }

        // Set the worker to update the fade-in volume.
        window.video_fade_worker = new Worker(video_fade_url)
        window.video_fade_worker.postMessage({
            'type': 'fade-in',
            'value': fade_in_sec,
        })
        window.video_fade_worker.onmessage = function(ev) {
            // Get the volume scalar from the message.
            const volume_scalar = ev.data

            // Update the volume.
            player.setVolume(target_volume * volume_scalar)
        }
    }

    // Check if valid end time was provided, and valid fade-out was provided.
    const end_sec = parse_time(all_songs[key]['end-time'])
    const fade_out_sec = Number(all_songs[key]['fade-out-sec'])
    if (!Number.isNaN(end_sec) && !Number.isNaN(fade_out_sec) && fade_out_sec > 0 && window.Worker) {
        // Create an interval to check the video's time.
        player.__custom__.test_fade_out = setInterval(() => {
            // Check if the current time is when the fade-out should start.
            if (player.getCurrentTime() >= end_sec - fade_out_sec) {
                // Get the video's current volume.
                let base_volume = player.getVolume()

                // Set the worker to update the fade-in volume.
                window.video_fade_worker = new Worker(video_fade_url)
                window.video_fade_worker.postMessage({
                    'type': 'fade-out',
                    'value': fade_out_sec,
                })
                window.video_fade_worker.onmessage = function(ev) {
                    // Get the volume scalar from the message.
                    const volume_scalar = ev.data

                    // Update the volume.
                    player.setVolume(base_volume * volume_scalar)
                }

                // Delete this interval.
                clearInterval(player.__custom__.test_fade_out)
            }
        }, 0)
    }
}



// Uses the video time information to calculate the elapsed or remaining time for the track.
function format_time(mode, start_sec, current_sec, end_sec, duration_sec) {
    // Convert start and end seconds if needed.
    if (Number.isNaN(start_sec)) start_sec = 0
    if (Number.isNaN(end_sec)) end_sec = duration_sec

    // Check which mode was selected.
    let time_sec
    switch (mode) {
        // Elapsed.
        case 'before': {
            time_sec = current_sec - start_sec
        } break

        // Duration.
        case 'total': {
            time_sec = end_sec - start_sec
        } break

        // Remaining.
        case 'after': {
            time_sec = end_sec - current_sec
        } break
    }

    // Check if an error occured.
    if (current_sec < start_sec || current_sec > end_sec || Number.isNaN(time_sec)) {
        // Return undefined time.
        return '&ndash;:&ndash;&ndash;'
    }

    // Convert to minutes and seconds.
    const minutes = Math.floor(time_sec / 60)
    const seconds = Math.floor(time_sec) % 60

    // Convert to string.
    if (seconds < 10) {
        // Force seconds to be 2 digits, and return time.
        return `${minutes}:0${seconds}`
    } else {
        // Return time.
        return `${minutes}:${seconds}`
    }
}



// Chooses a random song from the given song list.
function random_song(key_list, bias=10) {
    // Check if the key list is empty.
    if (key_list.length <= 0) {
        // No valid songs.
        return null
    }

    // Filter out duplicates from recent key list.
    const recent_set = [...new Set(recent_key_list)]

    // Loop through the recent key list to pick out songs that shouldn't be replayed.
    // The keys will be sorted by how recently the songs were played.
    const mix_recent_sorted = []
    for (const k of recent_set) {
        // Check if it's in the key list.
        if (key_list.includes(k)) {
            // Add it to the list.
            mix_recent_sorted.push(k)
        }
    }

    // Loop through the key list to get songs that weren't played recently.
    const mix_not_recent = []
    for (const k of key_list) {
        // Check if it's NOT in the recent sorted list.
        if (!recent_set.includes(k)) {
            // Add it to the list.
            mix_not_recent.push(k)
        }
    }

    // Check if there are any songs in the key list that weren't played recently.
    let new_key = null
    if (mix_not_recent.length > 0) {
        // Choose a random song from that list.
        new_key = mix_not_recent[
            Math.floor(
                Math.random() * mix_not_recent.length
            )
        ]
    } else if (mix_recent_sorted.length > 0) {
        // Choose a random song from the recent songs that also fit the key list.
        // Inversely weighted based on how recently it was played, with the most-recent songs being virtually impossible to be chosen.
        // Strength of the weightedness determined by the "bias" variable.
        new_key = mix_recent_sorted[
            Math.floor(
                Math.random()**(1.0 / bias) * mix_recent_sorted.length
            )
        ]
    }

    // Return the key of the new song.
    return new_key
}
