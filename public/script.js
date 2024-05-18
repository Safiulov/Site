// Функция выполняется при загрузке страницы
window.onload = () => {
  // Получение данных из сессионного хранилища
  const Fio = sessionStorage.getItem("Fio");
  const Email = sessionStorage.getItem("Email");
  const Login = sessionStorage.getItem("Login");
  const Password = sessionStorage.getItem("Password");
  const Marka = sessionStorage.getItem("Marka");
  const Color = sessionStorage.getItem("Color");
  const Type = sessionStorage.getItem("Type");
  const Number = sessionStorage.getItem("Number");
  const Year = sessionStorage.getItem("Year");

  // Отображение данных на странице
  if (Marka) {
    document.getElementById("Marka").textContent = Marka;
  }
  if (Color) {
    document.getElementById("Color").textContent = Color;
  }
  if (Type) {
    document.getElementById("Type").textContent = Type;
  }
  if (Number) {
    document.getElementById("Number").textContent = Number;
  }
  if (Year) {
    document.getElementById("Year").textContent = Year;
  }
  if (Login && Password) {
    document.getElementById("Fio").textContent = Fio;
    document.getElementById("Email").textContent = Email;
    document.getElementById("Login").textContent = Login;
  } else {
    document.getElementById("Fio").textContent = "Гость";
    document.getElementById("Email").textContent = "Не зарегистрирован";
    document.getElementById("Login").textContent = "Не зарегистрирован";
    document.getElementById("Marka").textContent = "Нет данных";
    document.getElementById("Color").textContent = "Нет данных";
    document.getElementById("Type").textContent = "Нет данных";
    document.getElementById("Number").textContent = "Нет данных";
    document.getElementById("Year").textContent = "Нет данных";
  }
};

// Функция переворачивает карточку при нажатии на кнопку
document.getElementById("flip-btn").addEventListener("click", function () {
  this.parentElement.classList.toggle("flip");
});
document.getElementById("flip-btn2").addEventListener("click", function () {
  this.parentElement.classList.toggle("flip");
});

// Обработчик события для кнопок сервисов на карточках
const cardButtons = document.querySelectorAll(".service-button");
cardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".card");
    card.classList.toggle("flip");
  });
});

