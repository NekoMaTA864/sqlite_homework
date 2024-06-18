const express = require('express'); // 引入框架
const bodyParser = require('body-parser'); // 用於解析HTTP請求中的請求體
const sqlite3 = require('sqlite3').verbose(); // 用於提供詳細的資料庫操作日誌
const path = require('path'); // 用於處理和轉換文件路徑
const session = require('express-session'); // 用於管理用戶session

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false })); // 使用body-parser中介軟體來解析URL編碼的表單資料
app.use(express.static(path.join(__dirname, 'views'))); // 設定靜態文件目錄為views資料夾

// 設置Session
app.use(session({
  secret: 'your_secret_key', // 設置session的密鑰
  resave: false, // 每次請求都重新儲存session，即使沒有改變
  saveUninitialized: true, // 強制將未初始化的session存儲
}));


const dbPath = path.join(__dirname, 'restaurant.db'); // 設定資料庫文件路徑
const db = new sqlite3.Database(dbPath); // 連接SQLite資料庫


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;  // 從請求的表單中取得帳號和密碼
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], (err) => {
    if (err) {
      return res.send('用戶名已存在！');
    }
    res.redirect('/');
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body; // 從請求的表單中取得帳號和密碼
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (err) {
      return res.send('錯誤！');
    }
    if (!row) {
      return res.send('用戶名或密碼錯誤！'); // 如果找不到相符的使用者，回饋錯誤訊息
    }
    req.session.userId = row.id; // 如果驗證成功，將使用者ID存儲在session中
    console.log('User logged in successfully:', { username });
    res.redirect('/mvp_booking');
  });
});

app.get('/mvp_booking', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mvp_booking.html'));
});

// 跳轉至mvp_booking.html文件，但需要經過驗證
app.post('/submit_booking', checkAuthenticated, (req, res) => {
  const newBooking = req.body; // 從請求中取得新的預訂資料
  const query = `INSERT INTO bookings
                (customer_id, customer_phone, reservation_date, people_count, soup1, soup2, soup3, appetizers_1, appetizers_2, main_course1, main_course2, main_course3, deluxe_1, steak_1, dessert_1, dessert_2, icecream_plus, drink_1, drink_2, drink_3)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    req.session.userId,
    newBooking.customer_phone,
    newBooking.reservation_date,
    newBooking.people_count,
    newBooking.soup1,
    newBooking.soup2,
    newBooking.soup3,
    newBooking.appetizers_1,
    newBooking.appetizers_2,
    newBooking.main_course1,
    newBooking.main_course2,
    newBooking.main_course3,
    newBooking.deluxe_1,
    newBooking.steak_1,
    newBooking.dessert_1,
    newBooking.dessert_2,
    newBooking.icecream_plus,
    newBooking.drink_1,
    newBooking.drink_2,
    newBooking.drink_3
  ];

  db.run(query, values, function(err) {
    if (err) {
      console.error('Error adding booking to SQLite:', err.message);
      res.status(500).json({ success: false, message: 'Internal server error.' }); //插入失敗傳送錯誤訊息
    } else {
      res.redirect('/list'); // 插入成功則跳轉至list頁面
    }
  });
});

// 跳轉至mvp_list.html文件，但需要經過驗證
app.get('/list', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'mvp_list.html'));
});

app.get('/api/bookings', checkAuthenticated, (req, res) => {
  const sql = 'SELECT * FROM bookings WHERE customer_id = ?';
  db.all(sql, [req.session.userId], (err, rows) => {
    if (err) {
      res.status(400).json({ "error": err.message });
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    });
  });
});

// 用於檢查用戶是否已認證
function checkAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next(); // 如果用戶已認證，則繼續執行下一個中介軟體或路由
  }
  res.redirect('/'); // 如果用戶未認證，重定向到list頁面
}

app.listen(port, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});

process.on('exit', () => {
  db.close();
  console.log('SQLite connection closed');
});
