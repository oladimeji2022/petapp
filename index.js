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
app.set('views/', path.join(__dirname, 'views/'));
app.use(express.static(path.join(__dirname, './public')));
//Routes to Webpages
//create the pages: For home Page
app.get('/', (req, res) => {
    res.render('index');
})
app.get('/reports', async (req, res) => {
  //get the reports from the database
  let query = 'Select Distinct petanimal, petloc, petid from petdetails order by petid desc';
  db.all(query, (err, data) => {
    if(err) throw err;
    res.render('viewreports', {
        reports: data
    });
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
    res.render('viewpet', { petName: petAnimal,
        viewPet: data
    });
  });
})
 //A page to view single report of the missing pets details
app.get('/report/:id', async (req, res) => {
  const petId = req.params.id;
  //get the reports from the database
  let query = "Select p.petanimal,p.petname,p.petdesc,p.petloc,l.petarea,l.roadname from petdetails p, petlocation l where p.petid = '"+Number(petId)+"'and l.petid='"+Number(petId)+"' ";
  db.all(query, (err, data) => {
    if(err) throw err;
    console.log(data);
    res.render('viewmissing', { 
        missingPet: data
    });
  });
})
//missing pet adding page
app.get('/reportpet', async (req, res) => {
  //get the reports from the database
  res.render('reportpet');
});
//pet activities page
app.get('/activities', async (req, res) => {
 //get the reports from the database
  res.render('pages/activities');
});

//create functions for each of the controller 
//function missing pets reports json format
const getMissingPet = async (req, res) => {
  try
  {
     //get the reports from the database
    let query = 'Select Distinct * from petdetails order by petid desc';
    db.all(query, (err, data) => {
      if(err) {
        return res.status(404).json({msg:err});
      }
      else if(!data)
        {
          return res.status(500).json({msg: `There is no any Pet Missing Reports`});
        }
      else 
      {
        //res.end(JSON.stringify(data));
        res.status(200).json({data});
      } 
    });
  }catch(error)
  {
     res.status(500).json({msg: error});
  }
}
//function display API single missing pets reports in json format
const getSingleMissingPet = async (req,res) => {
  try {
      const {id: petID} = req.params;
      let query = "Select p.petanimal,p.petname,p.petdesc,p.petloc,l.petarea,l.roadname from petdetails p, petlocation l where p.petid = '"+Number(petID)+"'and l.petid='"+Number(petID)+"' ";
      db.all(query, (err, data) => {
        if(err) {
          return res.status(404).json({msg:err});
        }
        else if(!data)
        {
          return res.status(404).json({msg: `No Missing Pet Reports with id : ${petID}`});
        }
        else 
        {
          //res.end(JSON.stringify(data));
          res.status(200).json({data});
        } 
      });
  }catch(error)
  {
    res.status(500).json({msg: error});
  }
}
//function report new missing pet into database json format
const saveMissingPet = async (req,res) => {
  try{
    const petAnimal = req.body.petAnimal;
    const petName = req.body.petName;
    const petDesc = req.body.petDesc;
    const petLoc = req.body.petLoc;

    const save = await db.run('INSERT INTO petdetails(petanimal,petname,petdesc,petloc) values(?,?,?,?)',petAnimal,petName,petDesc,petLoc);
    if(!save) {
      return res.status(500).json({msg: `Error Saving the Mising Report Into Database`});
    } 
    else 
    {
      return res.status(200).json({status: 'Success'});
    }
  }
  catch(error){
    res.status(500).json({msg: error});
  }
}
//function delete a single API missing pet report with json response format
const deleteMissingPet = async (req,res) => {
  try{
    const {id: petID} = req.params;
    //get the reports from the database
    const del = await db.run('Delete from petdetails where petid = '+Number(petID));
    if(!del) {
      return res.status(500).json({msg: `Error Deleting Mising Pet Report with id: ${petID}`});
    } 
    else 
    {
      return res.status(200).json({status: 'Success'});
    } 
  }catch(error)
  {
    res.status(500).json({msg: error});
  }
}
//function Update the single missing pet 
const updateMissingPet = async (req,res) => {
  try{
    const {id: petID} = req.params;
    const petAnimal = req.body.petAnimal;
    const petName = req.body.petName;
    const petDesc = req.body.petDesc;
    const petLoc = req.body.petLoc;
    const update = await db.run('Update petdetails set petanimal = ?, petname = ?, petDesc=?, petLoc=? where petid = ?',petAnimal,petName,petDesc,petLoc,petID);
    if(!update) {
      return res.status(500).json({msg: `Error Updating Missing Pet Report with id: ${petID}`});
    } 
    else 
    {
      //let query = "Select * from petdetails where petid ="+Number(petID);
      db.all('Select * from petdetails where petid ='+Number(petID), (err, data) => {
        if(!data)
        {
          return res.status(500).json({msg: `No Missing Updating Pet Reports with id : ${petID}`});
        }
        else 
        {
          //res.end(JSON.stringify(data));
          res.status(200).json({data});
        } 
      });
    } 
  }catch(error)
  {

  }
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

