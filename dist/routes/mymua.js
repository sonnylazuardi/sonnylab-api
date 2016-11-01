'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MYMUA_URL = 'https://mymua-9dd2c.firebaseio.com';

var MyMua = function MyMua(app) {

    app.get('/mymua/mua', function (req, res) {
        _axios2.default.get(MYMUA_URL + '/mua.json').then(function (response) {
            var data = response.data;
            console.log(data);
            var muas = [];
            // for (var id in data) {
            //     var pakets = [];
            //     // if (data[id].paket) {
            //     //     for (var idPaket in data[id].paket) {
            //     //         pakets.push(Object.assign({}, data[id].paket[idPaket], {id: idPaket}));
            //     //     }
            //     // }
            //     muas.push(Object.assign({}, data[id], {id}, {paket: pakets}));
            // }
            res.json(muas);
        });
    });
};

exports.default = MyMua;