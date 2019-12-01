var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require('express-sanitizer')
var dotenv = require('dotenv');

dotenv.config();

// APP CONFIG
var url = process.env.DATABASEURL || 'mongodb://localhost/my_blog_app';
mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true
});
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer())
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(methodOverride('_method'));

// MONGOOSE/MODEL/CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

// RESTful Routes

app.get("/",function(req,res){
    res.redirect("/blogs");
});

// INDEX
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err)
            console.log(err);
        else
        res.render("index",{blogs:blogs});
    });
});

// NEW
app.get("/blogs/new",function(req,res){
    res.render("new");
});

// CREATE
app.post("/blogs",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err)
        res.render("new");
        else
        res.redirect("/blogs/"+newBlog._id);
    })
});

// SHOW
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err)
        res.redirect("/blogs");
        else
        res.render("show",{blog:foundBlog});
    });
});

// EDIT
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err)
        res.redirect("/blogs");
        else
       res.render("edit",{blog:foundBlog}); 
    });
});

// UPDATE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err)
        res.redirect("/blogs");
        else
        res.redirect("/blogs/"+req.params.id);
    });
});

app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndDelete(req.params.id,function(err,deletedBlog){
        if(err)
        res.redirect("/blogs/"+req.params.id);
        else
        res.redirect("/blogs");
    });
});

var port = process.env.PORT || 3000;
app.listen(port,process.env.IP,function(){
    console.log("Blog App started!");
});