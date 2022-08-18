import { createClient } from "@supabase/supabase-js";
//NEED TO create a loader screen or lock buttons when making api call /before resToJs

const SUPABASE_URL = "https://iznfbqrevlorsxyoaueo.supabase.co";
const SUPABASE_ANON_K = process.env.SUPABASEANON;
//const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_K);

const searchInput = document.querySelector("#cocktail-search");
const searchBtn = document.querySelector("#cocktail-search-btn");
const switchBtn = document.querySelectorAll(".switch-container");
const displaySec = document.querySelector("#result-display-container");
const favDisplaySec = document.querySelector("#fav-list-container");
const recpieDetail = document.querySelector("#recipe-display-container");
const favRecpieDetail = document.querySelector("#fav-recipe-display-container");
const listBtn = document.querySelector("#cocktail-list-btn");

const mainNavBtn = document.querySelector("#menu-icon");
const mainBackBtn = document.querySelector("#nav-back-btn");
const favBtn = document.querySelector("#nav-fav-btn");
const navUl = document.querySelectorAll(".nav-ul");

//const supabaseBtn = document.querySelector("#supbase-test");
const signupBtn = document.querySelector("#supbase-signup");
const signinBtn = document.querySelector("#supbase-signin");
const usernameInput = document.querySelector("#username-input");
const passwdInput = document.querySelector("#passwd-input");
//const setFav = document.querySelector('#supbase-fav');
let breadcrumbs = [];

function switchClick(e) {
  e.preventDefault();
  const switchBtn = e.target;
  const targetSwitch = e.target.dataset.switchid;
  const switchStatus = e.target.dataset.switchstatus;

  if (!switchBtn.classList.contains("active")) {
    const allSwitchBtn = document.querySelectorAll(
      `button[data-switchid='${targetSwitch}']`
    );
    const switchBg = document.querySelector(
      `div.btn-bg[data-switchid='${targetSwitch}']`
    );
    allSwitchBtn.forEach((e) => {
      e.classList.remove("active");
    });
    switchBtn.classList.add("active");
    switchBg.classList.remove("switch-on");
    switchBg.classList.remove("switch-off");
    switchBtn.dataset.switchstatus === "on"
      ? switchBg.classList.add("switch-on")
      : switchBg.classList.add("switch-off");
  }
}

// Get Ingredient out of the list into an Array
function getIngredient(data) {
  let ingredient = [];
  let i = 1,
    y,
    z;
  do {
    y = "strIngredient" + i;
    z = "strMeasure" + i;
    const ingredientObj = { name: "", amount: "" };
    ingredientObj.name = data.drinks[0][y];
    ingredientObj.amount = data.drinks[0][z];
    ingredientObj.name === null || ingredientObj.name === undefined
      ? true
      : ingredient.push(ingredientObj);
    i++;
  } while (data.drinks[0][y] !== undefined && data.drinks[0][y] !== null);
  return ingredient;
}

function clearResultDisplay() {
  document.querySelector("#fav-list-container").innerHTML = "";
  displaySec.innerHTML = "";
}

