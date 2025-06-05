const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res) => {
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
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

// Passport provides an authenticate() function, which is used as route middleware that checks the username and password (authenticate requests) using Passport's local strategy.
// failureRedirect: If login fails, it redirects back to "/login". failureFlash: flashes an error message (true for default message or you can add a custom string). (there are more options like successRedirect, successFlash, etc)
router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), async (req, res) => {
    req.flash("success", "Welcome to Wanderlust");
    let redirectUrl = res.locals.redirectUrl || "/listings";    // in direct login redirected to "/listings" because res.locals.redirectUrl will be "undefined" in that case
    res.redirect(redirectUrl);
});

router.get("/logout", async (req, res, next) => {
    req.logout((err) => {       // passport have a req.logout method. This method takes a callback as an argument (checks error)
        if(err) {
            return next(err);
        }
    });
    req.flash("success", "You are logged out");
    res.redirect("/listings");
});

module.exports = router;