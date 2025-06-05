module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {        // checks if user is authenticated or not before creating, updating or deleting (checks through req.user if user object is present)
        req.session.redirectUrl = req.originalUrl;      // the session data will be erased after login, before that we had to save req.session.redirectUrl somewhere to set the redirect after login (ex: req.originalUrl = "/listings/new" or "/listings/6771686bcae4ea1bc3ddcb13/edit")
        req.flash("error", "Oops! You are not logged in");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {      // pass this middleware before user authenticate middleware in the post "login" route otherwise the session data will erase and so the res.locals.redirectUrl (undefinded)
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;   // saved in locals
    }
    next();
};