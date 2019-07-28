# Node.js Booking Server

This server allows you to make a booking for an hourly timeslot. Timeslot available for booking is between 2 days to 7 days from today, and the time allowed is between 9AM and 3PM. Each hour of timeslot allows for a maximum of 6 bookings.

## How to run the application:

_Note: Make sure you have installed Node.js and NPM on your machine. If you haven't, please go to [Node.js](https://nodejs.org "Node.js")
to install. NPM will automatically be installed on your machine when your are installing Node.js. You would also need to install MongoDB on your machine_.

1. In the directory, run `npm install`.
2. Run `node app.js`.
3. Utilize the API below to interact with the server.

## APIs:
GET Request: 
1. Make a HTTP GET request to the route "/bookings", eg. localhost:3000/bookings.
2. You should see all the timeslot between 2 days and 7 days (9AM to 3PM) from today. Each hourly timeslot has a corresponding value which shows the available bookings left that you can make for that timeslot.

POST Request: 
1. Make a HTTP POST request to the route "/bookings", eg. localhost:3000/bookings.
2. The body of the POST request should be in the following **JSON format**: {"date": "2019-08-02","time": 11,"increment": -1}. This JSON is only an example, and you may change the value for each property. Remember that "date" should be a string type between 2 days and 7 days from today, "time" is a number type that should be a whole number between 9 to 2 (inclusive), and "increment" should be either -1 or 1 only, to imply the decrease or increase of a booking.
3. If your request is valid, the server will return a "updated successfully" statement. Otherwise, it will return a HTTP 403 status code, together with a message that explain what goes wrong.

