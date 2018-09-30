var mongoose=require("mongoose");
var passportLocalMongo=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
    username:String,
    password:String
});

UserSchema.plugin(passportLocalMongo);

module.exports=mongoose.model("User",UserSchema);