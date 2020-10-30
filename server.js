require("dotenv").config(); // om een environment-variable te maken
const express = require("express");
const app = express();
const ejs = require("ejs");
const fetch = require("node-fetch");
const nodemailer = require('nodemailer');
/* Packages needed to login and register */
const bcrypt = require('bcryptjs');	// om wachtwoord te hashen
const mongoose = require('mongoose');	// om schema te maken
const { MongoClient } = require('mongodb');	// database
const User = require('./models/User');	// User-Schema
const flash = require('connect-flash');	// om meldingen te kunnen geven
const session = require('express-session');	// om een user-sessie vast te houden
const passport = require('passport'); // voor te laten inloggen

// Passport-config
require('./passport-config')(passport);
const { ensureAuthenticated } = require('./auth');

// Setting the port
app.set("port", process.env.PORT || 8080);
app.set("view engine", "ejs");

// CONNECT TO DB with mongoose
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => { console.log('connected to db')
});

async function writeToDatabase(object, user) {
	const client = new MongoClient(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true } );
	try {
		await client.connect();
		await client.db('test').collection('users').updateOne(
			{email: user.email},
			{$push: {favorites: object}}
		);
	} catch (exception) {
		console.log(exception);
	}
	finally {
		client.close();
	}
}
async function readFromDatabase(user) {
	const client = new MongoClient(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
	try {
		await client.connect();
		let result = await client.db('test').collection('users').findOne({ email: user.email });
		return result.favorites;
	} catch (exception) {
		console.log(exception);
	}
	finally {
		client.close();
	}
}
async function deleteFromDatabase(object, user) {
	console.log(user.email);
	console.log(object);
	const client = new MongoClient(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true });
	try {
		await client.connect();
		await client.db('test').collection('users').updateOne(
			{ email: user.email },
			{ $pull: { favorites: { 'attributes.OBJECTID' : object } } },
			{ multi: true }
		);
	} catch (exception) {
		console.log(exception);
	}
	finally {
		client.close();
	}
}


// Middlewares
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: false})); // nodig om data uit een form te kunnen krijgen
app.use(session({
	secret: process.env.TOKEN_SECRET,
	resave: false,
	saveUninitialized: true
}));
// To Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Checking if there is a user logged in
function checkIsLoggedIn(user) {
	if (user) return true;
	return false;
}

/* ============= FETCH DATA FROM THE 2 API'S ============= */
let myData = { wifiPoints: [], computerRooms: [] };
async function getData() {
	// Fetching data from 2 api's
	const fetch_response = await Promise.all([
		fetch("https://geodata.antwerpen.be/arcgissql/rest/services/P_Portal/portal_publiek1/MapServer/60/query?where=1%3D1&outFields=*&outSR=4326&f=json"),
		fetch("https://geodata.antwerpen.be/arcgissql/rest/services/P_Portal/portal_publiek6/MapServer/593/query?where=1%3D1&outFields=*&outSR=4326&f=json")
	]);
	// Converting to json
	let firstData = await fetch_response[0].json();
	let secondData = await fetch_response[1].json();
	// Assigning data to the variable and returning that variable
	myData = {
		wifiPoints: firstData,
		computerRooms: secondData
	};
	return new Promise((resolve, reject) => {
		resolve(myData);
		reject('Data kon niet worden opgehaald');
	})
};
// middleware to check if we actually have the data
async function checkData(req, res, next) {
	let result = await getData();
	if (result) {
		return next();
	}
	res.send('Data kon niet worden opgehaald');
}
/* ========== RENDERING OUR PAGES ========== */
app.get("/", checkData, (req, res) => {
		let isLoggedIn = checkIsLoggedIn(req.user);
		res.render("index", {
			user: isLoggedIn,
			accessToken: process.env.ACCESS_TOKEN,
			wifiPoints: myData.wifiPoints.features,
			computerRooms: myData.computerRooms.features,
			wifiPointsStringified: JSON.stringify(myData.wifiPoints.features),
			computerRoomsStringified: JSON.stringify(myData.computerRooms.features)
		});
});
// Favorieten rendering page
app.get("/favorieten", ensureAuthenticated, async (req, res) => {
		let isLoggedIn = checkIsLoggedIn(req.user);
		const result = await readFromDatabase(req.user);
		res.render("favorieten", {
			user: isLoggedIn,
			accessToken: process.env.ACCESS_TOKEN,
			wifiPointsStringified: JSON.stringify(myData.wifiPoints.features),
			computerRoomsStringified: JSON.stringify(myData.computerRooms.features),
			favorites: result
		});
})
// Navigatie.ejs rendering page
app.get("/navigatie", (req, res) => {
		let isLoggedIn = checkIsLoggedIn(req.user);
		res.render('navigatie', {
			user: isLoggedIn,
			accessToken: process.env.ACCESS_TOKEN,
			routingToken: process.env.ROUTING_TOKEN,
			wifiPoints: myData.wifiPoints.features,
			computerRooms: myData.computerRooms.features,
			wifiPointsStringified: JSON.stringify(myData.wifiPoints.features),
			computerRoomsStringified: JSON.stringify(myData.computerRooms.features)
		});
})
// Contact rendering page
app.get("/contact", async (req, res) => {
		if (req.query.subject != undefined && req.query.email != undefined && req.query.description != undefined) {
			// Create the transporter with the required configuration for Outlook
			let transporter = nodemailer.createTransport({
				host: process.env.EMAIL_SERVICE_HOST,
				secureConnection: process.env.EMAIL_SERVICE_SECURE, // TLS requires secureConnection to be false
				port: process.env.EMAIL_SERVICE_PORT, // port for secure SMTP
				tls: {
					ciphers: process.env.EMAIL_SERVICE_CYPHER,
					rejectUnauthorized: false
				},
				auth: {
					user: process.env.SERVER_EMAIL,
					pass: process.env.SERVER_EMAIL_PW
				}
			});
			let mailOptions = {
				from: process.env.SERVER_EMAIL, // sender address (who sends)
				to: 'elias.elharraksamadi@student.ap.be', // list of receivers (who receives)
				subject: `Contactformulier: ${req.query.subject}`,
				text: `Naam: ${req.query.name} \n
    	    Email: ${req.query.email} \n
        	Reden: ${req.query.subject} \n
        	Beschrijving: ${req.query.description} \n`
			};
			await transporter.sendMail(mailOptions, (error, info) => {
				if (error) {
					return console.log(error);
				}
				console.log('Message %s sent: %s', info.messageId, info.response);
			});
		} else {
			console.log(req.body);
			console.log(req.query);
		}
		let isLoggedIn = checkIsLoggedIn(req.user);
		res.render("contact", { user: isLoggedIn });
});
// Open Source Notice rendering the page
app.get("/bronnen", (req, res) => {
	res.render("bronnen");
})


