var mongoose              = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


//User Model
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    isAdmin: {
        type: Boolean, 
        default: false
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);