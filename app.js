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
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => console.log("successfully connected"))
    .catch((err) => console.log(err));


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.engine("ejs", ejsMate);     // defining an engine for ejs i.e. ejsMate    // works similar like we did with "includes"

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
app.use(flash());

app.use(passport.initialize());     // initializes Passport in your Express application (required for authentication)
app.use(passport.session());        // allows to keep users logged in between requests by using cookies and sessions. Without this, login sessions won't work, and users would have to log in on every request.

passport.use(new LocalStrategy(User.authenticate()));   // This sets up the Local Strategy for authentication using a username and password. Here, User.authenticate() is a method provided by passport-local-mongoose that checks the user's credentials. It handles hashing, comparing passwords, and finding the user in the database.
passport.serializeUser(User.serializeUser());       // When a user logs in, serializeUser() stores the user's ID (here i.e. MongoDB _id) into the session cookie to keep it lightweight
passport.deserializeUser(User.deserializeUser());   // Uses the stored user ID from the session to retrieve the full user object from the database on every request, attaching it to req.user (holds full user object for that route).

app.use((req, res, next) => {
    res.locals.success = req.flash("success");  // storing in locals and we can use it in index.ejs (like <%= success %>) but we will write it in boilerplate.ejs and access using includes (reason given in "flash.ejs")
    // console.log(res.locals.success);
    res.locals.error = req.flash("error");
    // console.log(res.locals.error);
    res.locals.currUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("listings/root.ejs");
});

// Demo User Registration --
// app.get("/registerUser", async(req, res) => {
//     let fakeUser = new User({
//         email: "abc@gmail.com",
//         username: "student"
//     });
//     let newUser = await User.register(fakeUser, "helloworld");
//     res.send(newUser);
// });


// Router Mounting :
// Using app.use() to mount a router at a specific path in your app.
// creates a base URL(common path), and then we can directly use the router to implement a nested URL through it.
app.use("/listings", listingRouter);     // The app will now be able to handle requests to /listings , /listings/new , /listings/:id etc (for the routes of this file listing.js)
app.use("/listings/:id/reviews", reviewRouter);      // listings/:id/reviews and listings/:id/reviews/:reviewId (for the routes of this file review.js)
// :id - mergeParams is used to make this parameter accessible to the router (see routes/review.js , express.Router line)
app.use("/", userRouter);


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