/* =============== LOGIN EN REGISTRATIE =============== */
app.get("/register", (req, res) => {
	res.render("register");
})
/* REGISTER HANDLING */
app.post('/register', (req, res) => {
	const { name, email, password } = req.body;
	let errors = [];
	// BASIC VALIDATION
	// Check pass length
	if (password.length < 6) {
		errors.push({ message: 'het wachtwoord moet uit minstens 6 karakters bestaan' });
	}

	if (errors.length > 0) {
		res.render('register', {
			errors
		})
	} else {
		// VALIDATION PASSED
		User.findOne({ email: email }).then(user => {
			if (user) {
				// If that user is already in DB
				errors.push({ message: 'E-mailadres bestaat al' })
				res.render('register', {
					errors
				})
			} else {
				const newUser = new User({
					name: name,
					email: email,
					password: password
				});
				// Hash password
				bcrypt.genSalt(10, (err, salt) =>
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						// Set password to hashed
						newUser.password = hash;
						// Save user in DB
						newUser.save().then(user => {
							res.redirect('/login')
						}).catch(err => console.log(err))
					}));
			}
		});
	}
})
app.get("/login", (req, res) => {
	let message;
	if (req.session.flash) {
		message = req.session.flash.error.pop();
	}
	res.render('login', { message: message });
});
/* LOGIN HANDLING */
app.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: 'login',
		failureFlash: true
	})(req, res, next);
});
/* LOGOUT HANDLING */
app.get('/logout', (req, res) => {
	req.logout();
	req.flash('succes_msg', 'You are logged out!');
	res.redirect('/');
})


/* ================ FAVORITE LOCATIONS HANDLING ================ */
// Hier komen de favoriete locaties aan en worden ze weggeschreven naar de database
app.post('/favorieten', (req, res) => {
	// Ik moet een nieuw object maken op de juiste manier (a.d.h.v. schema)
	let favorite = {};
	if (req.body.attributes.LOCATIE !== undefined) {
		favorite = {
			attributes: {
				OBJECTID: req.body.attributes.OBJECTID,
				LOCATIE: req.body.attributes.LOCATIE,
				STRAAT: req.body.attributes.STRAAT,
				HUISNR: req.body.attributes.HUISNR,
				POSTCODE: req.body.attributes.POSTCODE,
				GEMEENTE: req.body.attributes.GEMEENTE
			},
			geometry: {
				x: req.body.geometry.x,
				y: req.body.geometry.y
			}
		}
	} else {
		favorite = {
			attributes: {
				OBJECTID: req.body.attributes.OBJECTID,
				NAAM: req.body.attributes.NAAM,
				STRAATNAAM: req.body.attributes.STRAATNAAM,
				HUISNUMMER: req.body.attributes.HUISNUMMER,
				POSTCODE: req.body.attributes.POSTCODE,
				DISTRICT: req.body.attributes.DISTRICT
			},
			geometry: {
				x: req.body.geometry.x,
				y: req.body.geometry.y
			}
		}
	}
	// Nu moet favorite worden gestuurd naar de array in mongodb
	writeToDatabase(favorite, req.user);
});
// Deze endpoint is er om de favoriete locaties te kunnen gebruiken in de front-end ("favorieten.js")
app.get('/api', async (req, res) => {
	let result = await readFromDatabase(req.user);
	res.json(result);
});
// Hier komen de locaties die verwijderd moeten worden
app.post('/verwijder', async (req, res) => {
	await deleteFromDatabase(req.body.attributes.OBJECTID, req.user);
	res.json({ message: 'het object is verwijderd' });
});


/* ================ ERROR HANDLING ================ */
// pagina 404 (= http-statuscode 'Not Found')
app.use(function(req, res) {
	res.type("text/plain");
	res.status(404);
	res.send("404 - Not Found");
});
// pagina 500 (= http-statuscode 'intern server error')
app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.type("text/plain");
	res.status(500);
	res.send("500 - Server Error");
});
// Express listener (when app is running)
app.listen(app.get("port"), () => {
	console.log(
		`Express started on http://localhost:${app.get(
			"port"
		)}; press Ctrl-C to terminate.`
	);
});
