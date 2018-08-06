let express = require(`express`);
let app = express();
let http = require(`http`);
let path = require(`path`);

app.set('port', process.env.PORT || 3000);

app.get(`/`, function (request, response) {
  response.sendFile(path.join(__dirname + `/index.html`));
});

app.use(`/public`, express.static(`public`));

let server = http.createServer(app);

server.listen(3000);
