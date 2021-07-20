from logging.config import dictConfig

from flask import Flask, render_template, request

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s][%(levelname)s][%(module)s] %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': 'INFO',
        'handlers': ['wsgi']
    }
})

app = Flask(__name__)


@app.route('/accept', methods=['POST'])
def accept():
    name = request.form.get("name")
    email = request.form.get("email")
    app.logger.info(f'ACCEPT_EVENT: email="{email}" name="{name}"')
    return {'success': True}


@app.route('/', methods=['GET'])
def invite():
    return render_template('invite.html')
