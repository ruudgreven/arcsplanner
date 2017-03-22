var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.type('application/json');
    res.sendFile('www/blocks.json', {root: '../arcsplanner'});      //???
});

module.exports = router;