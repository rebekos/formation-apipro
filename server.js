/**
 * Server API
 */

import express from 'express';
import bodyParser from 'body-parser';
import db from './db/db';
import {BASIC,OAUTH,authconf, NOAUTH,tokenValid,mikeCodeurCredential} from './db/conf';
import btoa from 'btoa'
const app = express();

//init express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//home
app.get("/", function(req, res){
    res.sendFile(__dirname + '/index.html');
})

/*checkAuth = (req) => {
  req.h
}*/


//token
//CREATE / READ / UPDATE / DELETE
app.post('/oauth2/token/', (req, res) => {
  console.log("--------------------------------" )
  console.log("post oauth2 query" , req.query )
  console.log("post oauth2 body" , req.body )
  console.log("post oauth2 authorization" , req.headers.authorization )
  
  let isAuth=false;
  if (req.headers.authorization) {
    const autharr = req.headers.authorization.split(' ');
    const authType = autharr[0];
    const authValue = autharr[1];
    const btoaValue = btoa(mikeCodeurCredential)

    if (authValue === btoaValue) {
      console.log ("auth ok (headers)")
      isAuth = true
    } else {
      console.log ("auth ko (headers)" + authValue)
      return res.status(401).json({ error: 'client_id Client Secret incorrect ! (met mike et codeur)' });
    }
  }
  if (req.body) {
   
    const authValue = btoa(req.body.client_id+":"+req.body.client_secret);
    const btoaValue = btoa(mikeCodeurCredential)

    const authuserValue = btoa(req.body.username+":"+req.body.password);
   

    if (authValue === btoaValue ||authuserValue === btoaValue || isAuth) {
      console.log ("auth ok (body)")
      isAuth = true
    } else {
      console.log ("auth ko (body)" + authValue)
      return res.status(401).json({ error: 'client_id Client Secret incorrect ! (met mike et codeur)' });
    }
  }
  if (isAuth === true) {
    return res.status(200).send({
      access_token: tokenValid,
      token_type: 'bearer',
      expires_in: 315360000,
      "user_name": "username",
      "scope": "read-write"
    })
  } else {
    return res.status(401).json({ error: 'No  auth' });
  }
  
});
app.get('/oauth2/token/', (req, res) => {
  console.log("--------------------------------" )
  console.log("get oauth2 headers" , req.headers.authorization )
  console.log("get oauth2 query" , req.query )
  console.log("get oauth2 body" , req.query.client_id )
  if (!req.query){
    return res.status(403).json({ error: 'No oauth query sent!' });
  }
  if (req.query.client_id !== 'mike'){
    return res.status(403).json({ error: 'mauvais client id, met mike' });
  }
  return res.status(200).send({
    access_token: tokenValid,
    token_type: 'bearer',
    expires_in: 315360000,
    "user_name": "read-write",
    "scope": ""
  })
});


app.use(function(req, res, next) {
  if (authconf === NOAUTH) {
    next();
  } else {
    if (!req.headers.authorization) {
      console.log("req.headers",req.headers)
      return res.status(403).json({ error: 'No credentials sent!' });
    }
   
    else {
      console.log("req.headers",req.headers.authorization)
      const autharr = req.headers.authorization.split(' ');
      const authType = autharr[0];
      const authValue = autharr[1];
      console.log("authType "+ authType + authconf)
      switch (authconf) {
        case BASIC:
          if (authType === BASIC ) {
            if (authValue === btoa(mikeCodeurCredential)) {
              console.log("tokenValid")
              next();
            } else {
              return res.status(401).json({ error: 'login pass invalide !' });
            }
          } else {
            console.log("Vous devez utiliser la méthode Basic")
            return res.status(403).json({ error: 'Vous devez utiliser la méthode Basic!' });
          }
        case OAUTH:
          if (authType === OAUTH) {
            console.log("authType OAUTH")
            if (authValue === tokenValid) {
              console.log("tokenValid")
              next();
            } else {
              return res.status(401).json({ error: 'token oauth invalide !' });
            }
            
          }
          else {
            console.log("Vous devez utiliser la méthode OAUTH Bearer")
            return res.status(403).json({ error: 'Vous devez utiliser la méthode OAUTH Bearer!' });
          }
        default : 
        return res.status(403).json({ error: 'méthode inconnue!' });
      }
      if (authType === BASIC && authconf === BASIC ) {
        console.log("authType Basic")
        next();
      } else {
        console.log("Vous devez utiliser la méthode Basic")
        return res.status(403).json({ error: 'Vous devez utiliser la méthode Basic!' });
      }
      
     
    }
  }
  
  
 
});

// get all todos
app.get('/api/v1/tasks', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'tasks retrieved successfully',
    tasks: db
  })
});

// get all todos


//CREATE / READ / UPDATE / DELETE
app.post('/api/v1/tasks', (req, res) => {
  //console.log("req",req)
  if(!req.body.title) {
    return res.status(400).send({
      success: 'false',
      message: 'title is required'
    });
  } else if(!req.body.description) {
    return res.status(400).send({
      success: 'false',
      message: 'description is required'
    });
  }
  const task = {
    id: db.length + 1,
    title: req.body.title,
    description: req.body.description
  }
  db.push(task);
  return res.status(201).send({
    success: 'true',
    message: 'task added successfully',
    task
  })
});

app.get('/api/v1/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.map((task) => {
    if (task.id === id) {
      return res.status(200).send({
        success: 'true',
        message: 'task retrieved successfully',
        task,
      });
    } 
  });
  return res.status(404).send({
    success: 'false',
    message: 'task does not exist',
  });
});
///
app.delete('/api/v1/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.map((task, index) => {
    if (task.id === id) {
      db.splice(index, 1);
        return res.status(200).send({
          success: 'true',
          message: 'Task deleted successfuly',
        });
    }
  });
    return res.status(404).send({
      success: 'false',
      message: 'Task not found',
    });

  
});


  app.put('/api/v1/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    let taskFound;
    let itemIndex;
    db.map((task, index) => {
      if (task.id === id) {
        taskFound = task;
        itemIndex = index;
      }
    });
  
    if (!taskFound) {
      return res.status(404).send({
        success: 'false',
        message: 'task not found',
      });
    }
  
    if (!req.body.title) {
      return res.status(400).send({
        success: 'false',
        message: 'title is required',
      });
    } else if (!req.body.description) {
      return res.status(400).send({
        success: 'false',
        message: 'description is required',
      });
    }
  
    const updatedTask = {
      id: taskFound.id,
      title: req.body.title || taskFound.title,
      description: req.body.description || taskFound.description,
    };
  
    db.splice(itemIndex, 1, updatedTask);
  
    return res.status(200).send({
      success: 'true',
      message: 'task updated successfully',
      updatedTask,
    });
  });
  
app.listen(3000, function(){
    console.log("Server running on 3000 with mode AUTH : "+ authconf)
})