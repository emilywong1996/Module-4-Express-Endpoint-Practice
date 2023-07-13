// Module 4: Intro to Express 
// Type these commands in terminal: 
// npm init
// npm install -g nodemon
// npm i express cors mysql2
// npm i dotenv
// npm i nodemon
// To start server: nodemon index.cjs

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

// Allows us to access the .env
require('dotenv').config();

const port = process.env.PORT;

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}

// Points to .env file
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Middleware
// Gets to the computer
app.use(cors(corsOptions));


// Middleware
app.use(async function(req, res, next) {
  try {
    // Connecting to our SQL db.
    // Req db: connect to the SQL server, attaching variable to req, gets use in post (when making SQL queries)
    req.db = await pool.getConnection();
    req.db.connection.config.namedPlaceholders = true;

    // Traditional mode ensures not null is respected for unsupplied fields, ensures valid JavaScript dates, etc.
    await req.db.query(`SET SESSION sql_mode = "TRADITIONAL"`);
    await req.db.query(`SET time_zone = '-8:00'`);

    // Go on ahead until it hits the endpoint
    await next();

    // After the endpoint has been reached and resolved, disconnects from the database
    req.db.release();
  } catch (err) {
    // If anything downstream throw an error, we must release the connection allocated for the request
    console.log(err);
    // If an error occurs, disconnects from the database
    if (req.db) req.db.release();
    throw err;
  }
});

// Middleware
app.use(express.json());

// Endpoint
// Creates a GET endpoint at http://localhost:3000/cars
// The GET endpoint should query the database and fetch the entire contents of the `car` table, then return the data to the front end (you should use Insomnia, Postman, or something similar to those to make the requests to test)

app.get('/cars', async function(req, res) {
  try {
    // Set up database connection
    console.log('/cars/:id');

    // Attaches JSON content to the response
    const query = await req.db.query(`
      SELECT * FROM car
    `,);

    res.json(query);
  } catch (err) {
    
  }
});


app.use(async function(req, res, next) {
  try {
    console.log('Middleware after the get /cars');
  
    await next();

  } catch (err) {

  }
});

// Endpoint
app.post('/car', async function(req, res) {
  try {
    const { make, model, year } = req.body;
  
    const query = await req.db.query(
      `INSERT INTO car (make, model, year) 
       VALUES (:make, :model, :year)`,
      {
        make,
        model,
        year,
      }
    );
  
    res.json({ success: true, message: 'Car successfully created', data: null });
  } catch (err) {
    res.json({ success: false, message: err, data: null })
  }
});

// The DELETE endpoint should change the `deleted_flag` value of a certain row in the `car` table from 0 to 1, to signify it as "deleted"
app.delete('/car/:id', async function(req,res) {
  try {
    console.log('req.params /car/:id', req.params)

    const { id } = req.body;

    const query = await req.db.query(
      `UPDATE car
        SET deleted_flag = 1  
        WHERE id = :id`,
      {
        id,
      }
    );

    res.json('success')
  } catch (err) {
    res.json('error')
  }
});

// The PUT endpoint should update a column of a specific row in the `car` table
app.put('/car', async function(req,res) {
  try {

    const { id, make, model, year} = req.body;

    const query = await req.db.query(
      `UPDATE car
        SET make = :make, model = :model, year = :year 
        WHERE id = :id`,
      {
        id,
        make,
        model,
        year,
      }
    );
    res.json({ success: true, message: 'Car successfully created', data: null });
  } catch (err) {
    res.json({ success: false, message: err, data: null })
  }
});


app.listen(port, () => console.log(`212 API Example listening on http://localhost:${port}`));