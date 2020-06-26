
// Connect to express js
var express = require("express");
app = express();



//css folder
app.use(express.static("public"));


// body encoded url
app.use(express.urlencoded({extended:true}));

// Port for server
const PORT = 85;

// Connect to mongoDB
const MongoClient = require('mongodb').MongoClient
const uri = "mongodb+srv://masroor6:syntaxgroup1@cluster0-aupxl.mongodb.net/test?retryWrites=true&w=majority";

var db;

const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
	db = client.db("syntax");
	if (err) return console.log(err);
	app.listen(PORT, () => {
		console.log('listening on ' + PORT);
	});
	init(client);
});


var chosen = ["CSC343", "CSC369"];
var result;

//Set up the CalenderUI
const path = require('path');
const bodyParser = require("body-parser");
const{ ObjectId } = require('mongodb').ObjectId;

async function init(client) {
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	const db = client.db('eventList');
	const events = db.collection('events');

	app.get('/data', function (req, res) {
		events.find().toArray(function (err, data) {
			//set the id property for all client records to the database records, which are stored in ._id field
			for (var i = 0; i < data.length; i++){
				data[i].id = data[i]._id;
				delete data[i]["!nativeeditor_status"];
			}
			//output response
			res.send(data);
		});
	});

	app.post('/data', function (req, res) {
		var data = req.body;
		var mode = data["!nativeeditor_status"];
		var sid = data.id;
		var tid = sid;

		function update_response(err) {
			if (err)
				mode = "error";
			else if (mode == "inserted"){
				tid = data._id;
			}
			res.setHeader("Content-Type", "application/json");
			res.send({ action: mode, sid: sid, tid: String(tid) });
		}

		if (mode == "updated") {
			events.updateOne({"_id": ObjectId(tid)}, {$set: data}, update_response);
		} else if (mode == "inserted") {
			events.insertOne(data, update_response);
		} else if (mode == "deleted") {
			events.deleteOne({"_id": ObjectId(tid)}, update_response)
		} else
			res.send("Not supported operation");
	});
}

// Home Page Route
app.get("/", function(req, res){
    db.collection("cobalt").find({}).toArray(function(err, result) {
        if (err) throw err;
        res.render("index", {result:result, chosen:chosen});
    });
});

//Post route for searching courses
app.post("/",function(req,res){
	chosen.push(req.body.course);
	console.log(req.body.course)

	db.collection("cobalt").find({}).toArray(function(err,result){
		if (err) throw err;
		res.render("index",{result:result,chosen:chosen});
	});
});
