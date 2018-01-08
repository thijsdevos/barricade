const Express = require('express');
const Static = Express();
const Path = require('path');

const base = Path.join(__dirname + '/../..', 'public');

Static.use(Express.static(base));
Static.get('/', (req, res) => {
    res.sendFile(base + '/index.html');
});
Static.listen(80);

module.exports = Static;