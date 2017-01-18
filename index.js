'use strict';

module.exports = function(s3) {
  return {
    list: require('./list')(s3),
    diff: require('./diff')(s3)
  };

};