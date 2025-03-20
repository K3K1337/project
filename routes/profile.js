const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('profile', { error: null });
});

router.post('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const { height, weight, gender, age } = req.body;
    const username = req.session.user;

    db.run('UPDATE users SET height = ?, weight = ?, gender = ?, age = ? WHERE username = ?', [height, weight, gender, age, username], (err) => {
        if (err) {
            console.error(err.message);
            return res.render('profile', { error: 'Database error' });
        }

        // 更新会话中的用户数据
        req.session.userData = {
            height,
            weight,
            gender,
            age
        };
       res.redirect('/home');
    });
});

module.exports = router;