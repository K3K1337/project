const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

const analysisRouter = require('./routes/analysis');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const chatboxRouter = require('./routes/chatbox');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'your-secret-key', // 替换为你的密钥
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// 路由配置
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', analysisRouter);
app.use('/chatbox', chatboxRouter);

// 登录验证中间件
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Home页面路由
app.get('/home', requireLogin, (req, res) => {
  const healthTips = require('./healthTips');
  const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
  const userData = req.session.user ? req.session.user.data : null;
  res.render('home', { user: req.session.user, userData , healthTip: randomTip });
});

// 登出路由
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out.');
    }
    res.redirect('/login');
  });
});

app.use(function (req, res, next) {
  next(createError(404));
});


app.use(function (err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;