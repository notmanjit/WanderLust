// Restructured code from app.js
// Reviews routes

const express = require("express");
const router = express.Router({ mergeParams: true });    // the parent route /listing/:id/reviews has path parameters(:id), it will not be accessible by default from the sub-routes (review routes). To make it accessible, you will need to pass the mergeParams option to the Router
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { reviewSchema } = require("../schema.js");       // Joi Schema
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// Reviews
// Post review route
router.post("/", isLoggedIn ,validateReview, wrapAsync(reviewController.createReview));

// Delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;