const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
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

const nodemailer = require('nodemailer');
// Настройка nodemailer для отправки писем
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'safiulov17@gmail.com',
    pass: 'mbik ayka qplr dqvc'
  }
});
app.post('/reset-password', (req, res) => {
  let mailOptions = {
    from: 'safiulov17@gmail.com',
    to: req.body.email,
    subject: 'Password Reset',
    text: `Your password reset code is: ${req.body.code}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.status(200).send('Email sent: ' + info.response);
    }
  });
});




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
    const result = await pool.query('SELECT k."ФИО",k."Почта",k."Логин",k."Пароль", a."Марка",a."Цвет",a."Тип",a."Госномер",a."Год" FROM "Стоянка"."Klients" as k JOIN "Стоянка"."Auto" as a ON k."Код_авто" = a."Код_авто" where "Логин"=$1', [username]);
    if (result.rows.length > 0) {
      // Compare the hashed password
      const isPasswordValid = await bcrypt.compare(password, result.rows[0].Пароль);

      if (isPasswordValid) {
        res.json({ success: true, Fio: result.rows[0].ФИО, Email: result.rows[0].Почта, Login: result.rows[0].Логин, Marka: result.rows[0].Марка,Password: result.rows[0].Пароль, Color: result.rows[0].Цвет, Type: result.rows[0].Тип, Number: result.rows[0].Госномер, Year: result.rows[0].Год });
      } else {
        res.json({ success: false });
      }
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query('SELECT * FROM "Стоянка"."Klients" WHERE "Пароль" = $1', [hashedPassword]);
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
  const hashedPassword = await bcrypt.hash(Пароль, 10);
  const passwordCheck = await checkPassword(Пароль);
  if (!passwordCheck.success) {
    return res.json(passwordCheck);
  }

  try {
   
    await pool.query(
      'WITH new_auto AS (INSERT INTO "Стоянка"."Auto"( "Марка", "Цвет", "Тип", "Госномер", "Год") VALUES ( $1, $2, $3, $4,$5) RETURNING *), new_klients AS (INSERT INTO "Стоянка"."Klients"( "Логин", "Пароль","ФИО", "Дата_рождения", "Почта","Код_авто") VALUES ( $6, $7, $8, $9, $10,(select "Код_авто" from new_auto)) RETURNING *) SELECT * FROM new_klients;',
      [Марка, Цвет, Тип, Госномер, Год, Логин, hashedPassword, ФИО, Дата_рождения, Почта]
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

    // Проверяем, существует ли новый логин в базе данных
    const { rows: existingLogins } = await pool.query('SELECT "Логин" FROM "Стоянка"."Klients" WHERE "Логин" = $1', [НовыйЛогин]);

    if (existingLogins.length > 0) {
      // Новый логин уже существует в базе данных
      await pool.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Новый логин уже используется' });
    }

    // Обновляем данные клиента
    await pool.query('UPDATE "Стоянка"."Klients" SET "ФИО" = $1, "Почта" = $2 WHERE "Логин" = $3', [ФИО, Почта, Логин]);

    if (НовыйЛогин && НовыйПароль) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(НовыйПароль, 10);

      // Обновляем логин и пароль, если они были предоставлены
      await pool.query('UPDATE "Стоянка"."Klients" SET "Логин" = $1, "Пароль" = $2 WHERE "Логин" = $3', [НовыйЛогин, hashedPassword, Логин]);
    }

    await pool.query('COMMIT');

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    await pool.query('ROLLBACK');
    res.status(500).json({ success: false, message: 'Произошла ошибка при обновлении данных' });
  }
});

  
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


  
app.get('/parking-status', async (req, res) => {
  const result = await pool.query('SELECT * FROM "Стоянка"."Spaces"');
  res.json(result.rows);
});
app.post('/parking-status2', async (req, res) => {
  const { Место, Дата_въезда, Логин, Тип_услуги } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "Стоянка"."Sales" WHERE "Место" = $1 and "Дата_выезда" is null', [Место]);

    if (result.rowCount > 0) {
      return res.status(400).json({ message: 'Место уже занято' });
    }
    const result2 = await pool.query('SELECT * FROM "Стоянка"."Realisation" WHERE "Место" = $1', [Место]);
    if (result2.rowCount > 0) {
      const reservedPlace = result2.rows[0];
      const reservedDate = new Date(reservedPlace.Дата_въезда);
      const reservedMonths = reservedPlace.Код_услуги === 1 ? 1 : 12;
     // Если тариф "Бронирование на месяц", то проверим на месяц вперёд, если "Бронирование на год", то на год вперёд
      const endDate = new Date(reservedDate.getFullYear(), reservedDate.getMonth() + reservedMonths, reservedDate.getDate());
      const currentDate = new Date(Дата_въезда);

      if (Тип_услуги === '2' && (currentDate >= reservedDate && currentDate < endDate)) {
        return res.status(400).json({ message: 'Место забронировано на заданный период' });
      }
    }

    if (Тип_услуги === '1') {
      if (Место[0]!='A')
      {
        return res.status(400).json({ message: 'Резервирование применяется только к местам сектора "А" ' });
      }
      await pool.query('INSERT INTO "Стоянка"."Sales" (Место, Дата_въезда, Код_клиента) VALUES ($1, $2, (select "Код_клиента" from "Стоянка"."Klients" where "Логин"=$3))', [Место, Дата_въезда, Логин]);
      res.status(201).json({ message: 'Автомобиль добавлен на стоянку' });
    } else if (Тип_услуги === '2') {
      if (Место[0]!='B')
      {
        return res.status(400).json({ message: 'Бронирование на месяц применяется только к местам сектора "В"' });
      }
      await pool.query('INSERT INTO "Стоянка"."Realisation" (Место, Дата_въезда, Код_клиента, Код_услуги) VALUES ($1, $2, (select "Код_клиента" from "Стоянка"."Klients" where "Логин"=$3), 1)', [Место, Дата_въезда, Логин]);
      res.status(201).json({ message: 'Бронирование на месяц добавлено' });
    } else if (Тип_услуги === '3') {
      if (Место[0]!='B')
      {
        return res.status(400).json({ message: 'Бронирование на год применяется только к местам сектора "В"' });
      }
      await pool.query('INSERT INTO "Стоянка"."Realisation" (Место, Дата_въезда, Код_клиента, Код_услуги) VALUES ($1, $2, (select "Код_клиента" from "Стоянка"."Klients" where "Логин"=$3), 2)', [Место, Дата_въезда, Логин]);
      res.status(201).json({ message: 'Бронирование на год добавлено' });
    } else {
      res.status(400).json({ message: 'Неверный тип услуги' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Ошибка при добавлении автомобиля на стоянку' });
  }
});


app.get('/reserved-spaces', async (req, res) => {
  const { username } = req.query;

  try {
    const result = await pool.query('SELECT * FROM "Стоянка"."Realisation" WHERE "Код_клиента" = (SELECT "Код_клиента" FROM "Стоянка"."Klients" WHERE "Логин" = $1)', [username]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// Add this endpoint to your server
app.put('/change-password', async (req, res) => {
  const { newPassword , email } = req.body;

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's record in the database
    const result = await pool.query(
      'UPDATE "Стоянка"."Klients" SET "Пароль" = $1 WHERE "Почта" = $2',
      [hashedPassword, email]
    );

    if (result.rowCount > 0) {
      res.json({ success: true, message: 'Password updated successfully.' });
    } else {
      res.json({ success: false, message: 'User not found or password not updated.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while updating the password.' });
  }
});


app.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT * FROM "Стоянка"."Klients" WHERE "Почта" = $1', [email]);

    if (result.rowCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});