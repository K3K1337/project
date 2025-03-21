const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');

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

// 登录验证
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, row) => {
        if (err || !row) {
          return res.render('login', {
            error: 'Invalid credentials',
            username: req.body.username
          });
        }

        req.session.user = {
          id: row.id,
          username: row.username,
          data: {
            height: row.height,
            weight: row.weight,
            gender: row.gender,
            age: row.age
          }
        };

        res.redirect('/home');
      }
  );
});

// 登录验证中间件
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Home页面路由
app.get('/home', requireLogin, (req, res) => {
  const userData = req.session.userData;
  res.render('home', { user: req.session.user, userData });
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