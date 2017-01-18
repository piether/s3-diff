'use strict';

const AWS = require('aws-sdk');

AWS.config.loadFromPath('./config.json');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const s3Diff = require('./index.js')(s3);

//s3Diff.list('assets-staging.neoscores.com/test').then((list) => {
//  console.log(list);
//}).catch((e) => {
//  console.error(e);
//});

s3Diff.diff('assets-staging.neoscores.com/test/test1','assets-staging.neoscores.com/test/test2').then((result) => {
  console.log(result);
}).catch((e) => {
  console.error(e);
  console.error(e.stack);
});
