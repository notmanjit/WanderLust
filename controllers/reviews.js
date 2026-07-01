// Following the MVC (Model, View, Controller)

const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {        // actual /listings/:id/reviews  (see app.js route mounting section)
    // console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    // console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {        // actual /listings/:id/reviews/:reviewId
    let { id, reviewId } = req.params;
    let listing = await Listing.findById(id);

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })   // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);

};