// Imports the Google Cloud client library
const PubSub = require('@google-cloud/pubsub');
// Your Google Cloud Platform project ID
const projectId = 'eoswonderful';
// Instantiates a client
const pubsubClient = new PubSub({
    projectId: projectId,
    keyFilename: 'eoswonderful.json'
});
var topic = pubsubClient.topic('projects/eoswonderful/topics/transaction');
const publisher = topic.publisher();

const express = require('express');

const app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.get('/transmit', (req, res) => {
    var data = JSON.parse(req.query.data)
    data['sakey'] = config['SAkey'];
    if (data['fee'] < config['MinFee']) return res.status(300).send("Fee must >=" + config['MinFee']);
    data = {
        actions: [{
            account: config['CA'],
            name: req.query.name,
            authorization: [{
                actor: config['SA'],
                permission: config['SAperm']
            }],
            data: data
        }]
    };
    publisher.publish(Buffer.from(JSON.stringify(data)), (err) => {
        if (err) {
            console.log('Error occurred while queuing background task', err);
            res.status(500).json(err);
        } else {
            console.log(`Transaction queued for background processing`);
            res.status(200).send("succeed: true");
        }
    });
});

app.get('/mint', (req, res) => {
    var data = {
        actions: [{
            account: req.query.account,
            name: 'mint',
            authorization: [{
                actor: req.query.account,
                permission: 'active'
            }],
            data: {
                from: req.query.account,
                key: req.query.to,
                amount: req.query.amount,
                memo: req.query.memo
            }
        }]
    };
    publisher.publish(Buffer.from(JSON.stringify(data)), (err) => {
        if (err) {
            console.log('Error occurred while queuing background task', err);
            res.status(500).json(err);
        } else {
            console.log(`Mint transaction queued for background processing`);
            res.status(200).send("succeed: true");
        }
    });
});

app.listen(8080, () => {
    console.log('listening on port 8080!');
});

