var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
var Product = require('../models/product');
/* GET home page. */
router.get('/', function (req, res, next) {
    Product.find(function (err, docs) {
        var productChunks = [];
        var chunkSize = 3;
        for (var i = 0; i < docs.length; i += chunkSize) {
            productChunks.push(docs.slice(i, i + chunkSize));
        }
        res.render('shop/home', { title: 'Shopping Cart', products: productChunks });
    });
});


router.get('/add-to-cart/', function (req, res, next) {
    var productId = req.query.id;
    //if i already have a cart in the session then i pass that else i pass empty object
    //for each session i have a cart
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function (err, product) {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        res.redirect('/');
    });
});

router.get('/reduce/', function(req, res, next) {
    var productId = req.query.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/', function(req, res, next) {
    var productId = req.query.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.cart) {
        return res.render('shop/shopping-cart', { products: null });
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', { products: cart.generateArray(), totalPrice: cart.totalPrice });
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/checkout', { total: cart.totalPrice});
});


router.use('/user', require('./user'));

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/user/signin');
}

module.exports = router;