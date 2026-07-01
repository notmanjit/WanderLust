// Restructured code from app.js
// Listings routes

const express = require("express");
const router = express.Router();    // Creates new router object (middleware)
const wrapAsync = require("../utils/wrapAsync.js");
// const ExpressError = require("../utils/ExpressError.js");
// const { listingSchema } = require("../schema.js");      // Joi Schema
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

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
router.get("/", wrapAsync(listingController.index));

// New Listing route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Create route
router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// Show route
router.get("/:id", wrapAsync(listingController.showListing));

// Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// Update route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;