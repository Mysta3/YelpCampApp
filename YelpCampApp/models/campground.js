//must be required
var mongoose = require('mongoose');

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
	name: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

//Model Setup, exporting module
module.exports = mongoose.model("Campground", campgroundSchema);