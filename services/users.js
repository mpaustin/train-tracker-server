const db = require('../config/db');
const mw = require('../middleware');

module.exports = (app) => {
    app.get('/users/all', mw, async (req, res) => {
        const values = await db.query('SELECT * FROM trainusers');
        res.cookie('myCookie', 'Secret cookie');
        res.status(200).send(values.rows);
    })
}