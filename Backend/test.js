const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.foodcluster.v8cdzfm.mongodb.net', (err, records) => {
  console.log(err, records);
});