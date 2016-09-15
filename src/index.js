import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import Promise from 'es6-promise';
import Ziliun from './routes/ziliun';
import Karejo from './routes/karejo';
import PhpIndonesia from './routes/phpindonesia';
import Blitz from './routes/blitz';
import Genneo from './routes/genneo';

var app = express();
app.server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json({
    limit : '1024kb'
}));

Ziliun(app);
Karejo(app);
PhpIndonesia(app);
Blitz(app);
Genneo(app);

app.server.listen(process.env.PORT || 7010);
console.log(`sonnylab api is up on ${app.server.address().port}`);