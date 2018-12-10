//acess some npm modules 
const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');

//configure paypal with sandbox credentials
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AdZuJK7nupeoIpHr9ieYDbVRwogazE7wICEWaZsva_Z6qW4Xa0YpWkS9v3lFIjkx4mVwu3DU-2vowvys',
    'client_secret': 'EFTanALyeQCbLBsmKCN4WduZ4bmX0gSPvauNJgzG1pyHBIw9nExsqG1fD5YGUYV150QQuDGIJVUxUN4v'
});

//acess all files with express module
const app = express();
app.set('view engine', 'ejs');
app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.get('', (req, res) => res.render('index'));
app.get('/index', (req, res) => res.render('index'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/aboutus', (req, res) => res.render('aboutus'));
app.get('/Feedback', (req, res) => res.render('Feedback'));
app.get('/shop', (req, res) => res.render('shop'));
app.get('/signup', (req, res) => res.render('signup'));

//redirect to pay after clicking on buy button in website
app.post('/pay', (req, res) => {

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"

        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Toy Train",
                    "sku": "001",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Toy for special kid."
        }]
    };

    //Method for creating payment in paypal 
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0; i < payment.links.length; i++){

                if(payment.links[i].rel === 'approval_url'){

                    res.redirect(payment.links[i].href);
                }

            }
        }
    });
});

//redirect to success page for excecuting the payment after comparing my actual
//payment link in upper method 
app.get('/success', (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
    };
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});

//redirect to cancel page if cancel the payment
app.get('/cancel', (req, res) => res.send('Cancelled'));

//Starting server
app.listen(3000, () => console.log
    ('Server Started'));
