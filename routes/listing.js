// Restructured code from app.js
// Listings routes

const express = require("express");
const router = express.Router();    // Creates new router object (middleware)
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema } = require("../schema.js");      // Joi Schema
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     })

//     await sampleListing.save()
//     console.log("sample was saved");
//     console.log(sampleListing);
//     res.send("successful testing");
// });

// Index route
router.get("/", wrapAsync(async (req, res) => {     // actual /listings  (see app.js route mounting section)
    // if(req.user) {
    //     console.log(req.user);
    // }
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Listing route
router.get("/new", isLoggedIn, (req, res) => {     // actual /listings/new  (also for all rest of the routes)
    console.log(req.user);      // user object of logged in user
    // console.log(req.session);
    res.render("listings/new.ejs");
});

// Create route
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => {
    // meth1 :
    // let {title, description, image, price, location, country} = req.body;
    // let listing = new Listing({
    //     title: title,
    //     description: description,
    //     image: image,
    //     price: price,
    //     location: location,
    //     country: country,
    // })
    // await listing.save();

    // this is a way of accessing and inserting values. Instead this, a better way is possible
    // by creating "listing" object with the keys see (new.ejs)

    // meth2 :
    // if(!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");
    // }

    // Suppose a case, we are sending the listing object with hoppscotch but only with title and description (not all values) still it will add the listing because we don't have validation for individual fields
    // We have 2 methods to tackle this situation (Method1, Method2)

    // Method2 :
    // const result = listingSchema.validate(req.body);
    // console.log(result);
    // if(result.error) {      // if error exist in the result then throw error
    //     throw new ExpressError(400, result.error);
    // }

    // You can write this Method2 part in a function and pass it as a middleware to this route (already done) see middleware.js

    let newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Method1 :
    // if(!newListing.description) {
    //     throw new ExpressError(400, "Description is missing");
    // }
    // if(!newListing.price) {
    //     throw new ExpressError(400, "Price is missing");
    // }
    // And so on for the rest of the fields...
    // This method is lengthy and requires if condition for all the fields

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}));

// Show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews").populate("owner");
    if (!listing) {
        req.flash("error", "Oops! Listing does not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Oop! Listing does not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

// Update route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    // if (!req.body.listing) {
    //     throw new ExpressError(400, "Send valid data for listing");      // since we are using validateListing function as a middleware, so now validation will be handled by the middleware (this part is no more needed)
    // }
    let { id } = req.params;
    // let listing = req.body.listing;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;