const db = require('../config/db');
const mw = require('../middleware');

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.send('~SUCCESS~');
    })
}