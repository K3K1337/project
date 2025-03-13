const express = require('express');
const router = express.Router();
const db = require('../database');

// 处理注册请求
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // 检查用户名是否已存在
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.render('login', { error: 'Database error' });
        }

        if (row) {
            return res.render('login', { error: 'Username already exists' });
        }

        // 插入新用户
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function (err) {
            if (err) {
                console.error(err.message);
                return res.render('login', { error: 'Database error' });
            }
            res.redirect('/login');
        });
    });
});

// 处理登录请求
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 查询用户信息
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.render('login', { error: 'Database error' });
        }

        if (!row) {
            return res.render('login', { error: 'Invalid credentials' });
        }

        req.session.user = username;
        res.redirect('/home');
    });
});

module.exports = router;