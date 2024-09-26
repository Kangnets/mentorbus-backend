const mysql = require('mysql');

const dbInfo = {
        host: 'localhost',
        user: 'mentorowner',
        password: 'kangwh05!!',
        database: 'mentorbus_db'
};

module.exports = {
        init: function(){   
               return mysql.createConnection(dbInfo);
        },
        connect: function(conn) { 
            conn.connect(function(err) {
                 if (err) console.error('mysql 연결 에러 : ' + err);
                     else console.log('mysql 연결 성공');
        });
};