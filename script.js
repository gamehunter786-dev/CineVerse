import { initializeApp } from
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGIr1zZ_yRV_GZn_C84BIRXhXqFYeKHFo",
  authDomain: "e-commerce-a5510.firebaseapp.com",
  projectId: "e-commerce-a5510",
  storageBucket: "e-commerce-a5510.firebasestorage.app",
  messagingSenderId: "472698943089",
  appId: "1:472698943089:web:6bc21b0522d8ae41ee8dd0"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const movies = [
const movies = [
  {
    id: 1,
    title: "Dune: Part Two",
    year: 2024,
    genre: "Sci-Fi",
    rating: "8.5",
    image: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    glow: "#e7a64e",
    youtubeId: "pAnGwRiQ4-4"
  },
  {
    id: 2,
    title: "Spider-Man: Across the Spider-Verse",
    year: 2023,
    genre: "Animation",
    rating: "8.6",
    image: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    glow: "#df3f5c",
    youtubeId: "U_LlX4t0A9I"
  }
];

];
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORE = {users:"cineverse_users_v1", session:"cineverse_session_v1", watchlist:"cineverse_watchlist_v1"};
let activeFilter = "All", searchTerm = "", authMode = "login", toastTimer;
function readJSON(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function session(){return readJSON(STORE.session,null)}
function currentWatchlist(){const s=session();return s?readJSON(STORE.watchlist,{})[s.email]||[]:[]}
function notify(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2600)}
function safeText(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function getCloudWatchlist(user) {
  if (!user) return [];

  const snap = await getDoc(doc(db, "users", user.uid));

  return snap.exists()
    ? snap.data().watchlist || []
    : [];
}

async function saveCloudWatchlist(user, ids) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  await setDoc(
    doc(db, "users", user.uid),
    {
      email: user.email,
      watchlist: ids
    },
    { merge: true }
  );
}
async function renderMovies() {
  const list = movies.filter(m =>
    (activeFilter === "All" || m.genre === activeFilter) &&
    `${m.title} ${m.genre} ${m.year}`
      .toLowerCase()
      .includes(searchTerm)
  );

  let saved = [];

  try {
    saved = await getCloudWatchlist(auth.currentUser);
  } catch (error) {
    console.error("Watchlist error:", error);
  }

  $("#movieGrid").innerHTML = list.map((m, i) => `
    <article class="movie-card"
      data-movie-id="${m.id}"
      style="animation-delay:${Math.min(i * 45, 300)}ms">

      <div class="movie-poster">
        <div class="movie-poster-fallback"
          style="--glow:${m.glow}">
          <span>${safeText(m.title)}</span>
        </div>

        <img
          src="${m.image}"
          alt="${safeText(m.title)} poster"
          loading="lazy"
          onerror="this.style.display='none'">

        <div class="movie-rating">
          <span>★</span>${m.rating}
        </div>

        <button
          class="watch-btn ${saved.includes(m.id) ? "saved" : ""}"
          data-save="${m.id}"
          aria-label="Toggle watchlist">
          ${saved.includes(m.id) ? "✓" : "+"}
        </button>
      </div>

      <div class="movie-info">
        <div class="movie-title-line">
          <h3 class="movie-title">${safeText(m.title)}</h3>
          <span class="movie-year">${m.year}</span>
        </div>

        <div class="movie-meta">
          <span>${safeText(m.genre)}</span>
          <i class="genre-dot"></i>
          <span>Movie</span>
        </div>
      </div>
    </article>
  `).join("");

  $("#emptyState").hidden = list.length > 0;
}
function saveWatchlist(email,ids){const all=readJSON(STORE.watchlist,{});all[email]=ids;localStorage.setItem(STORE.watchlist,JSON.stringify(all))}
function openAuth(mode="login"){authMode=mode;$("#authModal").hidden=false;document.body.style.overflow="hidden";setAuthMode(mode);setTimeout(()=>$("#authEmail").focus(),50)}
function closeAuth(){$("#authModal").hidden=true;document.body.style.overflow=""}
function setAuthMode(mode){authMode=mode;$$(".auth-tab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));$("#authTitle").textContent=mode==="login"?"Your movie world awaits.":"Join the movie club.";$("#authSubmit").innerHTML=mode==="login"?"Sign in <span>↗</span>":"Create account <span>↗</span>";$("#authPassword").autocomplete=mode==="login"?"current-password":"new-password";$("#authMessage").textContent="";$("#authMessage").classList.remove("error")}
function updateAccountButton(){const s=session();$("#openAuth").textContent=s?(s.email.slice(0,1).toUpperCase()):"👤";$("#openAuth").title=s?`Signed in as ${s.email} — click to sign out`:"Sign in";$("#watchlistSignIn").textContent=s?"Sign out":"Create your free account";renderMovies()}
$("#movieGrid").addEventListener("click",e=>{const b=e.target.closest("[data-save]");if(!b)return;const s=session();if(!s){notify("Sign in to save your watchlist.");openAuth("login");return}const id=Number(b.dataset.save),ids=currentWatchlist();saveWatchlist(s.email,ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);renderMovies();notify(ids.includes(id)?"Removed from your watchlist.":"Added to your watchlist!")});
$("#filterRow").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;$$(".filter-chip").forEach(x=>x.classList.toggle("selected",x===b));renderMovies()});
$("#searchInput").addEventListener("input",e=>{searchTerm=e.target.value.trim().toLowerCase();renderMovies()});
$("#searchInput").addEventListener("focus",()=>$(".search-box").classList.add("open"));
document.addEventListener("click",e=>{if(!e.target.closest(".search-box"))$(".search-box").classList.remove("open")});
$("#openAuth").addEventListener("click",()=>{if(session()){if(confirm("Sign out of CineVerse?")){localStorage.removeItem(STORE.session);updateAccountButton();notify("You have signed out.")}}else openAuth("login")});
$("#watchlistSignIn").addEventListener("click",()=>session()?($("#openAuth").click()):openAuth("signup"));
$("#closeAuth").addEventListener("click",closeAuth);
$("#authModal").addEventListener("click",e=>{if(e.target===$("#authModal"))closeAuth()});
$$(".auth-tab").forEach(b=>b.addEventListener("click",()=>setAuthMode(b.dataset.mode)));
$("#authForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;
  const msg = $("#authMessage");

  msg.classList.remove("error");
  msg.textContent = "Please wait...";

  if (password.length < 6) {
    msg.textContent = "Password must be at least 6 characters.";
    msg.classList.add("error");
    return;
  }

  try {
    let credential;

    if (authMode === "signup") {
      credential = await createUserWithEmailAndPassword(
        auth, email, password
      );

      await setDoc(doc(db, "users", credential.user.uid), {
        email: credential.user.email,
        watchlist: [],
        createdAt: Date.now()
      });
    } else {
      credential = await signInWithEmailAndPassword(
        auth, email, password
      );
    }

    closeAuth();
    $("#authForm").reset();
    notify(authMode === "signup"
      ? "Account created successfully!"
      : "Welcome back!");

  } catch (error) {
    msg.textContent = error.code === "auth/email-already-in-use"
      ? "This email already has an account."
      : error.code === "auth/invalid-credential"
      ? "Email or password is incorrect."
      : error.message;

    msg.classList.add("error");
  }
});

