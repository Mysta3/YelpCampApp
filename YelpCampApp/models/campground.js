//must be required
var mongoose = require('mongoose');

//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    imageId: String,
    description: String,
    location: String,
    createdAt: { 
            type: Date, 
            default: Date.now 
        },
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