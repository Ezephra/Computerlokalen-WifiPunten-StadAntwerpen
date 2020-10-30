const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load User Model
const User = require('./models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
            // Check User
            User.findOne({email: email})
            .then(user => {
                // Check if there is an user with the given email
                if (!user) {
                    return done(null, false, { message: 'Het ingegeven e-mailadres bestaat niet'});
                }
                // Check if password is correct
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'Wachtwoord is niet correct'});
                    }
                });
            })
            .catch(err => console.log(err));

            // SERIALIZING AND DESERIALIZING USER
            passport.serializeUser((user, done) => {
                done(null, user.id);
            });

            passport.deserializeUser((id, done) => {
                User.findById(id, (err, user) => {
                    done(err, user);
                });
            });
        })
    )
}
