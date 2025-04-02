const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const userModel = require('./models/userModel');
const reportModel = require('./models/reportModel');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

app.get('/', (req, res)=>{
  res.render("index");
});

app.get('/log-in', (req, res)=>{
  res.render("log-in");
});

app.get('/sign-up', (req, res)=>{
  res.render("sign-up");
});

app.get('/report-issue', (req, res)=>{
  res.render("report-issue");
});

app.get('/view-map', (req, res)=>{
  res.render("view-map");
})

app.get('/dashboard', isLoggedIn, async (req, res)=>{
    let user = await userModel.findOne({email: req.user.email});
    console.log("user");
    res.render("dashboard", {user});
})

app.get('/safety-stats', isLoggedIn, async (req, res)=>{
    let user = await userModel.findOne({email: req.user.email});
    console.log("user", user);
    res.render("safety-stats", {user, reports});
})

app.get('/safety-map', (req, res)=>{
  res.render("safety-map");
})

app.get('/test', (req, res)=>{
  res.render("test");
})

app.get('/mapBare', (req, res)=>{
  res.render("mapBare");
})

app.post('/create', async (req, res)=>{
  const {name, username, email,  password} = req.body;
  let createdUser = await userModel.findOne({email});
  if(createdUser){
    return res.status(500).send("User already exists");
  }
  createdUser = await userModel.findOne({username});
  if(createdUser){
    return res.status(500).send("User already exists");
  } 
  
  bcrypt.genSalt(10, (err, salt)=>{
    if(err) return res.status(500).send("Error in generating salt");
    bcrypt.hash(password, salt, async (err, hash)=>{
      if(err) return res.status(500).send("Error in hashing password");
      createdUser = await userModel.create({
        name,
        username,
        email,
        password: hash,
      });
      let token = jwt.sign({email: email, userid: createdUser._id}, "secret");
      res.cookie("token", token);
      console.log("User created successfully", createdUser);
      res.redirect('/dashboard');
    })
  })
})

app.post('/login', async (req, res)=>{
    const {email, password} = req.body;
    let user = await userModel.findOne({email});
    if(!user) return res.status(500).send("User not found");
    bcrypt.compare(password, user.password, (err, result)=>{
        if(result){
            let token = jwt.sign({email: email, userid: user._id}, "secret");
            res.cookie("token", token);
            console.log("User logged in successfully", user);
        }
        res.redirect('/dashboard');
    });
});

app.post('/logout', (req, res)=>{
    res.clearCookie("token");
    console.log("User logged out successfully");
    res.redirect('/log-in');
})

function isLoggedIn(req, res, next){
    const token = req.cookies.token;
    if(token === "") {
        console.log("User not logged in");
        return res.redirect('/log-in');
    } else {
        let data = jwt.verify(token, "secret", (err, data)=>{
            if(err) return res.status(500).render("log-in");
            console.log("User logged in", data);
            req.user = data; 
            next();
        })
    }
}

app.post('/api/process', async (req, res) => {
    try {
        // Forward request to Flask
        const flaskResponse = await axios.post('http://127.0.0.1:5000/process', {
            input: req.body.input
        });
        
        // Get response from Flask
        const result = flaskResponse.data;
        
        // Return result to client
        res.json(result);
    } catch (error) {
        console.error('Error communicating with Flask:', error);
        res.status(500).json({ error: 'Failed to process data' });
    }
});

// Serve your template/web page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


app.post('/reportIssue', isLoggedIn, async (req, res)=>{
    let user = await userModel.findOne({email: req.user.email});
    const {address, theme, description, severity} = req.body;
    let report = await reportModel.create({
        address,
        theme,
        description,
        severity,
        userid: user._id,
    });
    console.log("Report created successfully", report);
    res.redirect('/dashboard');
})


app.get('/profile', isLoggedIn, (req, res)=>{
    console.log("User profile", req.user);
    res.render("dashboard");
})

app.listen(3000, ()=>{
  console.log("Server started....");
})
