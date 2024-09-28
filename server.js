const mysql = require("mysql2");
const { config } = require("./config/db");
const axios = require("axios");

// Connection pool 생성
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  port: config.port,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// DB 연결
/*
pool.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL database");
});
*/

const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let userData = {}; // Store user data by insta (Instagram handle) as key
let kakaoUserData = {}; // Store Kakao user data

let comments = []; // 댓글 저장소
let commentId = 0; // 댓글 인덱스 넘버

let letters = []; // 글 저장소
let letterId = 0; // 글 인덱스 넘버

let classes = []; // 수업 저장소
let classId = 0; // 수업 인덱스 넘버

let myClass = []; // 수업 저장소
let myclassId = 0; // 수업 인덱스 넘버

// 카카오 로그인 결과를 수신하는 엔드포인트
app.post("/api/login", (req, res) => {
  const loginData = req.body;

  // 로그인 데이터 처리
  console.log("Received Kakao login data:", loginData);

  // accessToken과 refreshToken을 추출
  const accessToken = loginData.accessToken;
  const refreshToken = loginData.refreshToken;

  // 현재 시간을 createdAt과 editedAt으로 설정
  const createdAt = new Date();
  const editedAt = new Date();

  // Kakao API를 통해 사용자 정보 가져오기
  axios
    .get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((response) => {
      console.log(response.data); // 사용자의 이메일, 프로필 이미지, 닉네임 등이 포함됨
      const userInfo = response.data;
      const kakao_id = userInfo?.id;
      const nickname = userInfo?.properties?.nickname;
      const profile = userInfo?.properties?.profile_image;
      const email = userInfo?.kakao_account?.email;

      // 데이터베이스에 저장
      pool.query(
        `INSERT INTO kakaoData (nickname, profile, email, accessToken, refreshToken, kakao_id, createdAt, editedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nickname,
          profile,
          email,
          accessToken,
          refreshToken,
          kakao_id,
          createdAt,
          editedAt,
        ],
        (error, results) => {
          if (error) {
            console.error("Error saving Kakao login data:", error);
            return res
              .status(500)
              .json({ message: "Internal server error", error: error.message });
          }
          res
            .status(200)
            .json({ message: "Kakao login data saved successfully" });
        }
      );
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Error fetching Kakao user data" });
    });
});

app.post("/onboarding/userData", (req, res) => {
  const { nickname, position, job, major, kakao_id } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO userData (nickname, position, job, major, kakao_id , createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nickname, position, job, major, kakao_id, createdAt, editedAt],
    (error, results) => {
      if (error) {
        console.error("Error saving mentee data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "Mentor data saved successfully" });
    }
  );
});

// Get mentor data by kakao_id
app.get("/onboarding/userdata/:kakao_id", (req, res) => {
  const kakao_id = req.params.kakao_id;

  pool.query(
    `SELECT * FROM userData WHERE kakao_id = ?`,
    [kakao_id],
    (error, results) => {
      if (error) {
        console.error("Error retrieving mentor data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Mentor not found" });
      }

      res.status(200).json(results[0]);
    }
  );
});

// GET API to retrieve Kakao user data
app.get("/api/login/:nickname", (req, res) => {
  const nickname = req.params.nickname;
  const userData = kakaoUserData[nickname];

  if (!userData) {
    return res.status(404).json({ message: "User data not found" });
  }

  res.status(200).json(userData);
});

//온보딩 멘토
// 온보딩 멘토
/*
app.post("/onboarding/mentor", (req, res) => {
  const { nickname, position, job, major } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Nickname is required" });
  }

  // 현재 시간을 기준으로 createdAt, editedAt 값을 설정
  const createdAt = new Date();
  const editedAt = new Date();

  // SQL 쿼리 작성
  const query = `
    INSERT INTO userData (nickname, position, job, major, createdAt, editedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // 쿼리 실행
  db.query(
    query,
    [nickname, position, job, major, createdAt, editedAt],
    (err, result) => {
      if (err) 
        console.error("Error saving mentor data:", err);
        return res.status(500).json({ message: "Failed to save data" });
      }

      res.status(200).json({ message: "Mentor data saved successfully" });
    }
  );

  */

app.post("/onboarding/mentee", (req, res) => {
  const { nickname, position, job, major, kakao_id } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO userData (nickname, position,  job, major,kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?)`,
    [nickname, position, job, major, kakao_id, createdAt, editedAt],
    (error, results) => {
      if (error) {
        console.error("Error saving mentee data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "Mentee data saved successfully" });
    }
  );
});

// Get mentor data by kakao_id
app.get("/onboarding/mentee/:kakao_id", (req, res) => {
  const kakao_id = req.params.kakao_id;

  pool.query(
    `SELECT * FROM userData WHERE kakao_id = ?`,
    [kakao_id],
    (error, results) => {
      if (error) {
        console.error("Error retrieving mentor data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Mentor not found" });
      }

      res.status(200).json(results[0]);
    }
  );
});

app.post("/onboarding/mentee", (req, res) => {
  const { nickname, position, job, major, kakao_id } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO userData (nickname, position,  job, major,kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nickname, position, job, major, kakao_id, createdAt, editedAt],
    (error, results) => {
      if (error) {
        console.error("Error saving mentee data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "Mentee data saved successfully" });
    }
  );
});

// 수업 열기
app.post("/class/open", (req, res) => {
  const {
    nickname,
    title,
    num,
    date,
    map,
    content,
    name,
    major,
    status,
    kakao_id,
  } = req.body;

  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO classData (nickname, title, num, date, map, content, name, major, status, kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)`,
    [
      nickname,
      title,
      num,
      date,
      map,
      content,
      name,
      major,
      status,
      kakao_id,
      createdAt,
      editedAt,
    ],
    (error, results) => {
      if (error) {
        console.error("Error saving class data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "Class data saved successfully" });
    }
  );
});

// Get mentor data by kakao_id
app.get("/class/open", (req, res) => {
  pool.query(`SELECT * FROM classData`, (error, results) => {
    if (error) {
      console.error("Error retrieving mentor data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "class not found" });
    }

    res.status(200).json(results[0]);
  });
});

// Save the new class
app.post("/class/save", (req, res) => {
  const { nickname, title, num, date, map, content, name, major, status } =
    req.body;

  // Create a new class entry
  const newClass = {
    id: classId++, // Increment class ID
    content: content,
    title: title,
    num: num,
    nickname: nickname,
    major: major,
    name: name,
    date: date,
    map: map,
    status: status,
    createdAt: new Date(),
  };

  // Store it in `myClass` using a unique identifier (e.g., class ID or name)
  myClass.push(newClass);

  // Send only the newly created class as a response
  res
    .status(200)
    .json({ message: "Class saved successfully", comment: newClass });
});

//글

// 수업 열기
app.post("/class/open", (req, res) => {
  const {
    nickname,
    title,
    num,
    date,
    map,
    content,
    name,
    major,
    status,
    kakao_id,
  } = req.body;

  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO classData (nickname, title, num, date, map, content, name, major, status, kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)`,
    [
      nickname,
      title,
      num,
      date,
      map,
      content,
      name,
      major,
      status,
      kakao_id,
      createdAt,
      editedAt,
    ],
    (error, results) => {
      if (error) {
        console.error("Error saving class data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "Class data saved successfully" });
    }
  );
});

app.post("/letters", (req, res) => {
  const {
    major,
    type,
    star_num,
    comment_num,
    question,
    mentor_answer,
    title,
    author,
    isClick,
    kakao_id,
  } = req.body;

  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO letterData (major, type, star_num, comment_num, question, mentor_answer, title, author, isClick, kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?,?)`,
    [
      major,
      type,
      star_num,
      comment_num,
      question,
      mentor_answer,
      title,
      author,
      isClick,
      kakao_id,
      createdAt,
      editedAt,
    ],
    (error, results) => {
      if (error) {
        console.error("Error saving class data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "letter data saved successfully" });
    }
  );
  res
    .status(200)
    .json({ message: "Comment saved successfully", comment: newLetter });
});

// Get mentor data by kakao_id
app.get("/letters", (req, res) => {
  pool.query(`SELECT * FROM letterData`, (error, results) => {
    if (error) {
      console.error("Error retrieving letter data:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "letter not found" });
    }

    res.status(200).json(results[0]);
  });
});

// Update the isClick value in the database for a specific letter by id
app.patch("/letters/:id", (req, res) => {
  const { id } = req.params;
  const { isClick } = req.body;

  // isClick은 1 또는 0의 값으로 전달됨 (true/false로 변환해서 사용할 수 있음)
  const newIsClick = isClick === true ? 1 : 0;

  // 데이터베이스에서 해당 id의 isClick 값 업데이트
  const updateQuery = `
    UPDATE letterData
    SET isClick = ?
    WHERE id = ?
  `;

  pool.query(updateQuery, [newIsClick, id], (error, results) => {
    if (error) {
      console.error("Error updating letter:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Letter not found" });
    }

    res.json({
      message: "Letter updated successfully",
      data: { id, isClick: newIsClick },
    });
  });
});

// 수업 상태 수정
app.patch("/classes/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // 데이터베이스에서 해당 id의 수업 상태를 업데이트
  const updateStatusQuery = `
    UPDATE classData
    SET status = ?
    WHERE id = ?
  `;

  pool.query(updateStatusQuery, [status, id], (error, results) => {
    if (error) {
      console.error("Error updating class status:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({
      message: "Class status updated successfully",
      data: { id, status },
    });
  });
});

// 수업 수정하기
app.patch("/classes/:id", (req, res) => {
  const { id } = req.params;
  const { title, num, date, map, content, name, nickname, major, status } =
    req.body;

  // 수업 배열에서 해당 수업 찾기
  const classIndex = classes.findIndex(
    (classItem) => classItem.id === parseInt(id)
  );

  if (classIndex === -1) {
    return res.status(404).json({ message: "Class not found" });
  }

  // 기존 수업 정보를 업데이트
  classes[classIndex] = {
    ...classes[classIndex], // 기존 정보를 유지하면서
    title: title !== undefined ? title : classes[classIndex].title,
    num: num !== undefined ? num : classes[classIndex].num,
    date: date !== undefined ? date : classes[classIndex].date,
    map: map !== undefined ? map : classes[classIndex].map,
    content: content !== undefined ? content : classes[classIndex].content,
    name: name !== undefined ? name : classes[classIndex].name,
    nickname: nickname !== undefined ? nickname : classes[classIndex].nickname,
    major: major !== undefined ? major : classes[classIndex].major,
    status: status !== undefined ? status : classes[classIndex].status,
  };

  res.json({
    message: "Class updated successfully",
    updatedClass: classes[classIndex],
  });
});

// 댓글 API
app.post("/comment", (req, res) => {
  const { kakao_id, content, likes, replyCount } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO commentData (nickname, position,  school, interest,want, content, likes,replyCount, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
    [kakao_id, likes, replyCount, content, createdAt, editedAt],
    (error, results) => {
      if (error) {
        console.error("Error saving mentee data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "Comment saved successfully" });
    }
  );
});

app.post("/onboarding/mentee", (req, res) => {
  const { nickname, position, job, major, kakao_id } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO userData (nickname, position,  job, major,kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?)`,
    [nickname, position, job, major, kakao_id, createdAt, editedAt],
    (error, results) => {
      if (error) {
        console.error("Error saving mentee data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res.status(200).json({ message: "Mentee data saved successfully" });
    }
  );
});

// 댓글 리스트 API
app.get("/comments", (req, res) => {
  res.status(200).json(comments);
});

// 좋아요 증가 API
app.post("/comment/:id/like", (req, res) => {
  const commentId = parseInt(req.params.id);

  const comment = comments.find((c) => c.id === commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  comment.likes += 1; // 좋아요 수 증가

  res.status(200).json({ message: "Like added", likes: comment.likes });
});

app.post("/mydata", (req, res) => {
  const { nickname, position, school, interest, want, level, profile } =
    req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  myData[nickname] = {
    nickname,
    position,
    school,
    interest,
    want,
    level,
    profile,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

app.post("/mydata", (req, res) => {
  const { nickname, position, school, interest, want, level, profile } =
    req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  myData[nickname] = {
    nickname,
    position,
    school,
    interest,
    want,
    level,
    profile,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

// Save the user data to the server using insta as the key
app.post("/register/data", (req, res) => {
  const { mbpbu } = req.body; // Add insta to retrieve the associated user
  const {
    mbti = null,
    birth = null,
    phone_num = null,
    bank_id = null,
  } = req.body; // Set default values to null if not provided

  if (!insta) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  if (!userData[insta]) {
    return res.status(404).json({ message: "User not found" });
  }

  // Save the data associated with the insta handle
  userDataAdded[insta] = {
    mbti,
    birth,
    phone_num,
    bank_id,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

// GET API for onboarding mentor
app.get("/onboarding/mentor/:nickname", (req, res) => {
  const nickname = req.params.nickname;
  const mentorData = userData[nickname];

  if (!mentorData) {
    return res.status(404).json({ message: "Mentor data not found" });
  }

  res.status(200).json(mentorData);
});

// GET API for onboarding mentee
app.get("/onboarding/mentee/:nickname", (req, res) => {
  const nickname = req.params.nickname;
  const menteeData = userData[nickname];

  if (!menteeData) {
    return res.status(404).json({ message: "Mentee data not found" });
  }

  res.status(200).json(menteeData);
});

// GET API for all classes
app.get("/classes", (req, res) => {
  res.status(200).json(classes);
});

app.get("/classes/myClass", (req, res) => {
  if (myClass) {
    res.status(200).json(myClass);
  } else {
    res.status(404).json({ error: "Class not found" });
  }
});

// GET API for a single class by ID
app.get("/class/:id", (req, res) => {
  const classId = parseInt(req.params.id);
  const singleClass = classes.find((c) => c.id === classId);

  if (!singleClass) {
    return res.status(404).json({ message: "Class not found" });
  }

  res.status(200).json(singleClass);
});

// GET API for letters
app.get("/letters", (req, res) => {
  res.status(200).json(letters);
});

// GET API for a single letter by ID
app.get("/letter/:id", (req, res) => {
  const letterId = parseInt(req.params.id);
  const singleLetter = letters.find((l) => l.id === letterId);

  if (!singleLetter) {
    return res.status(404).json({ message: "Letter not found" });
  }

  res.status(200).json(singleLetter);
});

// GET API for a single comment by ID
app.get("/comment/:id", (req, res) => {
  const commentId = parseInt(req.params.id);
  const singleComment = comments.find((c) => c.id === commentId);

  if (!singleComment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  res.status(200).json(singleComment);
});

// GET API for all comments
app.get("/comments", (req, res) => {
  res.status(200).json(comments);
});

// GET API for user data
app.get("/mydata/:nickname", (req, res) => {
  const nickname = req.params.nickname;
  const myUserData = userData[nickname];

  if (!myUserData) {
    return res.status(404).json({ message: "User data not found" });
  }

  res.status(200).json(myUserData);
});

// GET API for mentor data (only where position is "멘토")
/*
app.get("/mentor/data", (req, res) => {
  // userData 객체의 값들을 배열로 변환하고, 그 중 position이 "멘토"인 데이터만 필터링
  const mentors = Object.values(userData).filter(
    (user) => user.position === "멘토"
  );

  res.status(200).json({ mentors }); // 필터링된 멘토 데이터만 응답으로 전송
});

// GET API for mentor data (only where position is "멘토")
app.get("/mentee/data", (req, res) => {
  // userData 객체의 값들을 배열로 변환하고, 그 중 position이 "멘토"인 데이터만 필터링
  const mentees = Object.values(userData).filter(
    (user) => user.position === "멘티"
  );

  res.status(200).json({ mentors }); // 필터링된 멘토 데이터만 응답으로 전송
});
*/
app.listen(5002, () => {
  console.log("Server running on port 5002");
});