function displayResult(data) {
  let navDest =
    mainBackBtn.dataset.pageValue === "page-search"
      ? "page-recipe-detail"
      : "page-fav-recipe-detail";
  let html = `<div class="large-6 medium-12 small-12 cell text-left result-item has-page" data-nav-dest="${navDest}" data-cocktail-id="${data.idDrink}">
        <div class="has-page" data-nav-dest="${navDest}">
            <h4 class="has-page" data-nav-dest="${navDest}" data-cocktail-id="${data.idDrink}">${data.strDrink}</h4>
        </div>
    </div>`;
  if (mainBackBtn.dataset.pageValue === "page-search") {
    displaySec.innerHTML += html;
  } else {
    document.querySelector("#fav-list-container").innerHTML += html;
  }
}
function displayRecipe(data, ingredient, fav) {
  const topNav = document.querySelector("#nav-back-container");
  let html = `<div class="large-7 medium-12 small-12 cell text-left cocktail-recipe-db">
        <div class="grid-x align-left">
            <div class="large-12 medium-12 small-12 cell text-left">
                <h1 data-cocktail-id="${data.idDrink}">${data.strDrink}</h1>
            </div>`;
  for (let i = 0; i < ingredient.length; i++) {
    html += `<div class="large-6 medium-7 small-8 cell text-left">
                <h4>${ingredient[i].name}</h4>
            </div>
            <div class="large-6 medium-5 small-4 cell text-left">
                <h4>${
                  ingredient[i].amount === null ? "" : ingredient[i].amount
                }</h4>
            </div>`;
  }
  html += `<div class="large-12 medium-12 small-12 cell text-left">
                <h4 class="method">[Method] ${data.strInstructions}</h4>
            </div>
            <div class="large-12 medium-12 small-12 cell text-left">
                <h4 class="method drinkware">[Drinkware] ${data.strGlass}</h4>
            </div>
        </div>
    </div>`;
  if (mainBackBtn.dataset.pageValue === "page-favorite") {
    html += `<div class="large-5 medium-12 small-12 cell text-left cocktail-recipe-note">
            <div class="grid-x align-left">
                <div class="large-12 medium-12 small-12 cell text-left">
                    <h4>Note:</h4>
                </div>
                <div class="large-12 medium-12 small-12 cell text-left">
                    <textarea id="fav-cocktail-note" name="fav-cocktail-note" style="min-width:100%; height: 100%;" data-recipe-id="${data.idDrink}"></textarea>
                </div>
            </div>
        </div>`;
    getFavNote(data.idDrink);
  }

  //recpieDetail.innerHTML += html; //
  if (mainBackBtn.dataset.pageValue === "page-favorite") {
    favRecpieDetail.innerHTML += html;
  } else {
    recpieDetail.innerHTML += html;
  }
  favBtn.dataset.recipeId = `${data.idDrink}`;
  favConfirm();
  favBtn.classList.contains("hide") ? favBtn.classList.remove("hide") : false;
}

function getRecipe(data) {
  data.drinks.forEach((e) => {
    displayResult(e);
  });
}
function resToJs(res) {
  return res.json();
}
function apiCall(e) {
  e.preventDefault();
  const baseUrl = "https://thecocktaildb.com/api/json/v1/1/";
  let path, par;
  const searchBy = document.querySelector(
    'button.active[data-switchid="search-type"]'
  ).dataset.searchby;
  switch (searchBy) {
    case "name":
      path = "search.php";
      par = "?s=";
      break;
    case "ingredient":
      path = "filter.php";
      par = "?i=";
      break;
  }
  par += searchInput.value.replace(/ /g, "_").toLowerCase();
  const endpoint = baseUrl + path + par;
  clearResultDisplay();
  fetch(endpoint).then(resToJs).then(getRecipe).catch(handleErr);
  mainBackBtn.dataset.pageValue = "page-search";
  navForward(e);
}
function handleErr(err) {
  let navDest =
    mainBackBtn.dataset.pageValue === "page-search"
      ? "page-recipe-detail"
      : "page-fav-recipe-detail";
  let html = `<div class="large-12 medium-12 small-12 cell text-right">
      <div class="has-page" data-nav-dest="">
          <h4 class="">No matching result found.</h4>
      </div>
  </div>`;
  if (mainBackBtn.dataset.pageValue === "page-search") {
    displaySec.innerHTML += html;
  } else {
    document.querySelector("#fav-list-container").innerHTML += html;
  }
}
function apiCallRecpieById(e) {
  const ingredient = getIngredient(e);
  recpieDetail.innerHTML = "";
  favRecpieDetail.innerHTML = "";
  mainBackBtn.dataset.pageRecipe = "on";
  displayRecipe(e.drinks[0], ingredient);
}
function getRecipeDetail(e) {
  const cid = e.target.dataset.cocktailId;
  const endpoint =
    "https://thecocktaildb.com/api/json/v1/1/lookup.php?i=" + cid;
  fetch(endpoint).then(resToJs).then(apiCallRecpieById);
  navForward(e);
}
function listCocktail(e) {
  e.preventDefault();
  const endpoint = "https://thecocktaildb.com/api/json/v1/1/random.php";
  clearResultDisplay();
  fetch(endpoint).then(resToJs).then(getRecipe);
  mainBackBtn.dataset.pageValue = "page-search";
  navForward(e);
}
function getRecipeById(cid) {
  const endpoint =
    "https://thecocktaildb.com/api/json/v1/1/lookup.php?i=" + cid;
  /*   clearResultDisplay(); */
  fetch(endpoint).then(resToJs).then(favListDisplay);
}
function favListDisplay(data) {
  data.drinks.forEach(displayResult);
  //navForward(); ////////////
}

