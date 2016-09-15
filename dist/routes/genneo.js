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

var FIREBASE_GENNEO = 'https://genneounited-4b294.firebaseio.com';

var sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY || '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');
var helper = require('sendgrid').mail;

var Genneo = function Genneo(app) {
    app.post('/genneo/register', function (req, res) {
        var payload = {
            nama: req.body.nama,
            email: req.body.email,
            line: req.body.line,
            telp: req.body.telp,
            cabang: req.body.cabang,
            sent: false
        };
        _axios2.default.post(FIREBASE_GENNEO + '/daftar.json', payload).then(function (response) {
            var data = Object.assign({}, response.data, payload);

            var from_email = new helper.Email("gbipplriaubdg@gmail.com");
            var to_email = new helper.Email(data.email);
            var subject = "Pendaftaran PASSION - Genneo United";
            var content = new helper.Content("text/html", '\n                    <h2>PASSION - Genneo United 🎉🎉</h2>\n                    <p>Selamat kamu sudah berhasil terdaftar di PASSION - GENNEO UNITED</p>\n                    <br/>\n                    <img src="http://gu.gbippl.id/img/invitation.jpg" alt="" />\n                    <br/>\n                    <img src="http://www.barcodes4.me/barcode/qr/genneo.png?value=' + data.name + '&size=12" alt="" />\n                    <br/>\n                    <i>nomor pendaftaran: ' + data.name + '</i>');
            var mail = new helper.Mail(from_email, subject, to_email, content);

            var requestBody = mail.toJSON();
            var request = sg.emptyRequest();
            request.method = 'POST';
            request.path = '/v3/mail/send';
            request.body = requestBody;
            sg.API(request, function (response) {
                console.log(Object.assign({}, data, { sent: true }));
                _axios2.default.put(FIREBASE_GENNEO + '/daftar/' + data.name + '.json', Object.assign({}, data, { sent: true }));
            });

            res.json(data);
        }).catch(function (err) {
            res.json(null);
        });
    });

    app.post('/genneo/registerfriends', function (req, res) {
        var id = req.body.id;
        var friends = req.body.friends;
        Promise.all(friends.map(function (friend) {
            return _axios2.default.post(FIREBASE_GENNEO + '/daftar/' + id + '/teman.json', friend).then(function (response) {
                var data = Object.assign({}, response.data, friend);
                return data;
            }).catch(function (err) {
                return null;
            });
        })).then(function (response) {
            res.json(response);
        });
    });

    app.get('/genneo/pendaftar', function (req, res) {
        _axios2.default.get(FIREBASE_GENNEO + '/daftar.json').then(function (response) {
            var data = response.data;
            var pendaftar = [];
            for (var id in data) {
                pendaftar.push(Object.assign({}, data[id], { id: id }));
            }
            res.json(pendaftar);
        });
    });
};

exports.default = Genneo;