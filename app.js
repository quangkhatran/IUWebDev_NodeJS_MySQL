var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var mysql = require("mysql");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());

var { promisify } = require("util");

var methodOverride = require("method-override");

app.use('/css', express.static('css'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

var con = mysql.createConnection({
    host: 'localhost',
    user: 'sammy',
    password: 'password',
    database: 'mydb'
})

con.connect( function(err){
    if(err) throw err;
    console.log("Connected!");
    // con.query("CREATE DATABASE mydb", function(err, result){
    //     if(err) throw err;
    //     console.log("Database \"mydb\" created");
    // })
    
    // var sql = "CREATE TABLE course (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), address VARCHAR(255))";
    // con.query(sql, function(err, result) {
    //     if (err) throw err;
    //     console.log("Table created");
    // });
    
  //   var sql = "INSERT INTO course (title, description) VALUES ('Maths', 'Geometry, Algebra')";
  // con.query(sql, function (err, result) {
  //   if (err) throw err;
  //   console.log("1 record inserted");
  // });
} );


// var courses = [
// 		{title: "Machine Learning", description: "Linear Regression, Logistic Regression, SVM, PCA, ..."},
// 		{title: "Maths", description: "Geometry, Algebra"},
// 		{title: "Finance and Accounting", description: "Finance, Accounting"},
// 	];


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

app.get('/aboutme', isLoggedIn, function(req,res){
	res.render("aboutme.ejs", {currentUser: req.user});
});

app.get('/hi/:name', isLoggedIn, function(req,res){
	var name = req.params.name;
	res.render("hi.ejs", {name: name, currentUser: req.user});
});


app.get('/courses', isLoggedIn, function(req,res){
    
    var sql = "SELECT * FROM course";
    con.query(sql, function (err, courses) {
        if (err) throw err;
        // console.log(courses);
        res.render("courses.ejs", {courses: courses, currentUser: req.user});
    });
});

app.get('/courses/new', isLoggedIn, function(req,res){
	res.render("courses_new.ejs", {currentUser: req.user});
})

app.post('/courses',function(req,res){
	var title = req.body.title;
	var description = req.body.description;
    var sql = "INSERT INTO course (title, description) VALUES (\'"+ title + "\',\'" +   description + "\')";
    console.log(sql);
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 course inserted:\n" + title + ": " + description );
        res.redirect("/courses");
    });
});

app.get('/courses/:id', isLoggedIn, function(req,res){
	var courseID = req.params.id;
	var sql = "SELECT * FROM course WHERE id = " + courseID;
    console.log(sql);
    con.query(sql, function (err, courseFound) {
        if (err) throw err;
        console.log(courseFound[0]);  
        res.render("course_with_id.ejs", {course: courseFound[0], currentUser: req.user});
    });
})

app.get('/courses/:id/edit', isLoggedIn, function(req,res){
	var courseID = req.params.id;
    var sql = "SELECT * FROM course WHERE id = " + courseID;
    console.log(sql);
    con.query(sql, function (err, courseFound) {
        if (err) throw err;
        console.log(courseFound[0]);  
        res.render("course_edit.ejs", {course: courseFound[0], currentUser: req.user});
    });
})

app.put('/courses/:id', function(req,res){
	var courseID = req.params.id;
	var title = req.body.title;
	var description = req.body.description;
    
    var sql = "UPDATE course SET title = \'" + title + "\', description =  \'" + description + "\' WHERE id = " + courseID;
    console.log(sql);
    con.query(sql, function (err, courseFound) {
        if (err) throw err;
        console.log(courseFound[0]);  
        res.redirect("/courses/" + courseID );
    });
})

app.delete('/courses/:id', function(req,res){
	var courseID = req.params.id;
    var sql = "DELETE FROM course WHERE id = " + courseID;
    con.query(sql, function (err, courseDeleted) {
        if (err) throw err;
        console.log(courseDeleted[0]);  
        res.redirect("/courses");
    });
})

app.get('/courses/:id/delete', isLoggedIn, function(req,res){
	var courseID = req.params.id;
    
	var sql = "SELECT * FROM course WHERE id = " + courseID;
    console.log(sql);
    con.query(sql, function (err, courseFound) {
        if (err) throw err;
        console.log(courseFound[0]);  
        res.render("course_delete.ejs", {course: courseFound[0], currentUser: req.user});
    });
    
})

async function isLoggedIn(req, res, next){
	console.log( req.cookies );
    if( req.cookies.jwt ){
        try {
            var decoded = await promisify(jwt.verify)(req.cookies.jwt, 'secret_password_token');
            console.log(decoded);
            con.query("SELECT * FROM user WHERE id = ?", [decoded.id], function(err, results){
                // console.log(results);
                if(!results){
                    return next();
                }
                req.user = results[0];
                return next();
            })
        } catch (err) {
            console.log(err);
            return next();
        }
    } else {
        return next();
    }
}

app.get('/private', isLoggedIn, function(req, res){
    if( req.user ){
        res.render("private.ejs", {currentUser: req.user});
    } else {
        res.redirect("/login");
    }
	
})

// REGISTER ROUTES
app.get('/register', isLoggedIn, function(req, res){
	res.render("register.ejs", {currentUser: req.user});
})

app.post('/register', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
    var sql = "SELECT username FROM user WHERE username = ?"
    con.query(sql, [username], async function(err, results){
        if(err){
            console.log(err);
        } 
        if(results.length > 0){
            console.log("Email is already in use");
        } 
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
        var insertNewUserSql = "INSERT INTO user SET ?";
        con.query( insertNewUserSql, {username: username, password: hashedPassword}, function(err, results){
            if(err){
                console.log(err);
            } else {
                console.log("Register Success!")
                return res.redirect("/private");
            }
        })
    })
})

// LOGIN ROUTES
app.get('/login', isLoggedIn, function(req, res){
	res.render("login.ejs", {currentUser: req.user});
})

app.post('/login', async function(req, res){
    try{
        var username = req.body.username;
        var password = req.body.password;
        if( !username || !password ){
            res.status(400).render('login.ejs');
        }
        var sql = "SELECT * FROM user WHERE username = ?";
        con.query(sql, [username], async function(err, results){
            if( !results || !(await bcrypt.compare(password, results[0].password)) ){
                res.status(401).redirect("/login");
            } else {
                var id = results[0].id;
                var token = jwt.sign({id:id}, 'secret_password_token', {expiresIn: '90d'});
                // console.log("Token: " + token);
                var cookieOptions = {expires: new Date(Date.now()+ '90*24*60*60*1000'), httpOnly: true};
                res.cookie('jwt', token, cookieOptions);
                res.status(200).redirect("/private");
            }
        })
    } catch(err){
        console.log(err);
    }
}
);

// LOGOUT ROUTES
app.get('/logout', async function(req, res){
	var cookieOptions = {expires: new Date(Date.now()+'2*1000'), httpOnly: true};
    res.cookie('jwt', 'logout', cookieOptions);
    res.status(200).redirect("/");
});

app.listen(3000,function(){
	console.log('Server started');
});
