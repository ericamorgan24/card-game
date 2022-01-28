//require modules and data
const express = require('express');
const app = express();
const pug = require('pug');
const mongoose = require("mongoose");
const User = require("./userModel");
const ObjectId = require('mongodb').ObjectID;
//session initialization
const session = require('express-session');
const MongoDBCards = require('connect-mongodb-session')(session);
const cards = new MongoDBCards({
  uri: 'mongodb://localhost:27017/a5',
  collection: 'sessions'
});
app.use(session({secret:'top secret', store: cards}));
//set template engine
app.set("view engine", "pug");
//static server
app.use(express.static("public"));
//body parser
app.use(express.urlencoded({extended: true}));


//request handlers
/*
User is directed to home page
*/
app.get("/", function(req, res, next){
	res.render("pages/home", {loggedin: req.session.loggedin, id: req.session.uid});
});
/*
User is directed to registration page
*/
app.get('/register', auth2, function(req,res,next){
	res.render("pages/register", {loggedin: req.session.loggedin});
});
/*
User is directed to login page
*/
app.get('/login', auth2, function(req,res,next){
	res.render("pages/login", {loggedin: req.session.loggedin});
});
/*
User will be logged out and redirected to home page
*/
app.get('/logout', auth1, function(req,res,next){
	req.session.loggedin = false;
	res.redirect("/");
});
/*
A new user is created if the data is valid and the user doesn't alreay exist.
If user exists, client is notified.
*/
app.post('/register', auth2, express.json(), function(req,res,next){
	//check if data is valid
	if(req.body.username == "" && req.body.password == ""){
		alert("Invalid username and password.");
		return;
	}else if(req.body.username == ""){
		alert("Invalid username.");
		return;
	}else if (req.body.password == ""){
		alert("Invalid password.");
		return;
	}
	//if data is valid, check if user already exists
	User.findOne({username: req.body.username}, function(err, result){
		if(err) throw err;
		if(result == null){
			//generate 10 random cards
			let myCards = db.collection("cards").aggregate([
            {$sample: {size: 10}}]).toArray(function(err, theCards){
            	if(err) throw err;
            	//create new user only if one doesn't exist
				let newUser = new User({username: req.body.username, password: req.body.password, cards: theCards, friends:[], requests:[], trades:[]});
				newUser.save(function(err, result){
					if(err){
						console.log(err.message);
						return;
					}
					console.log(result);
					req.session.loggedin = true;
					req.session.name = result.username;
					res.redirect("/users/"+newUser._id);
					return;
			  	});

            });
		}else{
			res.status(200).send("Username already exists.");
		}
	});
});
/*
User can log in if username exists and if password matches.
*/
app.post('/login', auth2, express.json(), function(req,res,next){
	//check if user already exists
	User.findOne({username: req.body.username}, function(err, result){
		if(err) throw err;
		if(result){
			if(result.password == req.body.password){
				req.session.loggedin = true;
				req.session.name = result.username;
				req.session.uid = result._id;
				res.redirect("/users/"+result._id);
			}else{
				res.status(401).send("Incorrect password.");
			}
		}else{
			res.status(404).send("Username not found.");
		}
	});
});
/*
User is directed to the page of the user with userID.
If user is not found, 404 response is sent.
*/
app.get('/users/:userID', auth1, function(req,res,next){
	//search database for user and direct to page or send 404
	User.findOne({_id: req.params.userID}, function(err, result){
		if(result == null){
			res.status(404).send("Resource not found.");
		}else{
			res.render("pages/user", {result:result, loggedin: req.session.loggedin, id: req.session.uid});
		}
	});
});
/*
User is directed to the page of the card with cardID.
User must be logged in and the owner of the card to view the card.
If card is not found, 404 response is set.
*/
app.get('/cards/:cardID', auth1, function(req,res,next){
	//search database for user and direct to page or send 404
	db.collection("cards").findOne({"_id": ObjectId(req.params.cardID)}, function(err, result){
		if(result){
			res.render("pages/card", {result:result, loggedin: req.session.loggedin, id: req.session.uid});
		}else{
			res.status(404).send("Resource not found.");
		}
	});
});
/*
Finds a list of friends that match the name query parameter.
This list is then sent back to client so that they can make a friend request.
*/
app.get('/friends', auth1, function(req,res,next){
	User.find()
	.where("username").regex(new RegExp(req.query.name, 'i'))
	.exec(function(err, results){
		if(err) throw err;
		res.status(200).send(results);
	});
});

app.post('/friends', auth1, express.json(), function(req,res,next){
	console.log(req.body);
	User.findOne({username: req.session.uid}, function(err, result){
		if(err) throw err;
		if(result){
			//result.requests.push
		}else{
			res.status(404).send("Username not found.");
		}
	});
});

/*
Determines that a client is authorized to view page only if
they are logged in.
*/
function auth1(req, res, next){
	if (req.session.loggedin){
		next();
	}else{
		res.status(404).send("Unauthorized. Must log in.");
	}
}

/*
Determines that a client is authorized to view page only if
they are logged out.
*/
function auth2(req, res, next){
	if (!req.session.loggedin){
		next();
	}else{
		res.status(404).send("Unauthorized. Must log out.");
	}
}

//database and server initialization
mongoose.connect('mongodb://localhost/a5', {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting:'));
db.once('open', function() {
	app.listen(3000);
	console.log("Server listening at http://localhost:3000");
});