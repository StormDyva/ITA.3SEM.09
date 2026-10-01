// The browser calls the backend through its published host port.
const BACKEND_URL = "http://localhost:3000";
const colors = ["#ffb8cf", "#a9ed91", "#8fe3ff", "#cbb6ff", "#ffd27d", "#ff9d83"];
const carIcons = ["🚙", "🚗", "🚕", "🏎️", "🚘", "🚐", "🚓", "🚜"];
const imageKeys = new Set(["image", "imageurl", "photo", "photourl", "picture", "pictureurl"]);
const hiddenKeys = new Set(["id", "userid", "image", "imageurl", "photo", "photourl", "picture", "pictureurl"]);

function formatLabel(key) {
  const labels = {
    make: "Mærke", manufacturer: "Mærke", brand: "Mærke", model: "Model",
    year: "Årgang", color: "Farve", mileage: "Kilometer", price: "Pris",
    fuel: "Brændstof", fueltype: "Brændstof", transmission: "Gearkasse",
    bodytype: "Karrosseri", doors: "Døre", horsepower: "Hestekræfter",
  };
  const normalized = key.replace(/[_\s-]/g, "").toLowerCase();
  return labels[normalized] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.map(displayValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function renderCar(car, index) {
  const card = document.createElement("article");
  card.className = "note car-card";
  card.style.setProperty("--card", colors[index % colors.length]);
  card.style.setProperty("--tilt", `${(index % 3 - 1) * 1.2}deg`);

  const imageEntry = Object.entries(car).find(([key, value]) => imageKeys.has(key.toLowerCase()) && typeof value === "string");
  if (imageEntry) {
    const image = document.createElement("img");
    image.className = "car-image";
    image.src = imageEntry[1];
    image.alt = "";
    image.loading = "lazy";
    image.onerror = () => image.remove();
    card.appendChild(image);
  }

  const top = document.createElement("div");
  top.className = "note-top";
  const number = document.createElement("span");
  number.className = "note-number";
  number.textContent = car.id ?? index + 1;
  const icon = document.createElement("span");
  icon.className = "doodle";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = carIcons[index % carIcons.length];
  top.append(number, icon);

  const title = document.createElement("h3");
  const make = car.make ?? car.brand ?? car.manufacturer;
  const model = car.model;
  title.textContent = [make, model].filter(Boolean).join(" ") || car.name || car.title || "Bil uden navn";
  card.append(top, title);

  const details = document.createElement("dl");
  details.className = "car-details";
  for (const [key, value] of Object.entries(car)) {
    if (hiddenKeys.has(key.toLowerCase()) || key.toLowerCase() === "make" || key.toLowerCase() === "brand" || key.toLowerCase() === "manufacturer" || key.toLowerCase() === "model" || key.toLowerCase() === "name" || key.toLowerCase() === "title") continue;
    const row = document.createElement("div");
    const label = document.createElement("dt");
    label.textContent = formatLabel(key);
    const detail = document.createElement("dd");
    detail.textContent = displayValue(value);
    row.append(label, detail);
    details.appendChild(row);
  }
  if (details.childElementCount) card.appendChild(details);
  return card;
}

async function loadCars() {
  const list = document.getElementById("notes");
  const status = document.getElementById("status");
  const count = document.getElementById("count");

  try {
    const response = await fetch(`${BACKEND_URL}/notes`);
    if (!response.ok) throw new Error(`Serveren svarede ${response.status}`);

    const cars = await response.json();
    if (!Array.isArray(cars)) throw new Error("Dataene fra endpointet er ikke en liste");

    count.textContent = `${cars.length} ${cars.length === 1 ? "bil" : "biler"} 🚘`;
    status.textContent = cars.length ? "Her er bilerne fra backend — find din favorit!" : "Der er ingen biler at vise lige nu.";

    if (cars.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Bilgaragen er tom lige nu. 🐣";
      list.appendChild(empty);
      return;
    }

    cars.forEach((car, index) => list.appendChild(renderCar(car, index)));
  } catch (error) {
    count.textContent = "Ups! 🫠";
    status.textContent = "Vi kunne ikke hente bilerne.";
    const message = document.createElement("div");
    message.className = "error";
    message.textContent = `Kan ikke hente bilerne fra ${BACKEND_URL}/notes. Tjek at backend og vehicle-API'et er tilgængelige. (${error.message})`;
    list.appendChild(message);
  }
}

loadCars();
