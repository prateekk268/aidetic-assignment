# aidetic-assignment
Backend Task
Create CRUD API + Search and filter APIs with Apollo graphql and PostgreSQL database. You
need to create 3-4 database tables that have some sort of relationship in them and then build
API on top of it. Must use Typescript.
Once it's done push it to a GitHub repo and share it with us.
// Back End Task
// If candidate is senior we will remove the data structure and just send the table name.
You have been tasked with creating a simple GraphQL API for managing a list of movies. You
will be using Node.js with the Apollo GraphQL library to implement the API.
Requirements:
The API should allow users to:
● SignUp as a User
● Login
● Change Password
● Query a list of all the movies.
● Query a movie with it’s id
● Create a new movie
● Update an existing movie
● Delete a movie
● Query a list of reviews for a movie
● Create a new review
● Update an exiting review of a movie
● Delete a review
The user data should include following information:
● ID (Number)(Auto Increment)
● User Name(String)
● Email ID(String)
● Password(String)
The movie data should include following fields:
● ID (Number)(Auto Increment)
● Movie Name (String)
● Description(String)
● Director Name (String)
● Release Date (Date)
The review data should include the following:
● ID (Number)(Auto Increment)
● Movie ID(Number)(Reference from Movies data table)
● User ID(Number)(Reference from User data table)
● Rating(Number)
● Comment(String)
Authorization and Authentication:
● Users should be able to register for and account with email and password. Passwords
should be hashed.
● User should be able login in to the API with their email and password and receive a JWT
token.
● API should accept JWT tokens in headers to authenticate requests.
● Only authenicated users should be able to perform Create, Update or Delete operations
on movies or reviews.
● Users should only be able to modify their movie or review.
Technical Specification:
● Use Node.js and GrapqhQL to implement the API.
● User PostgreSQL to store user, movie and review data.
● Querying movies and reviews should include sort, filter and pagination.
● Querying a movie should also include search functionality based on movie name or
description.
● While querying a review logged in user review should always stay on top.
● Include proper Error Handling and data validation.
● User Git for version control.
