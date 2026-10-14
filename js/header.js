// Dropdown do header — compartilhado por todas as páginas
(function () {
  const btn  = document.getElementById("ddBtn");
  const menu = document.getElementById("ddMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.classList.toggle("open", open);
  });

  document.addEventListener("mousedown", (e) => {
    if (!document.getElementById("dd").contains(e.target)) {
      menu.classList.remove("open");
      btn.classList.remove("open");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menu.classList.remove("open");
      btn.classList.remove("open");
    }
  });
})();
