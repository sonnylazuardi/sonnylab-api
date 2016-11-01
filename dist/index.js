'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _es6Promise = require('es6-promise');

var _es6Promise2 = _interopRequireDefault(_es6Promise);

var _ziliun = require('./routes/ziliun');

var _ziliun2 = _interopRequireDefault(_ziliun);

var _karejo = require('./routes/karejo');

var _karejo2 = _interopRequireDefault(_karejo);

var _phpindonesia = require('./routes/phpindonesia');

var _phpindonesia2 = _interopRequireDefault(_phpindonesia);

var _blitz = require('./routes/blitz');

var _blitz2 = _interopRequireDefault(_blitz);

var _genneo = require('./routes/genneo');

var _genneo2 = _interopRequireDefault(_genneo);

var _mymua = require('./routes/mymua');

var _mymua2 = _interopRequireDefault(_mymua);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
app.server = _http2.default.createServer(app);

app.use((0, _cors2.default)());
app.use(_bodyParser2.default.json({
    limit: '1024kb'
}));

(0, _ziliun2.default)(app);
(0, _karejo2.default)(app);
(0, _phpindonesia2.default)(app);
(0, _blitz2.default)(app);
(0, _genneo2.default)(app);
(0, _mymua2.default)(app);

app.get('/pokeapi', function (req, res) {
    _axios2.default.get('http://pokeapi.co/api/v2/ability/4/').then(function (response) {
        var data = response.data;
        res.json(data);
    }).catch(function (err) {
        res.send(JSON.stringify(err));
    });
});

app.server.listen(process.env.PORT || 7010);
console.log('sonnylab api is up on ' + app.server.address().port);