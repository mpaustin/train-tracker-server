require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));  
    })
};

const auth = require('./config/auth');
app.use(auth.checkJwt);

require('./services/home')(app);
require('./services/users')(app);
require('./services/workouts')(app);

// deprecated, replaced with Auth0 integration
require('./services/login')(app);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('build'));
}

app.listen(port, () => {
    console.log(`Train Tracker listening on port ${port}`);
})