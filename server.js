require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;

// console.log('process env', process.env);

// app.use(express.static(path.join(__dirname, '/build')));
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));  
    })
} else {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/public', 'index.html'));
    })
}


const checkJwt = jwt({

    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://mpaustin.us.auth0.com/.well-known/jwks.json`
    }),
  
    audience: 'api.traintracker.com',
    issuer: `https://mpaustin.us.auth0.com/`,
    algorithms: ['RS256']
});

app.use(checkJwt);

const mw = (req, res, next) => {
    console.log('req.url', req.url);
    next();
}

app.get('/', (req, res) => {
    res.send('~SUCCESS~');
})

const pgClient = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

app.get('/users/all', mw, async (req, res) => {
    const values = await pgClient.query('SELECT * FROM trainusers');
    res.cookie('myCookie', 'Secret cookie');
    res.status(200).send(values.rows);
})

app.get('/workouts', mw, async (req, res) => {
    const { user } = req.query;
    const values = await pgClient.query(
        'select * from trainworkouts where username = $1 order by wdate desc', 
        [user]
    );
    res.status(200).send(values.rows);
})

app.post('/workouts/new', mw, async (req, res) => {

    const user = req.body.user;
    const date = req.body.date;
    const type = req.body.type;
    const description = req.body.description;
    const meditation = req.body.meditation;
    const sauna = req.body.sauna;

    await pgClient.query(
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

app.get('/login', mw, async (req, res) => {

    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Basic')) {

        const encoded = auth.substring('Basic '.length).trim();
        const decoded = Buffer.from(encoded, 'base64').toString('binary');

        const index = decoded.indexOf(':');
        const username = decoded.substring(0,index);
        const password = decoded.substring(index + 1);

        const user = await pgClient.query(
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

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('build'));
}

app.listen(port, () => {
    console.log(`Train Tracker listening on port ${port}`);
})