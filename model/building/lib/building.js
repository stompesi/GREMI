//코인스택쨔응
var CoinStack = require('coinstack-sdk-js');

// mysql
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql!!",
    database: "gremi"
});

// fileSystem
var fs = require('fs');

// 암복호화
var crypto = require('crypto');

//집 등록register
exports.register = function(req, res) {
    var data = req.body;
    var email = req.signedCookies.email;

    // console.log(data)
    // console.log(email)

    var readSql = 'SELECT * FROM buildings where country="' + data.country + '" AND state="' + data.state + '" AND city="' + data.city + '" AND street="' + data.street + '" AND NOT status=2';

    con.query(readSql, function(err, result, field) {
        if (err) {
            response = makeResponse(0, "계약이 끝나지 않은 중복된 주소의 건물입니다.", {});
            res.json(response);
            throw err;
        }
        if (result.length == 0) {
            var insertSql = "INSERT INTO buildings (lat, lng, country, state, city, street, price, email, contract_address) VALUES (?,?,?,?,?,?,?,?,?)";

            var values = [data.lat, data.lng, data.country, data.state, data.city, data.street, data.price, email, data.contract_address];

            con.query(insertSql, values, function(err2, result2, field2) {
                if (err2) {
                    response = makeResponse(0, "실패", {});
                    res.json(response);
                    throw err2;
                } else {
                    if (req.files.images) {
                        var buildingImages = req.files.images;
                        var buildingId = result2.insertId;
                        var imageDirPath = './public/building_images/' + buildingId;

                        if (!fs.existsSync(imageDirPath)) {
                            fs.mkdirSync(imageDirPath);
                        }


                        for (var i = 0; i < buildingImages.length; i++) {
                            var imagePath = imageDirPath + '/' + buildingImages[i].name;

                            (function(i, imagePath) {
                                buildingImages[i].mv(imagePath, function(err) {
                                    if (err) {
                                        response = makeResponse(0, "실패", {});
                                        res.json(response);
                                        return;
                                    } else {
                                        var insertSql = "INSERT INTO building_images (b_id, path) VALUES (?,?)";
                                        var values = [buildingId, imagePath.replace(/^\.\/public/, "")];
                                        con.query(insertSql, values, function(err3, result3, field3) {
                                            if (err3) {
                                                response = makeResponse(0, "실패", {});
                                                res.json(response);
                                                return;
                                            }
                                        });
                                    }
                                });
                            })(i, imagePath);
                        }
                    }
                    response = makeResponse(1, '', {});
                    res.json(response);
                }
            });
        } else {
            response = makeResponse(0, "실패", {});
            res.json(response);
        }
    });
}


//집정보 수정
exports.edit = function(req, res) {

    var lat = req.body.lat;
    var lng = req.body.lng;
    var country = req.body.country;
    var state = req.body.state;
    var city = req.body.city;
    var street = req.body.street;
    var price = req.body.price;

    var selectBuildingId = req.params.building_id;

    var editSql = 'UPDATE buildings SET lat="' + lat +
        '", lng="' + lng +
        '", country="' + country +
        '", state="' + state +
        '", city="' + city +
        '", street="' + street +
        '", price="' + price +
        '" where b_id=' + selectBuildingId;
    con.query(editSql, function(err, result, field) {
        if (err) {
            throw err;
            response = makeResponse(0, "수정에 실패했습니다", {});
        } else {
            console.log("수정 성공");
            response = makeResponse(1, "", {});
            res.json(response);
        }
    });
}


//집상세정보
exports.detailBuilding = function(req, res) {
    var selectBuildingId = req.params.building_id;
    var readSql =
        " SELECT * FROM buildings where b_id=" + selectBuildingId;
    con.query(readSql, function(err, result, field) {
        if (err) throw err;

        var imageSql =
            " SELECT * FROM building_images where b_id=" + selectBuildingId;
        con.query(imageSql, function(err2, result2, field2) {

            var imageArr = [];

            for (var i = 0; i < result2.length; i++) {
                imageArr[i] = result2[i].path;
            }
            res.render('detailBuilding.html', { "building": result[0], "images": imageArr });

        });
    });
}


//집등록 취소
exports.delete = function(req, res) {
    var email = req.signedCookies.email;
    // console.log(req.body);
    // console.log(email);
}



//범위 내의 집 검색
exports.search = function(req, res) {

    // var buildingList = [];
    // var building = [];

    // var readSql = " SELECT * FROM buildings where b_id=" + 19;
    // con.query(readSql, function(err2, buildingInfo, field2) {
    //     building.push(buildingInfo[0]) // 빌딩 정보를 빌딩에 추가
    // });

    // var imageSql = " SELECT path FROM building_images where b_id=" + 19;
    // con.query(imageSql, function(err2, imagePathList, field2) {

    //     var imageArr = [];
    //     for (var i = 0; i < imagePathList.length; i++) {
    //         imageArr[i] = imagePathList[i].path;
    //     }

    //     building.push(imageArr) // 빌딩이미지path를 빌딩에 추가

    //     // console.log(list);
    //     buildingList.push(building)
    //         // console.log(building);
    //         // console.log(buildingList[0])
    // });


    var buildingList = [];
    var building = [];

    var ne_x = req.query.northeast_lng;
    var ne_y = req.query.northeast_lat;
    var sw_x = req.query.southwest_lng;
    var sw_y = req.query.southwest_lat;
    var readSql = "select * from buildings where " + sw_x + "<= lng and lng <= " + ne_x + " and " + sw_y + "<= lat and lat <= " + ne_y + " AND status = 1";

    con.query(readSql, function(err, buildingInfo, field) {
        if (err) {
            throw err;
            response = makeResponse(0, "검색에 실패했습니다.", {});
            res.json(response);
        } else {
            console.log("test");
            for (var i = 0; i < buildingInfo.length; i++) {
                building.push(buildingInfo[i]) // 빌딩 정보를 빌딩에 추가
                var imageSql = " SELECT path FROM building_images where b_id=" + 20;
                con.query(imageSql, function(err2, buildingInfo, field) {
                    if (err2) {
                        console.log("에러낫어")
                        throw err2;
                        response = makeResponse(0, "이미지 정보를 가져오는데 실패하였습니다.", {});
                        res.json(response);
                    } else {
                        console.log("성공!!!!!!!!")
                    }
                });
            }

            //만든거 합쳐서 넘김
            // response = makeResponse(1, "", { 'buildingInfos': result });
            // res.json(response);
        }

    });
}




exports.getListOfUnconfirmedBuilding = function(req, res) {
    var sql = "select * from buildings where status = 0";

    con.query(sql, function(err, result, field) {
        if (err) throw err;
        res.render('adminBuilding.html', { "buildings": result });
        console.log(result.length);
    });
}

exports.confirmBuilding = function(req, res) {
    var sql = "UPDATE buildings SET status = 1 WHERE b_id = " + req.body.b_id;

    console.log(req.body);
    console.log(sql);

    con.query(sql, function(err, result, field) {
        if (err) {
            response = makeResponse(0, "컨펌 실패", {});
            res.json(response);
            return;
        }
        response = makeResponse(1, "", {});
        res.json(response);
    });
}

function makeResponse(status, errorMessage, data) {
    var response = {
        status: status,
        error_message: errorMessage
    };

    for (var key in data) {
        response[key] = data[key];
    }
    return response;
}