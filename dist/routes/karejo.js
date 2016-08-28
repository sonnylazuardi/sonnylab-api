'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Karejo = function Karejo(app) {
    app.get('/karejo/search', function (req, res) {
        var params = [];
        for (var key in req.query) {
            params.push(key + '=' + req.query[key]);
        }
        _axios2.default.get('http://karejo.com/cari?' + params.join('&')).then(function (result) {
            var $ = _cheerio2.default.load(result.data);
            var items = [];
            $('li.m-b-md.shadow-box').filter(function () {
                var data = $(this);

                items.push({
                    title: data.find('.job-title').first().text(),
                    detail: data.find('.job-detail').first().text(),
                    location: data.find('.job-location').first().children().eq(1).children().first().text(),
                    company: data.find('.company-name').first().text(),
                    image: data.find('.img-thumbs').first().children().first().attr('src')
                });
            });
            res.json(items);
        });
    });

    app.get('/karejo/location', function (req, res) {
        var params = [];
        for (var key in req.query) {
            params.push(key + '=' + req.query[key]);
        }
        _axios2.default.get('http://karejo.com/').then(function (result) {
            var $ = _cheerio2.default.load(result.data);
            var items = [];
            $('ul.list-city.list-unstyled li').filter(function () {
                var data = $(this);

                items.push({
                    image: data.find('img').first().attr('src'),
                    text: data.find('span').first().text(),
                    slug: data.find('a').first().attr('href')
                });
            });
            res.json(items.reverse());
        });
    });
};

exports.default = Karejo;