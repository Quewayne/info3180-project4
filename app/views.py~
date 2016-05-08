import jwt
import base64
import os
import json
import time
import smtplib
from functools import wraps
from app.image_getter import *
from datetime import datetime, timedelta
from flask import Flask, render_template, session, redirect, url_for, flash, request, jsonify,  _request_ctx_stack
from werkzeug.local import LocalProxy
from flask.ext.cors import cross_origin
#from flask.ext.script import Manager
from werkzeug import secure_filename
from flask.ext.bootstrap import Bootstrap
#from flask.ext.moment import Moment
from sqlalchemy.sql import *
from flask_wtf.file import *
from flask.ext.uploads import UploadSet, IMAGES
from flask.ext.wtf import Form
from random import randint
from wtforms.validators import Required, NumberRange
from flask.ext.sqlalchemy import SQLAlchemy
from app.models import Member, Wish

from app import app
#from flask import render_template, request, redirect, url_for
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['TOKEN_SECRET'] = 'MyJWT Secret Token String'
db = SQLAlchemy(app)


message = """From: {} <{}>
To: {} <{}>
Subject: {}

{}
"""





# Authentication annotation
current_user = LocalProxy(lambda: _request_ctx_stack.top.current_user)

# Authentication attribute/annotation
def authenticate(error):
  resp = jsonify(error)

  resp.status_code = 401

  return resp

def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    auth = request.headers.get('Authorization', None)
    if not auth:
      return authenticate({'code': 'authorization_header_missing', 'description': 'Authorization header is expected'})

    parts = auth.split()

    if parts[0].lower() != 'bearer':
      return {'code': 'invalid_header', 'description': 'Authorization header must start with Bearer'}
    elif len(parts) == 1:
      return {'code': 'invalid_header', 'description': 'Token not found'}
    elif len(parts) > 2:
      return {'code': 'invalid_header', 'description': 'Authorization header must be Bearer + \s + token'}

    token = parts[1]
    try:
         payload = jwt.decode(token, app.config['TOKEN_SECRET'])
  
    except jwt.ExpiredSignature:
        return authenticate({'code': 'token_expired', 'description': 'token is expired'})
    except jwt.DecodeError:
        return authenticate({'code': 'token_invalid_signature', 'description': 'token signature is invalid'})
    
    _request_ctx_stack.top.current_user = user = payload
    return f(*args, **kwargs)

  return decorated


def create_token(user):
    payload = {
        'sub': user.userid,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(days=14)
    }
    token = jwt.encode(payload, app.config['TOKEN_SECRET'])
    return token.decode('unicode_escape')


def parse_token(req):
    token = req.headers.get('Authorization').split()[1]
    return jwt.decode(token, app.config['TOKEN_SECRET'])


def timeinfo(entry):
    day = time.strftime("%a")
    date = time.strftime("%d")
    if (date <10):
        date = date.lstrip('0')
    month = time.strftime("%b")
    year = time.strftime("%Y")
    return day + ", " + date + " " + month + " " + year



###
# Routing for your application.
###

@app.route('/')
def home():
    """Render website's home page."""
    return app.send_static_file('index.html')
    #return render_template('index.html')

@app.route('/api/thumbnail/process', methods=['GET'])
def selImage():
	url = request.args.get('url')
	data = imageget(url)
	return data;
	
@app.route('/api/user/register', methods=['POST'])
def regUser():
	data= json.loads(request.data.decode())
	emailaddr= data["email"]
	password= data["password"]
	username= data["username"]
	#uid = randint(600000000,699999999)
	user = Member.query.filter_by(email=emailaddr).first()
	if user is None:
		while True:
                	uid = randint(620000000,629999999)
                	if not db.session.query(exists().where(Member.userid == uid)).scalar():
                	    	break
		member=Member(uid,emailaddr,password,username)
		db.session.add(member)
		db.session.commit()
		return jsonify (error="null",data={"user":{ "id": uid,"email": emailaddr,"name": username}},message= "Success")
	else:
		return jsonify (error="1",data={},message= "Email already in use")
	return jsonify ()
	
