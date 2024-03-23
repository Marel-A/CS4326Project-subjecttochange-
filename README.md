# CS4326 Project Working README (not complete)


# Running local API for database

Data for postings and user credentials are stored in a MySQL database which is managed through a REST API built in Node.js

## MySQL database layout:

Schema 'system' contains tables 'credentials' and 'postings'.

'credentials' has the following columns:
- 'username' for an account username
- 'SHA256_pass' for an account password

'postings' has the following columns:
-	"title" VARCHAR(30): title of a posting
-	"description" VARCHAR(45): description of a posting
-	"num_likes" INT: number of likes a posting has
-	"total_donated_USD": INT total amount of funding the posting has received in USD
-	"creator" VARCHAR(45):  the username of the account that created this posting
-	"contributors" VARCHAR(45):  usernames of accounts that have contributed to this posting
-	"date_time_made" DATETIME: year, month, day, hour, minute, second that a posting is made
-	"post_id" VARCHAR(100): integer value of date_time_made appended with ASCII representation of creator to build a unique identifier for a posting

## REST API for interacting with MySQL database

The following HTTP methods are provided on localhost port 3000:

### GET
#### Methods for getting a user's posts, getting most liked, most supported, and most recent posts, and verifying a user's credentials
**http://localhost:3000/profile/:username**
Get a user's profile by retrieving all of their posts
- Parameters: account username parameter for :username
- Response: response body contains a JSON array of postings where the creator of each posting equals the :username parameter. Status 409 indicates an error occurred between the API and the database, and the error will be logged.

**http://localhost:3000/getMostLiked**
Get the 100 most-liked posts
- Response: response body contains a JSON array of postings with the highest values of num_likes. The array is in descending order by num_likes where the first posting in the array has the most num_likes and the last posting in the array has the least num_likes. Status 409 indicates an error occurred between the API and the database, and the error will be logged.

**http://localhost:3000/getMostSupported**
Get the 100 most-supported posts
- Response: response body contains a JSON array of postings with the highest values of total_donated_USD. The array is in descending order by total_donated_USD where the first posting in the array has the highest total_donated_USD and the last posting in the array has the lowest total_donated_USD. Status 409 indicates an error occurred between the API and the database, and the error will be logged.

**http://localhost:3000/getMostRecent**
Get the 100 most recently created posts
- Response: response body contains a JSON array of postings with the lowest values of date_time_made. The array is in ascending order by date_time_made where the first posting in the array has the most recent date_time_made and the last posting in the array has the least recent date_time_made. Status 409 indicates an error occurred between the API and the database, and the error will be logged.

**http://localhost:3000/verifyCredentials**
Provided a username and password, verify that the usernmame's password in the database matches the password provided
- Request: in the request body, include the following JSON object
>{
"username" : "input username",
"SHA256_pass" : "input password"
}
- Response: status 200 indicates that the provided password matches the correct password for the username, and status 401 indicates that the provided password does not match. Status 409 indicates an error occurred between the API and the database, and the error will be logged.

### PUT
#### Methods for creating a new posting and creating a new pair of user credentials
**http://localhost:3000/createPosting**
Create a new post in the database by providing the post's title, description, number of likes, donated USD, creator username, and contributors
- Request: in the request body, include the following JSON object
>{
"title" : "title of the post",
"description" : "description of the post",
"num_likes" : "number of likes for the post",
"total_donated_USD" : "USD contributed upon creation (if creator wants to make an initial contribution to their post)",
"creator" : "username of the user creating this post",
"contributors" : "any contributors that the user deems have already contributed to this idea"
}

*note that date_time_made and post_id are not required, these are implemented automatically by the API.
- Response: if any of the required items in the request body are missing, this will return status 406. If the post is successfully created, this will return status 201. Status 409 indicates an error occurred between the API and the database, and the error will be logged.


**http://localhost:3000/newCredentials**
Given a username and password, create a new pair of credentials for verifying a password later on.
- Request: in the request body, include the following JSON object
>{
"username" : "input username",
"SHA256_pass" : "input password"
}
- Response: status 201 indicates that the username-and-password pair has been successfully created. Status 409 indicates an error occurred between the API and the database, and the error will be logged.

