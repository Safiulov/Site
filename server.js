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
const axios = require('axios');
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
    const response = await axios.get(`http://localhost:5100/api/Site/Check-login?columnValue=${username}`);
    const result = response.data;

    if (result.length > 0) {
      // Compare the hashed password
      const isPasswordValid = await bcrypt.compare(password, result[0].password);

      if (isPasswordValid) {
        res.json({
          success: true,
          Fio: result[0].fio,
          Email: result[0].email,
          Login: result[0].login,
          Marka: result[0].mark,
          Password: result[0].password,
          Color: result[0].color,
          Type: result[0].type,
          Number: result[0].governmentNumber,
          Year: result[0].year
        });
      } else {
        res.json({ success: false });
      }
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking login' });
  }
});


async function checkUsername(username) {
  try {
    const response = await axios.get(`http://localhost:5100/api/Site/Checkusername?columnValue=${username}`);
    if (response.data.length > 0) {
      return ({ success: false, error: 'Такой логин уже занят' });
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
    
    const response = await axios.get(`http://localhost:5100/api/Site/Checkpassword?columnValue=${password}`);
    if (response.data.length > 0) {
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
  
  try {
   
    const response = await axios.post(`http://localhost:5100/api/Site/`, {логин:Логин, пароль:Пароль, фио:ФИО, дата_рождения:Дата_рождения, почта:Почта, марка:Марка, цвет:Цвет, тип:Тип, госномер:Госномер, год:Год});

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error registering user' });
  }
});


app.put('/update', async (req, res) => {
  const { Логин, ФИО, Почта, НовыйЛогин } = req.body;

  try {
   
    const response = await axios.put(`http://localhost:5100/api/Site/Update_klient`, {oldLogin:Логин, fio:ФИО,email:Почта,newLogin:НовыйЛогин});

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({  success:false });
  }
});

  
app.put('/update2', async (req, res) => {
  const { Марка, Цвет, Тип, Госномер, Год,Логин } = req.body;

  try {
    const response = await axios.put(`http://localhost:5100/api/Site/Update_auto`, {марка:Марка,цвет:Цвет,тип:Тип,госномер:Госномер,год:Год,логин:Логин });


    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({  success:false });
  }
});


  app.get('/parking-status', async (req, res) => {
    try {
      const result = await axios.get('http://localhost:5100/api/Spaces/all');
      res.json(result.data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success:false });
    }
  });
  app.post('/parking-status2', async (req, res) => {
    const { Место, Дата_въезда, Логин, Тип_услуги } = req.body;
  
    try {
        // Проверка доступности места
        const availability = await axios.get(`http://localhost:5100/api/Site/check-availability?place=${Место}`);
       
        
        // Проверка резервации места
        const reservation = await axios.get(`http://localhost:5100/api/Site/check-reserve?place=${Место}`);
    
        
        
        // Добавление машины
        await axios.post(`http://localhost:5100/api/Site/add-vehicle`, {код:Тип_услуги,место:Место,дата:Дата_въезда,логин:Логин});
        
        // Возврат успеха
        res.json({ success: true});
      } catch (err) {
        console.error(err);
        res.status(500).json({success:false});
      }
});

app.get('/reserved-spaces', async (req, res) => {
  const { username } = req.query;

  try {
    const response = await axios.get(`http://localhost:5100/api/Site/Search_klient?columnValue=${username}`);
    const result = response.data;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false});
  }
});


// Add this endpoint to your server
app.put('/change-password', async (req, res) => {
  const { newPassword , email } = req.body;
  try { 
    const response = await axios.put(`http://localhost:5100/api/Site/change-password`, {newPassword:newPassword,email:email });
    const result = response.data;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false});
  }
  
});

app.post('/check-email', async (req, res) => {
  const { email } = req.body;

    try {

      const response = await axios.post(`http://localhost:5100/api/Site/check-email`, { email:email});
  
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error registering user' });
    }
  });


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});