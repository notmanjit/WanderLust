const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");       // Joi Schema

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

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "Unauthorised Listing, Only owner can access");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

// Listing schema validation function (sever side)
// Writing Method2 function and passing as middleware
module.exports.validateListing = (req, res, next) => {
    // const result = listingSchema.validate(req.body);
    // console.log(result);
    const { error } = listingSchema.validate(req.body);
    // console.log(error);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// Review schema validation function (sever side)
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    // console.log(error);
    if (error) {
        let errMsg = error.details.map(el => el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "Unauthorised access, You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    };
    next();
};