const express = require('express');
const router = express.Router();
const db = require('../database');

// 处理分析页面的 GET 请求
router.get('/analysis', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const userId = req.session.user.id;
    // 查询用户数据
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.render('error', { error: 'Database error' });
        }
        if (!row) {
            return res.render('error', { error: 'User data not found' });
        }
        // 计算 BMI
        const weight = parseFloat(row.weight);
        const height = parseFloat(row.height) / 100; // 转换为米
        const bmi = (weight / (height * height)).toFixed(2);

        // 计算每日热量代谢（默认正常运动）
        let dailyCalorie;
        if (row.gender === 'male') {
            dailyCalorie = (88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * row.age)) * 1.375;
        } else {
            dailyCalorie = (447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * row.age)) * 1.375;
        }
        dailyCalorie = dailyCalorie.toFixed(2);

        res.render('analysis', { userData: row, bmi, dailyCalorie });
    });
});

module.exports = router;