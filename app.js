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
    const result = await pool.query('SELECT k."ФИО",k."Почта",k."Логин",k."Пароль", a."Марка",a."Цвет",a."Тип",a."Госномер",a."Год" FROM "Стоянка"."Klients" as k JOIN "Стоянка"."Auto" as a ON k."Код_авто" = a."Код_авто" where "Логин"=$1 and "Пароль" = $2', [username, password]);
    if (result.rows.length > 0) {
      res.json({ success: true, Fio: result.rows[0].ФИО, Email: result.rows[0].Почта,Login: result.rows[0].Логин,Password: result.rows[0].Пароль, Marka: result.rows[0].Марка, Color: result.rows[0].Цвет, Type: result.rows[0].Тип, Number: result.rows[0].Госномер, Year: result.rows[0].Год });
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

app.put('/update', async (req, res) => {
  const { Логин, ФИО, Почта, НовыйЛогин, НовыйПароль } = req.body;

  try {
    await pool.query('BEGIN');

    await pool.query('UPDATE "Стоянка"."Klients" SET "ФИО" = $1, "Почта" = $2 WHERE "Логин" = $3', [ФИО, Почта, Логин]);

    if (НовыйЛогин && НовыйПароль) {
      await pool.query('UPDATE "Стоянка"."Klients" SET "Логин" = $1, "Пароль" = $2 WHERE "Логин" = $3', [НовыйЛогин, НовыйПароль, Логин]);
    }

    await pool.query('COMMIT');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    await pool.query('ROLLBACK');
    res.json({ success: false });
  }});



  
app.put('/update2', async (req, res) => {
  const { марка, цвет, тип, госномер, год,Логин } = req.body;

  try {
    await pool.query('UPDATE "Стоянка"."Auto" SET "Марка" = $1, "Цвет" = $2, "Тип" = $3, "Госномер" = $4, "Год" = $5 WHERE "Код_авто" = (select "Код_авто" from "Стоянка"."Klients" where "Логин"=$6)', [марка, цвет, тип, госномер, год,Логин]);


    res.json({ success: true });
  } catch (err) {
    console.error(err);
    await pool.query('ROLLBACK');
    res.json({ success: false });
  }});


  