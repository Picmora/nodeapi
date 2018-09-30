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


//auth requirements
app.use(require("express-session")({
   secret:"picmoraapp",
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

//routes

app.get("/",function(req,res){
    res.render("index");
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