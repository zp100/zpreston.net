# zpreston.net

Personal website for info and projects. (WORK-IN-PROGRESS)

## Setup

Requirements:
-   Python version 3.10 or later.
-   `pip` version 22.0 or later.
-   Latest version of `git`.

Installation:
```
git clone https://github.com/zp100/zpreston.net.git         # download the repository into a local directory named "zpreston.net"
cd zpreston.net                                             # open the directory
python3 -m venv .env                                        # [optional] create a virtual Python environment to avoid cluttering your pip packages
source .env/bin/activate                                    # [optional] activate the virtual environment
pip install -r requirements.txt                             # install the requirements
```

Running locally (make sure you're in the top-level "zpreston.net" folder):
```
flask --app api/index.py run
```
Once the local Flask server is running, access it by going to http://127.0.0.1:5000/ in a browser.

## Tech Stack
-   Content: [HTML](https://developer.mozilla.org/en-US/docs/Glossary/HTML) with [Jinja 3.1](https://jinja.palletsprojects.com/en/3.1.x/).
-   Style: [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS), [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/).
-   Client-side code (frontend): [JavaScript ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (vanilla), [YouTube player API](https://developers.google.com/youtube/iframe_api_reference).
-   Server-side code (backend): [Python 3.10](https://www.python.org/downloads/release/python-3100/) with [Flask 3.0](https://flask.palletsprojects.com/en/3.0.x/).
-   Website hosting: [Vercel](https://vercel.com/) directly hosting this repository.
-   Domain control: [Namecheap](https://www.namecheap.com/).
