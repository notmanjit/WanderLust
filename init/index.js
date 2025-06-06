const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initData = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
.then(() => console.log("successfully connected"))
.catch((err) => console.log(err));

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "68348a301e5a173d2ffa35e9"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();