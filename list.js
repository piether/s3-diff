'use strict';

module.exports = function(s3) {
  let i=0;

  return function list(url) {
    const urlParts = url.split('/');
    console.log(urlParts[0],url.substring(urlParts[0].length+1));
    return fetch(urlParts[0],url.substring(urlParts[0].length+1));
  };

  function fetch(bucket,prefix,marker) {
    // console.log(bucket,prefix);
    var params = {
      Bucket: bucket, /* required */
      //Delimiter: '/',
      //EncodingType: 'url',
      Marker: marker,
      //MaxKeys: 0,
      Prefix: prefix,
      //RequestPayer: 'requester'
    };

    return new Promise((resolve,reject)=> {
      s3.listObjects(params, function(err, data) {
        if (err) {
          reject(err);
        }
        else {
          // console.log(data.CommonPrefixes);
          if(data.IsTruncated) {
            let thisList = data.Contents;
            // console.log(i++);

            fetch(bucket,prefix,data.Marker).then((nextList) => {
              resolve(thisList.concat(nextList));
            }).catch((e) => {
              reject(e);
            });
          } else {
            resolve(data.Contents);
          }
        }
      });
    })
  }
};
