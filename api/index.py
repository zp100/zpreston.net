import flask

app = flask.Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/about')
def about():
    return 'About'

@app.route('/test/')
def test():
    return flask.render_template('test.html')
