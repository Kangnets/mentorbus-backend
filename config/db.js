const mysql = require("mysql");

const db = {
  host: "svc.sel4.cloudtype.app",
  port: 30957,
  user: "root",
  password: "kangwh05!!",
  database: "mentorbus_db",
};

module.exports = {
  init: function () {
    return mysql.createConnection(db);
  },
  connect: function (conn) {
    conn.connect(function (err) {
      if (err) console.error("mysql 연결 에러 : " + err);
      else console.log("mysql 연결 성공");
    });
  },
};
