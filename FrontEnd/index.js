let projects = []; // Variable globale pour stocker les projets

// Fonction pour récupérer les projets
async function getWorks() {
  try {
    let response = await fetch("http://localhost:5678/api/works");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    projects = await response.json();
    displayProjects(projects); 
    console.log("data", JSON.stringify(projects));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
getWorks();

// Fonction pour afficher les projets dans la galerie
function displayProjects(projects) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; 

  projects.forEach((project) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");

    img.src = project.imageUrl;
    figcaption.textContent = project.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);

    // Ajouter une classe avec l'ID de la catégorie pour le filtrage
    figure.classList.add(`category-${project.categoryId}`);
  });
}

// Fonction pour récupérer les catégories
async function getCategories() {
  try {
    let response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) {
      throw new Error(`Erreur HTTP ! Status: ${response.status}`);
    }
    const categoriesData = await response.json();
    return categoriesData;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
}

// Fonction pour afficher le menu des catégories
async function displayCategoriesMenu() {
  const categoriesData = await getCategories();
  const categoriesMenu = document.querySelector(".all-filters");

  if (!categoriesMenu) {
    console.error("Le conteneur du menu de filtres n'a pas été trouvé.");
    return;
  }

  if (categoriesData.length === 0) {
    console.error("Aucune catégorie disponible.");
    return;
  }

  // Ajout du bouton "Tous" pour afficher tous les projets
  const allButton = document.createElement("button");
  allButton.textContent = "Tous";
  allButton.dataset.categoryId = "all";
  categoriesMenu.appendChild(allButton);

  categoriesData.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    button.dataset.categoryId = category.id;
    categoriesMenu.appendChild(button);
  });

  categoriesMenu.addEventListener("click", filterProjects);
}

// Fonction de filtrage des projets
function filterProjects(event) {
  if (event.target.tagName !== "BUTTON") return;

  const selectedCategoryId = event.target.dataset.categoryId;

  if (selectedCategoryId === "all") {
    displayProjects(projects); 
  } else {
    const filteredProjects = projects.filter(
      (project) => project.categoryId == selectedCategoryId
    );
    displayProjects(filteredProjects); 
  }
}

document.addEventListener("DOMContentLoaded", () => {
  displayCategoriesMenu();
});

document.addEventListener("DOMContentLoaded", function () {
  // Vérifie la présence du token et de l'userId dans le localStorage
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (token && userId) {
    // Active le mode administrateur en modifiant l'apparence de la page

    document.querySelector("body").classList.add("connected");
    document.getElementById("visiteur").style.display = "none";
    document.getElementById("deconnecter").style.display = "inline";
    document.getElementById("top-bar").style.display = "flex"
    document.querySelector(".all-filters").style.display = "none";
  }
});

// Événement pour le clic sur le bouton de déconnexion
document
  .getElementById("deconnecter")
  .addEventListener("click", function (event) {
    event.preventDefault();

    // Suppression des informations de connexion du localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    // Mise à jour de l'apparence de la page après la déconnexion
    document.querySelector("body").classList.remove("connected");
    document.getElementById("visiteur").style.display = "inline"; 
    document.getElementById("deconnecter").style.display = "none"; 
    document.getElementById("update-works").style.display = "none";
    document.getElementById("top-bar").style.display = "none";
    // Réaffichage des filtres
    const filters = document.querySelector(".all-filters");
    if (filters) {
      filters.style.display = "flex"; 
    }

    // Réinitialiser le padding inférieur de l'espace réservé à l'admin
    const space = document.getElementById("space-only-admin");
    if (space) {
      space.style.paddingBottom = "0";
    }

    // Réinitialiser la marge supérieure de l'introduction
    const introduction = document.getElementById(
      "space-introduction-in-mode-admin"
    );
    if (introduction) {
      introduction.style.marginTop = "0";
    }

    // Redirection vers la page d'accueil ou toute autre page souhaitée
    location.href = "index.html";
  });

// Fonctions de récupération
async function fetchWorks() {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    return response.ok ? response.json() : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function fetchCategories() {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    return response.ok ? response.json() : [];
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function deleteWork(id) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    handleResponse(response, id);
  } catch (err) {
    console.log(err);
  }
}

// Fonctions de gestion de la modale
function openModal() {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-works").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-works").style.display = "none";
  document.getElementById("modal-edit").style.display = "none";
  resetModalForm();
}

