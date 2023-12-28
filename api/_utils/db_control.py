# Import packages.
import json



# Set up access to the database.
def init(app, edit_list):
    # Set the path to the database.
    global DATABASE_PATH
    DATABASE_PATH = f"{app.static_folder}/database.json"

    # Set the users' editable properties in the database.
    global EDIT_LIST
    EDIT_LIST = edit_list



# Loads the editable properties for a given user.
def load_user_data(username):
    # Load the database.
    database = load()

    # Check if the user is valid.
    if validate(username, database):
        # Loop through the properties.
        user_data = {}
        for prop in EDIT_LIST:
            # Add it to the user's data.
            user_data[prop] = database[username][prop]

        # Return the user's data.
        return user_data
    else:
        # User not found error.
        raise KeyError(f"user '{username}' is not in the database or is missing properties")



# Loads all properties for a given user.
def load_all_user_data(username):
    # Load the database.
    database = load()

    # Check if the user is valid.
    if validate(username, database):
        # Loop through the properties.
        user_data = {}
        for prop in database[username]:
            # Add it to the user's data.
            user_data[prop] = database[username][prop]

        # Return the user's data.
        return user_data
    else:
        # User not found error.
        raise KeyError(f"user '{username}' is not in the database")



# Updates the editable properties for a given user.
def update_user_data(username, user_data):
    # Load the database.
    database = load()

    # Check if the user is valid.
    if validate(username, database):
        # Loop through the properties.
        for prop in EDIT_LIST:
            # Update the property for the user.
            database[username][prop] = user_data[prop]

        # Open the database file.
        with open(DATABASE_PATH, 'w') as file:
            # Convert data to JSON file and store.
            json.dump(database, file)
    else:
        # User data error.
        raise KeyError(f"user '{username}' is not in the database or is missing properties")



# Updates all properties for a given user.
def update_all_user_data(username, all_user_data):
    # Load the database.
    database = load()

    # Check if the user is valid.
    if validate(username, database):
        # Loop through the properties.
        for prop in database[username]:
            # Update the property for the user.
            database[username][prop] = all_user_data[prop]

        # Open the database file.
        with open(DATABASE_PATH, 'w') as file:
            # Convert data to JSON file and store.
            json.dump(database, file)
    else:
        # User data error.
        raise KeyError(f"user '{username}' is not in the database or is missing properties")



# Adds a new user to the database.
def add_user(username, password):
    # Load the database.
    database = load()

    # Check if the user does not exist already.
    if not username in database:
        # Add user and password.
        database[username] = {
            'password': password,
            'all_songs': [],
            'song_key_list': [],
            'default_volume': 50,
            'save_extra': True,
        }

        # Open the database file.
        with open(DATABASE_PATH, 'w') as file:
            # Convert data to JSON file and store.
            json.dump(database, file)
    else:
        # User data error.
        raise KeyError(f"new user '{username}' is already in the database")



# Deletes a user from the database.
def delete_user(username):
    # Load the database.
    database = load()

    # Check if the user is valid.
    if validate(username, database):
        # Delete the user.
        del database[username]

        # Open the database file.
        with open(DATABASE_PATH, 'w') as file:
            # Convert data to JSON file and store.
            json.dump(database, file)
    else:
        # User data error.
        raise KeyError(f"user '{username}' is not in the database")



# Loads the users' data from the database.
def load():
    # Test if the file exists.
    try:
        # Open the database file.
        with open(DATABASE_PATH, 'r') as file:
            # Convert JSON file to data.
            database = json.load(file)
    except FileNotFoundError:
        # Create the database file.
        with open(DATABASE_PATH, 'x') as file:
            # Create empty JSON contents.
            file.write('{}')
            database = {}

    # Return the database.
    return database



# Checks if a user exists in the database and has all of the editable properties.
def validate(username, database):
    # Check if the user exists.
    if username.lower() in [un.lower() for un in database]:
        # Returns based on if the user has all of the properties in the list.
        return all([prop in database[username] for prop in EDIT_LIST])
    else:
        # User doesn't exist.
        return False



# Extracts the song list from the given file.
def parse_song_list(import_file):
    # Check if the file is valid JSON.
    try:
        # Convert JSON file to contents.
        contents = json.load(import_file)
    except json.decoder.JSONDecodeError:
        # User data error.
        raise ValueError(f"imported file is not in JSON format")

    # Check if a song list is included.
    if 'song_list' in contents:
        # Get the song list.
        song_list = contents['song_list']

        # Check if it's a list.
        if isinstance(song_list, list):
            # Check if all of the songs are dicts.
            if all([isinstance(song, dict) for song in song_list]):
                # Return the song list.
                return song_list
            else:
                # Song error.
                raise TypeError(f"a song in the list is not a JSON object")
        else:
            # Song list error.
            raise TypeError(f"song list is not a JSON array")
    else:
        # File contents error.
        raise KeyError(f"imported file does not contain 'song_list' property")
