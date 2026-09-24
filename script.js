import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* ================================
   FIREBASE CONFIG
================================ */

const firebaseConfig = {

  apiKey:
    "AIzaSyC9xsw3cQ8-KReJEnmg-rHpsN68xCPnYz0",

  authDomain:
    "eveninig-star-fc.firebaseapp.com",

  projectId:
    "eveninig-star-fc",

  storageBucket:
    "eveninig-star-fc.firebasestorage.app",

  messagingSenderId:
    "992780020158",

  appId:
    "1:992780020158:web:9dd346b24e0eeb4a82f1ef",

  databaseURL:
    "https://eveninig-star-fc-default-rtdb.firebaseio.com"

};


/* ================================
   START FIREBASE
================================ */

const app =
  initializeApp(firebaseConfig);

const db =
  getDatabase(app);

const dataRef =
  ref(db, "efcData");


/* ================================
   SAFE HTML
================================ */

function escapeHTML(text){

  const div =
    document.createElement("div");

  div.textContent =
    text ?? "";

  return div.innerHTML;

}


/* ================================
   PLAYER PHOTOS
================================ */

function updatePlayerPhotos(data){

  const grid =
    document.querySelector(
      "#players .players-grid"
    );

  if(!grid) return;


  const cards =
    grid.querySelectorAll(
      ":scope > .player-card:not(.reserved)"
    );


  const photos =
    data.photos || {};


  for(let i = 0; i < 15; i++){

    const card =
      cards[i];

    if(!card) continue;


    const photo =
      photos[i + 1] ||
      photos[String(i + 1)] ||
      "";


    if(!photo) continue;


    const photoBox =
      card.querySelector(
        ".player-photo"
      );

    if(!photoBox) continue;


    let img =
      photoBox.querySelector("img");


    if(!img){

      img =
        document.createElement("img");

      img.alt =
        "Player " +
        String(i + 1).padStart(2,"0");

      photoBox.prepend(img);

    }


    img.src =
      photo;

    img.style.display =
      "block";


    img.onerror =
      function(){

        this.style.display =
          "none";

      };

  }

}


/* ================================
   UPDATE WEBSITE
================================ */

function updateWebsite(data){


  /* ==============================
     TOTAL PLAYERS
  ============================== */

  const total =
    document.getElementById(
      "totalPlayers"
    );


  if(total){

    total.textContent =
      data.totalPlayers ?? 15;

  }



  /* ==============================
     PLAYER PHOTOS
  ============================== */

  updatePlayerPhotos(data);



  /* ==============================
     MATCH NOTICE
  ============================== */

  const notice =
    document.getElementById(
      "matchNotice"
    );


  const noticeArea =
    document.getElementById(
      "noticeArea"
    );


  if(notice && noticeArea){

    if(
      data.matchNotice &&
      data.matchNotice.trim() !== ""
    ){

      notice.textContent =
        data.matchNotice;

      noticeArea.style.display =
        "block";

    }else{

      notice.textContent =
        "";

      noticeArea.style.display =
        "none";

    }

  }



  /* ==============================
     SUSPENDED PLAYERS
  ============================== */

  const suspendedGrid =
    document.getElementById(
      "suspendedPlayersGrid"
    );


  const suspendedCount =
    document.getElementById(
      "suspendedCount"
    );


  const suspendedSection =
    document.getElementById(
      "suspendedPlayers"
    );


  const rawSuspended =
    data.suspendedPlayers || [];


  const suspendedPlayers =
    Array.isArray(rawSuspended)
      ? rawSuspended
      : Object.values(rawSuspended);



  /* ==============================
     RENDER SUSPENDED PLAYERS
  ============================== */

  if(suspendedGrid){

    suspendedGrid.innerHTML =
      "";


    suspendedPlayers.forEach(
      function(player,index){

        const card =
          document.createElement(
            "div"
          );


        card.className =
          "player-card";


        const name =
          escapeHTML(
            player.name ||
            "UNKNOWN PLAYER"
          );


        const position =
          escapeHTML(
            player.position ||
            "PLAYER"
          );


        const jersey =
          escapeHTML(
            player.jersey ||
            ""
          );


        const photo =
          player.photo ||
          "";


        const date =
          escapeHTML(
            player.date ||
            ""
          );


        const reason =
          escapeHTML(
            player.reason ||
            ""
          );


        card.innerHTML = `

          <div class="player-photo">

            ${
              photo
                ? `
                  <img
                    src="${photo}"
                    alt="${name}"
                    onerror="
                      this.style.display='none';
                      this.parentElement.classList.add('no-photo');
                    "
                  >
                `
                : ""
            }

            <span class="player-number">

              ${String(
                index + 1
              ).padStart(2,"0")}

            </span>

          </div>


          <div class="
            player-info
            suspended-player-info
          ">

            <span class="
              suspended-position
            ">

              ${position}

            </span>


            <h3 class="
              suspended-name
            ">

              ${name}

              ${
                jersey
                  ? `
                    <span class="
                      suspended-jersey
                    ">
                      #${jersey}
                    </span>
                  `
                  : ""
              }

            </h3>


            ${
              reason
                ? `
                  <p class="
                    suspended-reason
                  ">
                    ${reason}
                  </p>
                `
                : ""
            }


            ${
              date
                ? `
                  <small class="
                    suspended-date
                  ">
                    SUSPENDED: ${date}
                  </small>
                `
                : ""
            }

          </div>

        `;


        suspendedGrid.appendChild(
          card
        );

      }
    );

  }



  /* ==============================
     SUSPENDED COUNT
  ============================== */

  if(suspendedCount){

    suspendedCount.textContent =
      suspendedPlayers.length;

  }



  /* ==============================
     SHOW / HIDE SUSPENDED SECTION
  ============================== */

  if(suspendedSection){

    suspendedSection.style.display =
      suspendedPlayers.length > 0
        ? "block"
        : "none";

  }

}


/* ================================
   FIREBASE REALTIME LISTENER
================================ */

onValue(

  dataRef,

  function(snapshot){

    const data =
      snapshot.val() || {

        totalPlayers:15,

        matchNotice:"",

        photos:{},

        suspendedPlayers:[]

      };


    updateWebsite(data);

  },


  function(error){

    console.error(
      "Firebase error:",
      error
    );

  }

);


/* ================================
   FOOTER YEAR
================================ */

document.addEventListener(

  "DOMContentLoaded",

  function(){

    const year =
      document.getElementById(
        "year"
      );


    if(year){

      year.textContent =
        new Date().getFullYear();

    }

  }

);