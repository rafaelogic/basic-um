const passport = require('passport');
const mongoose = require('mongoose');

module.exports = function() {
    const User = mongoose.model('User');

    //When user is authenticated will save its _id property to the session
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    //Will use _id property to grab the user object from the database
    //'-password -salt' field option argument is used so that mongoose
    //doesn't fetch the user's password and salt properties
    passport.deserializeUser((id, done) => {
        User.findOne({
            _id: id
        }, '-password -salt', (err, user) => {
            done(err, user);
        });
    });

    //Load strategies configuration file
    require('./strategies/local')();
};