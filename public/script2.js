
// Добавляем обработчик событий на кнопку "забыли пароль?"
document.getElementById("forgot-password-button").addEventListener("click", function () {
  // Открываем страницу "забыли пароль?"
  openIndex2();
});

function openIndex2() {
  window.location.href = "index3.html";
}
// Функция для обработки отправки формы входа
function login(event) {
  // Получаем значения полей ввода логина и пароля
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  // Отправление запроса на сервер для проверки корректности логина и пароля
  fetch('/check-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Сохраняем значение входа в хранилище сеанса
        sessionStorage.setItem("Fio", data.Fio);
        sessionStorage.setItem("Email", data.Email);
        sessionStorage.setItem("Login", data.Login);
        sessionStorage.setItem("Password", data.Password);
        sessionStorage.setItem("Marka", data.Marka);
        sessionStorage.setItem("Color", data.Color);
        sessionStorage.setItem("Type", data.Type);
        sessionStorage.setItem("Number", data.Number);
        sessionStorage.setItem("Year", data.Year);
        // Перенаправление на главную страницу
        window.location.href = "index.html";
      } else {
        alert("Неверный логин или пароль");
      }
    });
}

// Функция для обработки отправки формы регистрации
function register(event) {
    // Получаем данные из формы регистрации
    const formData = new FormData(event.target);
    const data = {
      Логин: formData.get('Логин'),
      Пароль: formData.get('Пароль'),
      ФИО: formData.get('ФИО'),
      Дата_рождения: formData.get('Дата_рождения'),
      Почта: formData.get('Почта'),
      Марка: formData.get('Марка'),
      Цвет: formData.get('Цвет'),
      Тип: formData.get('Тип'),
      Госномер: formData.get('Госномер'),
      Год: formData.get('Год')
    };
    // Отправляем запрос на сервер для регистрации пользователя
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Если регистрация прошла успешно, переключаемся на форму входа
          document.querySelector('label[for="chk"]').click();
        } else {
          alert('Измените логин');
        }
      });
  }
