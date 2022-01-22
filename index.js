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
const slugs = dataObject.map(el => slugify(el.productName, { lower: true }))


const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, req.protocol + '://' + req.headers.host + '/');
    const pathName = reqUrl.pathname;
    ///////////////////////////////////////////////
    const query = reqUrl.search.match(/([0-9A-Za-z]+)/mg);
    const queryObj = {};
    if (query?.length > 0)
        for (i = 0; i < query.length; i += 2)
            queryObj[query[i]] = query[i + 1];
    //////////////////////////////////////////////
    switch (pathName) {
        case '/overview':
        case '/':
            const cardsHtml = dataObject.map(el => replaceTemplate(tempCard, el)).join('');
            const overViewOutput = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardsHtml);

            res.writeHead(200, { 'content-type': 'text/html' });
            res.end(overViewOutput);
            break;
        case '/product':
            if (query?.includes('id') && ('id' in queryObj) && dataObject[queryObj.id]) {
                const product = dataObject[queryObj.id];
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