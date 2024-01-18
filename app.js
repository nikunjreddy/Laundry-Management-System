const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const bcrypt = require('bcrypt');
const path = require('path');
const cron = require('node-cron');
const port = process.env.PORT || 3000;
const nodemailer = require('nodemailer');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));

mongoose.connect('mongodb://localhost/laundry', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  school: String,
  woxsenID: String,
  phone: Number,
  email:String,
  block: String,
  room_no: String,
  password: String,
  verify: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model('User', userSchema);

const adminSchema = new mongoose.Schema({
  name: String,
  email:String,
  position: String,
  woxsenID: String,
  phone: Number,
  password: String,
});

const admin = mongoose.model('Admin', adminSchema);

const detailSchema = new mongoose.Schema({
  name: String,
  school: String,
  woxsenID: String,
  phone: String,
  email:String,
  block: String,
  room_no: String,
  isSubmitted: {
    type: Boolean,
    default: false,
  },
  submittedAt: {
    type: Date,
    validate: {
      validator: function (value) {
        return !isNaN(value);
      },
      message: 'Invalid date for submittedAt',
    },
  },
  pickedUp: {
    type: Boolean,
    default: false,
  },
  pickedUpAt: {
    type: Date,
    default: null,
  },
  numberOfClothes: Number,
});

const Detail1 = mongoose.model('Detail1', detailSchema);
const Detail2 = mongoose.model('Detail2', detailSchema);
const Detail3 = mongoose.model('Detail3', detailSchema);
const Detail4 = mongoose.model('Detail4', detailSchema);
const Detail5 = mongoose.model('Detail5', detailSchema);
const Detail6 = mongoose.model('Detail6', detailSchema);

// Create a Mongoose schema
const studentSchema = new mongoose.Schema({
  name: String,
  phone: String,
  applicationNumber: String,
  query: String
});

const Student = mongoose.model('query', studentSchema);

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use your email service provider here
  auth: {
    user: 'minorprojectatwoxsen@gmail.com', // Replace with your email address
    pass: 'nfps tybo maeh qoin', // Replace with your email password
  },
});

// Middleware to check for user session in all routes except for /login
app.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/verify') {
    next();
  } else if (!req.session.user) {
    // Send alert and redirect to login page
    res.send(`
      <script>
        var confirmation = confirm("Session expired. Please log in again.");
        if (confirmation) {
          window.location = "/login";
        } else {
          // Stop the page reload on cancel
          history.pushState(null, null, window.location.href);
          window.addEventListener('popstate', function () {
            history.pushState(null, null, window.location.href);
          });
        }
      </script>
    `);
  } else {
    next();
  }
});


app.get('/', (req, res) => {
  if (req.session.user) {
    req.session.destroy();
  }
  res.render('login');
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    req.session.destroy();
  }
  res.render('login');
});

app.post('/login', async (req, res) => {
  if (req.session.user) {
    req.session.destroy();
  }
  const { woxsenID, password } = req.body;
  const adminUser = await admin.findOne({ woxsenID });
  if (adminUser) {
    try {
      const passwordMatch = await bcrypt.compare(password, adminUser.password);
      if (passwordMatch) {
        req.session.user = adminUser;
        res.redirect('/admin');
      } else {
        // Send alert and redirect to login page
        res.send('<script>alert("Invalid username or password."); window.location="/login";</script>');
      }
    } catch (error) {
      console.error('Error during bcrypt comparison:', error);
      // Send alert and redirect to login page
      res.send('<script>alert("An error occurred during password comparison."); window.location="/login";</script>');
    }
  } else {
    const regularUser = await User.findOne({ woxsenID });
    if (regularUser) {
      if (!regularUser.verify) {
        return res.send('<script>alert("Please verify your email before logging in."); window.location="/login";</script>');
      }
      const passwordMatch = await bcrypt.compare(password, regularUser.password);
      if (passwordMatch) {
        req.session.user = regularUser;
        res.redirect('/nonadmin');
      } else {
        // Send alert and redirect to login page
        res.send('<script>alert("Invalid username or password."); window.location="/login";</script>');
      }
    } else {
      // Send alert and redirect to login page
      res.send('<script>alert("Invalid username or password."); window.location="/login";</script>');
    }
  }
});

app.get('/logout', (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy(err => {
      if (err) {
          console.error('Error destroying session:', err);
      }
      res.redirect('/login');
  });
});

