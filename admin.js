const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const port = process.env.PORT || 3009;

// Set up EJS and static files
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost/laundry', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const adminSchema = new mongoose.Schema({
  name: String,
  email:String,
  position: String,
  woxsenID: String,
  phone: Number,
  password: String,
});
// Set up the admin model correctly
const admin = mongoose.model('Admin', adminSchema);

// Admin Registration route
app.get('/admin_reg', (req, res) => {
  res.render('admin_reg');
});

app.post('/admin_reg', async (req, res) => {
  try {
    const { name, email, position, woxsenID, phone, password } = req.body;

    // Hash the password using bcrypt
    const saltRounds = 10; // Adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Save admin data to MongoDB with the hashed password
    const adminUser = new admin({
      name,
      email,
      position,
      woxsenID,
      phone,
      password: hashedPassword, // Store the hashed password in the database
    });

    await adminUser.save();
    res.send('Admin Registered');
  } catch (error) {
    console.error(error);
    res.send('error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
