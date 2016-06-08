from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import numpy as np
import json
from bson import json_util
from bson.json_util import dumps
import os
from werkzeug import secure_filename

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/lineChart")
def lineChart():
    return render_template("lineChart.html")

@app.route("/barChart")
def barChart():
    return render_template("barChart.html")

@app.route("/pieChart")
def pieChart():
    return render_template("pieChart.html")

@app.route("/Help")
def help():
    return render_template("help.html")

@app.route("/About")
def about():
    return render_template("about.html")

@app.route("/Contact")
def contact():
    return render_template("contact.html")

#This is used to get data from static files
#Now this is for contact information
@app.route("/<path:path>")
def relation(path):
    return send_from_directory('static/data', path)

'''
following part is used to update files
'''
# This is the path to the upload directory
app.config['UPLOAD_FOLDER'] = 'static/data'
# These are the extension that we are accepting to be uploaded
app.config['ALLOWED_EXTENSIONS'] = set(['csv'])

# For a given file, return whether it's an allowed type or not
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']

# Route that will process the file upload
@app.route('/upload', methods=['POST'])
def upload():
    # Get the name of the uploaded file
    file = request.files['file']
    # Check if the file is one of the allowed types/extensions
    if file and allowed_file(file.filename):
        # Make the filename safe, remove unsupported chars
        filename = secure_filename(file.filename)
        # Move the file form the temporal folder to
        # the upload folder we setup
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        # Redirect the user to the uploaded_file route, which
        # will basicaly show on the browser the uploaded file
        return redirect(url_for('uploaded_file',
                                filename=filename))

# This route is expecting a parameter containing the name
# of a file. Then it will locate that file on the upload
# directory and show it on the browser, so if the user uploads
# an image, that image is going to be show after the upload
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename)

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)

