const express = require("express");
const cors = require('cors')
const app = express();
const port = 3001;
const path = require("path");
const multer = require("multer");

const mysql = require('mysql');
const fs = require("fs") // 파일을 읽어오도록 해줌
app.use(express.static("public")); //public이라는 폴더에 있는 파일에 접근 할 수 있도록 설정
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
    destination: function(req,res,cb){
        cb(null, 'public/img/')
    },
    filename: function(req, file, cb) {
      cb(null,file.originalname);
    }
  });
//파일 사이즈 지정
const upload = multer({
    storage: storage,
    limits: { fileSize: 30000000 }
  });

// //받아서 보내줌
app.post("/upload", upload.single("image"), function(req, res, next) {
    const file = req.file;
    console.log(file);
    res.send({
        // imgurl:"http://localhost3001/"+file.destination+file.filename
        imgurl:file.filename
    })
//   console.log(`${req.file.destination}${req.file.filename}`)  
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
            console.log(rows)
            res.send("등록되었습니다.")
        })
        
})


//숙소 등록
app.post("/addroom", async (req, res) => {
    const {rname,minp, maxp, price, soffer, amenity, badtype, radd, sns, info, imgurl} = req.body;
    connection.query(
        "INSERT INTO room(`rname`, `minp`, `maxp`, `price`, `soffer`, `amenity`, `badtype`, `radd`, `sns`, `info`, `imgurl`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [rname,minp, maxp, price, soffer, amenity, badtype, radd, sns, info, imgurl],
        (err,rows,fields)=>{
            console.log(rows)
            res.send("새로운 숙소 등록 완료")
        }
    )
})

//숙소 검색

//전체 출력하기
app.get("/search", async (req,res)=>{
    console.log(req.body);
    connection.query(
        "select * from room",(err,rows,fields)=>{
            console.log(rows);
            res.send(rows);
        }
    )
})

//검색어로 검색결과만 출력하기
app.get("/searchKeyword/:keyword", async (req,res)=>{
    console.log(req)
    const params = req.params
    const {keyword} = params
    console.log(keyword)
    connection.query(
        `select * from room where sns like '%${keyword}%'`,(err,rows,fields)=>{
            console.log(rows);
            console.log(err);
            res.send(rows); //결과 보내주기~~
        }

    )
})

//숙소 상세페이지 출력하기
app.get("/detail/:id", async (req,res)=>{
    const params = req.params
    console.log(req);
    console.log(params)
    const {id} = params
    console.log(id)
    connection.query(
        `select * from room where no=${id}`,(err,rows,fields)=>{
            console.log(rows);
            res.send(rows);
        })})

// 로그인용 id비번확인
app.post("/member", async (req,res)=>{
    console.log(req)
    const {id, pw} = req.body
    // console.log(id,pw)
    connection.query(
        `select id,pw from member where id = '${id}'`,(err,rows,fields)=>{
            console.log(rows);
            console.log(err);
            res.send(rows[0]); //결과 보내주기~~
        }

    )
})

// 예약 합니다.
    app.post("/addbooking", async (req, res) => {
    const {rname,radd,rsdate,edate,rbooker,rid,rphone,price,imgurl} = req.body;
    console.log(req.body)
    connection.query(
        "INSERT INTO booking(`rname`, `radd`, `rsdate`, `edate`, `rbooker`, `rid`, `rphone`, `rprice`, `imgurl`) VALUES (?,?,?,?,?,?,?,?,?)",
        [rname,radd,rsdate,edate,rbooker,rid,rphone,String(price),imgurl],
        (err,rows,fields)=>{
            console.log(rows)
            console.log(err)
            res.send("새로운 숙소 등록 완료")
        }
    )
})

// 예약내역가져오기
app.get("/booking/:id", async (req,res)=>{
    const params = req.params
    const {id} = params
    console.log(id)
    connection.query(
        `select * from booking where rid='${id}'`,(err,rows,fields)=>{
            res.send(rows);
        })})


//서버실행
app.listen(port, () => {
    console.log("서버 동작 중")
})
