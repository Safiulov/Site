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
app.use(express.static(`${__dirname}/public`));


app.get('/', async (req, res) => {
  try {
    res.sendFile(`${__dirname}/index.html`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
  
app.get('/index.html', async (req, res) => {
    try {
      res.sendFile(`${__dirname}/index.html`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.get('/index2.html', async (req, res) => {
    try {
      res.sendFile(`${__dirname}/index2.html`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });


app.post('/check-login', async (req, res) => {
const { username, password } = req.body;

try {
const result = await pool.query('SELECT * FROM "Стоянка"."Klients" WHERE "Логин" = $1 AND "Пароль" = $2', [username, password]);
if (result.rows.length > 0) {
    res.json({ success: true, username: result.rows[0].ФИО });
} else {
res.json({ success: false });
}
} catch (err) {
console.error(err);
res.json({ success: false });
}
});



app.post('/register', async (req, res) => {
  const { Логин, Пароль, ФИО, Дата_рождения, Телефон, Марка, Цвет, Тип, Госномер, Год } = req.body;

  try {
    await pool.query(
      'WITH new_klients AS (INSERT INTO "Стоянка"."Klients"( "Логин", "Пароль","ФИО", "Дата_рождения", "Телефон") VALUES ( $1, $2, $3, $4, $5) RETURNING *), new_auto AS (INSERT INTO "Стоянка"."Auto"("Марка", "Цвет", "Тип", "Госномер", "Год", "Код_клиента") VALUES ( $6, $7, $8, $9,$10,(select "Код_клиента" from new_klients)) RETURNING *) SELECT * FROM new_auto;',
      [Логин, Пароль, ФИО, Дата_рождения, Телефон, Марка, Цвет, Тип, Госномер, Год]   );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false});
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});