# Import packages.
import flask

# App setup.
app = flask.Flask(__name__)



# Route function for root page.
@app.route('/', methods=['GET'])
def root():
    return flask.render_template('index.html')
