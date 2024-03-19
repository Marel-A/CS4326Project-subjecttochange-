var mySQL = require('mysql');
const express = require('express');
var app = express();
app.use(express.json());

function getASCIIstring(s){
    let result = "";
    
    for(let i = 0; i < s.length; i++){
        let ASCIIchar = s.charCodeAt(i);
        result += ASCIIchar;
    }
    
    return result;
}

// NOTICE:
// In SQL database, query " ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; "
// Source of this solution: https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server


var connection = mySQL.createConnection({
    host: "localhost",
    user: "root",
    password: "password"
});

connection.connect( function(err) {
        if(err) throw err
        console.log("Connected to mySQL database!");
    }
);

app.use( (req,res,next) => {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers','Content-Type,Authorization,Content-Length,X-Requested-With');
    if(req.method === "OPTIONS") res.sendStatus(200);
    else next();
});

app.get('/names', (req,res) => {

    connection.query("SELECT * FROM system.postings", (err, result, fields) => {
        if(err) throw err;
        console.log(result);

        res.send(JSON.stringify(result));
    })

});

//Given a username, retrieve all of the user's postings
app.get('/profile/:username', (req,res) => {

});

//Get the 100 most liked posts
app.get('/getMostLiked',(req,res) => {

});

//Get the 100 posts with the most total donated USD
app.get('/getMostSupported', (req,res) => {

});

//Get the 100 most recently created posts
app.get('/getMostRecent', (req,res) => {

});

//Create an idea post
app.put('/createPosting', (req,res) => {
    const body = req.body;

    let dateTime = new Date();
    let dateTimeString = dateTime.toISOString().split('T')[0] + ' ' + dateTime.toTimeString().split(' ')[0] ;

    let title = body["title"];
    let description = body["description"];
    let num_likes = body["num_likes"];
    let total_donated_USD = body["total_donated_USD"];
    let creator = body["creator"];
    let contributors = body["contributors"];

    if(!title || !description || !num_likes || !total_donated_USD || !creator || !contributors ) {
        res.statusCode = 406;
        res.send("Error: missing body parameters");
    }

    let id = Date.parse(dateTime) + getASCIIstring(creator);

    let queryString = "INSERT INTO system.postings (title, description, num_likes, total_donated_USD, creator, contributors, date_time_made, post_id) VALUES ('" + title + "','" + description + "','" + num_likes + "','" + total_donated_USD + "','" + creator + "','" + contributors + "','" + dateTimeString + "','" + id + "')";

    connection.query(queryString, (err, result) => {
        if(err) {
            res.statusCode = 409;
            res.send("Error while creating posting: " + err);
        };
        console.log(result);
        res.sendStatus(201);
    });
});

//Modify an existing post
app.post('/editPosting', (req,res) => {

});

//Delete an existing post
app.delete('/deletePosting', (req,res) => {
    
});






app.listen(3000);