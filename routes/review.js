// Restructured code from app.js
// Reviews routes

const express = require("express");
const router = express.Router({ mergeParams: true });    // the parent route /listing/:id/reviews has path parameters, it will not be accessible by default from the sub-routes (review routes). To make it accessible, you will need to pass the mergeParams option to the Router
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");       // Joi Schema
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Review schema validation function (sever side)
const validateReview = (req, res, next) => {
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

// Reviews
// Post review route
router.post("/", validateReview, wrapAsync(async (req, res) => {        // actual /listings/:id/reviews  (see app.js route mounting section)
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

// Delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {        // actual /listings/:id/reviews/:reviewId
    let { id, reviewId } = req.params;
    let listing = await Listing.findById(id);

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })   // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);

}))

module.exports = router;