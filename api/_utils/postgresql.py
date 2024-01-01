# Import packages.
import bcrypt
import psycopg2

# Import modules.
from api._utils import pg_errors
from api._utils import pg_utils



# Creates a user in the "users" table.
@pg_utils.transaction
def create_user(cur, username, password):
    # Salt and hash the password, converting it to binary.
    hash_password = bcrypt.hashpw(
        bytes(password, 'utf-8'),
        bcrypt.gensalt(),
    )

    # Test for duplicate username.
    try:
        # Add the user to the "users" table.
        cur.execute("""
            insert
            into users(username, hash_password, default_volume, save_extra)
            values(%s, %s, 50, true);
        """, [
            username,
            hash_password,
        ])
    except psycopg2.errors.UniqueViolation as exc:
        # Error.
        raise pg_errors.DupUserError(f"a user with the username \"{username}\" already exists")



# Read a user's settings from the "users" table.
@pg_utils.transaction
def read_user(cur, username):
    # Fetch and validate the user's data.
    record = pg_utils.fetch_user(cur, username)

    # Extract and return the relevant fields.
    return {
        'username': record[0],
        'default_volume': record[2],
        'save_extra': record[3],
    }



# Update a user's settings in the "users" table.
@pg_utils.transaction
def update_user(cur, username, record):
    # Validate the user's data.
    pg_utils.fetch_user(cur, username)

    # Query and modify the user's record.
    cur.execute("""
        update users
        set default_volume = %s, save_extra = %s
        where lower(username) = lower(%s);
    """, [
        record['default_volume'],
        record['save_extra'],
        username,
    ])



# Delete a user.
@pg_utils.transaction
def delete_user(cur, username):
    # Validate the user's data.
    pg_utils.fetch_user(cur, username)

    # Delete the user's record.
    cur.execute("""
        delete
        from users
        where lower(username) = lower(%s);
    """, [
        username,
    ])



# Updates the password for the given user.
@pg_utils.transaction
def change_password(cur, username, password):
    # Validate the user's data.
    pg_utils.fetch_user(cur, username)

    # Salt and hash the password, converting it to binary.
    hash_password = bcrypt.hashpw(
        bytes(password, 'utf-8'),
        bcrypt.gensalt(),
    )

    # Update the user's password.
    cur.execute("""
        update users
        set hash_password = %s
        where lower(username) = lower(%s);
    """, [
        hash_password,
        username,
    ])



# Checks if the password is correct for the given username.
@pg_utils.transaction
def is_valid_login(cur, username, password):
    # Check if the user's data exists.
    try:
        # Fetch and validate the user's data.
        record = pg_utils.fetch_user(cur, username)
    except pg_errors.UsersError as exc:
        # User not found.
        return False

    # Get the hashed password for this user.
    hash_password = record[1].tobytes()

    # Return whether or not the password matches.
    return bcrypt.checkpw(
        bytes(password, 'utf-8'),
        hash_password,
    )



# Creates a track in the "tracks" table, with a random ID and owned by the given user.
@pg_utils.transaction
def create_track(cur, owner, record):
    # Generate a unique track ID.
    track_id = pg_utils.get_uuid()

    # Get the index for this track.
    index = pg_utils.parse_index(cur, owner, record['index'])

    # Make space for the index if needed.
    pg_utils.add_index(cur, owner, index)

    # Add the track to the "tracks" table.
    cur.execute("""
        insert
        into tracks(track_id, owner, index, title, tags, url, volume, start_time, fade_in_sec, fade_out_sec, end_time)
        values(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """, [
        track_id,
        owner,
        index,
        record['title'],
        record['tags'],
        record['url'],
        record['volume'],
        record['start_time'],
        record['fade_in_sec'],
        record['fade_out_sec'],
        record['end_time'],
    ])

    # Return the track ID for referencing the new track.
    return track_id



# Read a track from the "tracks" table, for a given user.
@pg_utils.transaction
def read_track(cur, track_id, owner):
    # Fetch and validate the tracks's data.
    record = pg_utils.fetch_track(cur, track_id, owner)

    # Extract and return all fields.
    return {
        'track_id': record[0],
        'owner': record[1],
        'index': record[2],
        'title': record[3],
        'tags': record[4],
        'url': record[5],
        'volume': record[6],
        'start_time': record[7],
        'fade_in_sec': record[8],
        'fade_out_sec': record[9],
        'end_time': record[10],
    }



# Update a track from the "tracks" table, for a given user.
@pg_utils.transaction
def update_track(cur, track_id, owner, record):
    # Validate the track's data.
    pg_utils.fetch_track(cur, track_id, owner)

    # Get the current index for this track.
    cur.execute("""
        select index
        from tracks
        where track_id = %s
        and lower(owner) = lower(%s);
    """, [
        track_id,
        owner,
    ])
    old_index = cur.fetchone()

    # Reclaim space from the old index.
    pg_utils.remove_index(cur, owner, old_index)

    # Get the index for this track.
    index = pg_utils.parse_index(cur, owner, record['index'])

    # Make space for the index if needed.
    pg_utils.add_index(cur, owner, index)

    # Query and modify the user's record.
    cur.execute("""
        update tracks
        set index = %s, title = %s, tags = %s, url = %s, volume = %s, start_time = %s, fade_in_sec = %s, fade_out_sec = %s, end_time = %s
        where track_id = %s
        and lower(owner) = lower(%s);
    """, [
        record['index'],
        record['title'],
        record['tags'],
        record['url'],
        record['volume'],
        record['start_time'],
        record['fade_in_sec'],
        record['fade_out_sec'],
        record['end_time'],
        track_id,
        owner,
    ])



# Delete a tarck for a given user.
@pg_utils.transaction
def delete_track(cur, track_id, owner):
    # Validate the track's data.
    pg_utils.fetch_track(cur, track_id, owner)

    # Get the current index for this track.
    cur.execute("""
        select index
        from tracks
        where track_id = %s
        and lower(owner) = lower(%s);
    """, [
        track_id,
        owner,
    ])
    old_index = cur.fetchone()

    # Reclaim space from the old index.
    pg_utils.remove_index(cur, owner, old_index)

    # Delete the tracks's record.
    cur.execute("""
        delete
        from tracks
        where track_id = %s
        and lower(owner) = lower(%s);
    """, [
        track_id,
        owner,
    ])



# Read all of a user's tracks from the "tracks" table.
@pg_utils.transaction
def get_all_tracks(cur, username):
    # Validate the user's data.
    pg_utils.fetch_user(cur, username)

    # Query the user's tracks.
    cur.execute("""
        select *
        from tracks
        where lower(owner) = lower(%s);
    """, [
        username,
    ])

    # Loop through the records.
    record_list = []
    for record in cur:
        # Extract all fields.
        record_list.append({
            'track_id': record[0],
            'owner': record[1],
            'index': record[2],
            'title': record[3],
            'tags': record[4],
            'url': record[5],
            'volume': record[6],
            'start_time': record[7],
            'fade_in_sec': record[8],
            'fade_out_sec': record[9],
            'end_time': record[10],
        })

    # Return the list of tracks.
    return record_list