async function favConfirm() {
  const user = supabase.auth.user();
  const recipeId = favBtn.dataset.recipeId;
  const userId = user.id;
  let { data: fav, error } = await supabase
    .from("fav")
    .select("*")
    .eq("recipe_id", recipeId)
    .eq("user_id", userId);
  if (fav.length >= 1) {
    favBtn.classList.contains("btn-activate")
      ? true
      : favBtn.classList.add("btn-activate");
  } else {
    favBtn.classList.contains("btn-activate")
      ? favBtn.classList.remove("btn-activate")
      : false;
  }
}
async function fav(e) {
  e.preventDefault();
  const user = supabase.auth.user();
  const recipeId = e.target.dataset.recipeId;
  const userId = user.id;
  let { data: fav, error } = await supabase
    .from("fav")
    .select("*")
    .eq("recipe_id", recipeId)
    .eq("user_id", userId);
  if (fav.length >= 1) {
    console.log("Already in the Favorite List.");
  } else {
    const { data, error } = await supabase
      .from("fav")
      .insert([{ recipe_id: recipeId, user_id: userId, note: "" }]);
  }
}
async function getFavNote(recipeId) {
  const user = supabase.auth.user();
  //const recipeId = e.target.dataset.recipeId;
  const userId = user.id;
  let { data: fav, error } = await supabase
    .from("fav")
    .select("*")
    .eq("recipe_id", recipeId)
    .eq("user_id", userId);
  const favNote = document.querySelector("#fav-cocktail-note");
  favNote.addEventListener("change", addFavNote);
  if (fav[0].note === null || fav[0].note === undefined) {
    document.querySelector("#fav-cocktail-note").innerHTML +=
      "Add your notes here.";
  } else {
    document.querySelector("#fav-cocktail-note").innerHTML += fav[0].note;
  }
}
async function addFavNote(e) {
  e.preventDefault();
  const user = supabase.auth.user();
  const recipeId = e.target.dataset.recipeId;
  const userId = user.id;
  let { data, error } = await supabase
    .from("fav")
    .update({ note: `${e.target.value}` })
    .eq("recipe_id", recipeId)
    .eq("user_id", userId);
}
async function myFav(e) {
  e.preventDefault();
  const user = supabase.auth.user();
  const userId = user.id;
  mainBackBtn.dataset.pageValue = "page-favorite";
  let { data: fav, error } = await supabase
    .from("fav")
    .select("*")
    .eq("user_id", userId);
  fav.forEach((favE) => {
    getRecipeById(favE.recipe_id);
  });
}
/******************* SUPABASE START *****************************/

async function supaSignIn(e) {
  e.preventDefault();
  const { user, session, error } = await supabase.auth.signIn({
    email: `${usernameInput.value}`,
    password: `${passwdInput.value}`,
  });
  if (session) {
    document.querySelector(`#page-login`).classList.add("hide");
    document.querySelector(`#menu-icon`).classList.remove("hide");
  }
  if (error) {
    console.log("error");
  }
}
async function supaSignUp(e) {
  e.preventDefault();
  const { user, session, error } = await supabase.auth.signUp({
    email: `${usernameInput.value}`,
    password: `${passwdInput.value}`,
  });
  supaSignIn(e);
}

