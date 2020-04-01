from functools import wraps

def unpack(f):
    @wraps
    def wrapped_f(kwargs):
        return f(**kwargs)
    return wrapped_f