onAuthStateChanged(auth, (user) => {
  $("#openAuth").textContent = user
    ? user.email.charAt(0).toUpperCase()
    : "👤";

  $("#openAuth").title = user
    ? `Signed in as ${user.email}`
    : "Sign in";

  $("#watchlistSignIn").textContent = user
    ? "Sign out"
    : "Create your free account";

  renderMovies();
});
$("#surpriseBtn").addEventListener("click",()=>{const pick=movies[Math.floor(Math.random()*movies.length)];activeFilter="All";searchTerm=pick.title.toLowerCase();$("#searchInput").value=pick.title;$$(".filter-chip").forEach(x=>x.classList.toggle("selected",x.dataset.filter==="All"));renderMovies();$("#trending").scrollIntoView({behavior:"smooth"});notify(`Tonight's pick: ${pick.title}`)});
$("#menuToggle").addEventListener("click",()=>{const nav=$(".desktop-nav");const opened=nav.style.display==="flex";nav.style.cssText=opened?"":"display:flex;position:absolute;top:69px;left:0;right:0;margin:0;padding:20px;background:#101522;border-bottom:1px solid var(--line);justify-content:center;z-index:25";if(!opened)$$(".nav-link",nav).forEach(a=>a.addEventListener("click",()=>{nav.style.display="none"},{once:true}))});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAuth();if(e.key==="/"&&document.activeElement.tagName!=="INPUT"&&document.activeElement.tagName!=="TEXTAREA"){e.preventDefault();$("#searchInput").focus()}});
renderMovies();updateAccountButton();
