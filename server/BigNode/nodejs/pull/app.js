// Imports the Google Cloud client library
const PubSub = require('@google-cloud/pubsub');
// Your Google Cloud Platform project ID
const projectId = 'eoswonderful';
// Instantiates a client
const pubsub = new PubSub({
  projectId: projectId,
  keyFilename: 'eoswonderful.json'
});
const subscriptionName = 'projects/eoswonderful/subscriptions/serviceaccount';
// References an existing subscription
const subscription = pubsub.subscription(subscriptionName);


var config = {
  httpEndpoint: 'https://proxy.eosnode.tools',
  chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
  CA: "1thefull2bot",
  SA: "1thefull2bot",
  SAkey: "EOS5BNXZvDrA8v6N9o7zxy8t7TqnVLvyrm9r2ZASesfsGyYfhMYwo",
  SAwif: "5KEarc2N1zteTk3PfdcvdAHxKxoeVcPd58EToJLjxQ9861GZ7ja",
  SAperm: "active",
  MinFee: 0,
}
const express = require('express');
var request = require('request');
Eos = require('eosjs');
var eos = Eos({
  httpEndpoint: config['httpEndpoint'],
  chainId: config['chainId'],
  keyProvider: config['SAwif'],
  debug: true
})
const app = express();
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


// Create an event handler to handle messages
let messageCount = 0;
const messageHandler = message => {

  console.log(`Received message ${message.id}:`);
  console.log(`\tData: ${message.data}`);
  console.log(`\tAttributes: ${message.attributes}`);
  messageCount += 1;

  eos.transaction(JSON.parse(message.data)).catch(reason => {
      //에러 메세지
      console.log(reason)
    })
    .then(value => {
      //성공 메세지
      console.log(value)

      // "Ack" (acknowledge receipt of) the message
      message.ack();
    })
};

// Listen for new messages until timeout is hit
subscription.on(`message`, messageHandler);

//setTimeout(() => {
//  subscription.removeListener('message', messageHandler);
///  console.log(`${messageCount} message(s) received.`);
//}, timeout * 1000);