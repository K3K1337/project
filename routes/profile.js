const express = require('express');
const router = express.Router();
const db = require('../database');

// 获取个人资料页面
router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // 从数据库获取最新数据（使用ID查询）
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
                return res.redirect('/logout'); // 用户不存在则强制登出
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

// 处理资料更新（关键修改点）
router.post('/profile', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { height, weight, gender, age } = req.body;
    const userId = req.session.user.id; // 改用ID操作

    // 数据验证和转换
    const errors = [];
    const parsedData = {};

    try {
        // 强制类型转换
        parsedData.height = parseFloat(height);
        parsedData.weight = parseFloat(weight);
        parsedData.age = parseInt(age);
        parsedData.gender = gender || null;

        // 验证范围
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
            userData: { height, weight, gender, age } // 返回原始输入
        });
    }

    // 执行数据库更新（使用事务保证数据一致性）
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 1. 检查用户存在性
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

                // 2. 执行更新
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

                        // 3. 验证影响行数
                        if (this.changes === 0) {
                            db.run('ROLLBACK');
                            return res.render('profile', {
                                error: '数据未变更',
                                userData: req.body
                            });
                        }

                        // 4. 提交事务并获取最新数据
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

                                // 更新会话数据
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