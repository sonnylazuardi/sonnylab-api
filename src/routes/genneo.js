import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

var FIREBASE_GENNEO = `https://genneo-united-stay-connected.firebaseio.com`;

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
                var subject = "Pendaftaran STAY CONNECTED - Genneo United";
                var content = new helper.Content("text/html", `
                    <h2>STAY CONNECTED - Genneo United 🎉🎉</h2>
                    <p>Selamat kamu sudah berhasil terdaftar di STAY CONNECTED - GENNEO UNITED</p>
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

                console.log('sending email to ', data.email);
                sg.API(request, (response) => {
                    console.log('RESP', response);
                    axios.put(`${FIREBASE_GENNEO}/daftar/${data.name}.json`, Object.assign({}, data, {sent: true}));
                });

                res.json(data);
            }).catch(err => {
                res.json(null);
            })
    });

    app.post('/genneo/friends', (req, res) => {
        var id = req.body.id;
        var friends = req.body.friends;
        Promise.all(friends.map(friend => {
            friend.referral = id;
            return axios.post(`${FIREBASE_GENNEO}/daftar.json`, friend)
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

    app.get('/genneo/listpendaftar', (req, res) => {
        axios.get(`${FIREBASE_GENNEO}/daftar.json`).then(response => {
            var data = response.data;
            var pendaftar = [];
            for (var id in data) {
                pendaftar.push(Object.assign({}, data[id], {id}));
            }
            pendaftar = pendaftar.filter((value, index, self) => {
                return self.indexOf(pendaftar.filter(user => user.email === value.email)[0]) === index;
            });
            res.json(pendaftar);
        });
    });

    app.get('/genneo/presences', (req, res) => {
        axios.get(`${FIREBASE_GENNEO}/presences.json`).then(response => {
            var data = response.data;
            var pendaftar = [];
            for (var id in data) {
                pendaftar.push(Object.assign({}, data[id], {id}));
            }
            res.json(pendaftar);
        });
    });

    app.post('/genneo/presences', (req, res) => {
        var id = req.body.id;
        axios.post(`${FIREBASE_GENNEO}/presences.json`, {
            id
        }).then((response) => {
            console.log(response);
            axios.get(`${FIREBASE_GENNEO}/presences.json`).then(response => {
                var data = response.data;
                var hadir = [];
                for (var id in data) {
                    hadir.push(data[id]);
                }
                res.json(hadir);
            });
        }).catch(e => {
            console.log(e)
            res.json({success: false})
        });
    });

    app.delete('/genneo/presences', (req, res) => {
        var id = req.body.id;
        var email = req.body.email;
        var withFriends = req.body.withFriends;
        axios.delete(`${FIREBASE_GENNEO}/presences/${id}.json`)
            .then((response) => {
                res.json(response.data);
            }).catch(e => {
                console.log(e)
                res.json({success: false})
            });
    });

    app.get('/genneo/idemailmap', (req, res) => {
        axios.get(`${FIREBASE_GENNEO}/daftar.json`).then(response => {
            var data = response.data;
            var pendaftar = [];
            for (var id in data) {
                pendaftar.push({
                    id: id,
                    email: data[id].email
                });
            }
            res.json(pendaftar);
        }).catch(e => {
            console.log(e);
            res.json({success: false});
        })
    });

};

export default Genneo;