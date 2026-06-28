const root = document.documentElement;

const toggleLightBtn = document.getElementById("theme-light");
const toggleDarkBtn = document.getElementById("theme-dark");
const toggleSystemBtn = document.getElementById("theme-system");


const deck = document.querySelector(".deck");
let cards = [];

const sidebar = document.querySelector(".sidebar");

const quotes =  [
  "Every website starts with a single idea.",
  "Curiosity is what turned me from a user into a developer.",
  "I learn to build, and I build to learn.",
  "Every bug is another lesson.",
  "As long as we are still breathing, we are learning.",
  "Learning never stops.",
  "Patience is key.",
  "Every great project starts with a simple question.",
  "Never stop building.",
  "Every line of code is another step forward.",
  "Learning today, build tomorrow.",
  "Every expert was once a beginner.",
  "Stay curious. Keep exploring.",
  "The journey matters as much as the destination.",
  "Create something today that didn't exist yesterday."
];

const toggleGlowEffectBtn = document.getElementById("toggle-glow-effect-btn");

const savedTheme = localStorage.getItem("theme") || "system";


// Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
            .then((registration) => console.log('Service Worker registered: ', registration.scope))
            .catch((registrationError) => console.log('Service Worker registration failed: ', registrationError));
    });
}

// Quotes
function randomQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById("quote").textContent = quote;
}

randomQuote();


// LOADS GITHUB REPO
async function loadRepos() {
    try {
        const response = await fetch(
          "https://api.github.com/users/DawnFallz/repos?per_page=100&sort=updated", {cache: "no-store"});

        const repos = await response.json();

        if (!response.ok) {
            throw new Error(repos.message || "GitHub API error");
        }
        if (!Array.isArray(repos)) {
            throw new Error("Invalid GitHub response");
        }

        deck.innerHTML = "<p>Loading repos...</p>";
        cards = [];
        const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f7b731", "#a29bfe", "#00b894"];

        repos.forEach((repo, i) => {
            if (repo.fork) return;

            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
                <h3 style="margin: 0; border: 2px solid dodgerblue; border-radius: 15px; text-align: center;">
                    <a href="${repo.html_url}" target="_blank" style="color: white;">${repo.name}</a>

                </h3>
                <p style="margin: 10px; font-size: var(--card-font-size);">${repo.description || ""}</p>

               <p style="position: absolute; bottom: 100px; left: 0; margin: 5px; font-size: var(--card-font-size); ">Link: <a href="${repo.html_url}" target="_blank">${repo.html_url}</a></p>
                <table>
                    <tr>
                        <td>⭐ ${repo.stargazers_count}</td>
                        <td>🍴 ${repo.forks_count}</td>
                        <td>🌐 ${repo.language || "Not specified"}</td>
                    </tr>
                </table>
            `;

            card.style.background = colors[i % colors.length];
            deck.appendChild(card);
            cards.push(card);
        });

        updateCards();

    } catch (err) {
        console.error(err);
        deck.innerHTML = `<p>Error: ${err.message}</p>`;
    }
}

loadRepos();



// CHANGES THEME
applyTheme(savedTheme);

toggleLightBtn.addEventListener("click", () => setTheme("light"));
toggleDarkBtn.addEventListener("click", () => setTheme("dark"));
toggleSystemBtn.addEventListener("click", () => setTheme("system"));

function setTheme(theme) {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    if (theme === "system") {
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
        root.setAttribute("data-theme", theme);
    }
}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (localStorage.getItem("theme") === "system") {
        applyTheme("system");
    }
});


// Age
document.getElementById("age").textContent = new Date().getFullYear() - 2012;


//  Logo
document.querySelector(".logo").onclick = () => window.open("/", "_self");


// Sidebar
const openSidebar = () => sidebar.classList.add("open");
const closeSidebar = () => sidebar.classList.remove("open");


// Toggle Glow Effect
toggleGlowEffectBtn.addEventListener("change", () => {
    document.body.classList.toggle("no-glow", !toggleGlowEffectBtn.checked);
});


// Cooldown
function cooldown(func, delay) {
    let isCooldown = false;

    return function (...args) {
        if (isCooldown) return;

        func.apply(this, args);

        isCooldown = true;

        setTimeout(() => {
            isCooldown = false;
        }, delay);
    };
}


// Cards in #Projects section
let isNext = false;
let isPrevious = false;

let index = 0;


document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") nextCard();
      if (e.key === "ArrowLeft") previousCard();
});

function updateCards() {
    cards.forEach((card, i) => {
        const position = i - index;

        card.style.position = "absolute";
        card.style.top = "50%";
        card.style.left = "50%";
        card.style.transition = "transform 1s ease, opacity 1s ease";
        card.style.transform = "translate(-50%, -50%)";

        if (position === 0) {
          card.style.transform = "translate(-50%, -50%) scale(1)";
          card.style.opacity = "1";
          card.style.filter = "brightness(100%)";
          card.style.zIndex = "10";
        } else if (position === 1) {
          card.style.transform = "translate(20%, -50%) scale(0.8)";
          card.style.opacity = "1";
          card.style.filter = "brightness(80%)";
          isNext ? card.style.zIndex = "5" : card.style.zIndex = "6";
        } else if (position === -1) {
          card.style.transform = "translate(-120%, -50%) scale(0.8)";
          card.style.opacity = "1";
          card.style.filter = "brightness(80%)";
          isPrevious ? card.style.zIndex = "5" : card.style.zIndex = "6";
        } else {
          card.style.transform = "translate(-50%, -50%) scale(0.5)";
          card.style.opacity = "1";
          card.style.zIndex = "1";
        }
    });
}

const nextCard = cooldown(function () {
    index = (index + 1) % cards.length;
    isNext = true;
    updateCards();
    isNext = false;
}, 500);

const previousCard = cooldown(function () {
    index = (index - 1 + cards.length) % cards.length;
    isPrevious = true;
    updateCards();
    isPrevious = false;
}, 500);

