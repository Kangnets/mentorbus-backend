const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let userData = {}; // Store user data by insta (Instagram handle) as key

let comments = []; // 댓글 저장소
let commentId = 0; // 댓글 인덱스 넘버

let letters = []; // 글 저장소
let letterId = 0; // 글 인덱스 넘버

let classes = []; // 수업 저장소
let classId = 0; // 수업 인덱스 넘버

//온보딩 멘토
app.post("/onboarding/mentor", (req, res) => {
  const { nickname, position, job, major } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  userData[nickname] = {
    nickname,
    position,
    job,
    major,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

//온보딩 멘티
app.post("/onboarding/mentee", (req, res) => {
  const { nickname, position, school, interest, want } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  userData[nickname] = {
    nickname,
    position,
    school,
    interest,
    want,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

// 수업 열기
app.post("/class/open", (req, res) => {
  const { nickname, title, num, date, map, content } = req.body;

  // 새로운 수업 생성
  const newClass = {
    id: classId++, // 댓글 인덱스 번호
    content: content, // 댓글 내용
    title: title, // 좋아요 수
    num: num, // 댓글 수 (대댓글)
    nickname: nickname,
    date: date,
    map: map,
    createdAt: new Date(), // 댓글 작성 시간
  };

  // 댓글 저장
  classes.push(newClass);

  // 전체 newClass 객체를 응답으로 보냄
  res
    .status(200)
    .json({ message: "Comment saved successfully", comment: newClass });
});

//수업 찾기
app.post("/class/search", (req, res) => {
  const { nickname, position, school, interest, want } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  userData[nickname] = {
    nickname,
    position,
    school,
    interest,
    want,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

//즐겨찾기
app.post("/letter/favorite", (req, res) => {
  const { nickname, position, school, interest, want } = req.body;

  if (!nickname) {
    return res.status(400).json({ message: "Insta handle is required" });
  }

  // Save the data associated with the insta handle
  userData[nickname] = {
    nickname,
    position,
    school,
    interest,
    want,
  };

  res.status(200).json({ message: "Data saved successfully" });
});

//글
app.post("/letters", (req, res) => {
  const { nickname, position, school, interest, want, content } = req.body;

  if (!nickname || !content) {
    return res
      .status(400)
      .json({ message: "Nickname and content are required" });
  }

  // 새로운 댓글 생성
  const newLetter = {
    id: letterId++, // 댓글 인덱스 번호
    content, // 댓글 내용
    likes: 0, // 좋아요 수
    replyCount: 0, // 댓글 수 (대댓글)
    author: {
      nickname,
      position,
      school,
      interest,
      want,
    },
    createdAt: new Date(), // 댓글 작성 시간
  };

  // 댓글 저장
  letters.push(newLetter);

  res
    .status(200)
    .json({ message: "Comment saved successfully", comment: newLetter });
});

// 댓글 API
app.post("/comment", (req, res) => {
  const { nickname, position, school, interest, want, content } = req.body;

  if (!nickname || !content) {
    return res
      .status(400)
      .json({ message: "Nickname and content are required" });
  }

  // 새로운 댓글 생성
  const newComment = {
    id: commentId++, // 댓글 인덱스 번호
    content, // 댓글 내용
    likes: 0, // 좋아요 수
    replyCount: 0, // 댓글 수 (대댓글)
    author: {
      nickname,
      position,
      school,
      interest,
      want,
    },
    createdAt: new Date(), // 댓글 작성 시간
  };

  // 댓글 저장
  comments.push(newComment);

  res
    .status(200)
    .json({ message: "Comment saved successfully", comment: newComment });
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
app.listen(5002, () => {
  console.log("Server running on port 5002");
});
