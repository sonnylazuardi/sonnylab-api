import axios from 'axios';
import cheerio from 'cheerio';

const Ziliun = (app) => {
    var loadData = (category, page) => { 
        var url = 'http://www.ziliun.com/category/'+category+'/';
        if (page) {
            url = url + 'page/' + page + '/';
        }
        return new Promise((resolve, reject) => {
            axios.get(url, {timeout: 1000})
                .then((response) => {
                    var $ = cheerio.load(response.data);
                    var title, image, author, slug, description;

                    var articles = [];

                    $('article').filter(function() {
                        var data = $(this);
                        title = data.children().eq(1).children().first().children().first().text();
                        author = data.children().eq(1).children().eq(1).children().first().children().first().text();
                        description = data.children().eq(2).children().first().text();
                        var slugs = data.children().eq(1).children().first().children().first().attr('href').split('/');
                        slug = slugs[slugs.length-2];
                        image = data.children().first().children().first().children().first().attr('style');
                        var re1 = /background-image\:( |)(url\()/gi;
                        var re2 = /\)/gi;
                        var re3 = /\'/gi
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
                })
                .catch(function (err) {
                    resolve({error: 'timeout', err: err});
                });
        });
    }

    var loadArticle = (slug) => {
        return new Promise((resolve, reject) => {
            axios.get('http://www.ziliun.com/'+slug+'/', {timeout: 1000})
                .then((response) => {
                    var $ = cheerio.load(response.data);
                    var title, image, author, category, contents, content, subimage, subimage_credit, image_credit;

                    image = $('.featured-image-header').eq(0).attr('style');
                    var re1 = /background-image\:( |)(url\()/gi;
                    var re2 = /\)/gi;
                    var re3 = /\'/gi
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
                        }  else {
                            content.push(text);
                        }
                    });

                    subimage = $('img.size-full').eq(0).attr('src');
                    if (!subimage)
                        subimage = $('img.size-large').eq(0).attr('src');

                    var json = {
                        title: title,
                        image: image,
                        author: author,
                        category: category,
                        content: content,
                        subimage_credit: subimage_credit,
                        image_credit: image_credit,
                        subimage: subimage,
                    };

                    resolve(json);
                })
                .catch(function (err) {
                    resolve({error: 'timeout', err: err});
                });
        });
    }

    app.get('/ziliun/featured', (req, res) => {
        var page = req.query.page;
        loadData('featured', page).then((data) => {
            res.json(data);
        });
    });

    app.get('/ziliun/insight', (req, res) => {
        var page = req.query.page;
        loadData('insight', page).then((data) => {
            res.json(data);
        });
    });

    app.get('/ziliun/opinion', (req, res) => {
        var page = req.query.page;
        loadData('opinion', page).then((data) => {
            res.json(data);
        });
    });

    app.get('/ziliun/story', (req, res) => {
        var page = req.query.page;
        loadData('story', page).then((data) => {
            res.json(data);
        });
    });

    app.get('/ziliun/article/:slug', (req, res) => {
        var slug = req.params.slug;
        loadArticle(slug).then((data) => {
            res.json(data);
        });
    });
}

export default Ziliun;

