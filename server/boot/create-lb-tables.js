var server = require('../server');
var ds = server.dataSources.mysqldb;
var lbTables = ['ACL'];
ds.automigrate(lbTables, function(er) {
    if (er) throw er;
    console.log('Looback tables [' + lbTables + '] created in ', ds.adapter.name);
    ds.disconnect();
});