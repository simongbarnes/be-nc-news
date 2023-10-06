# Northcoders News API

Hosted version: https://nc-news-2d8c.onrender.com/

Northcoders News API is an API that serves news articles. Users can post new articles and can comment on and vote for existing articles. Articles can be listed, viewed and filtered by topic.

A list of all available enpoints can be accessed using endpoint /api:
https://nc-news-2d8c.onrender.com//api

The project comprises an Express Node.js server accessing a Postgres database.

Minimum versions required:
Node.js 20.3.0
Express 4.18.2
PostgreSQL 15.4

The project can be cloned using the command:
git clone https://github.com/simongbarnes/be-nc-news/tree/main

Dependencies and dev dependencies are listed in the package.json and can be installed with the command npm install.

There are two databases in this project: one for real-looking dev data, and another for simpler test data.

You will need to create two .env files in the project directory: .env.test and .env.development. Into each, add PGDATABASE=, with the correct database name for that environment (see /db/setup.sql for the database names). 

Double check that these .env files are .gitignored.

Development and test databases can be set up using the command: 
npm run setup-dbs

To seed the dev database, use:
npm run seed

The test database is seeded automatically before each test is run.

Testing is done using Jest. To run a test use:
npm test