const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const handlebarsHelpers = require('handlebars-helpers')();

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

require("./db/conn");
const Register = require("./models/registers");
const Course = require("./models/courses");

const port = process.env.PORT || 3000;
const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", templates_path);

hbs.registerPartials(partials_path);
hbs.registerHelper(handlebarsHelpers);

// Set up session store
const store = new MongoDBStore({
  uri: "mongodb+srv://admin:admin123@cluster0.yiblqcl.mongodb.net/",
  collection: "sessions",
});

// Handle session store errors
store.on("error", function (error) {
  console.log(error);
});

// Use express-session middleware
app.use(
  session({
    secret: "mynameissubhrathasinha",
    resave: true,
    saveUninitialized: true,
    store: store,
  })
);

// Custom middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    res.locals.isAuthenticated = true;
  } else {
    res.locals.isAuthenticated = false;
  }
  next();
};

app.use(isAuthenticated);

// Home page route
app.get("/", (req, res) => {
  res.render("index", { isAuthenticated: res.locals.isAuthenticated });
});

// Registration page route
app.get("/register", (req, res) => {
  res.render("register", { isAuthenticated: res.locals.isAuthenticated });
});

// Create new user in the database
app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;

    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        age: req.body.age,
        gender: req.body.gender,
        password: password,
        confirmpassword: cpassword,
      });

      const registered = await registerEmployee.save();
      res.redirect("/profile"); // Redirect to profile page after successful registration
    } else {
      res.send("Password is not matching");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login page route
app.get("/login", (req, res) => {
  res.render("login", { isAuthenticated: res.locals.isAuthenticated });
});

// Login check route
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await Register.findOne({ email: email });

    if (user && user.password === password) {
      req.session.user = user; // Set user in the session
      res.redirect("/courses"); // Redirect to courses page after successful login
    } else {
      res.send("Incorrect login details");
    }
  } catch (error) {
    res.status(400).send("Invalid login details");
  }
});

// Courses page route (list of courses)
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.render("courses", { courses, isAuthenticated: res.locals.isAuthenticated });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Course details page route
app.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    res.render("courseDetails", { course, isAuthenticated: res.locals.isAuthenticated });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Profile page route
app.get("/profile", async (req, res) => {
  try {
    if (res.locals.isAuthenticated) {
      // Retrieve the details of the logged-in user from the session
      const userId = req.session.user._id;
      const user = await Register.findById(userId);

      if (user) {
        res.render("profile", { user, isAuthenticated: res.locals.isAuthenticated });
      } else {
        res.status(404).send("User not found");
      }
    } else {
      res.redirect("/login"); // Redirect to login if not authenticated
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update profile route
app.post("/update-profile", async (req, res) => {
  try {
    const userId = req.session.user._id;
    const updatedUser = await Register.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          phone: req.body.phone,
          age: req.body.age,
          gender: req.body.gender,
        },
      },
      { new: true }
    );
    if (updatedUser) {
        //res.redirect("/profile");
        //Redirect to the profile page after successful update
      res.json({ success: true });
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server is running at port no ${port}`);
});
