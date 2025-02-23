const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");        // ejs-mate is a Node.js package that provides a layout and partial rendering engine for EJS (Embedded JavaScript) templates. It enhances the functionality of EJS by allowing you to use features like layout inheritance
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);     // defining an engine for ejs i.e. ejsMate    // works similar like we did with "includes"

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => console.log("successfully connected"))
    .catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.render("listings/root.ejs");
});

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
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Listing route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Create route
app.post("/listings", wrapAsync(async (req, res, next) => {
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
    const result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error) {      // if error exist in the result then throw error
        throw new ExpressError(400, result.error);
    }
    
    let newListing = new Listing(req.body.listing);

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
    res.redirect("/listings");
}));

// Show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));

// Edit route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

// Update route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
    }
    let { id } = req.params;
    // let listing = req.body.listing;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { status = 500, message = "Some error occurred" } = err;
    res.status(status).render("error.ejs", { message });
});

app.listen(port, () => {
    console.log(`site live on http://localhost:${port}/listings`);
});
