// fileSystem
var fs = require('fs');

// 사용자 정의 모델
var userdb = require('./model/user');
var building = require('./model/building');

// express router
var express = require('express'),
path = require("path"),
app = express(),
fileUpload = require('express-fileupload');

app.use(fileUpload());

//static폴더
app.use(express.static(path.join(__dirname, "/public")))

//ejs 렌더링
app.engine('html', require('ejs').renderFile);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//body-parser
var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

var cookie = require('cookie-parser');
app.use(cookie('!@#%%@#@'));


// --------------------------------------------- post,delete ------------------------------------------------ //

//회원가입
app.post('/user_register', function(req, res) {
    userdb.register(req, res);
});

//로그인
app.post('/login', function(req, res) {
    userdb.login(req, res);
});

//집등록
app.post('/building', function(req, res) {
    building.register(req, res);
});


//집사기 
// 잠시 보류 ^^
app.post('/building/buy/:building_id', function(req, res) {
    console.log(req.params.building_id);
    console.log(req.body.price);
});

//집정보 수정
app.post('/building/:building_id', function(req, res) {
    building.edit(req, res);
});


app.post('/admin/building/confirm', function(req, res) {
    building.confirmBuilding(req, res);
});

app.post('/investment', function(req, res) {
    building.investment(req, res);
});


// ------------------------------------------------------- get ------------------------------------------------ //



//메인
app.get('/', function(req, res) {
    if (req.signedCookies.email === undefined) {
        res.render('app.html');
    } else {
        res.redirect('/building');
    }
});

//프로필
app.get('/profile', userdb.isLogined, function(req, res) {
    userdb.getProfile(req, res);
});


//집
app.get('/building', userdb.isLogined, function(req, res) {
    res.render('building.html');
});



//집상세정보
app.get('/building/:building_id', function(req, res) {
    building.detailBuilding(req, res);
})

//집등록 취소
app.delete('/building/delete/:building_id', function(req, res) {
    building.delete(req, res)
})

//여행가기
app.get('/traveling', function(req, res) {
    if (req.signedCookies.email === undefined) {
        res.render('app.html');
    } else {
        res.render('traveling.html');
    }
});

//로그아웃 
app.get('/logout', function(req, res) {
    res.clearCookie("email");
    res.redirect('/');
});


app.get('/buildingSearch', function(req, res) {
    building.search(req, res)
});

app.get('/admin/building', function(req, res) {
    building.getListOfUnconfirmedBuilding(req, res)
});


app.listen(3000, function() {
    console.log("Server listening on http://localhost:3000");
})