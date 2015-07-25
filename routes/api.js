var express = require('express');
var monk = require('monk');
var router = express.Router();

var db = monk('localhost/brainfood');
var items = db.get('items');
var bags = db.get('bags');

// ITEMS API ------------------------------
router.get('/items', function (req, res) {
    items.find({}, function(e, docs) {
        if (e) {
            res.send(400, e);
        } else {
            res.json(docs);
        }
    });
});

router.post('/items', function (req, res) {
    items.insert(req.body, function(err, doc) {
        if (err) {
            res.send(400, err);
        } else {
            res.send(200);
        }
    });
});

router.get('/item/:id', function (req, res) {
    items.findById( req.params.id, function(err,doc) {
        if (err) {
            res.send(400, err);
        } else { 
            res.json(doc);
        }
    });
});

router.put('/item/:id', function (req, res) {
    items.updateById(req.params.id, {$set: req.body}, function(err){
        if (err) {
            res.send(400, err);
        } else {
            res.send(200);
        }
    });
});

router.delete('/item/:id', function (req, res) {
    items.remove({_id : req.params.id}, function(err) {
         if (err) {
            res.send(400, err);
        } else {
            res.send(200);
        }
    });
});

// BAGS API ---------------------------------
router.get('/bags', function (req, res) {
    bags.find({}, function(e, docs) {
        if (e) {
            res.send(400, e);
        } else {
            res.json(docs);
        }
    });
});

router.post('/bags', function (req, res) {
    bags.insert(req.body, function(e, doc) {
        if (e) {
            res.send(400, e);
        } else {
            res.send(200);
        }
    });
});

router.get('/bag/:id', function (req, res) {
    bags.findById(req.params.id, function(e, docs) {
        if (e) {
            res.send(400, e);
        } else {
            res.json(docs);
        }
    });
});

router.put('/bag/:id', function (req, res) {
    bags.updateById(req.params.id, {$set: req.body}, function(e) {
        if (e) {
            res.send(400, e);
        } else {
            res.send(200);
        }
    })
});

router.delete('/bag/:id', function (req, res) {
    bags.remove({_id : req.params.id}, function(e) {
        if (e) {
            res.send(400, e);
        } else {
            res.send(200);
        }
    });    
});

module.exports = router;
