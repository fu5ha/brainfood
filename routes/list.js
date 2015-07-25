var express = require('express');
var monk = require('monk');
var PDFDocument = require('pdfkit');
var router = express.Router();

var db = monk('mongodb://heroku_cvtlvgnw:2p1pnog60hqbqad4eeqc67jo89@ds063892.mongolab.com:63892/heroku_cvtlvgnw');
var items = db.get('items');


router.get('/', function(req, res, next) {
    var doc = new PDFDocument;
    doc.pipe(res);

    

    doc.end()
});

module.exports = router;