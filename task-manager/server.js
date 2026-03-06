const express = require('express');
const jsonServer = require('json-server');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Setup JSON Server
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

app.use(middlewares);

// API routes - all requests starting with /api will be handled by json-server
app.use('/api', router);
// Currently the app hits root paths like /tasks and /statistics
app.use(router);

// Serve static compiled Angular app
app.use(express.static(path.join(__dirname, 'dist', 'task-manager', 'browser')));

// Serve index.html for all other routes to support Angular routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'task-manager', 'browser', 'index.html'));
});

app.listen(port, () => {
  console.log(`Unified Task Manager server is running.`);
  console.log(`- API endpoints: http://localhost:${port}/tasks, http://localhost:${port}/statistics`);
  console.log(`- Frontend app: http://localhost:${port}/`);
});
