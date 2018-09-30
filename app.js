var express=require("express");
var http=require("http");
var User = require("./models/user");
var mongoose = require("mongoose");
var request=require("request");
var bodyParser=require("body-parser");
var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
const flash = require("express-flash-messages");
app.use(flash());
var app=express();

mongoose.connect("mongodb://admin:admin83@ds159812.mlab.com:59812/loginegapp");

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");


//auth requirements
app.use(require("express-session")({
   resave:false,
   saveUninitialized:false,
   secret:"randomsecret"
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
passport.deserializeUser(function(userId, done) {
    User.findById(userId, (err, user) => done(err, user));
  });

const local = new LocalStrategy((username, password, done) => {
    User.findOne({ username })
      .then(user => {
        if (!user || !user.validPassword(password)) {
          done(null, false, { message: "Invalid username/password" });
        } else {
          done(null, user);
        }
      })
      .catch(e => done(e));
  });

passport.use("local", local);

app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
})

//--------------------------------------------------//
//auth
app.get("/login",isloggedOut,function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register")
})

app.post("/register", (req, res, next) => {
    const { username, password } = req.body;
    User.create({ username, password })
      .then(user => {
        req.login(user, err => {
          if (err) next(err);
          else res.redirect("/");
        });
      })
      .catch(err => {
        if (err.name === "ValidationError") {
          req.flash("Sorry, that username is already taken.");
          res.redirect("/register");
        } else next(err);
      });
  });

app.post("/login",passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// ---------------------------------------------------------//

//auth middleware
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.redirect("/login");
  };

const isloggedOut = (req, res, next) => {
      if (req.isUnauthenticated()) next();
      else res.redirect("/");
  };

//---------------------------------------------------------//  

//routes

app.get("/",function(req,res){
    res.render("index");
});

app.get("/home",isLoggedIn,function(req,res){
    res.render("home");
});

app.get("/about",function(req,res){
    res.render("about");
});

app.get("/cars",function(req,res){
    res.render("cars");
});

app.get("/service",function(req,res){
    res.render("service");
});

app.get("/team",function(req,res){
    res.render("team");
});

app.get("/blog-home",function(req,res){
    res.render("bloghome");
});

app.get("/blog-single",function(req,res){
    res.render("blogsingle");
});

app.get("/elements",function(req,res){
    res.render("elements");
});

//trash route
app.get("*",function(req,res){
    res.render("error");
});


//server
var server = http.createServer(app);

var port = process.env.PORT;
  app.set('port', port);

server.listen(port);