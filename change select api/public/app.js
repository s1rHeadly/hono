const categorySelect = document.getElementById("categorySelect");
const itemSelect = document.getElementById("itemSelect");

async function loadCategories() {
  const res = await fetch("http://localhost:5000/api/categories");
  const data = await res.json();

  categorySelect.innerHTML = '<option value="">Select category</option>';

  data.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });
}

loadCategories();
