const express = require('express');

const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const mysql = require('mysql');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '835081',
    database: 'users'
});

connection.connect(function (err) {
    if (err) {
        console.error('error connection: ' + err.stack);
    }
    console.log('connected as id ' + connection.threadId);
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));

});

app.get('/userlist', (req, res) => {
    let sql = 'select * from user';
    connection.query(sql, (err, result) => {
        if (err) {
            console.log('select error: ' + err.message);
        }
        // console.log(result);
        res.send(result);

    })
});
//更新用户列表和数据库
/*app.post('/updateuserlist/:users',(req,res)=>{
    var userList = req.params;
    console.log(userList);
})*/
//添加用户
app.post('/adduser', (req, res) => {
    let user = req.body;
    console.log(user);
    let sql = 'insert into user (id,name, age, email)values(?,?,?,?)';
    let params = [user.id, user.name, user.age, user.email];
    connection.query(sql, params, function (err, rs) {
        if (err) {
            let errMsg = err.message;
            console.log('insert error: ' + err.message);
            if(errMsg.includes('ER_DUP_ENTRY')){
                console.log('用户名重复插入！');
                res.send({
                    msg: '用户名重复插入！'
                });
                return;
            }
        }
        res.send({
            msg: ''
        });
    })

})
app.delete('/deleteuser/:delJson', (req, res) => {

    let sql = 'delete from user where id in (';
    let params = JSON.parse(req.params['delJson']);
    console.log(params.length);
    //为sql语句赋值
    for (let i = 0; i < params.length; i++) {
        if (i !== params.length - 1) {
            sql += params[i] + ',';
        } else {
            sql += params[i] + ');'
        }
    }
    console.log(sql);
    connection.query(sql, function (err, rs) {
        if (err) {
            console.log('delete error: ' + err.message);
            res.status(400).json({
                msg: err.stack
            });
            return;
        }
        res.status(200).json({
            msg: '用户删除成功！'
        });

    })

});

app.listen(8080, () => {
    console.log('Server is working...');
})