### POST
#### So far, method for editing a posting
**http://localhost:3000/editPosting/:post_id**
Given a post's ID and the properties of the post to change, change the aspects of the post which matches the post ID with the new properties
- Parameters: a posting's ID for parameter :post_id (hint for getting post_id: users may only be able to edit their own posts, so use /profile/username method to get users posts, then get post_id from any of the posting objects in the JSON response array)
- Request: in the request body, include any of the following in the JSON object:
>{
"title" : "title of the post",
"description" : "description of the post",
"num_likes" : "number of likes for the post",
"total_donated_USD" : "USD contributed upon creation (if creator wants to make an initial contribution to their post)",
"creator" : "username of the user creating this post",
"contributors" : "any contributors that the user deems have already contributed to this idea"
}

It is optional to include changes to title, description, num_likes, total_donated_USD, creator, and contributors, so only include what needs to be changed.
- Response: status 204 indicates that no changes were found in the request body, so no changes will be made. Status 200 indicates that the provided properties in the request body were successfully changed for the provided :post_id parameter. Status 409 indicates an error occurred between the API and the database, and the error will be logged.

### DELETE
#### So far, method for deleting a posting
**http://localhost:3000/deletePosting/:post_id**
Given a post's ID, the post corresponding to this post ID will be removed.
- Parameters: a posting's ID for parameter :post_id (hint for getting post_id: users may only be able to delete their own posts, so use /profile/username method to get users posts, then get post_id from any of the posting objects in the JSON response array)
- Response: status 200 indicates that the posting correlated to the :post_id parameter was successfully removed from the database. Status 409 indicates an error occurred between the API and the database, and the error will be logged.


## Local environment setup for local API
### Requirements for setup:
- Node.js
(https://nodejs.org/en/download)
- MySQL Community Server
(https://dev.mysql.com/downloads/mysql/)
- (Highly recommended) MySQL Workbench (https://dev.mysql.com/downloads/workbench/)
- (Highly Recommended) HTTP API testing software such as Postman (https://www.postman.com/downloads/)
- (Highly Recommended) PM2 Process Manager (https://pm2.io/docs/runtime/guide/installation/)

### Setup:
1. Installing MySQL Community Server should automatically create a new connection for the database management system on localhost. During installation, be sure to set a username and password for the system.
2. Execute the following query to setup the necessary tables:

```
CREATE DATABASE `system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
CREATE TABLE system.credentials (
  `username` varchar(100) NOT NULL,
  `SHA256_pass` varchar(100) NOT NULL,
  PRIMARY KEY (`username`,`SHA256_pass`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE system.postings (
  `title` varchar(30) NOT NULL,
  `description` varchar(45) NOT NULL,
  `num_likes` int NOT NULL,
  `total_donated_USD` int NOT NULL,
  `creator` varchar(45) NOT NULL,
  `contributors` varchar(45) NOT NULL,
  `date_time_made` datetime DEFAULT NULL,
  `post_id` varchar(100) NOT NULL,
  PRIMARY KEY (`title`,`description`,`num_likes`,`total_donated_USD`,`creator`,`contributors`,`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
This may be done by connecting to the mySQL server on mySQL Workbench and pasting this query into a new query tab and running the query, or connect in the terminal with
```
mysql -u username -p
```
then enter the password and paste the query to execute

3. Open BackendInterface.js in an editor. At line 22
```
var  connection  =  mySQL.createConnection({
	host:  "localhost",
	user:  "root",
	password:  "password"
});
```
modify the values for user and password with your MySQL connection username and password

4. Navigate to BackendInterface.js in the terminal and run with

```
node BackendInterface.js
```
If you have pm2 installed, use
```
pm2 start BackendInterface.js
```
and monitor the logs with 
```
pm2 monit
```
pm2 is easier to use here because when an API call causes an error with the SQL server, the instance of BackendInterface.js automatically shuts down when using node, but with pm2, the instance instead automatically restarts so that you don't have to keep manually restarting every time an error with the SQL database occurs.

5. Setup is complete, start making API calls using a tool like PostMan to try out interfacing with the backend