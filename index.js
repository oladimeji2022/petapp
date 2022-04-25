//import express
const express = require('express');
//initialize the express
const http = require('http');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator')
//use json format
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended:true
}));
app.use(bodyParser.json());
app.use(express.static('public'));
//initialize the port to listening to
const port = 5000;
//import sqlite database
const sqlite3 = require('sqlite3').verbose();
// create a new database file pet.db or open existing users.db
const db = new sqlite3.Database('./pet.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the pet.db database.');
});
//Inititalize the static files that holds css, images and javascript files
//set the ejs view engine
app.set('view engine', 'ejs');
const path = require('path')
app.set('views/pages', path.join(__dirname, 'views/pages'));
app.use(express.static(path.join(__dirname, '/public')));
//Routes to Webpages
//create the pages: For home Page
app.get('/', (req, res) => {
    res.render('pages/index');
})
//for reports page
app.get('/reports', async (req, res) => {
  //get the reports from the database
  let query = 'Select Distinct petanimal, petloc, petid from petdetails order by petid desc';
  db.all(query, (err, data) => {
    if(err) throw err;
    console.log(data);
    res.render('pages/reports', {
        reports: data
    });
  });
})
//Get missing reports with deletion of specific id
app.get('/reports/:petId', async (req, res) => {
  const petId = req.params.petId;
  //get the reports from the database
  let query = 'Delete from petdetails where petid = '+Number(petId);
  db.run(query, (err) => {
    if(err) throw err;
    res.render('pages/reports');
  });
})
//View Specific Pet Animal Reports Details
app.get('/viewpet/:petAnimal', async (req, res) => {
  const petAnimal = req.params.petAnimal;
  console.log(req.params.petAnimal);
  //get the reports from the database
  let query = "Select * from petdetails where petanimal = '"+ petAnimal +"' ";
  db.all(query, (err, data) => {
    if(err) throw err;
    console.log(data);
    res.render('pages/viewpet', { petName: petAnimal,
        viewPet: data
    });
  });
})
 //A page to view all the missing pets details
app.get('/report/:petId', async (req, res) => {
  const petId = req.params.petId;
  //get the reports from the database
  let query = "Select p.petanimal,p.petname,p.petdesc,p.petloc,l.petarea,l.roadname from petdetails p, petlocation l where p.petid = '"+Number(petId)+"'and l.petid='"+Number(petId)+"' ";
  db.all(query, (err, data) => {
    if(err) throw err;
    console.log(data);
    res.render('pages/viewmissing', { 
        missingPet: data
    });
  });
})
 //missing pet adding page
app.get('/petmissing', (req, res) => {
   //get the reports from the database
   res.render('pages/petmissing',{data:{}});
})
//pet activities page
app.get('/activities', (req, res) => {
  //get the reports from the database
  res.render('pages/activities')
})
//save the new missing pet reports
app.post('/addpet', async (req, res) => {
  //get the details from the form
  const petAnimal = req.body.petAnimal;
  const petName = req.body.petName;
  const petDesc = req.body.petDesc;
  const petLoc = req.body.petLoc;
  //check the validation now
  req.checkBody('petAnimal', 'Pet Animal Name is required').notEmpty();
  req.checkBody('petName', 'Pet Name is required').notEmpty();
  req.checkBody('petDesc', 'Pet Description is required').notEmpty();
  req.checkBody('petLoc', 'Pet location is required').notEmpty();
  var errors = req.validationErrors();
  if(errors)
  {
     res.render('pages/petmissing',{data:errors.array()});
  }
  else
  {
    //insert into query
    await db.run('INSERT INTO petdetails(petanimal,petname,petdesc,petloc) values(?,?,?,?)',petAnimal,petName,petDesc,petLoc);
    res.render('pages/reports')
  }
});
//create functions for each of the controller 
//function missing pets reports json format
const getMissingPet = (req,res) => {
  res.send("Display All mising Pets");
}
//function display single missing pets reports json format
const getSingleMissingPet = (req,res) => {
  res.send("Display All mising Pets");
}
//function report new missing pet into database json format
const saveMissingPet = (req,res) => {
  res.send("Display All mising Pets");
}
//function delete a single report json format
const deleteMissingPet = (req,res) => {
  res.send("Display All mising Pets");
}
//function Update the single missing pet 
const updateMissingPet = (req,res) => {
  res.send("Display All mising Pets");
}
// initialise the api routes pages
//routes to api pages
const reportRouter = express.Router();
//API to get all the pets reports
reportRouter.route('/reports')
   .get(getMissingPet)
reportRouter.route('/report/:id')
   .get(getSingleMissingPet)
reportRouter.route('/report')
  .post(saveMissingPet)
reportRouter.route('/report/:id')
  .delete(deleteMissingPet)
reportRouter.route('/report/:id')
  .put(updateMissingPet)     
  //add the api to the express
app.use('/api', reportRouter);
app.listen(port, () => {
  console.log(`App Listening on port ${port}`)
});

