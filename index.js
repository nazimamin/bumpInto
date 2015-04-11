var http = require('http'),
    express = require('express'),
    path = require('path'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    CollectionDriver = require('./collectionDriver').CollectionDriver;

// metadata  
var app = express();
app.set('port', process.env.PORT || 8080); 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.bodyParser()); // <-- add

// 
var mongoHost = 'localHost'; //A
var mongoPort = 27017; 
var collectionDriver;
var JSONtemp;
 
var mongoClient = new MongoClient(new Server(mongoHost, mongoPort)); //B
mongoClient.open(function(err, mongoClient) { //C
  if (!mongoClient) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1); //D
  }
  var db = mongoClient.db("MyDatabase");  //E
  collectionDriver = new CollectionDriver(db); //F
});


app.use(express.static(path.join(__dirname, 'public')));
 
app.get('/', function (req, res) {
  res.render('main')
});
 
// ths is our get function, this s importnat
// 
app.get('/data', function(req, res) { //A
   var params = req.params; //B this gets al params
   dbCollection = 'players' // this makes a collection
   //console.log(req)
   collectionDriver.findAll(dbCollection, function(error, objs) { //C
        if (error) { res.send(400, error); } //D
        else { 
            if (req.accepts('html')) { //E
                res.render('data',{objects: objs, collection: dbCollection}); //F
              } else {
            res.set('Content-Type','application/json'); //G
                  res.send(200, objs); //H
              }
         }
    });
});

// we fuck with post
// in post, the body, is teh json, sooooo.... 
//we place the json in the db, as well as comparing it to every other thing in the db
// and then i worry about returning, later
app.post('/data', function(req, res) { //A
    var object = req.body; // this is the JSON
    console.log(object)// this is theest that shows tht the post went through
    var dbCollection = 'players';
    JSONtemp = object;
    // insted of object.score, we'll implement object.x or object.y, probbly both
    object.Score = parseInt(object.Score) // idk why this is done tho
    collectionDriver.save(dbCollection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});




 
app.get('/data/:collection', function(req, res) { //A
   var params = req.params; //B
   console.log(req.params.collection) //name
   var userName = req.params.collection
   var dbCollection = 'players'
   collectionDriver.getPercentile(dbCollection, userName, function(error, objs) { //C
    	  if (error) { res.send(400, error); } //D
	      else { 
                  res.send(200, objs); //H  
              }
   	});
});

app.post('/data/:collection', function(req, res) { //A
    var object = req.body;
    console.log(object);
    var collection = req.params.collection;
    collectionDriver.save(collection, object, function(err,docs) {
          if (err) { res.send(400, err); } 
          else { res.send(201, docs); } //B
     });
});

 
app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});