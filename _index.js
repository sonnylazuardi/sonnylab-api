import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import Promise from 'es6-promise';
import Ziliun from './routes/ziliun';
import Karejo from './routes/karejo';

var app = express();
app.server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json({
    limit : '100kb'
}));

Ziliun(app);
Karejo(app);

app.server.listen(process.env.PORT || 7010);
console.log(`sonnylab api is up on ${app.server.address().port}`);