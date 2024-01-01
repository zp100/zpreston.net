# Import packages.
import os
import psycopg2
import psycopg2.extras
import uuid

# Import modules.
from api._utils import pg_errors



# Decorator function as a wrapper for database transactions.
# Functions that this decorates must use their first parameter for the cursor argument (similar to "self" in classes).
# Queries can be executed using the "cur.execute(query, vars=None)" function.
# Returned records can be accessed using the "cur.fetchone()", "cur.fetchmany(size=cur.arraysize)", or "cur.fetchall()" functions.
# Records can be iterated over using the "for record in cur:" block. 
def transaction(func):
    # Define inner function.
    def inner(*args, **kwargs):
        # Create connection to database.
        conn = psycopg2.connect(
            host=os.environ.get('POSTGRES_HOST'),
            port=5432,
            user=os.environ.get('POSTGRES_USER'),
            password=os.environ.get('POSTGRES_PASSWORD'),
            dbname=os.environ.get('POSTGRES_DATABASE'),
        )

        # Catch exceptions.
        try:
            # Use connection context.
            with conn:
                # Use cursor context.
                with conn.cursor() as cur:
                    # Execute queries.
                    ret = func(cur, *args, **kwargs)
        except Exception as exc:
            # If any exceptions occured, undo the changes.
            conn.rollback()

            # Bubble up the exception.
            raise exc
        else:
            # If no exceptions occured, commit the changes to make them persistent.
            conn.commit()
        finally:
            # Regardless of exceptions, close the connection.
            conn.close()
        
        # Return the wrapped function's return value.
        return ret

    # Return the function.
    return inner



# Gets a user's data, or raises an exception if the user doesn't exist.
def fetch_user(cur, username):
    # Query the user's record.
    cur.execute("""
        select *
        from users
        where lower(username) = lower(%s);
    """, [
        username,
    ])

    # Test for record found.
    record = cur.fetchone()
    if record is not None:
        # Return the record.
        return record
    else:
        # Error.
        raise pg_errors.UsersError(f"the user with the username \"{username}\" doesn't exist")



# Generates a UUID that's supported by psycopg2.
def get_uuid():
    # Register Python's "uuid.UUID" type as PostgreSQL's "uuid" type.
    psycopg2.extras.register_uuid()

    # Return a unique ID.
    return uuid.uuid4()



# Gets the index for the next track to be appended to the user's track list.
def get_end_index(cur, owner):
    # Query for the largest index.
    cur.execute("""
        select max(index)
        from tracks
        where lower(owner) = lower(%s);
    """, [
        owner,
    ])

    # Test for record found.
    record = cur.fetchone()[0]
    if record is not None:
        # Return 1 more than the largest index.
        return record + 1
    else:
        # Default to 1.
        return 1



# Converts an index string into a valid index.
def parse_index(cur, owner, index_str):
    # Get the end index.
    end_index = get_end_index(cur, owner)

    # Test for valid integer.
    try:
        # Convert to integer.
        index = int(index_str)
    except ValueError as exc:
        # Default to end index.
        index = end_index
    
    # Check if it's out-of-bounds.
    if index < 1:
        # Clamp up to 1.
        index = 1
    elif index > end_index:
        # Clamp down to end index.
        index = end_index
    
    # Return the final index.
    return index



# Makes space for a track at the given index.
def add_index(cur, owner, index):
    # Adds 1 to all tracks for this owner with an index at or above the given index.
    cur.execute("""
        update tracks
        set index = index + 1
        where lower(owner) = lower(%s)
        and index >= %s;
    """, [
        owner,
        index,
    ])



# Reclaims space from a track at the given index.
def remove_index(cur, owner, index):
    # Subtracts 1 from all tracks for this owner with an index at or above the given index.
    cur.execute("""
        update tracks
        set index = index - 1
        where lower(owner) = lower(%s)
        and index >= %s;
    """, [
        owner,
        index,
    ])



# Gets a track's data for a given user, or raises an exception if the track doesn't exist.
def fetch_track(cur, track_id, owner):
    # Query the track's record.
    cur.execute("""
        select *
        from tracks
        where track_id = %s
        and lower(owner) = lower(%s);
    """, [
        track_id,
        owner,
    ])

    # Test for record found.
    record = cur.fetchone()
    if record is not None:
        # Return the record.
        return record
    else:
        # Error.
        raise pg_errors.TracksError(f"this track owned by \"{owner}\" doesn't exist")
