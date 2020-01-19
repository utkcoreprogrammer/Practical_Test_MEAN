

const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const port = 9090;
var users = [];

const app = express();

app.use(bodyParser.json());

const MongoClient = mongodb.MongoClient;
MongoClient.connect('mongodb://localhost:27017/test', (err, Database) => {
    if(err) {
        console.log(err);
        return false;
    }
    const db = Database.db("test");
    users = db.collection("user");
    console.log("Connected to MongoDB");
    const server = app.listen(port, () => {
        console.log("Server started on port " + port + "...");
    });

});

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin' , 'http://localhost:4200');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append("Access-Control-Allow-Headers", "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    res.append('Access-Control-Allow-Credentials', true);
        console.log('users@@@@@@@@@',users);
        users.find({}).toArray((err, users) => {
    	console.log('check role middleware');
        if(err){
        	console.log("err in user auth", err);
        	res.send(err);
        }	
    	if(users && users.length){
	        users.forEach((user) => {
	    	    console.log('inside users.forEach');
	            if((user.role =='Admin')) {
	            	console.log('user role admin')
	            	next();
	            } else {
	            	console.log('user not authorized');
	               res.json({msg: 'User not authorized to access'});
	             }
	        });	
    	} else{
    		next();
    	}
    });
    // next();
});


app.post('/user/register', (req, res, next) => {
    let user = req.body;
	console.log("inside user/register>>>", user);
    let count = 0;    
    users.find({}, (err, Users) => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        for(let i = 0; i < Users.length; i++){
        	console.log(Users.length, '####################');
            if(Users[i].email == user.email)
            count++;
        }
        // Add user if not already signed up
        if(count == 0){
            users.insertOne(user, (err, User) => {
                if(err){
                    res.send(err);
                }
                res.json(User);
            });
        }
        else {
            // Alert message logic here
            res.json({ user_already_signed_up: true });
        }
    });
    
});

app.post('/user/update', (req, res) => {
    let isPresent = false;
    let correctPassword = false;
    let loggedInUser;
    console.log('inside user/auth');

    users.find({}).toArray((err, users) => {
        if(err){
        	console.log("err in user auth", err);
        	res.send(err);
        }	users.forEach((user) => {
        	    console.log('inside users.forEach');

            if((user.email == req.body.email)) {
                isPresent = true;
                loggedInUser = {
           	    	email: user.email
        	   }    
            } else {
                    isPresent = false;
            }
        });
            res.json({ isPresent: isPresent, user: loggedInUser });
    });
});

