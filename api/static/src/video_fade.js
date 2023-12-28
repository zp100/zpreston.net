// Callback function for when a message is posted to this worker.
onmessage = function(ev) {
    // Check if it's for fade-in or fade-out.
    if (ev.data.type === 'fade-in') {
        // Fade-in.
        fade_in(ev.data.value)
    } else if (ev.data.type === 'fade-out') {
        // Fade-out.
        fade_out(ev.data.value)
    }
}



// Fades in the volume.
async function fade_in(fade_in_sec) {
    // Convert the fade-in time to milliseconds.
    const target_time = fade_in_sec * 1000

    // Get a starting timestamp offset.
    const start_timestamp = Date.now()

    // Repeat until the length of the fade-in has expired.
    for (let elapsed_time = 0; elapsed_time < target_time; elapsed_time = Date.now() - start_timestamp) {
        // Get the fraction of the target time that's elapsed.
        const volume_scalar = elapsed_time / target_time

        // Post message back to the main thread.
        postMessage(volume_scalar)

        // Block for a bit.
        await new Promise(r => setTimeout(r, 0))
    }

    // Post the final volume scalar.
    postMessage(1)
}



// Fades out the volume.
async function fade_out(fade_out_sec) {
    // Convert the fade-out time to milliseconds.
    const target_time = fade_out_sec * 1000

    // Get a starting timestamp offset.
    const start_timestamp = Date.now()

    // Repeat until the length of the fade-in has expired.
    for (let elapsed_time = 0; elapsed_time < target_time; elapsed_time = Date.now() - start_timestamp) {
        // Get the fraction of the target time that's elapsed.
        const volume_scalar = 1 - elapsed_time / target_time

        // Post message back to the main thread.
        postMessage(volume_scalar)

        // Block for a bit.
        await new Promise(r => setTimeout(r, 0))
    }

    // Post the final volume scalar.
    postMessage(0)
}
