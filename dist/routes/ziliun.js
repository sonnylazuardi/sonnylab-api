'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Ziliun = function Ziliun(app) {
    var loadData = function loadData(category, page) {
        var url = 'http://www.ziliun.com/category/' + category + '/';
        if (page) {
            url = url + 'page/' + page + '/';
        }
        return new Promise(function (resolve, reject) {
            _axios2.default.get(url, { timeout: 7000 }).then(function (response) {
                var $ = _cheerio2.default.load(response.data);
                var title, image, author, slug, description;

                var articles = [];

                $('article').filter(function () {
                    var data = $(this);
                    title = data.children().eq(1).children().first().children().first().text();
                    author = data.children().eq(1).children().eq(1).children().first().children().first().text();
                    description = data.children().eq(2).children().first().text();
                    var slugs = data.children().eq(1).children().first().children().first().attr('href').split('/');
                    slug = slugs[slugs.length - 2];
                    image = data.children().first().children().first().children().first().attr('style');
                    var re1 = /background-image\:( |)(url\()/gi;
                    var re2 = /\)/gi;
                    var re3 = /\'/gi;
                    image = image.replace(re1, '');
                    image = image.replace(re2, '');
                    image = image.replace(re3, '');
                    var json = {
                        title: title,
                        image: image,
                        author: author,
                        slug: slug,
                        description: description
                    };
                    articles.push(json);
                });
                resolve(articles);
            }).catch(function (err) {
                resolve({ error: 'timeout', err: err });
            });
        });
    };

    var loadArticle = function loadArticle(slug) {
        return new Promise(function (resolve, reject) {
            _axios2.default.get('http://www.ziliun.com/' + slug + '/', { timeout: 7000 }).then(function (response) {
                var $ = _cheerio2.default.load(response.data);
                var title, image, author, category, contents, content, subimage, subimage_credit, image_credit;

                image = $('.featured-image-header').eq(0).attr('style');
                var re1 = /background-image\:( |)(url\()/gi;
                var re2 = /\)/gi;
                var re3 = /\'/gi;
                image = image.replace(re1, '');
                image = image.replace(re2, '');
                image = image.replace(re3, '');

                title = $('.entry-title').eq(0).text();
                author = $('.author').eq(0).text();
                category = $('.cat-links').eq(0).children().first().text();
                contents = $('.entry-content').children();

                content = [];
                contents.each(function (i, item) {
                    var text = $(item).text();
                    if (text == "" || text.indexOf('Baca juga:') > -1) {
                        // do nothing
                    } else if (text.indexOf('Image credit:') > -1) {
                            subimage_credit = text.replace(/Image credit\: /gi, '');
                        } else if (text.indexOf('Header image credit: ') > -1) {
                            image_credit = text.replace(/Header image credit\: /gi, '');
                        } else {
                            content.push(text);
                        }
                });

                subimage = $('img.size-full').eq(0).attr('src');
                if (!subimage) subimage = $('img.size-large').eq(0).attr('src');

                var json = {
                    title: title,
                    image: image,
                    author: author,
                    category: category,
                    content: content,
                    subimage_credit: subimage_credit,
                    image_credit: image_credit,
                    subimage: subimage
                };

                resolve(json);
            }).catch(function (err) {
                resolve({ error: 'timeout', err: err });
            });
        });
    };

    app.get('/ziliun/featured', function (req, res) {
        var page = req.query.page;
        loadData('featured', page).then(function (data) {
            res.json(data);
        });
    });

    app.get('/ziliun/insight', function (req, res) {
        var page = req.query.page;
        loadData('insight', page).then(function (data) {
            res.json(data);
        });
    });

    app.get('/ziliun/opinion', function (req, res) {
        var page = req.query.page;
        loadData('opinion', page).then(function (data) {
            res.json(data);
        });
    });

    app.get('/ziliun/story', function (req, res) {
        var page = req.query.page;
        loadData('story', page).then(function (data) {
            res.json(data);
        });
    });

    app.get('/ziliun/article/:slug', function (req, res) {
        var slug = req.params.slug;
        loadArticle(slug).then(function (data) {
            res.json(data);
        });
    });
};

exports.default = Ziliun;