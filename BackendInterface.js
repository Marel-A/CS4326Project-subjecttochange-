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
// In SQL database, may need to query " ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password'; "
// Source of this solution: https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server


var connection = mySQL.createConnection({
    host: "localhost",
    user: "root",
    password: "password"
});

connection.connect( function(err) {
    if(err) throw err
    console.log("Connected to mySQL database!");


    //CORS headers
    app.use( (req,res,next) => {
        res.header('Access-Control-Allow-Origin','*');
        res.header('Access-Control-Allow-Methods','GET,PUT,POST,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers','Content-Type,Authorization,Content-Length,X-Requested-With');
        if(req.method === "OPTIONS") res.sendStatus(200);
        else next();
    });

    //Given a username, retrieve all of the user's postings by most recent (first in result is most recent posting, last is the user's oldest posting)
    app.get('/profile/:username', (req,res) => {
        let queryString = "SELECT * FROM system.postings WHERE creator = '" + req.params.username + "' ORDER BY date_time_made DESC;";

        connection.query(queryString, (err, result) => {
            if(err) {
                res.statusCode = 409;
                res.send("Error while retrieving posts: " + err);
            };
            res.status = 200;
            res.send(JSON.stringify(result))
        });
    });

    //Get the 100 most liked posts
    app.get('/getMostLiked',(req,res) => {

        let queryString = "SELECT * FROM system.postings ORDER BY num_likes DESC LIMIT 100;";

        connection.query(queryString, (err, result) => {
            if(err) {
                res.statusCode = 409;
                res.send("Error while retrieving most liked posts: " + err);
            };
            res.status = 200;
            res.send(JSON.stringify(result))
        });

    });

    //Get the 100 posts with the most total donated USD
    app.get('/getMostSupported', (req,res) => {

        let queryString = "SELECT * FROM system.postings ORDER BY total_donated_USD DESC LIMIT 100;";

        connection.query(queryString, (err, result) => {
            if(err) {
                res.statusCode = 409;
                res.send("Error while retrieving most supported posts: " + err);
            };
            res.status = 200;
            res.send(JSON.stringify(result))
        });

    });

    //Get the 100 most recently created posts
    app.get('/getMostRecent', (req,res) => {

        let queryString = "SELECT * FROM system.postings ORDER BY date_time_made ASC LIMIT 100;";

        connection.query(queryString, (err, result) => {
            if(err) {
                res.statusCode = 409;
                res.send("Error while retrieving most supported posts: " + err);
            };
            res.status = 200;
            res.send(JSON.stringify(result))
        });

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

    //Modify an existing post's title, description, number of likes, total donated in USD, creator, or contributors given the post ID
    app.post('/editPosting/:post_id', (req,res) => {
        const body = req.body

        let changes = {};
        for(let change in body) {
            if(change == "title" || change == "description" || change == "num_likes" || change == "total_donated_USD" || change == "creator" || change == "contributors")
                changes[change] = body[change];
        }

        if(Object.keys(changes).length == 0) {
            res.status = 204;
            res.send("No changes found in body, no changes made.");
        }

        let queryString = "UPDATE system.postings SET "

        for(let change in changes) {
            queryString += (change + " = " + "'" + changes[change] + "',");
        }
        queryString = queryString.substring(0,queryString.length-1);
        queryString += " WHERE post_id = " + req.params.post_id;

        connection.query(queryString, (err, result) => {
            if(err) {
                res.statusCode = 409;
                res.send("Error while modifying posting: " + err);
            };
            console.log(result);
            res.sendStatus(200);
        });
    });

    //Delete an existing post given the post ID
    app.delete('/deletePosting/:post_id', (req,res) => {

        let queryString = "DELETE FROM system.postings WHERE post_id = '" + req.params.post_id + "';";

        connection.query(queryString, (err, result) => {
            if(err) {
                res.statusCode = 409;
                res.send("Error while deleting posting: " + err);
            };
            console.log(result);
            res.sendStatus(200);
        });
        
    });



    app.listen(3000);

});