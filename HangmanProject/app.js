/* app.js
Ryan McConnell
April 2021*/

var http = require("http");
var qString = require("querystring");
var path = require("path");
//var random = require('random');
var Math = require('mathjs');
let dbManager = require('./dbManager');
let express = require("express");
let app = express();
var ObjectID = require('mongodb').ObjectId;
var userRoute = require('./routes/userRoute.js')
//mongoose model stuff
let mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
//potential routes??

//login stuff
let session = require('express-session');
let crypto = require('crypto');
const users = require('./models/userSchema.js');
const hints = require('./models/hintSchema.js');
const words = require('./models/wordSchema.js');

//function for hashing passwords
function genHash(input){
    return Buffer.from(crypto.createHash('sha256').update(input).digest('base32')).toString('hex').toUpperCase();
}

//random function 
function getRand(){
    var rand = Math.floor((Math.random() * 10000) + 1);
    return rand;
}

//FUNCTIONS TO UPDATE DB IF SOMEONE IS LOGGED IN
//function to increment win or loss counter for current user at end of game
var endgameStatus = true;
function updateCounter(curUser, endgameStatus){
    if (endgameStatus){ //if endgame status is true, they win
        users.findOneAndUpdate({_id: curUser }, {$inc: { win_counter : 1}})
    }else{ //if false then they lost
        users.findOneAndUpdate({_id: curUser }, {$inc: { loss_counter : 1}})
    }
}
//function to update best_time for logged in user
function updateTime(curUser, timeTest){
    //get best time from user db and convert to seconds
    //then compare to time from the game they just finished
    //if timeTest < current best_time, make timeTest the new best time for user
    let result = users.findOne({_id : curUser});
    if (timeTest < result.best_time){
        users.findOneAndUpdate({_id: curUser}, {best_time : timeTest})
    }
}

//DOCIFY FUNCTIONS
//docify function for word submission
//UNFINISHED. Add random var for hintlist and var for current user
//user var should be req.session.user
function docifyWord(params, hintID){
    let doc = { word: params.word.toString().toLowerCase(), hintList: [hintID], submittedBy: '' }
    return doc;
};
//docify function for new user info.
function docifyUser(params){
    let doc = new users({ _id: params.userName, password: genHash(params.pass)})
    return doc;
};
//docify function for hint submission
//UNFINSHED. Add random var for hint id and var for current user
//user var should be req.session.user
function docifyHint(params, hintID){
    let doc = { hint: params.hint.toString(), hint_id: hintID, submittedBy: ''};
    return doc;
};

//PAGES
var postParams;
function moveOn(postData){
    let proceed = true;
    postParams = qString.parse(postData);
    //handle empty data
    for (property in postParams){
	if (postParams[property].toString().trim() == ''){
	    proceed = false;
	}
    }

    return proceed;
}
//handle views and dir
app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public'))); //join path of dir to public folder
app.use('/user', userRoute);
app.use(session({
    secret: 'titan',
    saveUninitialized: false,
    resave: false
}))

//GET ROUTES
app.get('/', function (req, res){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        //console.log(req.session.user); <- does return logged in user's name. Implement into web pages if time allows
        res.end('<html><body><br><br><a href="/wordSubmit">   Word Submission   </a>&emsp;&emsp;\
        <a href="/hintSubmit">   Hint Submission   </a>&emsp;&emsp;\
        <a href="/leaderboard">   Leaderboards   </a>&emsp;&emsp;\
        <a href="/logout">   Log out   </a></body></html>');
    }
}); 
app.get('/login', function(req, res, next){
	if(req.session.user){
		res.redirect('/');
	} else{
		res.render('login');
	}
});
app.get('/logout', function(req, res){
    if(req.session.user){
        req.session.destroy();
        res.render('login', {msg: "Successfully logged out! Bye-bye~"})
    } else{
        res.render('login', {msg: "You got to log in to log out"})
    }
})
app.get('/createUser', function(req, res, next){
    if(req.session.user){
        res.redirect('/');
    }else{
        res.render('createUser');
    }
    
})
app.get('/wordSubmit', function(req, res, next){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        res.render('wordSubmit');
    }
});
app.get('/hintSubmit', function(req, res, next){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        res.render('hintSubmit');
    }
});
app.get('/leaderboard', function(req, res, next){
    if(!req.session.user){
		res.redirect('/login');
	} else{
        res.render('leaderboard');
    }
});

