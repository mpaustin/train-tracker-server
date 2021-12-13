const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

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

exports.checkJwt = checkJwt;