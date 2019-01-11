// require what is needed

var express = require("express");
var exphbs = require("express-handlebars")
var logger = require("morgan");
var mongoose = require("mongoose");

//scraping tools go here, include Axios (promised-based http library, similar to Ajax)
var axios = require("axios");
var cheerio = require("cheerio");

//require all models (database tables)
var db = require("./models");

var PORT = process.env.PORT || 3000;

//initialize express
var app = express();

//configure middleware: software that acts as a bridge between an operating system or database and applications, especially on a network.

//use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// make Public a static folder
app.use(express.static("public"));

app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");
//connect to the Mongo DB

//mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/sheltered-meadow-65065.git";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//routes

app.get("/", function(req, res){
    db.Article.find({})
    .then(function(dbArticle){
        console.log(dbArticle);
        res.render("index", {Articles: dbArticle});
    })
    .catch(function(err){
        res.json(err);
    });
})

//Get is needed to scrape the news site
app.get("/scrape", function(req, res){
    //grab the body of the html with axios (similar to ajax)
    axios.get("http://www.espn.com/mens-college-basketball/").then(function(response){
         // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        //now, grab every headline within an article tag 
        $("article h1").each(function(i, element){
          //save into an empty result object
          var result = {};

        //add the text and href of every link, save them as properties of result object
        result.title = $(this)
          .children("a")
          .text();
        result.link = $(this)
          .children("a")
          .attr("href");

        //create a new article using the result object
        db.Article.create(result)
          .then(function(dbArticle){
              console.log(dbArticle);
          })
          .catch(function(err){
              console.log(err);
          });
        });

        //send message to let know complete
        res.send("Scrape Complete");
    });
});

//route for getting articles from the db
app.get("/articles", function(req, res){
  db.Article.find({})
    .then(function(dbArticle){
      res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//route for getting a specific article by id, include it's comment 
app.get("/articles/:id", function(req, res){
  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbArticle){
        res.json(dbArticle);
    })
    .catch(function(err){
        res.json(err);
    });
});

//route for saving, use POST, the article's comment
app.post("/articles/:id", function(req, res){
    //create a new comment
    db.Comment.create(req.body)
      .then(function(dbComment){
          return db.Article.findOneAndUpdate({ _id: req.params.id }, {comment: dbComment._id }, {new: true });
      })
      .then(function(dbArticle){
          res.json(dbArticle);
      })
      .catch(function(err){
          res.json(err);
      });
});

app.get("/saved/:id", function(req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }, { new: true })
    .then(function(dbArticle){
        res.render("index", {Articles: dbArticle});
    })
    .catch(function(err){
        res.json(err);
    });
});

//start the server
app.listen(PORT, function(){
    console.log("App running on port " + PORT + "!");
});
