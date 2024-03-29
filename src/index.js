const express = require('express');
const uuid = require('uuid'); 
const cors = require('cors');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const { username } = request.headers; 

  const user = users.find((user) => user.username == username);

  if(!user){
    return response.status(404).json({ error: 'User does not exists'});
  }

  request.user = user; 
  next(); 

}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body; 

  const userAlreadyExists = users.find((user) => user.username == username);

  if(userAlreadyExists){
    return response.status(400).json({ error: 'User already exists'});
  }

  const user = {
    id: uuid.v4(), 
    name, 
    username, 
    todos: []
  }

  users.push(user); 
  return response.status(201).json(user); 

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request; 

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  const { user } = request; 
  const { title, deadline } = request.body; 

  const todo = {
    id: uuid.v4(), 
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date
  }

  users.map((usr) => {
    if(usr.username == user.username){
      usr.todos.push(todo)

      return response.status(201).json(todo); 
    }
  })
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params; 
  const { title, deadline } = request.body; 
  const { user } = request; 

  const todo = user.todos.find((todo) => todo.id === id); 

  if(!todo){
    return response.status(404).json({ error: 'ToDo does not exists'}); 
  }

  todo.title = title; 
  todo.deadline = deadline; 

  return response.status(200).json(todo); 
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params; 
  const { user } = request; 

  const todo = user.todos.find((todo) => todo.id === id); 

  if(!todo){
    return response.status(404).json({ error: 'ToDo does not exists'}); 
  }

  todo.done = true; 

  return response.status(200).json(todo); 

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const { id } = request.params; 
  const { user } = request; 

  const todo = user.todos.find((todo) => todo.id === id); 

  if(!todo){
    return response.status(404).json({ error: 'ToDo does not exists'}); 
  }

  user.todos.splice(todo, 1) ; 

  return response.status(204).json(todo); 

});

module.exports = app;