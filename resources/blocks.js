var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.type('application/json');
    res.sendFile('blocks.json', {root: '../arcsplanner'});      //???
});

module.exports = router;