async function sessionCheck() {
  const user = supabase.auth.user();
  if (user.aud === "authenticated") {
    document.querySelector(`#page-login`).classList.contains("hide")
      ? true
      : document.querySelector(`#page-login`).classList.add("hide");
    document.querySelector(`#menu-icon`).classList.contains("hide")
      ? document.querySelector(`#menu-icon`).classList.remove("hide")
      : false;
  } else {
    document.querySelector(`#page-login`).classList.contains("hide")
      ? document.querySelector(`#page-login`).classList.remove("hide")
      : false;
    document.querySelector(`#menu-icon`).classList.contains("hide")
      ? true
      : document.querySelector(`#menu-icon`).classList.add("hide");
  }
}
sessionCheck();

/******************* SUPABASE END *****************************/

searchBtn.addEventListener("click", apiCall);
listBtn.addEventListener("click", listCocktail);
signinBtn.addEventListener("click", supaSignIn);
signupBtn.addEventListener("click", supaSignUp);
switchBtn.forEach((e) => {
  e.addEventListener("click", switchClick);
});
//setFav.addEventListener("click", favRecipe);

function navForward(event) {
  //Breadcrumbs
  if (event.target.dataset.navDest === "") {
    breadcrumbs.push("0");
  } else {
    breadcrumbs.push(event.target.dataset.navDest);
  }
  let current = breadcrumbs.length;
  //console.log(breadcrumbs);
  //console.log(event.target);

  //refresh menu
  if (current > 0) {
    mainBackBtn.classList.contains("hide")
      ? mainBackBtn.classList.remove("hide")
      : false;
  }
  document.querySelectorAll(`.nav-ul.nav-level-${current - 1}`).forEach((e) => {
    e.classList.contains("hide") ? true : e.classList.add("hide");
  });
  document.querySelectorAll(`.nav-ul.nav-level-${current}`).forEach((e) => {
    e.classList.contains("hide") ? e.classList.remove("hide") : false;
  });

  //refresh page
  if (event.target.classList.contains("has-page")) {
    let dest = breadcrumbs.length - 1;
    document
      .querySelector(`#${event.target.dataset.navDest}`)
      .classList.remove("hide");
    if (breadcrumbs[dest - 1] !== "0" && breadcrumbs[dest - 1] !== 0) {
      document.querySelector(`#${breadcrumbs[dest - 1]}`).classList.add("hide");
    }
    if (event.target.dataset.navDest === "page-favorite") {
      clearResultDisplay();
      myFav(event);
    }
  }
}

function navBackward(event) {
  let current = breadcrumbs.length;

  //refresh menu
  favBtn.classList.contains("hide") ? true : favBtn.classList.add("hide");
  if (current - 1 <= 0) {
    mainBackBtn.classList.contains("hide")
      ? true
      : mainBackBtn.classList.add("hide");
  }
  document.querySelectorAll(`.nav-ul.nav-level-${current}`).forEach((e) => {
    e.classList.contains("hide") ? true : e.classList.add("hide");
  });
  document.querySelectorAll(`.nav-ul.nav-level-${current - 1}`).forEach((e) => {
    e.classList.contains("hide") ? e.classList.remove("hide") : false;
  });

  //refresh page
  if (breadcrumbs[current - 1] !== "0" && breadcrumbs[current - 1] !== 0) {
    document
      .querySelector(`#${breadcrumbs[current - 1]}`)
      .classList.add("hide");
  }
  if (current - 1 > 0) {
    breadcrumbs.splice(current - 1, 1);
    current = breadcrumbs.length;
    if (breadcrumbs[current - 1] !== "0" && breadcrumbs[current - 1] !== 0) {
      document
        .querySelector(`#${breadcrumbs[current - 1]}`)
        .classList.remove("hide");
    }
  } else breadcrumbs = [];
  //console.log(breadcrumbs);
}

mainNavBtn.addEventListener("click", navForward);
mainBackBtn.addEventListener("click", navBackward);
navUl.forEach((e) => {
  e.addEventListener("click", navForward);
});
displaySec.addEventListener("click", getRecipeDetail);
favDisplaySec.addEventListener("click", getRecipeDetail);
favBtn.addEventListener("click", fav);
