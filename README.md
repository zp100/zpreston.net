<p align="center">
  <img src="/api/static/images/YouTune.png" alt="YouTune"/>
</p>

# YouTune

An interface for YouTube that makes it easy to catalog and organize music to create playlists. Visit it at https://youtune.zpreston.net.

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
git switch youtune                                          # switch to the "youtune" branch
python3 -m venv .env                                        # [optional] create a virtual Python environment to avoid cluttering your pip packages
source .env/bin/activate                                    # [optional] activate the virtual environment
pip install -r requirements.txt                             # install the requirements
```

You'll also need to [set up your own PostgreSQL database](https://www.postgresql.org/docs/current/tutorial-start.html) to store the tracks. This can either be a local database created on your computer, or one hosted online. Once that's done, run these SQL queries to create the tables for the project:
```
create table users(
    username        text not null,
    hash_password   bytea not null,
    default_volume  text,
    save_extra      boolean,
    primary key(username)
);
```
```
create table tracks(
    track_id        uuid not null,
    owner           text not null,
    index           integer not null,
    title           text,
    tags            text,
    url             text,
    volume          text,
    start_time      text,
    fade_in_sec     text,
    fade_out_sec    text,
    end_time        text,
    primary key(track_id)
);
```
Now that the database is ready, create a shell script to set up your local shell environment (separate from the Python virtual environment) so that the code can access the database:
```
touch dev_environ.sh                                        # files starting with "dev_" won't interfere with the git repository
```
Then open the file with a text editor, and set the environment variables for accessing the database:
```
export POSTGRES_HOST="postgres.host.com"                    # [optional] if your database is hosted online, provide the URL to it
export POSTGRES_USER="default"                              # username for a user that has admin access to the database
export POSTGRES_PASSWORD="admin"                            # [optional] password for the user
export POSTGRES_DATABASE="verceldb"                         # name of the database
```
Replace the values in double quotes with the credentials for your own database. These variables are used by the `transaction` function in "api/_utils/pg_utils.py".

To run the site on a local server, make sure your terminal is in the top-level "zpreston.net" directory (and the virtual environment is active, if you created it), and then run the following commands:
```
source dev_environ.sh
flask --app api/index.py run
```
Once the local Flask server is running, access it by going to http://127.0.0.1:5000/ in a browser.

## More Information

For software attributions and more info about the site, switch to the [main branch of the repository](https://github.com/zp100/zpreston.net).
