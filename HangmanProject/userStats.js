var events = require("events");
let dbManager = require('./dbManager');
//create class with functions to help with tracking user statistics.

//function to create new user class
class User extends events{
    constructor(username, password, best_time, win_counter, loss_counter){
        super();
        //check if user already exists
        if(!userExists(cursor)){ //if user does not already exist
            this.username = username;
            this.password = password;
            this.best_time = 0;
            this.win_counter = 0;
            this.loss_counter = 0;
        }

    };
    //search function to see if user already exists
    //update: I know this function is redundant now that login stuff is added, but
    //I'll fix later
    userExists(cursor){
        //move commented out code to app.js
        //let searchDoc = { prop : [val] };
        //let cursor = user.find(searchDoc, {projection: { username: 1 }});
        if (cursor.count() > 0){
            console.log("That username already exists, so welcome them back.");
            return true;
        }else{
            console.log("User not found. Let's try to add them!")
            return false;
        }
    }

    //function to increment win counter
    anotherWin(cursor, curUser, curWins){
        //move commented out code to app.js
        //var val = curUser;
        //let searchDoc = { [prop] : val };
        //let cursor = user.find(searchDoc, {projection: { username: 1, win_counter: 1 }});
        curWins++;
    }
    //function to increment loss counter
    anotherLoss(cursor, curUser, curLosses){
        curLosses++;
    }
    //function to update best time if new time > current best time 
    newTime(cursor, curUser, curTime){
        
    }
};

module.exports = User;