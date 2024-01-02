# Import packages.
import flask
import re

# Import modules.
from api._utils import pg_errors
from api._utils import postgresql

# App setup.
app = flask.Flask(__name__)
app.secret_key = '51bf357f0576ca99c78adcd705dbbafae9260786663bd83e5bd099af8edd2bcd'



# Route function for root page.
@app.route('/', methods=['GET'])
def root():
    # Check if user is logged in.
    if 'username' in flask.session:
        # Get the user.
        username = flask.session['username']

        # Check if the user's data is cached.
        if ('user_record' in flask.session) and ('track_list' in flask.session):
            # Copy from cache.
            user_record = flask.session['user_record']
            track_list = flask.session['track_list']
        else:
            # Check if the user's data exists.
            try:
                # Load the user's data.
                user_record = postgresql.read_user(username)
                track_list = postgresql.get_all_tracks(username)

                # Store in cache.
                flask.session['user_record'] = user_record
                flask.session['track_list'] = track_list
            except pg_errors.UsersError as exc:
                # Error: User not found.
                # Print the error and redirect to logout page.
                print(exc)
                return flask.redirect(
                    flask.url_for('session', action='logout')
                )

        # Add extra lists if they're cached.
        extra_lists = {
            'queue_key_list': (flask.session['queue_key_list'] if 'queue_key_list' in flask.session else []),
            'recent_key_list': (flask.session['recent_key_list'] if 'recent_key_list' in flask.session else []),
        }
    else:
        # Fabricate guest user.
        user_record = {
            'username': '<guest>',
            'default_volume': 50,
            'save_extra': True,
        }

        # Create empty track list.
        track_list = []

        # Create empty extra lists.
        extra_lists = {
            'queue_key_list': [],
            'recent_key_list': [],
        }

    # Render the user's page.
    return flask.render_template('youtune.html', user_record=user_record, track_list=track_list, extra_lists=extra_lists)



# Route function for session control. Can also update users.
# Valid actions: 'login', 'signup', 'extra_lists', 'logout'
@app.route('/session/', methods=['POST'])
def session():
    # Cancel if the "action" argument wasn't provided.
    if 'action' not in flask.request.args:
        # Return error message.
        return {
            'error': f"No action provided. Posted URL was: {flask.request.url}",
        }

    # Check which action was selected.
    action = flask.request.args['action']
    if action == 'login':
        # Check if not all necessary fields were provided.
        if 'username' not in flask.request.json or \
        'password' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the username and password.
        username = flask.request.json['username']
        password = flask.request.json['password']

        # Check if the login is invalid.
        if not postgresql.is_valid_login(username, password):
            # Return error message.
            return {
                'error': f"Incorrect username or password.",
            }

        # Log in.
        flask.session['username'] = username
    elif action == 'signup':
        # Check if not all necessary fields were provided.
        if 'username' not in flask.request.json or \
        'password' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the username and password.
        username = flask.request.json['username']
        password = flask.request.json['password']

        # Check if the username is invalid.
        if not re.fullmatch(r"[\-0-9A-Z_a-z]{3,20}", username):
            # Return error message.
            return {
                'error': f"Invalid format for username.",
            }

        # Check if the password is invalid.
        if not re.fullmatch(r".{6,64}", password):
            # Return error message.
            return {
                'error': f"Invalid format for password.",
            }

        # Check if a user with that username already exists.
        try:
            # Create account.
            postgresql.create_user(username, password)
        except pg_errors.DupUserError as exc:
            # Return error message.
            return {
                'error': f"Username already taken.",
            }

        # Log in.
        flask.session['username'] = username
    elif action == 'extra_lists':
        # Check if not all necessary fields were provided.
        if 'queue_key_list' not in flask.request.json or \
        'recent_key_list' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the lists.
        queue_key_list = flask.request.json['queue_key_list']
        recent_key_list = flask.request.json['recent_key_list']

        # Store the lists in the session.
        flask.session['queue_key_list'] = queue_key_list
        flask.session['recent_key_list'] = recent_key_list
    elif action == 'logout':
        # Check if user is logged in.
        if 'username' in flask.session:
            # Sign the user out.
            flask.session.pop('username')
    else:
        # Invalid action.
        # Return error message.
        return {
            'error': f"Invalid action \"{action}\".",
        }

    # Return successful.
    return {}



# Route function for updating the user's record.
# Valid actions: 'update_user', 'change_password'
@app.route('/user_record/', methods=['POST'])
def user_record():
    # Cancel if the "action" argument wasn't provided.
    if 'action' not in flask.request.args:
        # Return error message.
        return {
            'error': f"No action provided. Posted URL was: {flask.request.url}",
        }

    # Cancel if user is NOT logged in.
    if 'username' not in flask.session:
        # Return error message.
        return {
            'error': f"Not logged in.",
        }
    
    # Get the user.
    username = flask.session['username']

    # Check which action was selected.
    action = flask.request.args['action']
    if action == 'update_user':
        # Check if not all necessary fields were provided.
        if 'default_volume' not in flask.request.json or \
        'save_extra' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the settings.
        default_volume = flask.request.json['default_volume']
        save_extra = flask.request.json['save_extra']

        # Convert the settings to a record.
        record = {
            'default_volume': default_volume,
            'save_extra': save_extra,
        }

        # Check if the user exists.
        try:
            # Update the user settings.
            postgresql.update_user(username, record)
        except pg_errors.UsersError as exc:
            # Return error message.
            return {
                'error': f"User \"{username}\" doesn't exist.",
            }
    elif action == 'change_password':
        # Check if not all necessary fields were provided.
        if 'current_password' not in flask.request.json or \
        'new_password' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the old and new password.
        current_password = flask.request.json['current_password']
        new_password = flask.request.json['new_password']

        # Check if the new password is blank.
        if new_password == '':
            # Return error message.
            return {
                'error': f"New password is blank.",
            }

        # Check if the passwords are the same.
        if new_password == current_password:
            # Return error message.
            return {
                'error': f"New password is the same as current password.",
            }

        # Check if the old password is invalid.
        if not postgresql.is_valid_login(username, current_password):
            # Return error message.
            return {
                'error': f"Incorrect current password.",
            }

        # Check if the user exists.
        try:
            # Change the password.
            postgresql.change_password(username, new_password)
        except pg_errors.UsersError as exc:
            # Return error message.
            return {
                'error': f"User \"{username}\" doesn't exist.",
            }
    else:
        # Invalid action.
        # Return error message.
        return {
            'error': f"Invalid action \"{action}\".",
        }
    
    # Store user data in cache.
    user_record = postgresql.read_user(username)
    flask.session['user_record'] = user_record

    # Return successful.
    return {}



