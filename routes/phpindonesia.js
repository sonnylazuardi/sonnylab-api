import axios from 'axios';
import cheerio from 'cheerio';

var imageReplace = {
    'http://www.event.phpindonesia.or.id/images/30jan2016_technology_update.jpg': 'https://lh3.googleusercontent.com/-zROEwpq1dOg/VvU8vFg1asI/AAAAAAAAKwI/4f_LWCuOyIkCJ3vEuxrMcW2cmaStMrfdA/s0/30jan2016_technology_update.jpg'
};

const PhpIndonesia = (app) => {
    app.get('/phpindonesia/event', (req, res) => {
        axios.get('http://www.event.phpindonesia.or.id/').then((result) => {
            var $ = cheerio.load(result.data);
            var items = [];
            $('.items > .row').filter(function () {
                var data = $(this);
                var image = 'http://www.event.phpindonesia.or.id' + data.find('img').first().attr('src');
                if (imageReplace.hasOwnProperty(image))
                    image = imageReplace[image];

                items.push({
                    title: data.find('h4').first().children().first().text(),
                    description: data.find('p').first().text(),
                    date: data.find('table').first().children().eq(0).children().eq(1).text(),
                    code: data.find('table').first().children().eq(1).children().eq(1).text(),
                    venue: data.find('table').first().children().eq(2).children().eq(1).text(),
                    seat: data.find('table').first().children().eq(3).children().eq(1).text(),
                    status: data.find('table').first().children().eq(4).children().eq(1).text(),
                    image: image
                });
            });
            res.json(items);
        });
    });
};

export default PhpIndonesia;