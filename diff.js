'use strict';

module.exports = function(s3) {

  const list = require('./list')(s3);

  return function diff(url1, url2) {
    return Promise.all([list(url1),list(url2)]).then((arr) =>{
      return compare(onlyFiles(arr[0]),onlyFiles(arr[1]));
    });
  };

  function compare(one,two) {
    const deletions = [];
    const renames = [];
    const changes = [];
    const potentialDeletes = [];

    const objectsToCheck = keyMap(two);

    one.forEach((object) => {
      if(!objectsToCheck[object.Key]) {
        console.log('potential delete', object.Key);
        potentialDeletes.push(object);
      } else if(!objectsToCheck[object.Key].ETag===object.ETag) {
        console.log('change', object.Key);
        changes.push(objectsToCheck[object.Key]);
        objectsToCheck[object.Key] = null;
      } else {
        console.log('nothin changed', object.Key);
        objectsToCheck[object.Key] = null;
      }
    });

    potentialDeletes.forEach((object) => {
      console.log('going over pot del');
      const objectWithETag = findObjectWithETag(objectsToCheck,object.ETag);
      if(objectWithETag) {
        renames.push({from:object,to:objectWithETag});
        objectsToCheck[objectWithETag.Key] = null;
      } else {
        deletions.push(object);
      }
    });

    const additions = Object.keys(objectsToCheck).map((key) => {
      return objectsToCheck[key];
    }).filter((object) => {
      return object;
    });

    return {
      changes,
      additions,
      deletions,
      renames
    };
  }

  function keyMap(objects) {
    const result = {};
    objects.forEach((object) => {
      result[object.Key] = object;
    });
    return result;
  }

  function findObjectWithETag(collection, eTag) {
    const keys = Object.keys(collection);
    for(var i=0; i <keys.length; i++) {
      if(collection[keys[i]] && collection[keys[i]].ETag === eTag) {
        return collection[keys[i]];
      }
    }
  }

  function onlyFiles(objects) {
    return objects.filter((object) => {
      return !object.Key.endsWith('/');
    })
  }
};
