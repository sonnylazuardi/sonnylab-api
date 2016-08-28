import axios from 'axios';
import cheerio from 'cheerio';

const Karejo = (app) => {
    app.get('/karejo/search', (req, res) => {
        var params = [];
        for (var key in req.query) {
            params.push(key+'='+req.query[key]);
        }
        axios.get('http://karejo.com/cari?'+params.join('&')).then((result) => {
            var $ = cheerio.load(result.data);
            var items = [];
            $('li.m-b-md.shadow-box').filter(function () {
                var data = $(this);

                items.push({
                    title: data.find('.job-title').first().text(),
                    detail: data.find('.job-detail').first().text(),
                    location: data.find('.job-location').first().children().eq(1).children().first().text(),
                    company: data.find('.company-name').first().text(),
                    image: data.find('.img-thumbs').first().children().first().attr('src'),
                });
            });
            res.json(items);
        });
    });

    app.get('/karejo/location', (req, res) => {
        var params = [];
        for (var key in req.query) {
            params.push(key+'='+req.query[key]);
        }
        axios.get('http://karejo.com/').then((result) => {
            var $ = cheerio.load(result.data);
            var items = [];
            $('ul.list-city.list-unstyled li').filter(function () {
                var data = $(this);

                items.push({
                    image: data.find('img').first().attr('src'),
                    text: data.find('span').first().text(),
                    slug: data.find('a').first().attr('href'),
                });
            });
            res.json(items.reverse());
        });
    });
}

export default Karejo;