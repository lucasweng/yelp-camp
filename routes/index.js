const express    = require("express"),
      router     = express.Router(),
      passport   = require("passport"),
      User       = require("../models/user");

// root route
router.get('/', (req, res) => res.render('landing'));

// show register form
router.get("/register", (req, res) => res.render("register", {page: "register"}));

// handle sign up logic
router.post("/register", (req, res) => {
  let newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  });
  
  if (req.body.adminCode === process.env.ADMINCODE) {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate email
        req.flash("error", "That email has already been registered.");
        return res.redirect("/register");
      } 
      // Some other error
      req.flash("error", "Something went wrong...");
      return res.redirect("/register");
    }
    
    passport.authenticate("local")(req, res, () => {
      req.flash("success", "Welcome to YelpCamp " + user.username);
      res.redirect("/campgrounds");
    });
  });
});

// show login form
router.get("/login", (req, res) => res.render("login", {page: "login"}));

// login logic: app.post("/login", middleware, callback)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash("error", "Invalid username or password");
      return res.redirect('/login');
    }
    req.logIn(user, err => {
      if (err) { return next(err); }
      let redirectTo = req.session.redirectTo ? req.session.redirectTo : '/campgrounds';
      delete req.session.redirectTo;
      req.flash("success", "Good to see you again, " + user.username);
      res.redirect(redirectTo);
    });
  })(req, res, next);
});

// logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Logged out seccessfully. Look forward to seeing you again!");
  res.redirect("/campgrounds");
});

module.exports = router;