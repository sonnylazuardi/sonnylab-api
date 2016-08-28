import axios from 'axios';
import cheerio from 'cheerio';
const BASE_URL = 'https://www.cgvblitz.com';

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

const Blitz = (app) => {
    app.get('/blitz/movies/:movieId', (req, res) => {
        axios.get(`${BASE_URL}/en/movies/detail/${req.params.movieId}`)
            .then(response => {
                var $ = cheerio.load(response.data);
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
                    title,
                    director,
                    actors,
                    durations,
                    censorRating,
                    genre,
                    language,
                    subtitle,
                    description,
                    image,
                    trailer
                });
            }).catch(err => {
                res.status(400).send('Can\'t access server');
            });
    });

    app.get('/blitz/movies', (req, res) => {
        axios.get(`${BASE_URL}/en/movies/now_playing`)
            .then(response => {
                var $ = cheerio.load(response.data);
                var movieIdMap = {
                    nowPlaying: [],
                    comingSoon: []
                };

                $(`.movie-list-body ul li`).each(function (i, elm) {
                    var url = $(elm).children().eq(1).children().first().attr('href');
                    var parsedUrl = url.split('/');
                    var movieId = parsedUrl[parsedUrl.length - 1];
                    movieIdMap.nowPlaying.push({id: movieId});
                });

                $(`.comingsoon-movie-list-body ul li`).each(function (i, elm) {
                    var url = $(elm).children().eq(1).children().first().attr('href');
                    var parsedUrl = url.split('/');
                    var movieId = parsedUrl[parsedUrl.length - 1];
                    movieIdMap.comingSoon.push({id: movieId});
                });

                res.json(movieIdMap);
            }).catch(err => {
                res.status(400).send('Can\'t access server');
            });
    });

    app.get('/blitz/cinemas', (req, res) => {
        axios.get(`${BASE_URL}/en/schedule/cinema`)
            .then(response => {
                var $ = cheerio.load(response.data);
                var cinemas = [];

                $('.city').each(function (i, elm) {
                    var city = $(elm).children().first().text();
                    var cinemasObject = $(elm).children().eq(1).children().first().children();
                    
                    cinemasObject.each(function(i, elm) {
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
            }).catch(err => {
                res.status(400).send('Can\'t access server');
            });
    })

    app.get('/blitz/cinemas/:cinemaId', (req, res) => {
        axios.get(`${BASE_URL}/en/schedule/cinema/${req.params.cinemaId}`)
            .then(response => {
                var $ = cheerio.load(response.data);
                var cinema = {};
                var image = $('.cinema-info').first().children().first().attr('src');

                $('.city').each(function (i, elm) {
                    var city = $(elm).children().first().text();
                    var cinemasObject = $(elm).children().eq(1).children().first().children();
                    
                    cinemasObject.each(function(i, elm) {
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
            }).catch(err => {
                res.status(400).send('Can\'t access server');
            });
    })

    app.get('/blitz/schedule/:cinemaId/:date?', (req, res) => {
        var {cinemaId, date} = req.params;
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1;
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        if (!date) date = `${year}-${month}-${day}`;
        axios.get(`${BASE_URL}/en/schedule/cinema/${cinemaId}/${date}`)
            .then(response => {
                var $ = cheerio.load(response.data);
                var movies = [];

                $('.schedule-title').each(function (i, elm) {
                    var title = toTitleCase($(elm).children().first().text());
                    var idObject = $(elm).children().first().attr('href').split('/');
                    var formatObject = $(elm).parent().find('.schedule-type');
                    var formats = [];
                    formatObject.each((i, elm) => {
                        var timesObject = $(elm).next().find('.showtime-lists').children();
                        var times = [];
                        var format = $(elm).text().trim();
                        var auditype = 'N';
                        timesObject.each(function(i, elm) {
                            var timeObject = $(elm).first().children().first();
                            format = timeObject.attr('movieformat');
                            auditype = timeObject.attr('auditype');
                            if (times.filter(time => time.time == $(elm).text()).length == 0) {
                                times.push({
                                    time: $(elm).text(),
                                    active: timeObject.attr('class') != 'disabled',
                                    price: timeObject.attr('price')
                                });
                            }
                        });
                        formats.push({
                            format,
                            auditype,
                            name: $(elm).text().trim(),
                            times: times
                        });
                    });

                    movies.push({
                        id: idObject[idObject.length - 1],
                        title,
                        formats
                    });
                });

                res.json({
                    cinema: {
                        id: cinemaId
                    },
                    movies
                });
            }).catch(err => {
                res.status(400).send('Can\'t access server');
            });
    })

    app.get('/blitz/seat/:cinemaId/:date/:movieId/:audiType/:time/:format/:price', (req, res) => {
        var {cinemaId, date, movieId, audiType, time, format, price} = req.params;
        axios.get(`${BASE_URL}/en/schedule/seat?cinema=${cinemaId}&showdate=${date}&movie=${movieId}&auditype=${audiType}&showtime=${time}&movieformat=${format}&price=${price}&loveseatprice=0&price1=0&price2=0&price3=0&price4=0&price5=0`)
            .then(response => {
                var body = [];

                var $ = cheerio.load(response.data);
                var rowCount = 0;
                var columnCount = 0;
                var seatRows = [];
                $('.seat-row').each(function (i, elm) {
                    rowCount++;
                    var seatColumns = [];
                    $(elm).children().each(function(i, elm) {
                        var statusObject = $(elm).children().first().attr('class');
                        var taken = false;
                        if (statusObject) {
                            statusObject = statusObject.split(' ');
                            taken = (statusObject[1] == 'taken');
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
                    currentRow.shift()
                    table.push(currentRow);
                }

                res.json({
                    table,
                    price,
                    date
                });
            }).catch(err => {
                res.status(400).send('Can\'t access server');
            });
    })
}

export default Blitz;