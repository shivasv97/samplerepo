var express = require("express");
var router = express();
var fs = require("fs");
var router = express.Router()
var multer = require("multer");
var upload = multer({dest: "./uploads"});

var mongoose = require("mongoose");

mongoose.connect('mongodb://admin:ccbd1@ds143030.mlab.com:43030/imagedb')
var conn = mongoose.connection;

var sess = { id: "" }

var Schema = new mongoose.Schema({
  _id : String,
  name : String,
  pass : String,
  age: Number,
  images : { type : Array },
  following : { type : Array }
});

var quotesSchema = new mongoose.Schema({
  name : String,
  quote : String
});

var user_rough = mongoose.model('emp', Schema);
var quotes = mongoose.model('quotes', quotesSchema);

//var Song = mongoose.model('fs.files');

var gfs;

var images_to_render = [];

var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;

conn.once("open", function(){
  gfs = Grid(conn.db);
  router.get("/user/upload", function(req,res){
    //renders a multipart/form-data form
    res.render("home");
  });

  //second parameter is multer middleware.
  router.post("/user/upload", upload.single("avatar"), function(req, res, next){
    //create a gridfs-stream into which we pipe multer's temporary file saved in uploads. After which we delete multer's temp file.
    console.log("File name : " + req.file.originalname);

    var writestream = gfs.createWriteStream({
      filename: req.file.originalname
    });
    //
    // //pipe multer's temp file /uploads/filename into the stream we created above. On end deletes the temporary file.
    fs.createReadStream("./uploads/" + req.file.filename)
      .on("end", function(){fs.unlink("./uploads/"+ req.file.filename, function(err){res.send("<h1 align='center'>success</h1><br/><br/><a href = '/user/upload'><h3>BACK</h3></a>")})})
        .on("err", function(){res.send("Error uploading image")})
          .pipe(writestream);

    // update the users image list

      var a = [];
      a.push(req.file.originalname);
      user_rough.find({_id : sess.id}, function(err,docs){
      if(err){
        res.send("Error Fetching");
      }
      else{
        //res.send(docs[0].images);
        var c = a.concat(docs[0].images);
        //res.send(c);
        docs[0]._id = docs[0]._id;
        docs[0].name = docs[0].name;
        docs[0].pass = docs[0].pass;
        docs[0].age = docs[0].age;
        docs[0].images = c;
        docs[0].following = docs[0].following;

        docs[0].save(function (err, docs) {
            if (err) {
                res.send(err)
            }
            //res.send(docs);
        });
        //res.send("Updated the database");
        console.log("UPdated users image list")
      }
    });

  });

  // sends the image we saved by filename.
  router.get("/:filename", function(req, res){
  	  //var x = fs.files.findOne();
      var readstream = gfs.createReadStream({filename: req.params.filename});
     // var readstream = gfs.createReadStream(x);
      readstream.on("error", function(err){
        res.send("No image found with that title");
      });
      readstream.pipe(res);
  });

  // sends the image we saved by filename.
  /*router.get("/get", function(req, res){
        gfs.files.find().toArray(function(err, files){
            if (files.length == 0){
                return res.status(400).send({
                    message:"NO FILES"
                });
            }*/
            //console.log(files);
            /*forEach(x in files){
                var readstream = gfs.createReadStream(files[0]);
                readstream.on("error", function(err){
                    res.send("Couldnt render image");
                });
                readstream.pipe(res);
            }*/
            /*data = []
            files.forEach(function(items){*/
                /*var readstream = gfs.createReadStream(items);
                readstream.on("error", function(err){
                    res.send("Couldnt render image");
                });
                readstream.pipe(res);*/
                //console.log(items);
                /*var readstream = gfs.createReadStream(items);
                readstream.on("error", function(err){
                    res.send("Couldnt render image");
                });
                //readstream.pipe(res);
                data.push(readstream);
            });
            //data[0].pipe(res)
            data[2].pipe(res);
            console.log(data[0]);
            //res.send("All items fetched..... Check console");
        });
  });*/


  router.get("/user/getImages", function(req, res){
    user_rough.find({_id : sess.id}, function(err,docs){
      if(err){
        res.send("Error Fetching");
      }
      else{
        //res.send(a);
        if(docs[0].images.length == 0 && (docs[0].following).length == 0){
          res.send("<h1>NO UPLOADED IMAGES</h1><br/><a href = '/user/upload'>BACK</a>");
        }
        else if((docs[0].following).length != 0){
            myImages = (docs[0].images).length;
            images_to_render = images_to_render.concat(docs[0].images);
            var temp = docs[0].images;
            console.log("Current users images : " + images_to_render);
            var all_following = docs[0].following;
            console.log("All following  = " + all_following);
            for(var i = 0 ; i < all_following.length ; i++){
                (function(i){
                //var i = 0;
                //all_following.forEach(function(following_id){
                    //i++;
                    user_rough.find( { _id : all_following[i] }, function(err, doc){
                    //user_rough.find( { _id : following_id }, function(err, doc){
                    console.log("Followers ID in for loop : " + doc[0]._id);
                    console.log("Followers images : " + doc[0].images);
                    if(err){
                        res.send("ERROR");
                    }
                    else{
                        if((doc[0].images).length >= 1){
                            console.log("I am here!!");
                            /*for(var j = 0; j < (doc[0].images).length ; j++){
                                temp.push((doc[0].images)[j]);
                            }*/
                            temp = temp.concat(doc[0].images);
                            console.log("i = ");
                            //images_to_render = images_to_render.concat(doc[0].images);
                            if(i == (all_following.length - 1)){
                                console.log("temp after conctenating : " + temp);
                                res.render("a", a = { my: myImages, names : temp });
                            }
                            //x = a;
                        }
                        //console.log("a after conctenating : " + images_to_render);
                        //temp = images_to_render;
                    }
                });
                //res.render("a", a = { names : images_to_render });
                //console.log("i = " + i);
            })(i);
        }

            //console.log("all images : ", temp);
            //res.send(temp);
        }
        else{
            res.render("a", a = { my: (docs[0].images).length, names : docs[0].images } );
        }
      }
    });
  });


  //delete the image
  router.get("/delete/:filename", function(req, res){
    gfs.exist({filename: req.params.filename}, function(err, found){
      if(err) return res.send("Error occured");
      if(found){
        gfs.remove({filename: req.params.filename}, function(err){
          if(err) return res.send("Error occured");
          res.send("Image deleted!");
        });
      } else{
        res.send("No image found with that title");
      }
    });
  });

  router.get("/", function(req, res){
    res.render("b");
  });

  router.post("/user/registered", function(req, res){
    console.log("Name entered : " + req.body.name);
    console.log("Password entered : " + req.body.pass);

    new user_rough({
      _id : req.body.email,
      name : req.body.name,
      pass: req.body.pass,
      age: req.body.age,
      images: [],
      following: []
    }).save(function(err, doc){
        if(err){
          res.json(err);
        }
        else{
          res.render("registered");
        }
    });

    //res.send("Check the console");
  });

  router.get("/user/login", function(req, res){
    res.render("login");
  });

  router.post("/user/postlogin", function(req, res){
    var id = req.body.email;
    var password = req.body.pass;
    console.log("Id : " + id);
    console.log("Password : " + password);

     user_rough.find({_id : id}, function(err, docs) {
      if(err){
        res.send("Error");
      }
      //console.log(docs[0]);
     // res.send(docs[0].pass);
     if(password == docs[0].pass){
      console.log("Correct Password");
      sess.id = id;
      console.log("In session ID: " + sess.id);
      images_to_render = [];
      res.redirect("/user/upload");
     }
     else{
      console.log("Wrong Password");
      res.redirect("/user/login");
     }
    });
  });

  router.get("/user/logout", function(req, res){
    sess.id = "";
    console.log("In session ID: " + sess.id);
    res.send("<h2> LOGGED OUT </h2><br/><a href = '/user/login'><h3>LOG IN</h3></a>");
  });

  //follow people
  router.get("/user/follow", function(req, res){
    user_rough.find({}, function(err, docs){
        if(err){
          res.send("Couldnt fetch");
        }
        else{
          res.render("follow", users = docs);      
        }
    });
    //res.render("follow");
  });

  router.post("/user/follow", function(req, res){
    email = req.body.email;
    user_rough.find({_id : email}, function(err,docs){
      if(err){
        res.send("Error Fetching");
      }
      else{
          if(docs.length == 1){
              //console.log("docs[0]._id = " + docs[0]._id);

              user_rough.find({_id : sess.id}, function(err,docs){
              if(err){
                res.send("Error Fetching");
              }
              else{
                 // console.log(docs[0].following);
                 //res.send(docs[0].images);
                 //res.send(c);
                 var found = false;
                 for(var i = 0; i < (docs[0].following).length; i++){
                  if((docs[0].following)[i] == req.body.email){
                    found = true;
                  }
                 }
                 if(found){
                   console.log("Already following !!");
                   res.send("Already following !!<br/><br/><a href = '/user/follow'>Go Back</a>");
                 }
                 else{
                    console.log("Weren't Following before");
                    docs[0]._id = docs[0]._id;
                    docs[0].name = docs[0].name;
                    docs[0].pass = docs[0].pass;
                    docs[0].age = docs[0].age;
                    docs[0].images = docs[0].images;
                    docs[0].following = (docs[0].following).concat([req.body.email]);

                    docs[0].save(function (err, docs) {
                       if (err) {
                           res.send(err)
                        }
                        //res.send(docs);
                    });
                //res.send("Updated the database");
                    console.log("Updated users following list")
                    res.send("FOLLOWING NOW<br/><br/><a href = '/user/upload'>BACK</a>");
                 }
              }
            });

          }
          else{
              res.send("Invalid ID.....<br/><br/><a href = '/user/follow'>RETRY</a>");
          }
     }
     });
    });

  /*router.get("/user/shit", function(req, res){
    var a = ["spiderman.jpg"];
    user_rough.find({_id : sess.id}, function(err,docs){
      if(err){
        res.send("Error Fetching");
      }
      else{
        //res.send(docs[0].images);
        var c = a.concat(docs[0].images);
        //res.send(c);
        docs[0]._id = docs[0]._id;
        docs[0].name = docs[0].name;
        docs[0].pass = docs[0].pass;
        docs[0].age = docs[0].age;
        docs[0].images = c;

        docs[0].save(function (err, docs) {
            if (err) {
                res.send(err)
            }
            //res.send(docs);
        });
        res.send("Updated the database");
      }
    });
    //user_rough.update({_id : sess.id}, $set: { some_key : new_info  })
  });*/

});

module.exports = router;

/*router.set("view engine", "ejs");
router.set("views", "./views");



if (!module.parent) {
  router.listen(3000);
}

*/

//var express = require('express');
/*var router = express.Router();
var mongoose = require('mongoose');
*/
/* GET home page. */
/*router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

mongoose.connect('mongodb://admin:ccbd1@ds143030.mlab.com:43030/imagedb')
mongoose.model('quotes',{ name: String, quote: String });
router.get('/mongo', function(req, res, next) {
	mongoose.model('quotes').find(function(err, quotes){
		res.send(quotes);
	});
});
module.exports = router;*/