@app.route('/api/user/login', methods=['POST'])
def usrLogin():
	data= json.loads(request.data.decode())
	emailaddr= data["email"]
	password= data["password"]
	user = Member.query.filter_by(email=emailaddr).first()
	passw = user.password
	if user is None:
		return jsonify (error="1",data={},message= "Bad user name or password")
	elif  password == passw:
		token = create_token(user)
		payload = jwt.decode(token,app.config['TOKEN_SECRET'], algorithm=['HS256'])	
		return jsonify (token=token, error="null",data={'token':token,'expires': timeinfo(payload['exp']),"user":{ "id": user.userid,"email": user.email,"name": user.uname}},message= "Success")
	elif  password != passw:	
		return jsonify (error="1",data={},message= "Bad user name or password")
	

@app.route('/api/user/<usrID>/wishlist', methods=['POST','GET'])
@cross_origin(headers=['Content-Type', 'Authorization'])
@requires_auth
def shwList(usrID):
	if request.method == "POST":
		data= json.loads(request.data.decode())
		title= data["title"]
		description= data["description"]
		user= usrID
		url= data["url"]
		thumbnail= data["thumbnail"]
		wish= Wish(title,description,thumbnail,user,url)
		db.session.add(wish)
		db.session.commit()
		wishes = db.session.query(Wish).filter_by(user=usrID).all()
	 	wishlist = []
        	for wish in wishes:
            		wishlist.append({'title': wish.title,'description':wish.description,'url':wish.url,'thumbnail':wish.thumbnail})
        	if(len(wishlist)>0):
            		return jsonify({"error":"null","data":{"wishes":wishlist},"message":"Success"})
        	else:
            		return jsonify({"error":"1","data":{},"message":"No such wishlist exists"})
	elif request.method == "GET":
		wishes = db.session.query(Wish).filter_by(user=usrID).all()
	 	wishlist = []
        	for wish in wishes:
            		wishlist.append({'title': wish.title,'description':wish.description,'url':wish.url,'thumbnail':wish.thumbnail})
        	if(len(wishlist)>0):
            		return jsonify({"error":"null","data":{"wishes":wishlist},"message":"Success"})
        	else:
            		return jsonify({"error":"1","data":{},"message":"No such wishlist exists"})


@app.route('/api/user/<usrID>/remove', methods=['POST'])
@cross_origin(headers=['Content-Type', 'Authorization'])
@requires_auth
def removeItem(usrID):	
	data= json.loads(request.data.decode())
	delete= data["urldel"]
        wish = db.session.query(Wish).filter_by(thumbnail=delete).first()
	if wish is None:
		return jsonify({"error":"1","message":"No such wish exists"})
	else:
		#title= wish.title
		#description= wish.description
		#user= usrID
		#url= wish.url
		#thumbnail= wish.thumbnail
		#wishdel= Wish(title,description,thumbnail,user,url)
		db.session.delete(wish)
        	db.session.commit()
        	return jsonify({"error":"null","message":"Success"})



@app.route('/api/user/<usrID>/share', methods=['POST'])
@cross_origin(headers=['Content-Type', 'Authorization'])
@requires_auth
def shareList(usrID):	
	data= json.loads(request.data.decode())
	addresses= []
	addresses.append(data["email1"])
	addresses.append(data["email2"])
	addresses.append(data["email3"])
	addresses.append(data["email4"])
	subject= "Hey check out my wishlist"
	user = Member.query.filter_by(userid=usrID).first()
	fromname= user.uname
	msg = "http://"+"0.0.0.0:"+"/"+"8080"+ "/api/user/" + usrID + "/wishlist"
	for address in addresses:
		sendmsg(subject,msg,address,fromname)
	return jsonify({"error":"null","message":"Success"})



def sendmsg(subject,msg,toaddr,fromname):
	fromaddr  = 'qgrant96@gmail.com'
	toname = 'Cooze'
	#subject = request.form.subject.data
    	#msg = request.form.msg.data
    	#toaddr  = request.form.email.data
	#fromname = request.form.name.data
	messagetosend = message.format(
                             	fromname,
                             	fromaddr,
                             	toname,
                             	toaddr,
                             	subject,
                             	msg)

	# Credentials (if needed)
	username = 'qgrant96@gmail.com'
	password = 'coozeman11'
	#password = '{youremailapppassword}''
	# The actual mail send
	server = smtplib.SMTP('smtp.gmail.com:587')
	server.starttls()
	#server.login(username)
	server.login(username,password)
	server.sendmail(fromaddr, toaddr, messagetosend)
	server.quit()
	
	

###
# The functions below should be applicable to all Flask apps.
###


@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send your static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=600'
    return response


@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0",port="8888")
