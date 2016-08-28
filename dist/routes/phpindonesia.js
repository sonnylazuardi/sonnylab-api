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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var imageReplace = {
    'http://www.event.phpindonesia.or.id/images/30jan2016_technology_update.jpg': 'https://lh3.googleusercontent.com/-zROEwpq1dOg/VvU8vFg1asI/AAAAAAAAKwI/4f_LWCuOyIkCJ3vEuxrMcW2cmaStMrfdA/s0/30jan2016_technology_update.jpg'
};

var videoCache = [];

function loadYoutube() {
    var pageToken = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    return new Promise(function (resolve, reject) {
        console.log('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCoHfa6wCvqFVIqDTXOSNC_Q&order=date&key=AIzaSyBpu8hgnXbkqFVWrAvwRUEz7T13ii3I7WM&pageToken=' + (pageToken ? pageToken : ''));
        _axios2.default.get('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCoHfa6wCvqFVIqDTXOSNC_Q&order=date&key=AIzaSyBpu8hgnXbkqFVWrAvwRUEz7T13ii3I7WM&pageToken=' + (pageToken ? pageToken : '')).then(function (result) {
            var items = result.data.items.map(function (item) {
                var id = item.id.videoId;
                var thumbnail = item.snippet.thumbnails.high.url;
                var title = item.snippet.title;
                var description = item.snippet.description;
                var date = (0, _moment2.default)(item.snippet.publishedAt).fromNow();
                var link = 'https://www.youtube.com/watch?v=' + id;

                return {
                    id: id,
                    thumbnail: thumbnail,
                    title: title,
                    description: description,
                    date: date,
                    link: link
                };
            });
            resolve({ items: items, nextPageToken: result.data.nextPageToken });
        });
    });
}

var PhpIndonesia = function PhpIndonesia(app) {
    app.get('/phpindonesia/event', function (req, res) {
        _axios2.default.get('http://www.event.phpindonesia.or.id/').then(function (result) {
            var $ = _cheerio2.default.load(result.data);
            var items = [];
            $('.items > .row').filter(function () {
                var data = $(this);
                var image = 'http://www.event.phpindonesia.or.id' + data.find('img').first().attr('src');
                if (imageReplace.hasOwnProperty(image)) image = imageReplace[image];

                items.push({
                    title: data.find('h4').first().children().first().text(),
                    description: data.find('p').first().text(),
                    date: data.find('table').first().children().eq(0).children().eq(1).text().replace(/<(?:.|\n)*?>/gm, ''),
                    code: data.find('table').first().children().eq(1).children().eq(1).text().replace(/<(?:.|\n)*?>/gm, ''),
                    venue: data.find('table').first().children().eq(2).children().eq(1).text().replace(/<(?:.|\n)*?>/gm, ''),
                    seat: data.find('table').first().children().eq(3).children().eq(1).text().replace(/<(?:.|\n)*?>/gm, ''),
                    status: data.find('table').first().children().eq(4).children().eq(1).text().replace(/<(?:.|\n)*?>/gm, ''),
                    image: image
                });
            });
            res.json(items);
        });
    });

    app.get('/phpindonesia/video', function (req, res) {
        if (videoCache.length > 0) {
            res.json(videoCache);
        }
        loadYoutube().then(function (result) {
            loadYoutube(result.nextPageToken).then(function (result2) {
                loadYoutube(result2.nextPageToken).then(function (result3) {
                    var items = [].concat(_toConsumableArray(result.items), _toConsumableArray(result2.items), _toConsumableArray(result3.items));
                    if (JSON.stringify(videoCache.map(function (item) {
                        return item.id;
                    })) !== JSON.stringify(items.map(function (item) {
                        return item.id;
                    }))) {
                        videoCache = items;
                        res.json(videoCache);
                    } else {
                        res.json(videoCache);
                    }
                });
            });
        });
    });
};

exports.default = PhpIndonesia;