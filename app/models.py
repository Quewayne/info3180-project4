from app import db

class Member(db.Model):
    userid = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100))
    password = db.Column(db.String(64))
    uname= db.Column(db.String(64))
    wishes = db.relationship('Wish',backref=db.backref('member'))

    def __init__(self,userid, email, password ,uname):
       self.userid= userid
       self.email = email
       self.password = password
       self.uname = uname 
       

class Wish(db.Model):
	STATUS= "PENDING"
	PRIORITY= "NORMAL"
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(180))
	description = db.Column(db.String(300))
        thumbnail = db.Column(db.String(400))
        user = db.Column(db.Integer, db.ForeignKey('member.userid'))
        url = db.Column(db.String(400)) 
        priority= db.Column(db.String(20))
        status= db.Column(db.String(20),default=STATUS)
        
        def __init__(self, title,description,thumbnail,user,url,priority):
        	self.title = title
        	self.description = description
        	self.thumbnail = thumbnail
        	self.user = user
        	self.url = url
        	self.priority=priority
        	#self.status= status
       	
        
	def __repr__(self):
		return '<Wish %r>' % self.title
        	   
