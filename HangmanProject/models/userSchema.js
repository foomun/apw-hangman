let mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: [true, 'Please provide a username for yourself']
    },
    password: {
        type: String,
        required: [true, 'Do you want people to steal your identity?']
    },
    best_time: Number,
    win_counter: Number,
    loss_counter: Number
});
const users=mongoose.model('User', userSchema, 'user');
//Hi! if you are reading this, let it be known I went insane for an hour wondering why I
//was in a state of existing and not existing when trying to log in. It was because the
//mongoose model couldn't find the a collection. wahoo... - Ryan

module.exports = users;