# Route function for updating the user's tracks.
# Valid actions: 'add', 'save', 'delete'
@app.route('/tracks/', methods=['POST'])
def tracks():
    # Cancel if the "action" argument wasn't provided.
    if 'action' not in flask.request.args:
        # Return error message.
        return {
            'error': f"No action provided. Posted URL was: {flask.request.url}",
        }

    # Cancel if user is NOT logged in.
    if 'username' not in flask.session:
        # Return error message.
        return {
            'error': f"Not logged in.",
        }
    
    # Get the user.
    username = flask.session['username']

    # Check which action was selected.
    action = flask.request.args['action']
    if action == 'add':
        # Check if not all necessary fields were provided.
        if 'index' not in flask.request.json or \
        'title' not in flask.request.json or \
        'tags' not in flask.request.json or \
        'url' not in flask.request.json or \
        'volume' not in flask.request.json or \
        'start_time' not in flask.request.json or \
        'fade_in_sec' not in flask.request.json or \
        'fade_out_sec' not in flask.request.json or \
        'end_time' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the track options.
        index = flask.request.json['index']
        title = flask.request.json['title']
        tags = flask.request.json['tags']
        url = flask.request.json['url']
        volume = flask.request.json['volume']
        start_time = flask.request.json['start_time']
        fade_in_sec = flask.request.json['fade_in_sec']
        fade_out_sec = flask.request.json['fade_out_sec']
        end_time = flask.request.json['end_time']

        # Convert the options to a record.
        record = {
            'index': index,
            'title': title,
            'tags': tags,
            'url': url,
            'volume': volume,
            'start_time': start_time,
            'fade_in_sec': fade_in_sec,
            'fade_out_sec': fade_out_sec,
            'end_time': end_time,
        }

        # Add the track.
        track_id = postgresql.create_track(username, record)

        # Return the updated track list, with the new track's ID included.
        response_json = get_track_list_json(username)
        response_json['track_id'] = track_id
        return response_json
    elif action == 'save':
        # Check if not all necessary fields were provided.
        if 'track_id' not in flask.request.json or \
        'index' not in flask.request.json or \
        'title' not in flask.request.json or \
        'tags' not in flask.request.json or \
        'url' not in flask.request.json or \
        'volume' not in flask.request.json or \
        'start_time' not in flask.request.json or \
        'fade_in_sec' not in flask.request.json or \
        'fade_out_sec' not in flask.request.json or \
        'end_time' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the track options.
        track_id = flask.request.json['track_id']
        index = flask.request.json['index']
        title = flask.request.json['title']
        tags = flask.request.json['tags']
        url = flask.request.json['url']
        volume = flask.request.json['volume']
        start_time = flask.request.json['start_time']
        fade_in_sec = flask.request.json['fade_in_sec']
        fade_out_sec = flask.request.json['fade_out_sec']
        end_time = flask.request.json['end_time']

        # Convert the options to a record.
        record = {
            'index': index,
            'title': title,
            'tags': tags,
            'url': url,
            'volume': volume,
            'start_time': start_time,
            'fade_in_sec': fade_in_sec,
            'fade_out_sec': fade_out_sec,
            'end_time': end_time,
        }

        # Check if the track exists.
        try:
            # Edit the track.
            postgresql.update_track(track_id, username, record)
        except pg_errors.TracksError as exc:
            # Return error message.
            return {
                'error': f"Track doesn't exist.",
            }
        
        # Return the updated track list.
        return get_track_list_json(username)
    elif action == 'delete':
        # Check if not all necessary fields were provided.
        if 'track_id' not in flask.request.json:
            # Return error message.
            return {
                'error': f"Not all fields provided.",
            }

        # Get the track's ID.
        track_id = flask.request.json['track_id']

        # Check if the track exists.
        try:
            # Delete the track.
            postgresql.delete_track(track_id, username)
        except pg_errors.TracksError as exc:
            # Return error message.
            return {
                'error': f"Track doesn't exist.",
            }
        
        # Return the updated track list.
        return get_track_list_json(username)
    else:
        # Invalid action.
        # Return error message.
        return {
            'error': f"Invalid action \"{action}\".",
        }

    # Return successful.
    return {}



# Gets the track list as a REST response for the given user.
def get_track_list_json(username):
    # Check if the user exists.
    try:
        # Load the user's tracks.
        track_list = postgresql.get_all_tracks(username)

        # Store in cache.
        flask.session['track_list'] = track_list
    except pg_errors.UsersError as exc:
        # Return error message.
        return {
            'error': f"User \"{username}\" doesn't exist.",
        }
    
    # Return the tracks.
    return {
        'track_list': track_list,
    }
