let foods = [
  {
    restaurant: "Chick-fil-A",
    item: "3 Count Tenders",
    carbs: 11
  },
  {
    restaurant: "Chick-fil-A",
    item: "Medium Fries",
    carbs: 45
  },
  {
    restaurant: "McDonald's",
    item: "Big Mac",
    carbs: 46
  },
  {
    restaurant: "McDonald's",
    item: "Large Fries",
    carbs: 66
  },
  {
    restaurant: "Taco Bell",
    item: "Crunchwrap Supreme",
    carbs: 71
  },
  {
    restaurant: "Dunkin'",
    item: "Bacon Egg and Cheese English Muffin",
    carbs: 34
  }
];

let meal = [];

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();

  foodResults.innerHTML = "";

  const filteredFoods = foods.filter(food =>
    food.item.toLowerCase().includes(searchTerm)
  );

  filteredFoods.forEach(food => {
    const div = document.createElement("div");
    div.className = "food-item";

    div.innerHTML = `
      <strong>${food.item}</strong><br>
      ${food.restaurant}<br>
      ${food.carbs}g carbs
      <button>Add</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      meal.push(food);
      renderMeal();
    });

    foodResults.appendChild(div);
  });
});

function renderMeal() {
  mealList.innerHTML = "";

  let totalCarbs = 0;

  meal.forEach(food => {
    totalCarbs += food.carbs;

    const div = document.createElement("div");
    div.className = "meal-item";

    div.textContent = `${food.item} - ${food.carbs}g carbs`;

    mealList.appendChild(div);
  });

  totalCarbsElement.textContent = totalCarbs;
}

calculateBtn.addEventListener("click", () => {
  const totalCarbs = Number(totalCarbsElement.textContent);
  const ratio = Number(ratioInput.value);

  if (!ratio || ratio <= 0) {
    alert("Please enter a valid insulin ratio.");
    return;
  }

  const units = (totalCarbs / ratio).toFixed(1);

  insulinResult.textContent = units;
});