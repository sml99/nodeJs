const fs = require('fs');
const http = require('http');
const replaceTemplate = require(`${__dirname}/modules/replaceTemplate`);
const slugify = require('slugify');

const port = 8000;
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');

const dataObject = JSON.parse(data);
if (!dataObject[0]?.slug) {
    const slugs = dataObject.map(el => slugify(el.productName, { lower: true }));
    dataObject.map((el, index) => el.slug = slugs[index]);
    fs.writeFileSync(`${__dirname}/dev-data/data.json`, JSON.stringify(dataObject));
}

const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, req.protocol + '://' + req.headers.host + '/');
    const pathName = reqUrl.pathname;
    paths = pathName.match(/\/?[A-Za-z\-]+/g) ?? ['/'];

    switch (paths[0]) {
        case '/overview':
        case '/':
            const cardsHtml = dataObject.map(el => replaceTemplate(tempCard, el)).join('');
            const overViewOutput = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);

            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(overViewOutput);
            break;
        case '/product':
            const product = dataObject.find(el => '/' + el.slug == paths[1]);
            if (product) {
                const productOutput = replaceTemplate(tempProduct, product);
                res.writeHead(200, { 'content-type': 'text/html' });
                res.end(productOutput);
            } else {
                res.writeHead(404, {
                    'Content-type': 'text/html'
                });
                res.end('<h1><b>Error 404</b>: Page not found!</h1>');
            }
            break;
        case '/api':
            res.writeHead(200, {
                'content-type': 'application/json'
            })
            res.end(dataObject);
            break;
        default:
            res.writeHead(404, {
                'Content-type': 'text/html'
            });
            res.end('<h1><b>Error 404</b>: Page not found!</h1>');
    }
})

server.listen(port, () => {
    console.log('Listening on ' + port);
});