//POST ROUTES
var postData;
app.post('/login', express.urlencoded({extended: false}), async (req, res, next)=>{
	let untrusted = {user: req.body.userName, password: genHash(req.body.pass)}
	    try{
		    let result = await users.findOne({_id: req.body.userName})
            console.log(result); //just to make sure things are working
            console.log(untrusted)//yep it works
		    if (untrusted.password.toString().toLowerCase() == result.password.toString().toLowerCase()){
			    let trusted={name: result._id.toString()}
			    req.session.user=trusted;
			    res.redirect('/')
		    }else{
			    res.render('login', {msg: "Password does not match records!"})
		    }
	    }catch (err){
		    next(err)
	    }
})
app.post('/createUser', function(req, res){
    postData = '';
    req.on('data', (data) =>{
	postData+=data;
    });
    req.on('end', async ()=>{
	    postParams = qString.parse(postData)
        try{
            //console.log(postParams.userName);
            //console.log(postParams.pass); <-used to make sure it caught the right values
            let curDoc = docifyUser(postParams);
            await curDoc.save();
            console.log("Added " + postParams.userName + " to db");
            //below checks if they are now present in db and proceeds to log them in
            let result = await users.findOne({_id: postParams.userName})
            console.log(result);
            let trusted={name: result._id.toString()};
            req.session.user=trusted;
            res.redirect('/')
        }catch (err){
            res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
        }
    })
})
app.post('/wordSubmit', function(req, res){
    postData = '';
    req.on('data', (data) =>{
        postData+=data;
    });
    req.on('end', async()=>{
        try{
            //insert functionality when word/hint functions are made
        } catch (err){
            res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
        }
    })
})
app.post('/hintSubmit', function(req, res){
    postData = '';
    req.on('data', (data) =>{
        postData+=data;
    });
    req.on('end', async()=>{
        try{
            //insert functionality when word/hint functions are made
        } catch (err){
            res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
        }
    })
})
//Insert leaderboard sort POST here. UPDATE: Yay its done
app.post('/leaderboard', function(req, res){
    postData = '';
    req.on('data', (data)=>{
        postData+=data;
    });
    req.on('end', async() =>{
        console.log(postData)
        if(moveOn(postData)){
            var prop = postParams.prop;
            //console.log(prop);//<- returns prop correctly
            try{
                var cursor;
                //sort top 5 of whatever value
                if(prop == "win_counter"){
                    cursor = await users.find({}).sort({win_counter: -1}).limit(5);
                    //console.log(cursor);
                } else if(prop == "loss_counter"){
                    cursor = await users.find({}).sort({loss_counter: -1}).limit(5);
                    //console.log(cursor);
                }
                //since its by lowest times, sort is ascending
                else if(prop == "best_time"){
                    cursor = await users.find({}).sort({best_time: 1}).limit(5);
                    //console.log(cursor);
                }
                let data = [];
                await cursor.forEach((item) => {
                    let curInfo={};
                    curInfo._id = item._id;
                    curInfo.best_time = item.best_time;
                    curInfo.win_counter = item.win_counter;
                    curInfo.loss_counter = item.loss_counter;
                    data.push(curInfo);
                    //console.log(curInfo);
                    console.log(data)
                });
                let result = {dataArr: data, prop: prop};
                //console.log(result)
                res.render('leaderboard', {results: result});
            }catch(err){
                res.status(500).render('error', {message: err.message})
            }
        }else{
            res.render('leaderboard');
        }
    })
})

//error stuff
app.use('*', function(req, res){
    res.writeHead(404);
    res.end(`<h1> ERROR 404. ${req.url} NOT FOUND</h1><br><br>`);
});
app.use((err, req, res, next)=>{
	res.status(500).render('error', {message: err.message})
})

//Express listen function
app.listen(7000, async()=>{
    //try to start and wait for database
    //HangmanDB contains users, words, and hints collections
    try{
        await mongoose.connect('mongodb://localhost:27017/HangmanDB', {useNewUrlParser: true, useUnifiedTopology: true });
        //await dbManager.get("HangmanDB")
    } catch(e){
        console.log(e.message);
    }
    console.log("Server is running...");
} );