const db = require('../config/db');
const mw = require('../middleware');

module.exports = (app) => {

    app.get('/login', mw, async (req, res) => {

        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Basic')) {
    
            const encoded = auth.substring('Basic '.length).trim();
            const decoded = Buffer.from(encoded, 'base64').toString('binary');
    
            const index = decoded.indexOf(':');
            const username = decoded.substring(0,index);
            const password = decoded.substring(index + 1);
    
            const user = await db.query(
                'select * from trainusers where username = $1',
                [username]
            )
            if (user && user.rows && user.rows[0] && user.rows[0].password === password) {
                console.log('Log In: Success');
                return res.status(200).send();
            }
        }
        console.log('Log In: Failure');
        return res.status(401).send();
    });

}