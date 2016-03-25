import axios from 'axios';
import cheerio from 'cheerio';

const PhpIndonesia = (app) => {
    app.get('/phpindonesia/event', (req, res) => {
        axios.get('http://www.event.phpindonesia.or.id/').then((result) => {
            var $ = cheerio.load(result.data);
            var items = [];
            $('.items > .row').filter(function () {
                var data = $(this);

                console.log(data.find('table').first().children().first().children().eq(1).html());

                items.push({
                    title: data.find('h4').first().children().first().text(),
                    description: data.find('p').first().text(),
                    date: data.find('table').first().children().eq(0).children().eq(1).text(),
                    code: data.find('table').first().children().eq(1).children().eq(1).text(),
                    venue: data.find('table').first().children().eq(2).children().eq(1).text(),
                    seat: data.find('table').first().children().eq(3).children().eq(1).text(),
                    status: data.find('table').first().children().eq(4).children().eq(1).text(),
                    image: 'http://www.event.phpindonesia.or.id' + data.find('img').first().attr('src')
                });
            });
            res.json(items);
        });
    });
};

export default PhpIndonesia;