// Инициализация карты OpenStreetMap
var map = L.map("map").setView([54.286741, 48.233571], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Добавление маркера на карту
var marker = L.marker([54.286741, 48.233571])
  .addTo(map)
  .bindPopup(
    "<h2>CarPark</h2><p>Адрес: Баратаевский Аэропорт, Авиационная20</p><p>Телефон: +7 (920) 123-45-67</p><p>Email: carpark@example.com</p>"
  );
marker.openPopup();

// Кнопка фокусировки на маркере
var focusMarkerButton = L.easyButton("fa-car", function () {
  map.setView(marker.getLatLng(), 18);
});
focusMarkerButton.addTo(map);

// Кнопка определения текущего местоположения
var locateButton = L.easyButton("fa-location-arrow", function () {
  map.locate({ setView: true, maxZoom: 18 });
});
locateButton.addTo(map);

// Контрол маршрутизации
var control = L.Routing.control({
  waypoints: [marker.getLatLng(), map.getCenter()],
  routeWhileDragging: true,
});
map.on("locationfound", function (e) {
  control.setWaypoints([e.latlng, marker.getLatLng()]);
  control.addTo(map);
});
map.on("locationerror", function (e) {
  alert("Не удалось определить ваше местоположение");
});

// Кнопка очистки маршрута
var clearRouteButton = L.easyButton("fa-times", function () {
  // Очищаем маршрут
  control.spliceWaypoints(0, control.getWaypoints().length);
});
clearRouteButton.addTo(map);

// Обработчик отправки формы обновления данных пользователя
const updateUserForm = document.getElementById("update-form");
updateUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  // Получение данных из формы
  const fio = document.getElementById("fio").value;
  const email = document.getElementById("email").value;
  const newLogin = document.getElementById("login").value;
  const currentLogin = sessionStorage.getItem("Login");

  try {
    const response = await fetch("/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Логин: currentLogin,
        ФИО: fio,
        Почта: email,
        НовыйЛогин: newLogin,
      }),
    });

    if (response.ok) {
      alert("Данные обновлены");
      // Обновление данных в сессионном хранилище и на странице
      updateUserData(fio, email);
      updateLogin(newLogin);
      // Перезагрузка страницы после успешного редактирования данных
      window.location.reload();
    } else {
      alert("Измените логин...");
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// Обработчик отправки формы обновления данных автомобиля
const updateCarForm = document.getElementById("update-form2");
updateCarForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  // Получение данных из формы
  const marka = document.getElementById("marka").value;
  const color = document.getElementById("color").value;
  const type = document.getElementById("type").value;
  const number = document.getElementById("number").value;
  const year = document.getElementById("year").value;
  const currentLogin = sessionStorage.getItem("Login");

  try {
    const response = await fetch("/update2", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Марка: marka,
        Цвет: color,
        Тип: type,
        Госномер: number,
        Год: year,
        Логин: currentLogin,
      }),
    });

    if (response.ok) {
      alert("Данные обновлены");
      // Обновление данных в сессионном хранилище и на странице
      updateCarData(marka, color, type, number, year);
         // Перезагрузка страницы после успешного редактирования данных
         window.location.reload();
    } else {
      throw new Error("Ошибка при обновлении");
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

// Функция обновления данных пользователя на странице
function updateUserData(fio, email) {
  document.getElementById("Fio").textContent = fio;
  document.getElementById("Email").textContent = email;
  sessionStorage.setItem("Fio", fio);
  sessionStorage.setItem("Email", email);
}

// Функция обновления данных автомобиля на странице
function updateCarData(marka, color, type, number, year) {
  document.getElementById("Marka").textContent = marka;
  document.getElementById("Color").textContent = color;
  document.getElementById("Type").textContent = type;
  document.getElementById("Number").textContent = number;
  document.getElementById("Year").textContent = year;
  sessionStorage.setItem("Marka", marka);
  sessionStorage.setItem("Color", color);
  sessionStorage.setItem("Type", type);
  sessionStorage.setItem("Number", number);
  sessionStorage.setItem("Year", year);
}

// Функция обновления логина в сессионном хранилище и на странице
function updateLogin(newLogin) {
  document.getElementById("Login").textContent = newLogin;
  sessionStorage.setItem("Login", newLogin);
}

// Функция получения данных о зарезервированных местах
async function getReservedSpaces() {
  const username = sessionStorage.getItem("Login");
  try {
    const response = await fetch(`/reserved-spaces?username=${username}`);
    const data = await response.json();
    if (response.ok) {
      const reservedSpacesList = document.getElementById(
        "reserved-spaces-list"
      );
      reservedSpacesList.innerHTML = ""; // Очистка списка зарезервированных мест
      data.forEach((space) => {
        const li = document.createElement("li");
        const date = new Date(space.дата_въезда).toLocaleString("ru-RU", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const text = `Место: ${space.место}, Дата выезда: ${date}, Услуга: ${space.название_услуги}`;
        li.textContent = text;
        reservedSpacesList.appendChild(li);
      });
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

// Обработчик события изменения выбранной услуги
const serviceSelect = document.getElementById("service-select");
const dateInput = document.getElementById("date-input-1");

serviceSelect.addEventListener("change", (event) => {
  if (event.target.value === "1") {
    const today = new Date();
    dateInput.type = "datetime-local";
    dateInput.readOnly = false;
    dateInput.min = new Date(today.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, -8);
  } else {
    dateInput.type = "date";
    dateInput.readOnly = true; // Add this line to reset the readOnly property
    if (event.target.value === "2") {
      const today = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(today.getMonth() + 1);
      dateInput.valueAsDate = oneMonthFromNow;
      dateInput.min = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, -8);
      dateInput.max = new Date(
        oneMonthFromNow.getTime() + 24 * 60 * 60 * 1000 * 30
      )
        .toISOString()
        .slice(0, -8);
    } else if (event.target.value === "3") {
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      dateInput.valueAsDate = oneYearFromNow;
      dateInput.min = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, -8);
      dateInput.max = new Date(
        oneYearFromNow.getTime() + 24 * 60 * 60 * 1000 * 365
      )
        .toISOString()
        .slice(0, -8);
    }
  }
});
// Обработчик события загрузки документа
document.addEventListener("DOMContentLoaded", () => {
  const parkingStatus = document.getElementById("parking-status");
  const textForm = document.getElementById("parking-form");
  const currentLogin = sessionStorage.getItem("Login");

  // Обработчик отправки формы резервирования парковочного места
  textForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    // Получение данных из формы
    const Место = document.getElementById("место").value;
    const Дата_въезда = document.getElementById("date-input-1").value;
    const Тип_услуги = document.getElementById("service-select").value;
    try {
      const response = await fetch("/parking-status2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Место,
          Дата_въезда,
          Логин: currentLogin,
          Тип_услуги,
        }),
      });
      if (Тип_услуги === "1" && Место.startsWith("B")) {
        alert("Резервирование доступно только для мест секции 'A'");
        return;
      }
      if ((Тип_услуги === "2" || Тип_услуги === "3") && Место.startsWith("A")) {
        alert("Бронирование доступно только для мест секции 'В'");
        return;
      }
      if (response.ok) {
        alert("Запись добавлена в журнал.");
        // Очистка полей формы
        document.getElementById("место").value = "";
        document.getElementById("date-input-1").value = "";
        document.getElementById("service-select").value = "";

        // Обновление статуса парковки на странице
        fetch("/parking-status")
          .then((res) => res.json())
          .then((data) => {
            parkingStatus.innerHTML = ""; // Очистка статуса парковки
            data.forEach((spot) => {
              const div = document.createElement("div");
              div.className = "parking-spot";
              if (spot.статус === "Занято") {
                div.classList.add("occupied");
              } else if (spot.статус === "Свободно") {
                div.classList.add("free");
              }
              div.textContent = `${spot.статус} ${spot.место}`;
              parkingStatus.appendChild(div);
            });
          })
          .catch((error) => {
            console.error(error);
            alert(error.message);
          });

        // Обновление списка зарезервированных мест
        getReservedSpaces();
      } else {
        alert("Ошибка при добавлении записи.");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });

  // Обновление статуса парковки на странице 
  fetch("/parking-status")
    .then((res) => res.json())
    .then((data) => {
      data.forEach((spot) => {
        const div = document.createElement("div");
        div.className = "parking-spot";
        if (spot.статус === "Занято") {
          div.classList.add("occupied");
        } else if (spot.статус === "Свободно") {
          div.classList.add("free");
        }
        div.textContent = `${spot.статус} ${spot.место}`;
        parkingStatus.appendChild(div);
      });
    })
    .catch((error) => {
      console.error(error);
      alert(error.message);
    });

  // Обновление списка зарезервированных мест 
  getReservedSpaces();
});

