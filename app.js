const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");      // no longer required here due to code restructuring (to /routes/...)
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");        // ejs-mate is a Node.js package that provides a layout and partial rendering engine for EJS (Embedded JavaScript) templates. It enhances the functionality of EJS by allowing you to use features like layout inheritance
// const wrapAsync = require("./utils/wrapAsync.js");      // no longer required here due to code restructuring
const ExpressError = require("./utils/ExpressError.js");
// const { listingSchema, reviewSchema } = require("./schema.js");      // no longer required here due to code restructuring
// const Review = require("./models/review.js");      // no longer required here due to code restructuring
const session = require("express-session");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionOptions = {
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,      // By default, no expiration is set, and if not set then delete it on a condition like exiting a web browser application.
        maxAge: 1000 * 60 * 60 * 24 * 7,        // in milliseconds (expires in 7 days)
        httpOnly: true
    }
}

app.use(session(sessionOptions));

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

// app.get("/hello", (req, res) => {
//     res.cookie("greet", "namaste");
//     res.cookie("madeIn", "India");
//     res.cookie("hello", "hi");
//     res.send("sent you some cookies");
// });

// Router Mounting :
// Using app.use() to mount a router at a specific path in your app.
// creates a base URL(common path), and then we can directly use the router to implement a nested URL through it.
app.use("/listings", listings);     // The app will now be able to handle requests to /listings , /listings/new , /listings/:id etc (for the routes of this file listing.js)
app.use("/listings/:id/reviews", reviews);      // listings/:id/reviews and listings/:id/reviews/:reviewId (for the routes of this file review.js)
// :id - mergeParams is used to make this parameter accessible to the router (see routes/review.js , express.Router line)


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
