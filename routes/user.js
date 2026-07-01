const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

router.get("/signup", userController.renderSignupForm);

router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.renderLoginForm);

// Passport provides an authenticate() function, which is used as route middleware that checks the username and password (authenticate requests) using Passport's local strategy.
// failureRedirect: If login fails, it redirects back to "/login". failureFlash: flashes an error message (true for default message or you can add a custom string). (there are more options like successRedirect, successFlash, etc)
router.post("/login", saveRedirectUrl, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.login);      // if login is successful, it will call the next middleware (userController.login) which will redirect to "/listings" or the saved redirectUrl

router.get("/logout", userController.logout);

module.exports = router;