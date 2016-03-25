import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';

var imageReplace = {
    'http://www.event.phpindonesia.or.id/images/30jan2016_technology_update.jpg': 'https://lh3.googleusercontent.com/-zROEwpq1dOg/VvU8vFg1asI/AAAAAAAAKwI/4f_LWCuOyIkCJ3vEuxrMcW2cmaStMrfdA/s0/30jan2016_technology_update.jpg'
};

var videoCache = [];

function loadYoutube(pageToken = null) {
    return new Promise((resolve, reject) => {
        axios.get('https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCoHfa6wCvqFVIqDTXOSNC_Q&order=date&key=AIzaSyBpu8hgnXbkqFVWrAvwRUEz7T13ii3I7WM&pageToken='+(pageToken ? pageToken : ''))
            .then(function (result) {
                var items = result.data.items.map((item) => {
                    var id = item.id.videoId;
                    var thumbnail = item.snippet.thumbnails.high.url;
                    var title = item.snippet.title;
                    var description = item.snippet.description;
                    var date = moment(item.snippet.publishedAt).fromNow();
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
                resolve(items);
            });
    });
}

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

    app.get('/phpindonesia/video', (req, res) => {
        if (videoCache.length > 0) {
            res.json(videoCache);
        }
        loadYoutube().then(items => {
            if (JSON.stringify(videoCache.map(item => item.id)) !== JSON.stringify(items.map(item => item.id))) {
                videoCache = items;
                res.json(videoCache);
            } else {
                res.json(videoCache);
            }
        });
    })
};

export default PhpIndonesia;