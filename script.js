// Dados base de filmes/séries/doramas/animes (exemplo)
const data = [
  {
    id: "stranger-things",
    title: "Stranger Things",
    image: "https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",
    description: "Um grupo de amigos enfrenta criaturas de outra dimensão na pequena cidade de Hawkins.",
    trailer: "https://www.youtube.com/embed/b9EkMc79ZSU?autoplay=1",
    music: "https://actions.google.com/sounds/v1/ambiences/city_traffic_1.ogg"
  },
  {
    id: "the-last-of-us",
    title: "The Last of Us",
    image: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
    description: "Uma aventura emocionante em um mundo pós-apocalíptico.",
    trailer: "https://www.youtube.com/embed/b6lpM05NV6E?autoplay=1",
    music: "https://actions.google.com/sounds/v1/ambiences/forest_rain.ogg"
  },
  {
    id: "round-6",
    title: "Round 6 (Squid Game)",
    image: "https://image.tmdb.org/t/p/w500/7vnGntD8fFgGcc2nlQi2fNjC36A.jpg",
    description: "Jogos mortais e uma crítica social intensa em uma competição pela vida.",
    trailer: "https://www.youtube.com/embed/oqxAJKy0ii4?autoplay=1",
    music: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  },
  {
    id: "duna",
    title: "Duna (Dune)",
    image: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    description: "Uma épica saga de ficção científica com desertos e política interplanetária.",
    trailer: "https://www.youtube.com/embed/8g18jFHCLXk?autoplay=1",
    music: "https://actions.google.com/sounds/v1/ambiences/desert_wind.ogg"
  },
  {
    id: "lupin",
    title: "Lupin",
    image: "https://image.tmdb.org/t/p/w500/7KVDx51xNi6wov6wvC4GJgfI1zB.jpg",
    description: "Um ladrão carismático inspirado em Arsène Lupin.",
    trailer: "https://www.youtube.com/embed/oygrmJFKYZY?autoplay=1",
    music: "https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg"
  }
];

// Referências DOM
const content = document.getElementById("content");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const trailer = document.getElementById("trailer");
const audio = document.getElementById("audio");
const starsContainer = document.getElementById("stars");
const commentInput = document.getElementById("commentInput");
const submitComment = document.getElementById("submitComment");
const commentsList = document.getElementById("commentsList");
const searchInput = document.getElementById("search");

let currentId = null;

// Função para salvar avaliação no localStorage
function saveRating(id, rating) {
  let ratings = JSON.parse(localStorage.getItem("ratings") || "{}");
  ratings[id] = rating;
  localStorage.setItem("ratings", JSON.stringify(ratings));
}

// Função para pegar avaliação salva
function getRating(id) {
  let ratings = JSON.parse(localStorage.getItem("ratings") || "{}");
  return ratings[id] || 0;
}

// Função para salvar comentários no localStorage
function saveComment(id, comment) {
  let comments = JSON.parse(localStorage.getItem("comments") || "{}");
  if (!comments[id]) comments[id] = [];
  comments[id].push({
    text: comment,
    date: new Date().toISOString()
  });
  localStorage.setItem("comments", JSON.stringify(comments));
}

// Função para obter comentários
function getComments(id) {
  let comments = JSON.parse(localStorage.getItem("comments") || "{}");
  return comments[id] || [];
}

// Renderiza lista de comentários na modal
function renderComments(id) {
  commentsList.innerHTML = "";
  const comments = getComments(id);
  if (comments.length === 0) {
    commentsList.innerHTML = `<p class="no-comments">Seja o primeiro a comentar!</p>`;
    return;
  }
  comments.forEach(c => {
    const div = document.createElement("div");
    div.classList.add("comment");
    div.innerHTML = `
      <p>${escapeHtml(c.text)}</p>
      <time datetime="${c.date}">${new Date(c.date).toLocaleString("pt-BR")}</time>
    `;
    commentsList.appendChild(div);
  });
}

// Função segura para evitar XSS em comentários
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Renderiza estrelas interativas de avaliação
function renderStars(rating = 0) {
  starsContainer.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.classList.add("star");
    star.setAttribute("role", "radio");
    star.setAttribute("tabindex", "0");
    star.setAttribute("aria-checked", i === rating ? "true" : "false");
    star.setAttribute("aria-label", `${i} estrela${i > 1 ? "s" : ""}`);
    star.innerHTML = i <= rating ? "&#9733;" : "&#9734;"; // preenchida ou vazia
    star.addEventListener("click", () => {
      saveRating(currentId, i);
      renderStars(i);
    });
    star.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        saveRating(currentId, i);
        renderStars(i);
      }
    });
    starsContainer.appendChild(star);
  }
}

// Renderiza os cards dos títulos na página
function renderCards(list) {
  content.innerHTML = "";
  if (list.length === 0) {
    content.innerHTML = `<p class="no-results">Nenhum título encontrado.</p>`;
    return;
  }
  list.forEach(item => {
    const card = document.createElement("article");
    card.classList.add("card");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Abrir detalhes de ${item.title}`);
    card.innerHTML = `
      <img src="${item.image}" alt="Capa de ${item.title}" loading="lazy" />
      <div class="card-content">
        <h3 class="card-title">${item.title}</h3>
        <p class="card-description">${item.description}</p>
      </div>
    `;
    card.addEventListener("click", () => openModal(item.id));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(item.id);
      }
    });
    content.appendChild(card);
  });
}

// Abre modal com dados do título selecionado
function openModal(id) {
  currentId = id;
  const item = data.find(d => d.id === id);
  if (!item) return;

  modalTitle.textContent = item.title;
  modalDescription.textContent = item.description;
  trailer.src = item.trailer;
  audio.src = item.music;
  audio.play().catch(() => {}); // tenta tocar (user gesture pode bloquear)

  renderStars(getRating(id));
  renderComments(id);

  commentInput.value = "";
  modal.setAttribute("aria-hidden", "false");
  modal.style.display = "flex";

  // Trava o foco dentro do modal
  trapFocus(modal);
}

// Fecha modal e para mídia
function closeModal() {
  modal.setAttribute("aria-hidden", "true");
  modal.style.display = "none";
  trailer.src = "";
  audio.pause();
  currentId = null;
  removeTrapFocus();
}

// Evento do botão fechar
