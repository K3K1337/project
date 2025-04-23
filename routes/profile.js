const express = require('express');
const router = express.Router();
const db = require('../database');


router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }


    db.get(
        'SELECT * FROM users WHERE id = ?',
        [req.session.user.id],
        (err, row) => {
            if (err) {
                console.error('数据库查询错误:', err);
                return res.render('profile', {
                    error: '无法获取用户数据',
                    userData: null
                });
            }

            if (!row) {
                return res.redirect('/logout');
            }

            res.render('profile', {
                error: null,
                userData: {
                    height: row.height,
                    weight: row.weight,
                    gender: row.gender,
                    age: row.age
                }
            });
        }
    );
});

router.post('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { height, weight, gender, age } = req.body;
    const userId = req.session.user.id;


    const errors = [];
    const parsedData = {};

    try {

        parsedData.height = parseFloat(height);
        parsedData.weight = parseFloat(weight);
        parsedData.age = parseInt(age);
        parsedData.gender = gender || null;


        if (isNaN(parsedData.height))errors.push("身高必须为数字");
        if (parsedData.height < 100 || parsedData.height > 250) errors.push("身高需在100-250cm之间");
        if (isNaN(parsedData.weight)) errors.push("体重必须为数字");
        if (parsedData.weight < 30 || parsedData.weight > 300) errors.push("体重需在30-300kg之间");
        if (isNaN(parsedData.age)) errors.push("年龄必须为数字");
        if (parsedData.age < 1 || parsedData.age > 120) errors.push("年龄需在1-120岁之间");

    } catch (e) {
        errors.push("数据格式错误");
    }

    if (errors.length > 0) {
        return res.render('profile', {
            error: errors.join("<br>"),
            userData: { height, weight, gender, age }
        });
    }


    db.serialize(() => {
        db.run('BEGIN TRANSACTION');


        db.get(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            (err, user) => {
                if (err || !user) {
                    db.run('ROLLBACK');
                    return res.render('profile', {
                        error: '用户不存在',
                        userData: req.body
                    });
                }


                db.run(
                    `UPDATE users SET
                        height = ?,
                        weight = ?,
                        gender = ?,
                        age = ?
                    WHERE id = ?`,
                    [
                        parsedData.height,
                        parsedData.weight,
                        parsedData.gender,
                        parsedData.age,
                        userId
                    ],
                    function(updateErr) {
                        if (updateErr) {
                            db.run('ROLLBACK');
                            console.error('更新错误:', updateErr);
                            return res.render('profile', {
                                error: '数据库更新失败',
                                userData: req.body
                            });
                        }


                        if (this.changes === 0) {
                            db.run('ROLLBACK');
                            return res.render('profile', {
                                error: '数据未变更',
                                userData: req.body
                            });
                        }


                        db.run('COMMIT');
                        db.get(
                            'SELECT * FROM users WHERE id = ?',
                            [userId],
                            (err, updatedUser) => {
                                if (err || !updatedUser) {
                                    console.error('数据获取失败:', err);
                                    return res.render('profile', {
                                        error: '无法获取更新后的数据',
                                        userData: req.body
                                    });
                                }


                                req.session.user.data = {
                                    height: updatedUser.height,
                                    weight: updatedUser.weight,
                                    gender: updatedUser.gender,
                                    age: updatedUser.age
                                };

                                res.redirect('/home');
                            }
                        );
                    }
                );
            }
        );
    });
});

module.exports = router;