app.get('/nonadmin', (req, res) => {
  if (!req.session.user) {
      // Redirect to login if user is not available
      return res.redirect('/login');
  }

  // Assuming regularUser is the object you want to pass to the template
  const regularUser = req.session.user;

  res.render('userpanel', { regularUser });
});




app.get('/register', (req, res) => {
  if (!req.session.user) {
    // Redirect to login if user is not available
    return res.redirect('/login');
}
// Assuming regularUser is the object you want to pass to the template
const adminUser = req.session.user;

res.render('register', { adminUser });});

app.post('/register', async (req, res) => {
  try {
    const { name, school, woxsenID, phone, email, block, room_no, password } = req.body;
    // Check if user with the same woxsenID already exists
    const existingUser = await User.findOne({ woxsenID });
    if (existingUser) {
      return res.status(400).then(() => {
        res.json({ success: true, message: 'ID Already Registered' });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ success: false, error: 'Error saving data' });
    });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      school,
      woxsenID,
      phone,
      email,
      block,
      room_no,
      password: hashedPassword,
      verify: false,
    });
    // Send registration confirmation email to the user
    const registrationMailOptions = {
      from: 'minorprojectatwoxsen@gmail.com',
      to: user.email,
      subject: 'Registration Confirmation',
      text: 'Thank you '+user.name+' for registering for laundry services. Verify Your Email before logging in.\n Click the following link to verify your email:<a href="http://localhost:3000/verify?id='+user._id+'">Verify</a>',
    };

    transporter.sendMail(registrationMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending registration email:', error);
      } else {
        console.log('Registration email sent:', info.response);
      }

    });
    await user.save()
    .then(() => {
      res.json({ success: true, message: 'Registered Seccessfully' });
  })
  .catch(err => {
      console.log(err);
      res.status(500).json({ success: false, error: 'Error saving data' });
  });  } catch (error) {
    console.error(error);
    res.send('Error');
  }
});

app.get('/verify', async (req, res) => {
  try {
    const userId = req.query.id;
    
    // Update the user's verification status
    const updateVerify = await User.updateOne({ _id: userId }, { $set: { verify: true } });

    if (updateVerify.modifiedCount === 1) {
      // Verification successful
      

      // Send registration confirmation email
      const user = await User.findById(userId);
      const registrationMailOptions = {
        from: 'minorprojectatwoxsen@gmail.com',
        to: user.email,
        subject: 'Registration Confirmation',
        text: `Dear ${user.name},\nYour email has been verified.`,
      };

      transporter.sendMail(registrationMailOptions, (error, info) => {
        if (error) {
          console.error('Error sending registration email:', error);
        } else {
          console.log('Registration email sent:', info.response);
        }
      });

      res.send('<script>alert("Your Email Has Been Verified");</script>');
    } else {
      // No user was updated (invalid user ID)
      res.status(404).send('Invalid user ID');
    }
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).send('Error verifying email');
  }
});


app.get('/admin', (req, res) => {
  if (!req.session.user) {
    // Redirect to login if user is not available
    return res.redirect('/login');
}
// Assuming regularUser is the object you want to pass to the template
const adminUser = req.session.user;

res.render('adminpanel', { adminUser });
});

app.get('/services', (req, res) => {
  if (!req.session.user) {
    res.send('<script>alert("Session expired. Please log in again."); window.location="/login";</script>');
  } else {
    res.redirect('/searchday');
  }
});


// Inside your /searchday route
app.get('/searchday', async (req, res) => {
  if (!req.session.user) {
    res.send('<script>alert("Session expired. Please log in again."); window.location="/login";</script>');
  } else {
    const day = req.query.day;
    const detailModel = mongoose.model(`Detail${day}`, detailSchema);
    const details = await detailModel.find({}).sort('submittedAt');
    res.render('search', { details, selectedDay: day }); // Pass selectedDay to the template
  }
});

// Inside your /search route
app.post('/search', async (req, res) => {
  const { woxsenID, day } = req.body;
  const detailModel = mongoose.model(`Detail${day}`, detailSchema);
  const details = await detailModel.find({ woxsenID: woxsenID });
  res.render('search', { details, selectedDay: day });
});

app.post('/delete', async (req, res) => {
  const { id, day } = req.body;
  const detailModel = mongoose.model(`Detail${day}`, detailSchema);
  await detailModel.findByIdAndDelete(id);
  res.redirect('/searchday/?day=' + day);
});

