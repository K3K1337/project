const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if(username === 'admin' && password === 'password') {
        req.session.user = username;
        return res.redirect('/home');
    }
    res.render('login', { error: 'Invalid credentials' });
});

module.exports = router;
