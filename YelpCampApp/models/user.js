var mongoose              = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');



//User Model
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: {
        type: String, 
        unique: true, 
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: { 
        type: String, 
        default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNJJJF3UZxmQ189Jv3hkpvsymvs-g7aquSOvJos7Mn54fGEGn4&s' 
    },
    isAdmin: {
        type: Boolean, 
        default: false
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);