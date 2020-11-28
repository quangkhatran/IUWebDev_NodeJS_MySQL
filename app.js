var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var passport = require("passport");
var localStrategy = require("passport-local");

var axios = require('axios');

var User = require("./models/user");

// passport config
app.use(require("express-session")({
	secret: "passport config",  
	resave: false,
	saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use( function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

var methodOverride = require("method-override");

var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/firstProject', {useNewUrlParser: true, useUnifiedTopology: true});

app.use('/css', express.static('css'));
app.use(bodyParser.urlencoded({extended: true}));

app.use(methodOverride("_method"));

// var courses = [
// 		{title: "Machine Learning", description: "Linear Regression, Logistic Regression, SVM, PCA, ..."},
// 		{title: "Maths", description: "Geometry, Algebra"},
// 		{title: "Finance and Accounting", description: "Finance, Accounting"},
// 	];

var courseSchema = new mongoose.Schema({
	title: String,
	description: String
});

var Course = mongoose.model("Course", courseSchema);

// create a new "course" object namely machine learning
// var machineLearning = new Course({
// 	title: "Machine Learning",
// 	description: "Linear Regression, Logistic Regression, SVM, PCA, ..."
// }
// );

// machineLearning.save(function(err,newCourseSaved){
// 	if(err){
// 		console.log("Error with saving the course");
// 	} else {
// 		console.log("Success with saving the course");
// 		console.log(newCourseSaved);
// 	}
// });

// Course.create({ title: "Maths", description: "Geometry, Algebra" }, function(err, newCourseCreated){
// 	if(err){
// 		console.log("Error with creating and saving the course");
// 	} else {
// 		console.log("Success with creating and saving the course");
//   		console.log(newCourseCreated);	
// 	}
// })

app.get('/',function(req,res){
	// res.send("IU would like to say Hi to the world");
	res.redirect("/aboutme");
});

app.get('/aboutme',function(req,res){
	res.render("aboutme.ejs");
});

app.get('/hi/:name',function(req,res){
	var name = req.params.name;
	res.render("hi.ejs", {name: name});
});

app.get('/courses',function(req,res){
	// var courses = [
	// 	{title: "Machine Learning", description: "Linear Regression, Logistic Regression, SVM, PCA, ..."},
	// 	{title: "Maths", description: "Geometry, Algebra"},
	// 	{title: "Finance and Accounting", description: "Finance, Accounting"},
	// ]
	// res.render("courses.ejs", {courses: courses});
	
	Course.find({}, function(err, courses){
		if(err){
			console.log("Error with finding the courses");
		} else {
			res.render("courses.ejs", {courses: courses});
		}
	})
	
});

// app.post('/addcourse',function(req,res){
// 	var title = req.body.title;
// 	var description = req.body.description;
// 	courses.push( {title: title, description: description} );
// 	res.render("courses.ejs", {courses: courses});
// });

app.get('/courses/new', function(req,res){
	res.render("courses_new.ejs");
})

app.post('/courses',function(req,res){
	var title = req.body.title;
	var description = req.body.description;
	Course.create({title: title, description: description}, function(err, courseCreated){
		if(err){
			console.log("Error with finding the courses");
		} else {
			res.redirect("/courses");
		}
	})
});

app.get('/courses/:id', function(req,res){
	var courseID = req.params.id;
	Course.findById(courseID, function(err, courseFound){
		if(err){
			console.log("Error with finding the course with id: " + courseID);
			res.redirect("/courses");
		} else {
			res.render("course_with_id.ejs", {course: courseFound});
		}
	})
})

app.get('/courses/:id/edit', function(req,res){
	var courseID = req.params.id;
	Course.findById(courseID, function(err, courseFound){
		if(err){
			console.log("Error with finding the course with id: " + courseID);
			res.redirect("/courses");
		} else {
			res.render("course_edit.ejs", {course: courseFound});
		}
	})	
})

app.put('/courses/:id', function(req,res){
	var courseID = req.params.id;
	var title = req.body.title;
	var description = req.body.description;
	Course.findByIdAndUpdate(courseID, {title:title, description: description}, function(err, courseUpdated){
		if(err){
			console.log("Error with updating the course with ID: " + courseID);
		} else {
			res.redirect("/courses/" + courseID );
		}
	})
})

app.delete('/courses/:id', function(req,res){
	var courseID = req.params.id;
	Course.findByIdAndRemove(courseID, function(err, courseDeleted){
		if(err){
			console.log("Error with deleting the course with ID: " + courseID);
		} else {
			res.redirect("/courses");
		}
	})
})

app.get('/courses/:id/delete', function(req,res){
	var courseID = req.params.id;
	Course.findById(courseID, function(err, courseDeleted){
		if(err){
			console.log("Error with finding the course with ID: " + courseID + " to delete");
		} else {
			res.render("course_delete.ejs", {course: courseDeleted});
		}
	})
})

// route to get the precious metal rates and currency exchange rates
app.get('/prices', function(req,res){
	var config = { params: { base: "USD", symbols: "XAU,XAG" } }; 
	axios.get('https://metals-api.com/api/latest?access_key=sxsr0hf49dmx757lffn6nik5v50suq4dw51xzqfu0ew3w4mg332843v3a1eq', config)
  	.then(function (response) {
    	// handle success
    	// console.log(response);
		var goldPrice = 1/response.data.rates.XAU;
		var silverPrice = 1/response.data.rates.XAG;
		
		res.render("prices.ejs", {goldPrice: goldPrice, silverPrice: silverPrice });
  	})
  	.catch(function (error) {
    	// handle error
    	console.log(error);
  	});
  	
})


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.get('/private', isLoggedIn, function(req, res){
	res.render("private.ejs");
})

// REGISTER ROUTES
app.get('/register', function(req, res){
	res.render("register.ejs");
})

app.post('/register', function(req, res){
	// res.send("Register POST ROUTE");
	var username = req.body.username;
	var password = req.body.password;
	User.register(new User({username: username}), password, function(err, user){
		if(err){
			return res.render("register.ejs");
		}
		passport.authenticate("local")( req, res, function(){
			res.redirect("/private");
		})
	})
})

// LOGIN ROUTES
app.get('/login', function(req, res){
	res.render("login.ejs");
})

app.post('/login', passport.authenticate("local", {
	successRedirect: "/private",
	failureRedirect: "/login"
}), function(req, res){
	
})

// LOGOUT ROUTES
app.get('/logout', function(req, res){
	req.logout();
	res.redirect("/");
})

app.listen(3000,function(){
	console.log('Server started');
});
