// SERVER-SIDE PROGRAM THAT RUNS OUTSIDE OF THE BROWSER
// loading in the Express module
const express = require('express')
// loading in the pg module (a PostgreSQL client)
const { Pool } = require('pg')
// const { Client } = require('pg');
// Use dotenv to read.env vars into Node
require('dotenv').config();
// destructure the env variables
// const USER = 'readonly'
const { PGHOST, PGPORT, PGDATABASE, PGPASSWORD } = process.env;
console.log(PGHOST, PGPORT, PGDATABASE, PGPASSWORD);

// TASK: implement rate-limiting on all API endpoints


// the app object denotes the Express application
// express fxn returns an object that can be used to configure routes for the application
// use app to define different routes
// the object includes get(), post(), put() and delete() methods to define routes
const app = express()
// configs come from standard PostgreSQL env vars
 
// connection pool
// strategy that uses a cache (or pool) of connections that are kept open on the database server and re-used by different client requests is known as connection pooling
// A connection is like a wire that connects your application to your database.
const pool = new Pool()

// pool.query -> When you ask the pool for a connection, it will either give you a 'wire' it already has in place or create a new wire to the database
// When you release() a pooled connection, the pool reclaims it, but keeps it in place for a while in case you need it again
// pool.query() is shortcut for pool.getConnection() + connection.query() + connection.release()
// The api for executing queries supports both callbacks and promises
const queryHandler = (req, res, next) => {

  // the following is an example of the req.sqlQuery being passed into the pool.query() connection request
  // it is the request query being sent to the database
  // one of these gets passed into the query each time app.get needs to get info from the DB (when the queryHandler gets called)

  // req.sqlQuery = `
  // SELECT date, hour, events
  // FROM public.hourly_events
  // ORDER BY date, hour
  // LIMIT 168;
  // `

  pool.query(req.sqlQuery).then((r) => {
    // console.log(res.json(r.rows || []))
    return res.json(r.rows || [])
  }).catch(next)
}
// Routing -> how an application’s endpoints (URIs) respond to client requests
// You define routing using methods of the Express app object that correspond to HTTP methods -> i.e. app.get() to handle GET requets, app.post() to handle POST requests, app.all() handles all HTTP methods
// the methods are attached to an instance of the express class (app)
// These routing methods take a callback function (sometimes called the “handler functions”) that is called when the application receives a request to the specified route (endpoint) and HTTP method
// the application “listens” for requests that match the specified route(s) and method(s), and when it detects a match, it calls the specified callback function
// the routing methods can have more than one callback function as arguments
// With multiple callback functions, it is important to provide next as an argument to the callback function and then call next() within the body of the function to hand off control to the next callback
// app.all(), app.get(), app.post(), app.delete() and app.put() methods are all used to define routes. 
// these methods all handle different types of HTTP request
// A route is used to handle an HTTP request.
// A route is a combination of a path and callback, which is executed when a request’s path is matched. The callback is called as the route handler.
// Every route handler get a reference to the request and response object of the HTTP request that is currently being served
// NOTE: A route handler must end the request or call the next route handler
// Here we do not need next(), b/c res.send will end the Request-Response cycle
// respond with 'Welcom...' when a get request is made to the homepage (root route = '/')
app.get('/', (req, res) => {
  res.send('Welcome to EQ Works 😎')
})

// in an app GET method The first parameter is a path of a route which will start after the base URL.
// the second parameter is a callback fxn, it includes request and response objects which will be executed on each request
// Next is basically just a callback
// There can be multiple route handlers executed for a single HTTP request
// The next() method is used to call the next route handler that matches the route path
app.get('/events/hourly', (req, res, next) => {
  // Query strings are not part of the route path.
  // pass this DB query along with the queryHandler call
  // the queryHandler will make a connection request to the DB (postgreSQL)
  // the chained on .then() method promises to return the response in JSON format
  // returns a response object i.e. res.json()
  // send a response to the client, and terminate the request-response cycle.
  // the response (r) comes back as either r.rows which grabs all the rows in a table (HTMLCollection of rows = array-like object), OR as [] an empty array 
  req.sqlQuery = `
    SELECT date, hour, events
    FROM public.hourly_events
    ORDER BY date, hour
    LIMIT 168;
  `
  return next() //pass control on to the next handler
}, queryHandler)

app.get('/events/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, SUM(events) AS events
    FROM public.hourly_events
    GROUP BY date
    ORDER BY date
    LIMIT 7;
  `
  return next()
}, queryHandler)

app.get('/stats/hourly', (req, res, next) => {
  req.sqlQuery = `
    SELECT date, hour, impressions, clicks, revenue
    FROM public.hourly_stats
    ORDER BY date, hour
    LIMIT 168;
  `
  return next()
}, queryHandler)

app.get('/stats/daily', (req, res, next) => {
  req.sqlQuery = `
    SELECT date,
        SUM(impressions) AS impressions,
        SUM(clicks) AS clicks,
        SUM(revenue) AS revenue
    FROM public.hourly_stats
    GROUP BY date
    ORDER BY date
    LIMIT 7;
  `
  return next()
}, queryHandler)

app.get('/poi', (req, res, next) => {
  req.sqlQuery = `
    SELECT *
    FROM public.poi;
  `
  return next()
}, queryHandler)

// listening for HTTP requests on PORT 5432 or 5555
app.listen(process.env.PGPORT || 5555, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  } else {
    console.log(`Running on ${process.env.PGPORT || 5555}`)
  }
})

// last resorts
process.on('uncaughtException', (err) => {
  console.log(`Caught exception: ${err}`)
  process.exit(1)
})
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  process.exit(1)
})