// Функция скроллинга по секциям
let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll("header nav a");
let currentSection = sections[0];
let currentNavLink = document.querySelector(
  "header nav a[href*=" + currentSection.getAttribute("id") + "]"
);
currentNavLink.classList.add("active");
window.onscroll = () => {
  sections.forEach((sec) => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute("id");
    if (top >= offset && top < offset + height) {
      navLinks.forEach((links) => {
        links.classList.remove("active");
        document
          .querySelector("header nav a[href*=" + id + "]")
          .classList.add("active");
      });
      document.title =
        document.querySelector("header nav a[href*=" + id + "]").textContent +
        " - Личный кабинет";
    }
  });
};

// Функционал скроллинга сервисов
const servicesContainer = document.querySelector(".services-container");
let isMouseDown = false;
let startX;
let scrollLeft;
servicesContainer.addEventListener("mousedown", (event) => {
  if (event.target.id === "scroll-prev" || event.target.id === "scroll-next") {
    return;
  }
  isMouseDown = true;
  startX = event.clientX;
  scrollLeft = servicesContainer.scrollLeft;
});
servicesContainer.addEventListener("mousemove", (event) => {
  if (!isMouseDown) {
    return;
  }
  const distanceX = event.clientX - startX;
  const newScrollLeft = scrollLeft - distanceX;
  servicesContainer.scrollTo({ left: newScrollLeft, behavior: "instant" }); // Change 'smooth' to 'instant'
});
servicesContainer.addEventListener("mouseup", () => {
  isMouseDown = false;
});
servicesContainer.addEventListener("mouseleave", () => {
  isMouseDown = false;
});
document.querySelector("#scroll-prev").addEventListener("click", () => {
  servicesContainer.scrollTo({
    left: servicesContainer.scrollLeft - servicesContainer.clientWidth,
    behavior: "instant",
  }); // Change 'smooth' to 'instant'
});
document.querySelector("#scroll-next").addEventListener("click", () => {
  servicesContainer.scrollTo({
    left: servicesContainer.scrollLeft + servicesContainer.clientWidth,
    behavior: "instant",
  }); // Change 'smooth' to 'instant'
});

// Функция выхода из системы
function logout() {
  sessionStorage.clear();
  location.reload();
}


