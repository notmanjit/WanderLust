// Following the MVC (Model, View, Controller)

const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);      // register(user, password, callback) Convenience method to register a new user instance with a given password. Checks if username is unique.
        console.log(registeredUser);
        req.login(registeredUser, (err) => {        // req.login() automatically log in the newly registered user (after signup)
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";    // in direct login redirected to "/listings" because res.locals.redirectUrl will be "undefined" in that case
    res.redirect(redirectUrl);
};

module.exports.logout = async (req, res, next) => {
    req.logout((err) => {       // passport have a req.logout method. This method takes a callback as an argument (checks error)
        if(err) {
            return next(err);
        }
    });
    req.flash("success", "You are logged out");
    res.redirect("/listings");
};