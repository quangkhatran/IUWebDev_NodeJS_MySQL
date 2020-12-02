var express = require("express");
var app = express();
var bodyParser = require("body-parser");

var mysql = require("mysql");

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

app.get('/aboutme',function(req,res){
	res.render("aboutme.ejs");
});

app.get('/hi/:name',function(req,res){
	var name = req.params.name;
	res.render("hi.ejs", {name: name});
});


app.get('/courses',function(req,res){
    var sql = "SELECT * FROM course";
    con.query(sql, function (err, courses) {
        if (err) throw err;
        console.log(courses);
        res.render("courses.ejs", {courses: courses});
    });
});

app.get('/courses/new', function(req,res){
	res.render("courses_new.ejs");
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

app.get('/courses/:id', function(req,res){
	var courseID = req.params.id;
	var sql = "SELECT * FROM course WHERE id = " + courseID;
    console.log(sql);
    con.query(sql, function (err, courseFound) {
        if (err) throw err;
        console.log(courseFound[0]);  
        res.render("course_with_id.ejs", {course: courseFound[0]});
    });
})

app.get('/courses/:id/edit', function(req,res){
	var courseID = req.params.id;
    var sql = "SELECT * FROM course WHERE id = " + courseID;
    console.log(sql);
    con.query(sql, function (err, courseFound) {
        if (err) throw err;
        console.log(courseFound[0]);  
        res.render("course_edit.ejs", {course: courseFound[0]});
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

app.get('/courses/:id/delete', function(req,res){
	var courseID = req.params.id;
    
	var sql = "SELECT * FROM course WHERE id = " + courseID;
    console.log(sql);
    con.query(sql, function (err, courseFound) {
        if (err) throw err;
        console.log(courseFound[0]);  
        res.render("course_delete.ejs", {course: courseFound[0]});
    });
    
})

app.listen(3000,function(){
	console.log('Server started');
});
