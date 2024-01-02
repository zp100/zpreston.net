# zpreston.net

Personal website for info and projects. Visit it at https://zpreston.net. (WORK-IN-PROGRESS)

## Local Setup

You'll need a terminal with access to your file system to run the setup commands. You'll also need a package manager such as `apt` or `pacman` that can install the CLI versions of applications.

Requirements:
-   `python3` version 3.9 or later.
-   `pip` version 22.0 or later.
-   Latest version of `git`.

To install, open a terminal and navigate to the directory where you'd like to store the repository. Then run the following commands:
```
git clone https://github.com/zp100/zpreston.net.git         # create a local directory named "zpreston.net" and download the repository into it
cd zpreston.net                                             # open the directory
python3 -m venv .env                                        # [optional] create a virtual Python environment to avoid cluttering your pip packages
source .env/bin/activate                                    # [optional] activate the virtual environment
pip install -r requirements.txt                             # install the requirements
```

To run the site on a local server, make sure your terminal is in the top-level "zpreston.net" directory (and the virtual environment is active, if you created it), and then run the following commands:
```
flask --app api/index.py run
```
Once the local Flask server is running, access it by going to http://127.0.0.1:5000/ in a browser.

## Tech Stack
-   Content: [HTML](https://developer.mozilla.org/en-US/docs/Glossary/HTML) with [Jinja 3.1](https://jinja.palletsprojects.com/en/3.1.x/).
-   Style: [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) with [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/).
-   Client-side code (frontend): [JavaScript ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript) (vanilla) with [YouTube player API](https://developers.google.com/youtube/iframe_api_reference).
-   Server-side code (backend): [Python 3.9](https://www.python.org/downloads/release/python-390/) with [Flask 3.0](https://flask.palletsprojects.com/en/3.0.x/), [Psycopg 2.9.9](https://www.psycopg.org/docs/), [bcrypt](https://pypi.org/project/bcrypt/).
-   Database: [PostgreSQL](https://www.postgresql.org/).
-   Website hosting: [Vercel](https://vercel.com/) directly hosting this repository.
-   Domain control: [Namecheap](https://www.namecheap.com/).