app.post('/submit', async (req, res) => {
  const { id, day } = req.body;
  const detailModel = mongoose.model(`Detail${day}`, detailSchema);

  try {
    // Find the detail record by ID and update the submitted status
    await detailModel.findByIdAndUpdate(id, { isSubmitted: true, submittedAt: new Date() });

    // Retrieve the updated detail
    const updatedDetail = await detailModel.findById(id);

    // Send email to the user that their laundry has been submitted
    const submitLaundryMailOptions = {
      from: 'minorprojectatwoxsen@gmail.com',
      to: updatedDetail.email,
      subject: 'Laundry Submitted',
      text: 'Your laundry has been submitted successfully.',
    };

    transporter.sendMail(submitLaundryMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending submit laundry email:', error);
      } else {
        console.log('Submit laundry email sent:', info.response);
      }
    });

    res.redirect('/searchday/?day=' + day);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error marking record as submitted');
  }
});

app.post('/pickup', async (req, res) => {
  const { id, day } = req.body;
  const detailModel = mongoose.model(`Detail${day}`, detailSchema);

  try {
    const pickedUpAt = new Date();
    await detailModel.findByIdAndUpdate(id, { pickedUp: true, pickedUpAt });
    res.redirect('/searchday/?day=' + day);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error marking record as picked up');
  }
});

cron.schedule('* * * * * *', async () => {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  for (let i = 1; i <= 6; i++) {
    const detailModel = mongoose.model(`Detail${i}`, detailSchema);
    await detailModel.deleteMany({
      isSubmitted: false,
      submittedAt: { $lt: sixHoursAgo },
    });
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  for (let i = 1; i <= 6; i++) {
    const detailModel = mongoose.model(`Detail${i}`, detailSchema);
    await detailModel.deleteMany({
      pickedUp: true,
      pickedUpAt: { $lt: twentyFourHoursAgo },
    });
  }
});

app.get('/pre_drop', (req, res) => {
  // Assuming you have the user object in the session
  const user = req.session.user;
  res.render('index', { user });
});

app.post('/save', async (req, res) => {
  const { application_no, number_of_clothes } = req.body;

  try {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    const user = req.session.user;
    const day = new Date().getDay();
    const detailModel = mongoose.model(`Detail${day}`, detailSchema);
    // Check if a record already exists for the user on the current day
    const existingDetail = await detailModel.findOne({ woxsenID: application_no, submittedAt: { $ne: null } });

    if (existingDetail) {
      return res.send('A record already exists for this user on the current day');
    }

    const detail = new detailModel({
      name: user.name,
      school: user.school,
      woxsenID: user.woxsenID,
      phone: user.phone,
      email: user.email,
      block: user.block,
      room_no: user.room_no,
      numberOfClothes: number_of_clothes,
      submittedAt: new Date(),
    });

    await detail.save();
    // Send email to the user that their details have been saved
    const saveDetailsMailOptions = {
      from: 'minorprojectatwoxsen@gmail.com',
      to: user.email,
      subject: 'Details Saved',
      text: 'Dear '+user.name+'\nYour laundry drop for today has been scheduled. Please submit your laundry at the station within 6 hours.',
    };

    transporter.sendMail(saveDetailsMailOptions, (error, info) => {
      if (error) {
        console.error('Error sending save details email:', error);
      } else {
        console.log('Save details email sent:', info.response);
      }
    });
    
    res.send('Details Saved');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving details');
  }
});

app.get('/helpsub', (req, res) => {
  // Assuming you have the user object in the session
  const user = req.session.user;
  res.render('student-form', { user });
});


// Handle form submission
app.post('/helpsubmit', async (req, res) => {
  try {
      const { name, phone, applicationNumber, query } = req.body;
      const studentData = new Student({
          name,
          phone,
          applicationNumber,
          query
      });

      studentData.save()
          .then(() => {
              res.json({ success: true, message: 'Records successfully submitted' });
          })
          .catch(err => {
              console.log(err);
              res.status(500).json({ success: false, error: 'Error saving data' });
          });
  } catch (error) {
      console.error(error);
      res.status(500).send('Error saving details');
  }
});


app.get('/helpadmin', (req,res) => {
  res.render('student-information');
});

// Set up a route to retrieve and display student information
app.get('/helpstudents', async (req, res) => {
    try {
      const students = await Student.find({}).exec();
      res.json({ students: students });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
