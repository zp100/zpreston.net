# Import packages.
import flask
import re

# Import modules.
from api._utils import db_control

# App setup.
app = flask.Flask(__name__)
app.secret_key = '51bf357f0576ca99c78adcd705dbbafae9260786663bd83e5bd099af8edd2bcd'
db_control.init(app, ['all_songs', 'song_key_list', 'default_volume', 'save_extra'])



# Route function for root page.
@app.route('/', methods=['GET', 'POST'])
def root():
    # Check if user is not logged in.
    if not 'username' in flask.session:
        # Render guest page.
        user_data = {
            'all_songs': [],
            'song_key_list': [],
            'default_volume': 50,
            'save_extra': True,
        }
        return flask.render_template('youtune.html', username='<guest>', user_data=user_data)

    # Get the user.
    username = flask.session['username']

    # Check if the user's data exists.
    try:
        # Load the user's data.
        user_data = db_control.load_user_data(username)
    except KeyError as exc:
        # Print the error and redirect to logout page.
        print(exc)
        return flask.redirect(
            flask.url_for('logout')
        )

    # Add extra lists if they're stored.
    user_data['queue_key_list'] = (flask.session['queue_key_list'] if 'queue_key_list' in flask.session else [])
    user_data['recent_key_list'] = (flask.session['recent_key_list'] if 'recent_key_list' in flask.session else [])

    # Render the user's page.
    return flask.render_template('youtune.html', username=username, user_data=user_data)



# Route function for logout page.
@app.get('/logout/')
def logout():
    # Check if user is logged in.
    if 'username' in flask.session:
        # Sign the user out.
        flask.session.pop('username')

    # Redirect to main page.
    return flask.redirect(
        flask.url_for('root')
    )



# Route function for accessing the database.
@app.post('/database/')
def database():
    # Check if all fields were provided.
    if ('username' in flask.request.json) and ('user_data' in flask.request.json):
        # Update the user's data.
        username = flask.request.json['username']
        user_data = flask.request.json['user_data']
        db_control.update_user_data(username, user_data)

        # Return successful.
        return ''

    # Request error.
    raise KeyError(f"database request is missing properties in data body: has properties {flask.request.json}")



# Route function for storing queue and recent lists.
@app.post('/extra_lists/')
def extra_lists():
    # Check if all fields were provided.
    if ('queue_key_list' in flask.request.json) and ('recent_key_list' in flask.request.json):
        # Store the lists.
        queue_key_list = flask.request.json['queue_key_list']
        recent_key_list = flask.request.json['recent_key_list']
        flask.session['queue_key_list'] = queue_key_list
        flask.session['recent_key_list'] = recent_key_list

        # Return successful.
        return ''

    # Request error.
    raise KeyError(f"extra lists request is missing properties in data body: has properties {flask.request.json}")



# Route function for accessing the database.
@app.post('/password/')
def password():
    # Check if all fields were provided.
    if ('password' in flask.request.json) and ('new_password' in flask.request.json):
        # Get the user.
        username = flask.session['username']

        # Check if the user's data exists.
        try:
            # Load the user's data.
            all_user_data = db_control.load_all_user_data(username)
        except KeyError as exc:
            # Print the error and redirect to logout page.
            print(exc)
            return flask.redirect(
                flask.url_for('logout')
            )

        # Check if the passwords are invalid.
        password = flask.request.json['password']
        new_password = flask.request.json['new_password']
        if ('password' not in all_user_data) or (all_user_data['password'] != password):
            # Error.
            return 'Error: Incorrect current password.'
        if new_password == '':
            # Error.
            return 'Error: New password is blank.'
        if new_password == password:
            # Error.
            return 'Error: New password is the same as current password.'

        # Change the user's password.
        all_user_data['password'] = new_password
        db_control.update_all_user_data(username, all_user_data)

        # Return successful.
        return ''

    # Request error.
    raise KeyError(f"password request is missing properties in data body: has properties {flask.request.json}")



# Route function for logging in.
@app.post('/login/')
def login():
    # Check if all fields were provided.
    if ('mode' in flask.request.json) and ('username' in flask.request.json) and ('password' in flask.request.json):
        # Copy mode, username, and password.
        mode = flask.request.json['mode']
        username = flask.request.json['username']
        password = flask.request.json['password']

        # Load the database.
        database = db_control.load()

        # Check which button was pressed.
        if mode == 'login':
            # Check if the user is invalid, or the password is incorrect.
            if not db_control.validate(username, database) or ('password' not in database[username]) or (password != database[username]['password']):
                # Error.
                return 'Error: Incorrect username or password.'

            # Log in.
            flask.session['username'] = username

            # Return successful.
            return ''
        elif mode == 'signup':
            # Check if the username is invalid.
            if not re.fullmatch(r"[\-0-9A-Z_a-z]{3,20}", username):
                # Error.
                return 'Error: Invalid format for username.'

            # Check if the password is invalid.
            if not re.fullmatch(r".{6,64}", password):
                # Error.
                return 'Error: Invalid format for password.'

            # Check if the username already exists.
            if username.lower() in [un.lower() for un in database]:
                # Error.
                return 'Error: Username already taken.'

            # Create account.
            db_control.add_user(username, password)

            # Log in.
            flask.session['username'] = username

            # Return successful.
            return ''

    # Request error.
    raise KeyError(f"password request is missing properties in data body: has properties {flask.request.json}")
