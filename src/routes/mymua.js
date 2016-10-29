import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

var MYMUA_URL = `https://mymua-9dd2c.firebaseio.com`;

const MyMua = (app) => {

    app.get('/mymua/mua', (req, res) => {
        axios.get(`${MYMUA_URL}/mua.json`).then(response => {
            var data = response.data;
            var muas = [];
            for (var id in data) {
                var pakets = [];
                if (data[id].paket) {
                    for (var idPaket in data[id].paket) {
                        pakets.push(Object.assign({}, data[id].paket[idPaket], {id: idPaket}));
                    }
                }
                muas.push(Object.assign({}, data[id], {id}, {paket: pakets}));
            }
            res.json(muas);
        });
    });


};

export default MyMua;