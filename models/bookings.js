let mongoose = require("mongoose");

//Post Schema
let bookingsSchema = mongoose.Schema({
    bookingDate: {type: Date, required: true},
    numberBookings: {type: Number, required: true}
});

module.exports = mongoose.model("Bookings", bookingsSchema);