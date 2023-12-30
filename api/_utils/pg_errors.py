# User already exists.
class DupUserError(Exception):
    pass

# User doesn't exist.
class UsersError(Exception):
    pass

# Track doesn't exist.
class TracksError(Exception):
    pass
