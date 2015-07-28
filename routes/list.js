var express = require('express');
var monk = require('monk');
var PDFDocument = require('pdfkit');
var router = express.Router();

//var db = monk('mongodb://heroku_cvtlvgnw:2p1pnog60hqbqad4eeqc67jo89@ds063892.mongolab.com:63892/heroku_cvtlvgnw');
var db = monk('localhost/brianfood');
var items = db.get('items');


router.get('/', function(req, res, next) {
    var doc = new PDFDocument;

    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename=ShoppingList.pdf'
    });

    doc.pipe(res);

    items.find({stock: {$lt: 50}}, function(err, docs){
        for (var i=0;i<docs.length;i++) {
            var current_doc = docs[i];
            doc.text('Current Stock: ' + current_doc.stock);
            doc.text('Item Number: ' + current_doc.item_number);
            doc.text('Item Name: ' + current_doc.name);
            doc.text('Price Per Item: ' + current_doc.price);
            doc.text('Units Per Item: ' + current_doc.pack);
            doc.moveDown();
            doc.moveDown();
        }
        doc.end();
    return
    });

});

module.exports = router;