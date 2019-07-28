// Import dependencies
let express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose");

// Import Mongoose model and connect to MongoDB
let Bookings        = require("./models/bookings");
mongoose.connect("mongodb://localhost/bookings", { useNewUrlParser: true });

// Parse body of Post request 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended:true}));

//HTTP GET Route
app.get('/bookings', function(req,res){

    //Find date for two and seven days later from today
    let twoDaysDate     = new Date(),
        sevenDaysDate   = new Date();
    twoDaysDate.setDate(twoDaysDate.getDate() + 2); 
    sevenDaysDate.setDate(sevenDaysDate.getDate() + 7); 

    // Reset dates to 9AM and 3PM
    twoDaysDate.setHours(9,0,0);
    sevenDaysDate.setHours(15,0,0);

    //Create object that stores an array, which shows the available slots for all booking time
    let bookingAvailableTime = {availableSlots:[]};

    Bookings.find({bookingDate: {$gte: twoDaysDate, $lt: sevenDaysDate}}, function (err, bookings) { 
        if (err) return console.log(err);
        
        //Loop through day 2 to day 7
        for (let i = 2; i <= 7; i++) {

            //Create date object starting from day 2 and repeat until day 7
            let calculateDay = new Date()
            calculateDay.setDate(calculateDay.getDate() + i); 

            //Loop through 9AM to 2PM (6 hours)
            for (let j = 9; j <= 14; j++){
                calculateDay.setHours(j, 0, 0);
                
                //Check if there is existing booking for the time
                let bookingObject = bookings.find((bookings) => {
                    let strBooking = bookings.bookingDate.getTime();
                    let bookingDateSecond = strBooking.toString().substr(0, strBooking.toString().length - 3);
                    let strDay = calculateDay.getTime();
                    let calDay = strDay.toString().substr(0, strDay.toString().length - 3);

                    return (bookingDateSecond === calDay);
                }); 
                    
                if (bookingObject){
                    let numberAvailableBookings = 6 - bookingObject.numberBookings;
                    bookingAvailableTime.availableSlots.push([calculateDay.toString(), numberAvailableBookings]);
                } else {
                    bookingAvailableTime.availableSlots.push([calculateDay.toString(), 6]);
                }

            }
        }
        
        //Send available booking time back
        res.json(bookingAvailableTime);

    });

});

//HTTP POST Route
app.post('/bookings', function(req,res){

    let userBookingDate = req.body.date;
    let userBookingTime = req.body.time;
    let increment       = req.body.increment;

    //Find date for two and seven days later from today
    let twoDaysDate     = new Date(),
        sevenDaysDate   = new Date();
    twoDaysDate.setDate(twoDaysDate.getDate() + 2); 
    sevenDaysDate.setDate(sevenDaysDate.getDate() + 7); 

    // Reset dates to 9AM and 3PM
    twoDaysDate.setHours(9,0,0);
    sevenDaysDate.setHours(15,0,0);

    //Check if user time input is between 9AM to 3PM
    let timeArray = [9,10,11,12,13,14]
    if (!(timeArray.includes(userBookingTime))){
        res.status(403).send('Invalid request. Please ensure the time input is between 9AM to 2PM inclusive.');
    } else {
        //Create actual Date object for schedule booking based on user POST info
        //Create another Date object that is one hour ahead of the actual one
        let bookingDate         = new Date(userBookingDate);
        let bookingDateOneHour  = new Date(userBookingDate);
        bookingDate.setHours(userBookingTime, 0, 0);
        bookingDateOneHour.setHours(userBookingTime + 1, 0, 0);

        //Create epoch time
        let epochTwoDays = twoDaysDate.getTime();
        let epochSevenDays = sevenDaysDate.getTime();
        let epochBookingDays = bookingDate.getTime();

        if (epochBookingDays < epochTwoDays || epochBookingDays >= epochSevenDays){
            res.status(403).send('Invalid request. Please ensure the date is between 2 days and 7 days from today.');
        } else {
            //Search in MongoDB if booking exist
            //The in-between search is used instead of exact search, because there might be inaccuracy in millisecond during storing of data
            Bookings.find({bookingDate: {$gte: bookingDate, $lt: bookingDateOneHour}}, function (err, bookings) {

                if (err) return console.log(err);

                if (bookings.length === 0) {

                    if (increment !== 1) {
                        //Send 403 because server cannot fulfill request
                        res.status(403).send('Invalid request. Please ensure you do not exceed the limit of 6 for each timeslot, or ensure booking exist if you are trying to decrease it');
                    } else {
                        let newBooking = new Bookings({
                            bookingDate: bookingDate,
                            numberBookings: increment
                        })
                        newBooking.save(err => {
                            if (err) {console.log(err)}
                            else {
                                res.status(200).send('Updated successfully.')
                            }
                        });
                    }

                } else if (bookings[0].numberBookings === 6){

                    if (increment !== -1) {
                        //Send 403 because server cannot fulfill request
                        res.status(403).send('Invalid request. Please ensure you do not exceed the limit of 6 for each timeslot, or ensure booking exist if you are trying to decrease it');
                    } else {
                        let bookingObject = bookings[0];
                        bookingObject.numberBookings = bookingObject.numberBookings + increment;

                        bookingObject.save(err => {
                            if (err) {console.log(err)}
                            else {
                                res.status(200).send('Updated successfully.')
                            }
                        });
                    }

                } else {

                    if (!(increment === 1 || increment === -1)) {
                        //Send 403 because server cannot fulfill request
                        res.status(403).send('Invalid request. You can only increase or decrease a booking one at a time.');
                    } else {
                        let bookingObject = bookings[0];
                        bookingObject.numberBookings = bookingObject.numberBookings + increment;

                        if (bookingObject.numberBookings === 0){
                            let bookingID = bookingObject._id;
                            Bookings.findByIdAndRemove(bookingID, (err) => {
                                if (err) {console.log(err)}
                                else {
                                    res.status(200).send('Updated successfully.')
                                }
                            });
                        } else {
                            bookingObject.save(err => {
                                if (err) {console.log(err)}
                                else {
                                    res.status(200).send('Updated successfully.')
                                }
                            });
                        }
                    }

                }

            });

        }

    }

});


//Start listen to client request
let server = app.listen(3000, function (){
    let port = server.address().port;
    console.log(`Server listening at PORT ${port}`);
});