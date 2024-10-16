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

app.post("/api/login", async (req, res) => {
  const loginData = req.body;
  const { accessToken, refreshToken } = loginData.data;
  const createdAt = loginData.data.createdAt || new Date(); // createdAt 값이 없으면 현재 시간 사용
  const editedAt = new Date(); // 요청 시점에 업데이트된 시간

  try {
    // Kakao 로그인 데이터에서 필요한 정보 추출
    const kakao_id = loginData.data.id;
    const nickname = loginData.data.name || "Unknown"; // name 필드가 nickname 역할
    const profile = loginData.data.profileImage || ""; // profileImage 필드
    const email = loginData.data.email || null; // studentId가 null이므로 email도 없을 수 있음

    // 사용자 정보가 존재하는지 확인
    if (!kakao_id) {
      return res.status(400).json({ message: "Kakao user data is missing" });
    }

    // 데이터베이스에 저장
    const query = `INSERT INTO kakaoData (nickname, profile, accessToken, refreshToken, kakao_id, createdAt, editedAt) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      nickname,
      profile,
      accessToken,
      refreshToken,
      kakao_id,
      createdAt,
      editedAt,
    ];

    pool.query(query, values, (error, results) => {
      if (error) {
        console.error("Error saving Kakao login data:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

      // 성공적으로 저장된 경우
      return res.status(200).json({
        message: "Kakao login data saved successfully",
        id: kakao_id,
      });
    });
  } catch (error) {
    console.error("Error processing Kakao login data:", error);
    return res.status(500).json({
      message: "Server error occurred",
      error: error.message,
    });
  }
});

app.post("/onboarding/mentor", (req, res) => {
  const { nickname, position, job, major, kakao_id } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO userData (nickname, position, job, major, kakao_id , createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nickname, position, job, major, kakao_id, createdAt, editedAt],
    (error, results) => {
      if (error) {
        console.error("Error saving mentor data:", error);
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
  const { nickname, position, school, interest, want, kakao_id } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO userData (nickname, position,  school, interest,want,kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nickname, position, school, interest, want, kakao_id, createdAt, editedAt],
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
  const { nickname, position, school, interest, want, kakao_id } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO userData (nickname, position,  school, interest,want,kakao_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nickname, position, school, interest, want, kakao_id, createdAt, editedAt],
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

    res.status(200).json(results);
  });
});

// Get class data by school
app.get("/class/open/:major", (req, res) => {
  const major = req.params;

  pool.query(
    `SELECT * FROM classData WHERE major = ? `,
    [major],
    (error, results) => {
      if (error) {
        console.error("Error retrieving mentor data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "class not found" });
      }

      res.status(200).json(results);
    }
  );
});

// Save the new class
app.post("/class/save", (req, res) => {
  const {
    nickname,
    title,
    num,
    date,
    map,
    content,
    name,
    major,
    kakao_id,
    status,
    mentee_id,
  } = req.body;

  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 editedAt으로 설정

  // Check if title already exists
  pool.query(
    `SELECT COUNT(*) as count FROM saveClassData WHERE title = ?`,
    [title],
    (error, results) => {
      if (error) {
        console.error("Error checking for existing title:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }

      // If title already exists, return 405 error
      if (results[0].count > 0) {
        return res.status(405).json({ message: "Title already exists" });
      }

      // If title does not exist, proceed with insertion
      pool.query(
        `INSERT INTO saveClassData (nickname, title, num, date, map, content, name, major, status, kakao_id, mentee_id, createdAt, editedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
          mentee_id,
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

          // Include the original data in the response
          res.status(200).json({
            message: "Class data saved successfully",
            result: {
              ...results,
              data: {
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
                mentee_id,
                createdAt,
                editedAt,
              },
            },
          });
        }
      );
    }
  );
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
    comment_id,
    kakao_id,
  } = req.body;

  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO letterData (major, type, star_num, comment_num, question, mentor_answer, title, author, isClick, kakao_id, comment_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      comment_id,
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

// Get comment data by letter_id
app.get("/comments/:letter_id", (req, res) => {
  const letter_id = req.params.letter_id;

  pool.query(
    `SELECT * FROM commentData WHERE letter_id = ?`,
    [letter_id],
    (error, results) => {
      if (error) {
        console.error("Error retrieving comment data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "comment not found" });
      }

      res.status(200).json(results);
    }
  );
});

// Update the isClick value in the database for a specific letter by id
app.patch("/comments/:letter_id", (req, res) => {
  const id = req.params.letter_id;
  const { comment_id } = req.body;

  // 데이터베이스에서 해당 id의 isClick 값 업데이트
  const updateQuery = `
    UPDATE letterData
    SET comment_id = CONCAT(comment_id, ?)
    WHERE id = ?;
  `;

  pool.query(updateQuery, [comment_id, id], (error, results) => {
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
      data: { id, comment_id },
    });
  });
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

    res.status(200).json(results);
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

app.patch("/classes/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updateStatusQuery = `
      UPDATE saveClassData
      SET status = ?
      WHERE id = ?
  `;

  const newStatus = status === "completed" ? "completed" : "pending";

  pool.query(updateStatusQuery, [newStatus, id], (error, results) => {
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
app.post("/comments", (req, res) => {
  const {
    kakao_id,
    userName,
    position,
    content,
    likes,
    replyCount,
    letter_id,
  } = req.body;
  const createdAt = new Date(); // 현재 시간을 createdAt으로 설정
  const editedAt = new Date(); // 현재 시간을 createdAt으로 설정

  pool.query(
    `INSERT INTO commentData (kakao_id, userName, position, content, likes,replyCount, letter_id, createdAt,editedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ? , ?)`,
    [
      kakao_id,
      userName,
      position,
      content,
      likes,
      replyCount,
      letter_id,
      createdAt,
      editedAt,
    ],
    (error, results) => {
      if (error) {
        console.error("Error saving mentee data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }
      res
        .status(200)
        .json({ message: "Comment saved successfully", result: res });
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

// Get mentor data by kakao_id
app.get("/classes/myClass/:mentee_id", (req, res) => {
  const mentee_id = req.params.mentee_id;

  pool.query(
    `SELECT * FROM saveClassData WHERE mentee_id = ? `,
    [mentee_id],
    (error, results) => {
      if (error) {
        console.error("Error retrieving class data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Class not found" });
      }

      res.status(200).json(results);
    }
  );
});

// Get mentor data by kakao_id
app.get("/classes/myClass/:mentor_id", (req, res) => {
  const mentor_id = req.params.mentor_id;

  pool.query(
    `SELECT * FROM ClassData WHERE kakao_id = ? `,
    [mentor_id],
    (error, results) => {
      if (error) {
        console.error("Error retrieving class data:", error);
        return res
          .status(500)
          .json({ message: "Internal server error", error: error.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Class not found" });
      }

      res.status(200).json(results);
    }
  );
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
