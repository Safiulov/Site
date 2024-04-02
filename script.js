window.onload = () => {
  const Fio = sessionStorage.getItem("Fio");
  const Email = sessionStorage.getItem("Email");
  const Login = sessionStorage.getItem("Login");
  const Password = sessionStorage.getItem("Password");
  const Marka = sessionStorage.getItem("Marka");
  if (Marka) {
    document.getElementById("Marka").textContent = Marka;
  }
  const Color = sessionStorage.getItem("Color");
  if (Color) {
    document.getElementById("Color").textContent = Color;
  }
  const Type = sessionStorage.getItem("Type");
  if (Type) {
    document.getElementById("Type").textContent = Type;
  }
  const Number = sessionStorage.getItem("Number");
  if (Number) {
    document.getElementById("Number").textContent = Number;
  }
  const Year = sessionStorage.getItem("Year");
  if (Year) {
    document.getElementById("Year").textContent = Year;
  }
  if (Login && Password) {
    document.getElementById("Fio").textContent = Fio;
    document.getElementById("Email").textContent = Email;
    document.getElementById("Login").textContent = Login;
    document.getElementById("Password").textContent = Password;
  } else {
    document.getElementById("Fio").textContent = "Гость";
  }
};
document.getElementById("flip-btn").addEventListener("click", function () {
  this.parentElement.classList.toggle("flip");
});
document.getElementById("flip-btn2").addEventListener("click", function () {
  this.parentElement.classList.toggle("flip");
});
const cardButtons = document.querySelectorAll(".service-button");
cardButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".card");
    card.classList.toggle("flip");
  });
});
var map = L.map("map").setView([54.286741, 48.233571], 15);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
var marker = L.marker([54.286741, 48.233571])
 .addTo(map)
 .bindPopup(
    "<h2>CarPark</h2><p>Адрес: Баратаевский Аэропорт, Авиационная20</p><p>Телефон: +7 (920) 123-45-67</p><p>Email: carpark@example.com</p>"
  );
marker.openPopup();
var focusMarkerButton = L.easyButton("fa-car", function () {
  map.setView(marker.getLatLng(), 18);
});
focusMarkerButton.addTo(map);
var locateButton = L.easyButton("fa-location-arrow", function () {
  map.locate({ setView: true, maxZoom: 18 });
});
locateButton.addTo(map);
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
var clearRouteButton = L.easyButton("fa-times", function () {
  // Очищаем маршрут
  control.spliceWaypoints(0, control.getWaypoints().length);
});
clearRouteButton.addTo(map);
const updateUserForm = document.getElementById("update-form");
updateUserForm.addEventListener("submit", async (event) => {
  event.preventDefault();
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
      updateLogin(newLogin);
      updateUserData(fio, email);
    } else {
      alert("Измените логин...")
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    console.error(error);
   
  }
});

const updateCarForm = document.getElementById("update-form2");
updateCarForm.addEventListener("submit", async (event) => {
  event.preventDefault();
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
      updateCarData(marka, color, type, number, year);
    } else {
      throw new Error("Ошибка при обновлении");
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

function updateUserData(fio, email) {
  document.getElementById("Fio").textContent = fio;
  document.getElementById("Email").textContent = email;
}

function updateCarData(marka, color, type, number, year) {
  document.getElementById("Marka").textContent = marka;
  document.getElementById("Color").textContent = color;
  document.getElementById("Type").textContent = type;
  document.getElementById("Number").textContent = number;
  document.getElementById("Year").textContent = year;
}

function updateLogin(newLogin) {
  sessionStorage.setItem("Login", newLogin);
}

async function getReservedSpaces() {
  const username = sessionStorage.getItem("Login");
  try {
    const response = await fetch(`/reserved-spaces?username=${username}`);
    const data = await response.json();
    if (response.ok) {
      const reservedSpacesList = document.getElementById(
        "reserved-spaces-list"
      );
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
getReservedSpaces();

document.getElementById("service-select").addEventListener("change", function () {
  if (this.value === "2") {
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    const dateInput = document.getElementById("date-input-1");
    dateInput.valueAsDate = oneMonthFromNow;
    dateInput.min = new Date(
      today.getTime() + 24 * 60 * 60 * 1000
    ).toISOString().slice(0, -8)
  } else if (this.value === "3") {
    const today = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(today.getFullYear() + 1);
    const dateInput = document.getElementById("date-input-1");
    dateInput.valueAsDate = oneYearFromNow;
    dateInput.min = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, -8);
  }
})

const serviceSelect = document.getElementById("service-select");
const dateInput = document.getElementById("date-input-1");

serviceSelect.addEventListener("change", (event) => {
   if (event.target.value === "1") {
    const today = new Date();
    dateInput.type = "datetime-local";
    dateInput.readOnly = false;
    dateInput.min = new Date(today.getTime() + 24 * 60 * 60)
      .toISOString()
      .slice(0, -8);
  } else {
    dateInput.type = "date";
    if (event.target.value === "2") {
      const today = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(today.getMonth() + 1);
      dateInput.valueAsDate = oneMonthFromNow;
      dateInput.min = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, -8);
      dateInput.max = new Date(
        oneMonthFromNow.getTime() + 24 * 60 * 60 * 1000 * 30
      ).toISOString().slice(0, -8);
    } else if (event.target.value === "3") {
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);
      dateInput.valueAsDate = oneYearFromNow;
      dateInput.min = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, -8);
      dateInput.max = new Date(
        oneYearFromNow.getTime() + 24 * 60 * 60 * 1000 * 365
      ).toISOString().slice(0, -8);
      }
    }
});

document.addEventListener("DOMContentLoaded", () => {
  const parkingStatus = document.getElementById("parking-status");
  const textForm = document.getElementById("parking-form");
  const currentLogin = sessionStorage.getItem("Login");
  textForm.addEventListener("submit", async (event) => {
    event.preventDefault();
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

      if (response.ok) {
        alert("Запись добавлена в журнал..");
      } else {
        const error = await response.json();
        if (error.hasOwnProperty('success')) {
          alert(error.message);
        } else {
          throw new Error(error.error);
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });
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
});

let sections = document.querySelectorAll("section");
let navLinks = document.querySelectorAll("header nav a");
let currentSection = sections[0];
let currentNavLink= document.querySelector(
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
const servicesContainer = document.querySelector(".services-container");
var isMouseDown = false;
let startX, scrollLeft;
servicesContainer.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  startX = e.pageX - servicesContainer.offsetLeft;
  scrollLeft = servicesContainer.scrollLeft;
});
document.addEventListener("mousemove", (e) => {
  if (isMouseDown) {
    e.preventDefault();
    const x = e.pageX - servicesContainer.offsetLeft;
    const scroll = (x - startX) * 10;
    servicesContainer.scrollTo(scrollLeft - scroll, 0);
  }
});
window.addEventListener("mouseup", () => {
  isMouseDown = false;
});

document.querySelector("#scroll-prev").addEventListener("click", () => {
  servicesContainer.scrollLeft -= servicesContainer.clientWidth;
});

document.querySelector("#scroll-next").addEventListener("click", () => {
  servicesContainer.scrollLeft += servicesContainer.clientWidth;
});

function logout() {
  sessionStorage.clear();
  window.location.replace("index.html");
}

