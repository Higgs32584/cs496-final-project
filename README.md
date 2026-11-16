# cs496-final-project

Website for PRSSA Loyola: upcoming and past meetings, guest speakers, and news posts. Admins manage the content, and visitors can browse and search it.

The project has two parts:

* The server, in the root of this repository: Node, Express, and MongoDB (through Mongoose).
* The website, in the `my-app` folder: React.

# Relevant Links
Link to User Stories: https://studentsloyola-my.sharepoint.com/:x:/g/personal/ehenson_loyola_edu/EZg3XfnqE8FIjuwehC_ZMrgBJNzYB_VpoRwbreWeoKxk6Q?e=637CtQ

Link to User Story Iterations: https://studentsloyola-my.sharepoint.com/:x:/g/personal/ehenson_loyola_edu/EWgt-t9fcwdHq67RpgMt-mQBdec2NdhsgH8nLGlGgokbhA?e=oLw6be


# Install and Run Instructions
To run this project, you will need Node and NPM
Node: https://nodejs.org/en/download/
The Node installer should also install NPM

To install the necessary packages:
 * Open a console window to the project folder
 * Type `npm install` and wait for all packages for the server to install
 * `cd` into the `my-app` folder
 * Type `npm install` again to download React and other necessary packages

To set up the `.env` file:
 * Copy `.env.example` to a new file named `.env` in the project folder
 * Fill in the MongoDB connection strings and a session secret, as described in that file
 * The `.env` file is not included in this repository for security reasons, and should never be committed

To run the server:
 * Open a console window to the project folder
 * Type `npm start` (or `node ProjectServer.js`)
 * If you see the text `Server running in localhost:4000`, the server is working properly and listening for requests
 * The text also says which database is in use. The test database is used unless `NODE_ENV=production` or `DB_TARGET=main` is set in the `.env` file

To run the React project:
 * Open a separate console window to the `my-app` folder
 * Type `npm start`
 * A browser window should shortly open up displaying the website in React on `localhost:3000`

The website expects the server at `http://localhost:4000`. To use a different address, set `REACT_APP_API_URL` in a file named `my-app/.env`, and set `CLIENT_ORIGIN` in the server's `.env` file to the address of the website.


# Tests
To run the server tests:
 * Open a console window to the project folder
 * Type `npm test`

The tests do not need the `.env` file or a database. They start a temporary MongoDB on your computer and throw it away afterwards, so they never touch real data. The first run downloads MongoDB (about 500 MB), which can take a few minutes.

To run the website tests, type `npm test` in the `my-app` folder.

Both sets of tests also run on GitHub for every push and pull request.


# Admin Accounts
Every account made through the website is a normal account. To make an account an admin, set its `admin` field to `1` in the `users` collection of the database (for example, with MongoDB Compass or Atlas), then log in again.
