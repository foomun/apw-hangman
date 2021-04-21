/* app.js
Ryan McConnell
April 2021*/

//INSERT var for userstats!!! <- Hello future me look here
var http = require("http");
var qString = require("querystring");
var path = require("path");
let dbManager = require('./dbManager');
let express = require("express");
let app = express();
var ObjectID = require('mongodb').ObjectId;
//potential routes??

//DOCIFY FUNCTIONS
//docify function for word submission
//UNFINISHED. Add random var for hintlist and var for current user
function docifyWord(params){
    let doc = { word: params.word.toString().toLowerCase(), hintList: [], submittedBy: user }
    return doc;
};
//docify function for new user info
//UNFINISHED. Update whenever learn about login page handling/ password encryption
function docifyUser(params){
    let doc = { username: params.username.toString(), password: "", best_time: 0, win_counter: 0, loss_counter: 0}
    return doc;
};
//docify function for hint submission
//UNFINSHED. Add random var for hint id and var for current user
function docifyHint(params){
    let doc = { hint: params.hint.toString(), hint_id: "", submittedBy: user};
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

//GET ROUTES
app.get('/', function (req, res){
    res.end('<html><body><br><br><a href="/wordSubmit">Word Submission</a>&emsp;&emsp;\
    <a href="/hintSubmit">Hint Submission</a>&emsp;&emsp;\
    <a href="/leaderboard">Leaderboards</a></body></html>');
}); 
app.get('/wordSubmit', function(req, res, next){
    res.render('wordSubmit');
});

//POST ROUTES
var postData;
app.post('/wordSubmit', function(req, res){
    postData = '';
    req.on('data', (data) =>{
        postData+=data;
    });
    try{
        
    } catch (err){
        res.status(500).render('error', {message: `That ain't good... \n ${err.message}`})
    }
})

//Express listen function
app.listen(7000, async()=>{
    //try to start and wait for database
    //HangmanDB contains users, words, and hints collections
    try{
        await dbManager.get("HangmanDB")
    } catch(e){
        console.log(e.message);
    }
} );