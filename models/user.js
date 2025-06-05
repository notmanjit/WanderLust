const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");   // Passport-Local Mongoose is a Mongoose plugin that simplifies building username and password login with Passport.

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
    // username, hash & salt are automatically added by the plugin
});

userSchema.plugin(passportLocalMongoose);   // adds fields and methods like username, hash & salt automatically to your Mongoose schema (userSchema) to make user authentication easier when using Passport.js.

module.exports = mongoose.model("User", userSchema);