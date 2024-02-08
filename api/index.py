# Import packages.
import flask

# App setup.
app = flask.Flask(__name__)



# "GET" function for root page.
@app.get('/')
def root_get():
    # Check if the user is logged in.
    if 'username' in flask.session:
        #
        return flask.render_template('index.html')
    else:
        # Redirect to login page.
        return flask.redirect('/login/')



# "GET" function for login page.
@app.get('/login/')
def login_get():
    #
    return flask.render_template('login.html')



# "POST" function for login page.
@app.post('/login/')
def login_post():
    # Check if not all necessary fields were provided.
    if 'username' not in flask.request.form \
    or flask.request.form['username'] == '' \
    or 'password' not in flask.request.form \
    or flask.request.form['username'] == '':
        # Error.
        return flask.render_template('login.html', error="Error: Username and password are required.")
    else:
        #
        return flask.render_template('index.html')
