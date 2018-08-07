'use strict';

const express = require(`express`);
const app = express();
const path = require(`path`);

app.set('port', process.env.PORT || 3000);

app.get(`/`, function (request, response) {
  response.sendFile(path.join(__dirname + `/index.html`));
});

app.use(`/public`, express.static(`public`));

const http = require(`http`);
const server = http.createServer(app);
server.listen(3000);
