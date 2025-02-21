const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        default: "https://thumbs.dreamstime.com/b/ocean-beach-sunrise-colorful-75364306.jpg",       // default value when the input is undefined
        set: (v) => v === "" ? "https://thumbs.dreamstime.com/b/ocean-beach-sunrise-colorful-75364306.jpg" : v,         //ternary operator(work same as if else)     // when the value if sent empty
    },
    price: {
        type: Number,
    },
    location: {
        type: String,
    },
    country: {
        type: String,
    },
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;