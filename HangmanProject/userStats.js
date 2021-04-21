var events = require("events");
let dbManager = require('./dbManager');
//let user = dbManager.get().collection("user");
//create class with functions to help with tracking user statistics.

//function to create new user class
class User extends events{
    constructor(username, password, best_time, win_counter, loss_counter){
        super();
        
        //check if user already exists
        if(!noDuplicateUser(username)){ //if user does not already exist
            this.username = username;
            //fix with encrypted password later
            //this.password = ;
            this.best_time = 0;
            this.win_counter = 0;
            this.loss_counter = 0;
        }

    };
    //search function to see if user already exists
    noDuplicateUser(username){
        var val = username;
        let searchDoc = { prop : [val] };
        let cursor = user.find(searchDoc, {projection: { username: 1 }});
        if (cursor.count() > 0){
            console.log("That username already exists.");
            //insert error page info here
            return false;
        }
    }


    //function for existing user login
    welcomeBack(){

    }
    //function to increment win counter
    anotherWin(curUser){
        var val = curUser;
        let searchDoc = { [prop] : val };
        let cursor = user.find(searchDoc, {projection: { username: 1, win_counter: 1 }});
        if (cursor.count() > 0){
            //update win counter

        } else{
            //error
        }
    }
    //function to increment loss counter
    anotherLoss(curUser){

    }
    //function to update best time if new time > current best time 
    newTime(curUser){

    }
};

module.exports = User;