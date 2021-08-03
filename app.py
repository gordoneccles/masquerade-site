from logging.config import dictConfig
import os

from flask import Flask, render_template, request
import gspread

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

_SHEET_ID = '1GEQUxniorixFM9-zw5d34H8kaPHwr_VN1itiBP1KvuI'


def _get_credentials_dict():
    try:
        return {
            'type': os.environ['GSHEETS_TYPE'],
            'project_id': os.environ['GSHEETS_PROJECT_ID'],
            'private_key_id': os.environ['GSHEETS_PRIVATE_KEY_ID'],
            'private_key': os.environ['GSHEETS_PRIVATE_KEY'],
            'client_email': os.environ['GSHEETS_CLIENT_EMAIL'],
            'client_id': os.environ['GSHEETS_CLIENT_ID'],
            'token_uri': os.environ['GSHEETS_TOKEN_URI'],
            'auth_uri': os.environ['GSHEETS_AUTH_URI'],
            'auth_provider_x509_cert_url': os.environ['GSHEETS_AUTH_PROVIDER_X509_CERT_URL'],
            'client_x509_cert_url': os.environ['GSHEETS_CLIENT_X509_CERT_URL'],
        }
    except KeyError as e:
        app.logger.exception(f'Failed to load Google service account credentials')
        raise


def _save_to_sheet(name, email):
    gc = gspread.service_account_from_dict(_get_credentials_dict())
    sh = gc.open_by_key(_SHEET_ID)
    worksheet = sh.sheet1
    row = [name, email]
    worksheet.append_row(row)
    app.logger.info(f'Successfully saved {row} to Google sheets')



@app.route('/accept', methods=['POST'])
def accept():
    try:
        name = request.json.get("name")
        email = request.json.get("email")
        app.logger.info(f'ACCEPT_EVENT: email="{email}" name="{name}"')
        _save_to_sheet(name, email)
        return {'success': True}
    except:
        app.logger.exception(f'Invite accept failed')
        return {'success': False}


@app.route('/', methods=['GET'])
def invite():
    return render_template('invite.html')
