# Laundry Management System

The Laundry Management System is a web-based application developed using Node.js, Express, MongoDB, and other technologies. It provides a platform for managing laundry services for a university or similar institution.

## Features

- **User Authentication:** Secure login system for both regular users and administrators.
- **User Registration:** New users can register by providing their details.
- **Email Verification:** Email verification system to ensure user authenticity.
- **Admin Panel:** Dashboard for administrators to manage user data and laundry services.
- **Laundry Submission:** Users can submit their laundry details, including the number of clothes to be laundered.
- **Laundry Search:** Admins can search and view laundry submissions based on various criteria.
- **Laundry Pickup:** Admins can mark laundry as picked up after completion.
- **Automatic Data Cleanup:** Scheduled tasks to delete unsubmitted records after 6 hours and picked up records after 24 hours.

## Technologies Used

- **Node.js:** Server-side JavaScript runtime.
- **Express:** Web application framework for Node.js.
- **MongoDB:** NoSQL database for storing user and laundry data.
- **Mongoose:** MongoDB object modeling for Node.js.
- **Express Session:** Session middleware for Express.
- **Bcrypt:** Password hashing for enhanced security.
- **Nodemailer:** Sending emails for registration confirmation and other notifications.
- **Cron:** Scheduling tasks for automatic data cleanup.
- **EJS:** Templating engine for rendering HTML pages.

## Setup Instructions

**Prerequisites:**
- Node.js installed
- MongoDB installed and running

1. **Install Dependencies:**
   - Express
   - Mongoose
   - Express Session
   - Body Parser
   - Bcrypt
   - Path
   - Cron
   - Nodemailer
   - EJS

2. **Set up MongoDB:**
   - Install MongoDB and start the MongoDB server.
   - Update the MongoDB connection string in `app.js` with your database information.

3. **Configure Nodemailer:**
   - Replace the email and password in the transporter setup with your email credentials.
   - Ensure to enable "less secure app access" for the email account.

4. **Run the Application:**
   - Visit http://localhost:3000 in your browser to access the application.

## Project Structure

- **views/:** Contains EJS templates for rendering HTML pages.
- **public/:** Stores static assets (stylesheets, client-side scripts, images).
- **models/:** Defines Mongoose schemas for MongoDB.
- **routes/:** Defines Express routes for handling different URL paths.
- **controllers/:** Implements logic for handling route requests.
- **middlewares/:** Custom middleware functions, including user session authentication.
- **utils/:** Utility functions used across the application.
- **app.js:** Main application file where the Express app is configured.

## Usage

- Visit `/login` to log in as an admin or regular user.
- Admins can manage users, search and handle laundry submissions.
- Regular users can submit laundry details and view their submissions.

## Acknowledgments

- Thank you to Node.js and Express for providing a robust platform for web development.
- Special thanks to Nodemailer for enabling email communication within the application.
