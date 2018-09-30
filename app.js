var express=require("express");
var http=require("http");
var User = require("./models/user");
var mongoose = require("mongoose");
var request=require("request");
var bodyParser=require("body-parser");
var passport = require("passport");
var localStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var methodOverride = require("method-override");
var app=express();

mongoose.connect("mongodb://admin:admin83@ds159812.mlab.com:59812/loginegapp");

app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

//login and signup module
app.use(express.static("public"));
app.use(express.static("views/loginmod"));
app.use(express.static("views/loginmod/css"));
app.use(express.static("views/loginmod/fonts"));
app.use(express.static("views/loginmod/images"));
app.use(express.static("views/loginmod/js"));
app.use(express.static("views/loginmod/vendor"));

//auth requirements
app.use(require("express-session")({
   secret:"password",
   resave:false,
   saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
})


var parsedData={};

//home
app.get("/",function(req,res){
    res.render("home");
});

app.get("/main",isLoggedIn,function(req,res){
    res.render("landing");
});

//auth
app.get("/login",function(req,res){
    res.render("login");
});

app.get("/signup",function(req,res){
    res.render("signup")
})

app.post("/register",function(req,res){
    User.register(new User(
    {username:req.body.username}),
    req.body.password,
        function(err,user){
            if(err)
            {
                console.log(err);
                res.render("signup");
            }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/login");
        });
    });
});

app.post("/login",passport.authenticate("local",{
    failureRedirect:"/login"}),
    function(req,res){
        res.redirect("/main");
    });

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});  

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//trash
app.get("*",function(req,res){
    res.render("error");
});



//server
var server = http.createServer(app);

var port = process.env.PORT;
  app.set('port', port);

server.listen(port);