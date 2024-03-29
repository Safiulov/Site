const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const port=3000;
const pool = new Pool({
user: 'postgres',
host: 'localhost',
database: 'postgres',
password: '1234',
port: 5432,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/index');
});

app.get('/register', (req, res) => {
  res.render('index2');
});

app.get('/login', (req, res) => {
  res.render('index');
});

app.post('/check-login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT "ФИО", "Почта" FROM "Стоянка"."Klients" WHERE "Логин" = $1 AND "Пароль" = $2', [username, password]);
    if (result.rows.length > 0) {
      res.json({ success: true, username: result.rows[0].ФИО, phoneNumber: result.rows[0].Почта });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

async function checkUsername(username) {
  try {
    const result = await pool.query('SELECT * FROM "Стоянка"."Klients" WHERE "Логин" = $1', [username]);
    if (result.rows.length > 0) {
      return { success: false, message: 'Такой логин уже существует' };
    } else {
      return { success: true };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Ошибка при проверке логина' };
  }
}

async function checkPassword(password) {
  try {
    const result = await pool.query('SELECT * FROM "Стоянка"."Klients" WHERE "Пароль" = $1', [password]);
    if (result.rows.length > 0) {
      return { success: false, message: 'Такой пароль уже существует' };
    } else {
      return { success: true };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Ошибка при проверке пароля' };
  }
}

app.post('/register', async (req, res) => {
  const { Логин, Пароль, ФИО, Дата_рождения, Почта, Марка, Цвет, Тип, Госномер, Год } = req.body;

  const usernameCheck = await checkUsername(Логин);
  if (!usernameCheck.success) {
    return res.json(usernameCheck);
  }

  const passwordCheck = await checkPassword(Пароль);
  if (!passwordCheck.success) {
    return res.json(passwordCheck);
  }

  try {
   
    await pool.query(
      'WITH new_auto AS (INSERT INTO "Стоянка"."Auto"( "Марка", "Цвет", "Тип", "Госномер", "Год") VALUES ( $1, $2, $3, $4,$5) RETURNING *), new_klients AS (INSERT INTO "Стоянка"."Klients"( "Логин", "Пароль","ФИО", "Дата_рождения", "Почта","Код_авто") VALUES ( $6, $7, $8, $9, $10,(select "Код_авто" from new_auto)) RETURNING *) SELECT * FROM new_klients;',
      [Марка, Цвет, Тип, Госномер, Год, Логин, Пароль, ФИО, Дата_рождения, Почта]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

