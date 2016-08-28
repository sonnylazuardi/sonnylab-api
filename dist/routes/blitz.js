'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BASE_URL = 'https://www.cgvblitz.com';

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

var Blitz = function Blitz(app) {
    app.get('/blitz/movies/:movieId', function (req, res) {
        _axios2.default.get(BASE_URL + '/en/movies/detail/' + req.params.movieId).then(function (response) {
            var $ = _cheerio2.default.load(response.data);
            var title = toTitleCase($('.movie-info-title').text().trim());
            var info = $('.movie-add-info ul').children();
            var director = toTitleCase(info.eq(0).text().replace(/DIRECTOR : /g, ''));
            var actors = info.eq(1).text().replace(/ACTORS : /g, '').split(', ');
            var durations = info.eq(2).text().replace(/DURATIONS : /g, '');
            var censorRating = info.eq(3).text().replace(/CENSOR RATING : /g, '');
            var genre = toTitleCase(info.eq(4).text().replace(/GENRE : /g, ''));
            var language = toTitleCase(info.eq(5).text().replace(/LANGUAGE : /g, ''));
            var subtitle = toTitleCase(info.eq(6).text().replace(/SUBSTITLE : /g, ''));
            var description = $('.movie-synopsis').first().children().first().text().trim();
            var image = BASE_URL + $('.poster-section').children().first().attr('src');
            var trailer = $('.trailer-section').children().first().attr('src');

            res.json({
                id: req.params.movieId,
                title: title,
                director: director,
                actors: actors,
                durations: durations,
                censorRating: censorRating,
                genre: genre,
                language: language,
                subtitle: subtitle,
                description: description,
                image: image,
                trailer: trailer
            });
        }).catch(function (err) {
            res.status(400).send('Can\'t access server');
        });
    });

    app.get('/blitz/movies', function (req, res) {
        _axios2.default.get(BASE_URL + '/en/movies/now_playing').then(function (response) {
            var $ = _cheerio2.default.load(response.data);
            var movieIdMap = {
                nowPlaying: [],
                comingSoon: []
            };

            $('.movie-list-body ul li').each(function (i, elm) {
                var url = $(elm).children().eq(1).children().first().attr('href');
                var parsedUrl = url.split('/');
                var movieId = parsedUrl[parsedUrl.length - 1];
                movieIdMap.nowPlaying.push({ id: movieId });
            });

            $('.comingsoon-movie-list-body ul li').each(function (i, elm) {
                var url = $(elm).children().eq(1).children().first().attr('href');
                var parsedUrl = url.split('/');
                var movieId = parsedUrl[parsedUrl.length - 1];
                movieIdMap.comingSoon.push({ id: movieId });
            });

            res.json(movieIdMap);
        }).catch(function (err) {
            res.status(400).send('Can\'t access server');
        });
    });

    app.get('/blitz/cinemas', function (req, res) {
        _axios2.default.get(BASE_URL + '/en/schedule/cinema').then(function (response) {
            var $ = _cheerio2.default.load(response.data);
            var cinemas = [];

            $('.city').each(function (i, elm) {
                var city = $(elm).children().first().text();
                var cinemasObject = $(elm).children().eq(1).children().first().children();

                cinemasObject.each(function (i, elm) {
                    cinemas.push({
                        name: $(elm).first().text(),
                        id: $(elm).first().children().first().attr('id'),
                        city: {
                            name: city
                        }
                    });
                });
            });

            res.json(cinemas);
        }).catch(function (err) {
            res.status(400).send('Can\'t access server');
        });
    });

    app.get('/blitz/cinemas/:cinemaId', function (req, res) {
        _axios2.default.get(BASE_URL + '/en/schedule/cinema/' + req.params.cinemaId).then(function (response) {
            var $ = _cheerio2.default.load(response.data);
            var cinema = {};
            var image = $('.cinema-info').first().children().first().attr('src');

            $('.city').each(function (i, elm) {
                var city = $(elm).children().first().text();
                var cinemasObject = $(elm).children().eq(1).children().first().children();

                cinemasObject.each(function (i, elm) {
                    var cinemaId = $(elm).first().children().first().attr('id');
                    if (cinemaId == req.params.cinemaId) {
                        cinema = {
                            name: $(elm).first().text(),
                            id: cinemaId,
                            image: image,
                            city: {
                                name: city
                            }
                        };
                    }
                });
            });

            res.json(cinema);
        }).catch(function (err) {
            res.status(400).send('Can\'t access server');
        });
    });

    app.get('/blitz/schedule/:cinemaId/:date?', function (req, res) {
        var _req$params = req.params;
        var cinemaId = _req$params.cinemaId;
        var date = _req$params.date;

        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        if (!date) date = year + '-' + month + '-' + day;
        _axios2.default.get(BASE_URL + '/en/schedule/cinema/' + cinemaId + '/' + date).then(function (response) {
            var $ = _cheerio2.default.load(response.data);
            var movies = [];

            $('.schedule-title').each(function (i, elm) {
                var title = toTitleCase($(elm).children().first().text());
                var idObject = $(elm).children().first().attr('href').split('/');
                var formatObject = $(elm).parent().find('.schedule-type');
                var formats = [];
                formatObject.each(function (i, elm) {
                    var timesObject = $(elm).next().find('.showtime-lists').children();
                    var times = [];
                    var format = $(elm).text().trim();
                    var auditype = 'N';
                    timesObject.each(function (i, elm) {
                        var timeObject = $(elm).first().children().first();
                        format = timeObject.attr('movieformat');
                        auditype = timeObject.attr('auditype');
                        if (times.filter(function (time) {
                            return time.time == $(elm).text();
                        }).length == 0) {
                            times.push({
                                time: $(elm).text(),
                                active: timeObject.attr('class') != 'disabled',
                                price: timeObject.attr('price')
                            });
                        }
                    });
                    formats.push({
                        format: format,
                        auditype: auditype,
                        name: $(elm).text().trim(),
                        times: times
                    });
                });

                movies.push({
                    id: idObject[idObject.length - 1],
                    title: title,
                    formats: formats
                });
            });

            res.json({
                cinema: {
                    id: cinemaId
                },
                movies: movies
            });
        }).catch(function (err) {
            res.status(400).send('Can\'t access server');
        });
    });

    app.get('/blitz/seat/:cinemaId/:date/:movieId/:audiType/:time/:format/:price', function (req, res) {
        var _req$params2 = req.params;
        var cinemaId = _req$params2.cinemaId;
        var date = _req$params2.date;
        var movieId = _req$params2.movieId;
        var audiType = _req$params2.audiType;
        var time = _req$params2.time;
        var format = _req$params2.format;
        var price = _req$params2.price;

        _axios2.default.get(BASE_URL + '/en/schedule/seat?cinema=' + cinemaId + '&showdate=' + date + '&movie=' + movieId + '&auditype=' + audiType + '&showtime=' + time + '&movieformat=' + format + '&price=' + price + '&loveseatprice=0&price1=0&price2=0&price3=0&price4=0&price5=0').then(function (response) {
            var body = [];

            var $ = _cheerio2.default.load(response.data);
            var rowCount = 0;
            var columnCount = 0;
            var seatRows = [];
            $('.seat-row').each(function (i, elm) {
                rowCount++;
                var seatColumns = [];
                $(elm).children().each(function (i, elm) {
                    var statusObject = $(elm).children().first().attr('class');
                    var taken = false;
                    if (statusObject) {
                        statusObject = statusObject.split(' ');
                        taken = statusObject[1] == 'taken';
                    }
                    seatColumns.push({
                        label: $(elm).text().trim(),
                        taken: taken
                    });
                });
                seatRows.push(seatColumns);
            });

            columnCount = seatRows[0].length - 1;

            var table = [];

            for (var i = rowCount - 1; i >= 1; i--) {
                var currentRow = seatRows[i - 1];
                currentRow = currentRow.reverse();
                currentRow.shift();
                table.push(currentRow);
            }

            res.json({
                table: table,
                price: price,
                date: date
            });
        }).catch(function (err) {
            res.status(400).send('Can\'t access server');
        });
    });
};

exports.default = Blitz;