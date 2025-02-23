// Joi - to validate our schema
// It is a npm package (install it)

// With the help of Joi we define our schema
// and it's not mongoose schema, it is for our sever side validation schema

const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),  // min(0) to avoid negative values
        country: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.string().allow("", null),    // its not required because mongoose is sending a default value so it allow empty string("") and also null values
    }).required()
});

