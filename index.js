const express = require("express");
const cors = require('cors')
const app = express();
const port = process.env.PORT || 3001;
const mysql = require('mysql');
const fs = require("fs") // 파일을 읽어오도록 해줌

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

//회원정보 저장
app.post("/addjoin", async (req,res) => {
    console.log(req.body)
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
            console.log(err)
        }

    )
})

//서버실행
app.listen(port, () => {
    console.log("서버 동작 중")
})
