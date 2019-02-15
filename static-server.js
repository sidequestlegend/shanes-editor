const express = require('express');
const http = require('http');
let app = express();
let server = http.createServer(app);
app.use(express.static(__dirname+'/dist/'));
server.listen(43000);