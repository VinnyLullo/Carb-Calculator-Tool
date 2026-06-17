let foods = [];
let meal = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let savedMeals = JSON.parse(localStorage.getItem("savedMeals")) || [];

const restaurantSelect = document.getElementById("restaurantSelect");
const searchInput = document.getElementById("searchInput");
const foodResults = document.getElementById("foodResults");
const mealList = document.getElementById("mealList");
const totalCarbsElement = document.getElementById("totalCarbs");
const ratioInput = document.getElementById("ratioInput");
const insulinResult = document.getElementById("insulinResult");
const doseCarbs = document.getElementById("doseCarbs");
const doseRatio = document.getElementById("doseRatio");

ratioInput.value = localStorage.getItem("insulinRatio") || 8;

ratioInput.addEventListener("input", () => {
  localStorage.setItem("insulinRatio", ratioInput.value);
  updateInsulinCalculation();
});

const favoritesSection = document.createElement("div");
const savedMealsSection = document.createElement("div");

document.querySelector(".container").insertBefore(favoritesSection, document.querySelector("h2"));
document.querySelector(".container").insertBefore(savedMealsSection, document.querySelector("h2"));

fetch("./data/restaurants.json")
  .then(response => response.json())
  .then(files => Promise.all(files.map(file => fetch(file).then(response => response.json()))))
  .then(results => {
    foods = results.flat();
    populateRestaurantDropdown();
    renderSearchResults();
    renderFavorites();
    renderSavedMeals();
    updateInsulinCalculation();
  })
  .catch(error => {
    console.error("Error loading food data:", error);
    alert("Food data did not load.");
  });

function populateRestaurantDropdown() {
  restaurantSelect.innerHTML = `<option value="all">Select Restaurant</option>`;

  const restaurants = [...new Set(foods.map(food => food.restaurant))].sort();

  restaurants.forEach(restaurant => {
    const option = document.createElement("option");
    option.value = restaurant;
    option.textContent = restaurant;
    restaurantSelect.appendChild(option);
  });
}

searchInput.addEventListener("input", renderSearchResults);
restaurantSelect.addEventListener("change", renderSearchResults);

function renderSearchResults() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedRestaurant = restaurantSelect.value;

  foodResults.innerHTML = "";

  if (selectedRestaurant === "all") {
    foodResults.innerHTML = "<p>Please select a restaurant to view food options.</p>";
    return;
  }

  const filteredFoods = foods.filter(food => {
    const matchesSearch = searchTerm === "" || food.item.toLowerCase().includes(searchTerm);
    const matchesRestaurant = food.restaurant === selectedRestaurant;

    return matchesSearch && matchesRestaurant;
  });

  filteredFoods.forEach(food => {
    foodResults.appendChild(createFoodCard(food));
  });
}

function createFoodCard(food) {
  const div = document.createElement("div");
  div.className = "food-item";

  const isFavorite = favorites.includes(food.id);

  div.innerHTML = `
    <strong>${food.item}</strong><br>
    ${food.restaurant}<br>
    ${food.carbs}g carbs<br>
    Qty:
    <input type="number" min="1" value="1" class="qty-input">
    <button class="add-btn">Add</button>
    <button class="fav-btn">${isFavorite ? "★" : "☆"}</button>
  `;

  div.querySelector(".add-btn").addEventListener("click", () => {
    const qty = Number(div.querySelector(".qty-input").value);

    meal.push({
      ...food,
      quantity: qty,
      totalCarbs: food.carbs * qty
    });

    renderMeal();
  });

  div.querySelector(".fav-btn").addEventListener("click", () => {
    toggleFavorite(food.id);
  });

  return div;
}

function toggleFavorite(foodId) {
  if (favorites.includes(foodId)) {
    favorites = favorites.filter(id => id !== foodId);
  } else {
    favorites.push(foodId);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
  renderSearchResults();
}

function renderFavorites() {
  favoritesSection.innerHTML = "<h2>Favorites</h2>";

  const favoriteFoods = foods.filter(food => favorites.includes(food.id));

  if (favoriteFoods.length === 0) {
    favoritesSection.innerHTML += "<p>No favorites yet.</p>";
    return;
  }

  favoriteFoods.forEach(food => {
    favoritesSection.appendChild(createFoodCard(food));
  });
}

function renderMeal() {
  mealList.innerHTML = "";
  let totalCarbs = 0;

  meal.forEach((food, index) => {
    totalCarbs += food.totalCarbs;

    const div = document.createElement("div");
    div.className = "meal-item";

    div.innerHTML = `
      ${food.quantity} × ${food.item} = ${food.totalCarbs}g carbs
      <button onclick="removeFromMeal(${index})">Remove</button>
    `;

    mealList.appendChild(div);
  });

  totalCarbsElement.textContent = totalCarbs;
  updateInsulinCalculation();
}

function removeFromMeal(index) {
  meal.splice(index, 1);
  renderMeal();
}

function saveCurrentMeal() {
  if (meal.length === 0) {
    alert("Add items before saving a meal.");
    return;
  }

  const mealName = prompt("Name this meal:");

  if (!mealName) return;

  savedMeals.push({
    name: mealName,
    items: meal
  });

  localStorage.setItem("savedMeals", JSON.stringify(savedMeals));
  renderSavedMeals();
}

function renderSavedMeals() {
  savedMealsSection.innerHTML = `
    <h2>Saved Meals</h2>
    <button onclick="saveCurrentMeal()">Save Current Meal</button>
  `;

  if (savedMeals.length === 0) {
    savedMealsSection.innerHTML += "<p>No saved meals yet.</p>";
    return;
  }

  savedMeals.forEach((savedMeal, index) => {
    const div = document.createElement("div");
    div.className = "meal-item";

    const total = savedMeal.items.reduce((sum, item) => sum + item.totalCarbs, 0);

    div.innerHTML = `
      <strong>${savedMeal.name}</strong> - ${total}g carbs
      <button onclick="loadSavedMeal(${index})">Load</button>
      <button onclick="deleteSavedMeal(${index})">Delete</button>
    `;

    savedMealsSection.appendChild(div);
  });
}

function loadSavedMeal(index) {
  meal = [...savedMeals[index].items];
  renderMeal();
}

function deleteSavedMeal(index) {
  savedMeals.splice(index, 1);
  localStorage.setItem("savedMeals", JSON.stringify(savedMeals));
  renderSavedMeals();
}

function updateInsulinCalculation() {
  const totalCarbs = Number(totalCarbsElement.textContent);
  const ratio = Number(ratioInput.value);

  doseCarbs.textContent = totalCarbs;
  doseRatio.textContent = ratio || 0;

  if (!ratio || ratio <= 0) {
    insulinResult.textContent = "0";
    return;
  }

  insulinResult.textContent = (totalCarbs / ratio).toFixed(1);
}