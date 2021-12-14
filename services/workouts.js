const db = require('../config/db');
const mw = require('../middleware');

module.exports = (app) => {

    app.get('/workouts', mw, async (req, res) => {
        
        const { user } = req.query;
        const values = await db.query(
            'select * from trainworkouts where username = $1 order by wdate desc', 
            [user]
        );
        res.status(200).send(values.rows);
    })

    app.post('/workouts/new', mw, async (req, res) => {

        const {
            user, 
            date, 
            type, 
            description, 
            meditation, 
            sauna
        } = req.body;

        await db.query(
            'insert into trainworkouts (username,wdate,type,description,meditation,sauna)' +
            'values ($1,$2,$3,$4,$5,$6)',
            [user,date,type,description,meditation,sauna],
            (err, result) => {
                if (err) {
                    console.log('ERROR', err);
                    res.status(500).send();
                }
                console.log('Added workout successfully');
                res.status(200).send();
            }
        );
    })
}