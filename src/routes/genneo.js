import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

var FIREBASE_GENNEO = `https://genneounited-4b294.firebaseio.com`;

var sg = require('sendgrid').SendGrid(process.env.SENDGRID_API_KEY || `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`);
var helper = require('sendgrid').mail;

const Genneo = (app) => {
    app.post('/genneo/register', (req, res) => {
        var payload = {
            nama: req.body.nama,
            email: req.body.email,
            line: req.body.line,
            telp: req.body.telp,
            cabang: req.body.cabang,
            sent: false
        };
        axios.post(`${FIREBASE_GENNEO}/daftar.json`, payload)
            .then(response => {
                var data = Object.assign({}, response.data, payload);

                var from_email = new helper.Email("gbipplriaubdg@gmail.com");
                var to_email = new helper.Email(data.email);
                var subject = "Pendaftaran PASSION - Genneo United";
                var content = new helper.Content("text/html", `
                    <h2>PASSION - Genneo United 🎉🎉</h2>
                    <p>Selamat kamu sudah berhasil terdaftar di PASSION - GENNEO UNITED</p>
                    <br/>
                    <img src="http://gu.gbippl.id/img/invitation.jpg" alt="" />
                    <br/>
                    <img src="http://www.barcodes4.me/barcode/qr/genneo.png?value=${data.name}&size=12" alt="" />
                    <br/>
                    <i>nomor pendaftaran: ${data.name}</i>`);
                var mail = new helper.Mail(from_email, subject, to_email, content);

                var requestBody = mail.toJSON();
                var request = sg.emptyRequest();
                request.method = 'POST';
                request.path = '/v3/mail/send';
                request.body = requestBody;
                sg.API(request, (response) => {
                    console.log(Object.assign({}, data, {sent: true}));
                    axios.put(`${FIREBASE_GENNEO}/daftar/${data.name}.json`, Object.assign({}, data, {sent: true}));
                });

                res.json(data);
            }).catch(err => {
                res.json(null);
            })
    });

    app.post('/genneo/registerfriends', (req, res) => {
        var id = req.body.id;
        var friends = req.body.friends;
        Promise.all(friends.map(friend => {
            return axios.post(`${FIREBASE_GENNEO}/daftar/${id}/teman.json`, friend)
                .then(response => {
                    var data = Object.assign({}, response.data, friend);
                    return data;
                }).catch(err => {
                    return null;
                });
        })).then(response => {
            res.json(response);
        });
    });

    app.get('/genneo/pendaftar', (req, res) => {
        axios.get(`${FIREBASE_GENNEO}/daftar.json`).then(response => {
            var data = response.data;
            var pendaftar = [];
            for (var id in data) {
                pendaftar.push(Object.assign({}, data[id], {id}));
            }
            res.json(pendaftar);
        });
    });

};

export default Genneo;