function resetModalForm() {
  const preview = document.getElementById("form-image-preview");
  if (preview) preview.remove();
  document.getElementById("modal-edit-work-form").reset();
  ["photo-add-icon", "new-image", "photo-size"].forEach((id) => {
    document.getElementById(id).style.display = "block";
  });
  document.getElementById("modal-edit-new-photo").style.padding =
    "30px 0 19px 0";
  document.getElementById("submit-new-work").style.backgroundColor = "#A7A7A7";
}

function handleTrashIconClick(event, workId) {
  event.preventDefault();
  if (confirm("Voulez-vous supprimer cet élément ?")) {
    deleteWork(workId);
  }
}

function createFigure(work) {
  const figure = document.createElement("figure");
  figure.className = `work-item category-id-0 category-id-${work.categoryId}`;
  figure.id = `work-item-popup-${work.id}`;

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;
  figure.appendChild(img);

  const trashIcon = document.createElement("i");
  trashIcon.classList.add("fa-solid", "fa-trash-can", "trash");
  trashIcon.addEventListener("click", (event) =>
    handleTrashIconClick(event, work.id)
  );
  figure.appendChild(trashIcon);

  document.querySelector("div.modal-content").appendChild(figure);
}

function renderWorks() {
  document.querySelector("#modal-works .modal-content").innerText = "";
  fetchWorks().then((works) => works.forEach(createFigure));
}

function openSecondModalWindow() {
  document.getElementById("modal-works").style.display = "none";
  document.getElementById("modal-edit").style.display = "block";
  populateCategories(); 
}

// Remplir les catégories dans le formulaire
async function populateCategories() {
  const categorySelect = document.getElementById("form-category");
  categorySelect.innerHTML = ""; 
  const categories = await fetchCategories();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// Écouteurs d'événements
document.getElementById("update-works").addEventListener("click", (event) => {
  event.preventDefault();
  renderWorks();
  openModal();
});

["modal-works", "modal-edit"].forEach((modalId) => {
  document.getElementById(modalId).addEventListener("click", (event) =>
    event.stopPropagation()
  );
});

document.getElementById("modal").addEventListener("click", (event) => {
  event.preventDefault();
  closeModal();
});

document.getElementById("button-to-close-first-window").addEventListener(
  "click",
  (event) => {
    event.preventDefault();
    closeModal();
  }
);

document.getElementById("button-to-close-second-window").addEventListener(
  "click",
  (event) => {
    event.preventDefault();
    closeModal();
  }
);

document.getElementById("modal-edit-add").addEventListener("click", (event) => {
  event.preventDefault();
  openSecondModalWindow();
});

document.getElementById("arrow-return").addEventListener("click", (event) => {
  event.preventDefault();
  resetModalForm();
  document.getElementById("modal-works").style.display = "block";
  document.getElementById("modal-edit").style.display = "none";
});

// Validation de la taille de l'image et aperçu
document.getElementById("form-image").addEventListener("change", () => {
  const fileInput = document.getElementById("form-image");
  const maxFileSize = 4 * 1024 * 1024;

  if (fileInput.files[0].size > maxFileSize) {
    alert("Le fichier sélectionné est trop volumineux. La taille maximale est de 4 Mo.");
    fileInput.value = "";
  } else {
    const preview = document.createElement("img");
    preview.id = "form-image-preview";
    preview.src = URL.createObjectURL(fileInput.files[0]);
    preview.style.cssText = "display:block; height:169px;";
    document.getElementById("modal-edit-new-photo").appendChild(preview);
    ["photo-add-icon", "new-image", "photo-size"].forEach((id) => {
      document.getElementById(id).style.display = "none";
    });
    document.getElementById("modal-edit-new-photo").style.padding = "0";
  }
});

// Validation du formulaire
function checkNewProjectFields() {
  const title = document.getElementById("form-title").value.trim();
  const category = document.getElementById("form-category").value.trim();
  const image = document.getElementById("form-image").files.length;

  document.getElementById("submit-new-work").style.backgroundColor =
    title && category && image ? "#1D6154" : "#A7A7A7";
}

["form-title", "form-category", "form-image"].forEach((id) => {
  document.getElementById(id).addEventListener("input", checkNewProjectFields);
});