const express = require("express");
const cors = require('cors')
const app = express();
const port = 3001;
const path = require("path");
const multer = require("multer");

const mysql = require('mysql');
const fs = require("fs") // 파일을 읽어오도록 해줌
app.use(express.static("public"));
const dbinfo = fs.readFileSync('./database.json');
//받아온 json데이터를 객체형태로 변경 JSON.parse
const conf = JSON.parse(dbinfo)






const connection = mysql.createConnection({
    host:conf.host,
    user:conf.user,
    password:conf.password,
    port:conf.port,
    database:conf.database
})

app.use(express.json());
app.use(cors());

// // aws config 파일 읽기
// aws.config.loadFromPath('s3.json');

// // s3 객체 생성
// const s3 = new aws.S3();

// // multer 에 대한 설정값
// const awsUpload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: 'bevelog-bucket', // 객체를 업로드할 버킷 이름
//     acl: 'public-read', // Access control for the file
//     key: function (req, file, cb) { // 객체의 키로 고유한 식별자 이기 때문에 겹치면 안됨
//       cb(null, Math.floor(Math.random() * 1000).toString() + Date.now() + '.' + file.originalname.split('.').pop());
//     }
//   }),
// });


//이미지 저장
const storage = multer.diskStorage({
    destination: "./public/img/",
    filename: function(req, file, cb) {
      const newFileName = file.originalname.normalize('NFKC');
      cb(null,newFileName);
    }
  });
//파일 사이즈 지정
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }
  });

// //받아서 보내줌
app.post("/upload", upload.single("img"), function(req, res, next) {
  console.log(`${req.file.destination}${req.file.filename}`)  
  // console.log(req.file.filename);
    // res.send(req.file.filename);
    })

//회원정보 저장
app.post("/addjoin", async (req,res) => {
    // console.log(req.body)
    const a_phone = `${req.body.a_p1} - ${req.body.a_p2} - ${req.body.a_p3}`
    const a_add = `${req.body.a_add1} ${req.body.a_add2}`
    // console.log(a_phone)
    // console.log(a_add)
    const {a_id, a_pw, a_name} = req.body
    connection.query(
        "insert into member(`id`, `pw`, `name`,`phone`, `add`) values (?,?,?,?,?)",
        [a_id, a_pw, a_name, a_phone, a_add],
        (err,rows,fields)=>{
            console.log(err)
            res.send("등록되었습니다.")
        })
        
})


//숙소 등록
app.post("/addroom", async (req, res) => {
    const {rname,minp, maxp, price, soffer, amenity, badtype, radd, sns, info} = req.body;
    connection.query(
        "INSERT INTO room(`rname`, `minp`, `maxp`, `price`, `soffer`, `amenity`, `badtype`, `radd`, `sns`, `info`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [rname,minp, maxp, price, soffer, amenity, badtype, radd, sns, info],
        (err,rows,fields)=>{
            // console.log(err)
        }
    )
})

//서버실행
app.listen(port, () => {
    console.log("서버 동작 중")
})
