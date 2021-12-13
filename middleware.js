
const mw = (req, res, next) => {
    console.log('endpoint:', req.url);
    next();
}

module.exports = mw;