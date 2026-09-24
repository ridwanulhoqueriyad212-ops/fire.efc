import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


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

const auth =
  getAuth(app);

const dataRef =
  ref(db, "efcData");


/* ================================
   DEFAULT DATA
================================ */

const defaultData = {

  totalPlayers: 15,

  matchNotice: "",

  suspendedPlayers: []

};


let data = {

  ...defaultData,

  suspendedPlayers: []

};


/* ================================
   AUTH GUARD
================================ */

onAuthStateChanged(

  auth,

  function(user){

    if(!user){

      sessionStorage.removeItem(
        "esfc_admin_login"
      );

      window.location.href =
        "./admin-login.html";

      return;

    }


    sessionStorage.setItem(
      "esfc_admin_login",
      "true"
    );


    loadData();

  }

);


/* ================================
   LOAD DATA
================================ */

async function loadData(){

  try{

    const snapshot =
      await get(dataRef);


    const saved =
      snapshot.val();


    if(saved){

      const rawSuspended =
        saved.suspendedPlayers ||
        [];


      data = {

        ...defaultData,

        ...saved,


        suspendedPlayers:

          Array.isArray(rawSuspended)

            ? rawSuspended

            : Object.values(
                rawSuspended
              )

      };

    }


    fillAdminPanel();

    setupSuspendedPhoto();

    renderSuspendedAdmin();


  }catch(error){

    console.error(
      "Firebase load error:",
      error
    );


    alert(
      "Firebase data load করতে সমস্যা হয়েছে।"
    );

  }

}


/* ================================
   FILL ADMIN PANEL
================================ */

function fillAdminPanel(){

  const totalPlayers =
    document.getElementById(
      "totalPlayers"
    );


  const countPreview =
    document.getElementById(
      "countPreview"
    );


  const matchNotice =
    document.getElementById(
      "matchNotice"
    );


  if(totalPlayers){

    totalPlayers.value =
      data.totalPlayers;

  }


  if(countPreview){

    countPreview.textContent =
      data.totalPlayers;

  }


  if(matchNotice){

    matchNotice.value =
      data.matchNotice || "";

  }

}


/* ================================
   PLAYER COUNT
================================ */

const totalPlayersInput =
  document.getElementById(
    "totalPlayers"
  );


if(totalPlayersInput){

  totalPlayersInput.addEventListener(

    "input",

    function(){

      let value =
        Number(
          this.value
        ) || 0;


      value =
        Math.max(
          0,
          Math.min(
            20,
            value
          )
        );


      this.value =
        value;


      const preview =
        document.getElementById(
          "countPreview"
        );


      if(preview){

        preview.textContent =
          value;

      }

    }

  );

}


/* ================================
   OPEN MATCH PANEL
================================ */

const openMatch =
  document.getElementById(
    "openMatch"
  );


if(openMatch){

  openMatch.addEventListener(

    "click",

    function(){

      const panel =
        document.getElementById(
          "matchPanel"
        );


      if(panel){

        panel.style.display =
          "block";


        panel.scrollIntoView({

          behavior: "smooth",

          block: "center"

        });

      }

    }

  );

}


/* ================================
   CLOSE MATCH PANEL
================================ */

const closeMatch =
  document.getElementById(
    "closeMatch"
  );


if(closeMatch){

  closeMatch.addEventListener(

    "click",

    function(){

      const panel =
        document.getElementById(
          "matchPanel"
        );


      if(panel){

        panel.style.display =
          "none";

      }

    }

  );

}


/* ================================
   SAVE MATCH
================================ */

const saveMatch =
  document.getElementById(
    "saveMatch"
  );


if(saveMatch){

  saveMatch.addEventListener(

    "click",

    async function(){

      const input =
        document.getElementById(
          "matchNotice"
        );


      if(input){

        data.matchNotice =
          input.value.trim();

      }


      await saveData();

    }

  );

}


/* ================================
   SUSPENDED PHOTO
================================ */

let suspendedPhotoData =
  "";


function compressImage(
  file,
  maxSize = 500
){

  return new Promise(
    function(resolve,reject){

      if(
        !file ||
        !file.type.startsWith("image/")
      ){

        reject(
          new Error(
            "Please select a valid image."
          )
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function(event){

          const img =
            new Image();


          img.onload =
            function(){

              let width =
                img.width;

              let height =
                img.height;


              if(width > height){

                if(width > maxSize){

                  height =
                    Math.round(
                      height *
                      maxSize /
                      width
                    );

                  width =
                    maxSize;

                }

              }else{

                if(height > maxSize){

                  width =
                    Math.round(
                      width *
                      maxSize /
                      height
                    );

                  height =
                    maxSize;

                }

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;

              canvas.height =
                height;


              const ctx =
                canvas.getContext(
                  "2d"
                );


              ctx.drawImage(
                img,
                0,
                0,
                width,
                height
              );


              const result =
                canvas.toDataURL(
                  "image/jpeg",
                  0.70
                );


              resolve(result);

            };


          img.onerror =
            function(){

              reject(
                new Error(
                  "Image load failed."
                )
              );

            };


          img.src =
            event.target.result;

        };


      reader.onerror =
        function(){

          reject(
            new Error(
              "Image read failed."
            )
          );

        };


      reader.readAsDataURL(file);

    }
  );

}


function setupSuspendedPhoto(){

  const input =
    document.getElementById(
      "suspendedPhoto"
    );


  const preview =
    document.getElementById(
      "suspendedPhotoPreview"
    );


  if(!input) return;


  input.addEventListener(

    "change",

    async function(){

      const file =
        this.files[0];


      if(!file){

        suspendedPhotoData =
          "";


        if(preview){

          preview.src =
            "";

          preview.style.display =
            "none";

        }

        return;

      }


      try{

        suspendedPhotoData =
          await compressImage(
            file,
            500
          );


        if(preview){

          preview.src =
            suspendedPhotoData;

          preview.style.display =
            "block";

        }


      }catch(error){

        console.error(
          "Suspended photo error:",
          error
        );


        alert(
          "ছবি upload করতে সমস্যা হয়েছে।"
        );


        this.value =
          "";

        suspendedPhotoData =
          "";

      }

    }

  );

}


/* ================================
   ADD SUSPENDED PLAYER
================================ */

const addSuspended =
  document.getElementById(
    "addSuspended"
  );


if(addSuspended){

  addSuspended.addEventListener(

    "click",

    async function(){

      const name =
        document
          .getElementById(
            "suspendedName"
          )
          .value
          .trim();


      const position =
        document
          .getElementById(
            "suspendedPosition"
          )
          .value
          .trim();


      const jersey =
        document
          .getElementById(
            "suspendedJersey"
          )
          .value
          .trim();


      const date =
        document
          .getElementById(
            "suspendedDate"
          )
          .value;


      const reason =
        document
          .getElementById(
            "suspendedReason"
          )
          .value
          .trim();


      if(!name){

        alert(
          "Player name দিন।"
        );

        return;

      }


      if(!data.suspendedPlayers){

        data.suspendedPlayers =
          [];

      }


      data.suspendedPlayers.push({

        name:
          name,

        position:
          position,

        jersey:
          jersey,

        photo:
          suspendedPhotoData || "",

        date:
          date,

        reason:
          reason

      });


      await saveData();


      document.getElementById(
        "suspendedName"
      ).value =
        "";


      document.getElementById(
        "suspendedPosition"
      ).value =
        "";


      document.getElementById(
        "suspendedJersey"
      ).value =
        "";


      document.getElementById(
        "suspendedPhoto"
      ).value =
        "";


      document.getElementById(
        "suspendedDate"
      ).value =
        "";


      document.getElementById(
        "suspendedReason"
      ).value =
        "";


      suspendedPhotoData =
        "";


      const preview =
        document.getElementById(
          "suspendedPhotoPreview"
        );


      if(preview){

        preview.src =
          "";

        preview.style.display =
          "none";

      }


      renderSuspendedAdmin();

    }

  );

}


/* ================================
   RENDER SUSPENDED ADMIN LIST
================================ */

function renderSuspendedAdmin(){

  const list =
    document.getElementById(
      "suspendedAdminList"
    );


  if(!list) return;


  list.innerHTML =
    "";


  const players =
    data.suspendedPlayers || [];


  if(players.length === 0){

    list.innerHTML = `

      <div style="
        padding:15px;
        opacity:.7;
      ">

        No suspended players added.

      </div>

    `;

    return;

  }


  players.forEach(

    function(player,index){

      const item =
        document.createElement(
          "div"
        );


      item.style.padding =
        "15px";


      item.style.marginBottom =
        "10px";


      item.style.border =
        "1px solid rgba(255,255,255,.09)";


      item.style.borderRadius =
        "12px";


      const name =
        player.name ||
        "Unknown";


      const position =
        player.position ||
        "PLAYER";


      const jersey =
        player.jersey
          ? " • #" +
            player.jersey
          : "";


      const date =
        player.date
          ? "<br>Suspended: " +
            player.date
          : "";


      const reason =
        player.reason
          ? "<br>Reason: " +
            player.reason
          : "";


      item.innerHTML = `

        <strong>
          ${name}
        </strong>

        <br>

        <small>

          ${position}
          ${jersey}

          ${date}

          ${reason}

        </small>

        <br><br>

        <button
          class="reset-button"
          onclick="
            removeSuspended(${index})
          "
        >

          REMOVE

        </button>

      `;


      list.appendChild(
        item
      );

    }

  );

}


/* ================================
   REMOVE SUSPENDED PLAYER
================================ */

window.removeSuspended =
  async function(index){

    if(
      !confirm(
        "এই suspended player remove করতে চান?"
      )
    ){

      return;

    }


    if(
      !data.suspendedPlayers ||
      !data.suspendedPlayers[index]
    ){

      return;

    }


    data.suspendedPlayers.splice(
      index,
      1
    );


    await saveData();


    renderSuspendedAdmin();

  };


/* ================================
   SAVE ALL
================================ */

const saveAll =
  document.getElementById(
    "saveAll"
  );


if(saveAll){

  saveAll.addEventListener(

    "click",

    async function(){

      const totalInput =
        document.getElementById(
          "totalPlayers"
        );


      const matchInput =
        document.getElementById(
          "matchNotice"
        );


      let count =
        Number(
          totalInput
            ? totalInput.value
            : 0
        ) || 0;


      data.totalPlayers =
        Math.max(
          0,
          Math.min(
            20,
            count
          )
        );


      data.matchNotice =
        matchInput
          ? matchInput.value.trim()
          : "";


      await saveData();

    }

  );

}


/* ================================
   SAVE TO FIREBASE
================================ */

async function saveData(){

  try{

    await set(
      dataRef,
      data
    );


    showSaved();


  }catch(error){

    console.error(
      "Firebase save error:",
      error
    );


    alert(
      "Save করতে সমস্যা হয়েছে। Firebase Rules check করো।"
    );

  }

}


/* ================================
   SAVED STATUS
================================ */

function showSaved(){

  const status =
    document.getElementById(
      "saveStatus"
    );


  if(status){

    status.textContent =
      "✓ Saved";


    setTimeout(

      function(){

        status.textContent =
          "Ready";

      },

      2000

    );

  }

}


/* ================================
   RESET DATA
================================ */

const resetData =
  document.getElementById(
    "resetData"
  );


if(resetData){

  resetData.addEventListener(

    "click",

    async function(){

      const confirmReset =
        confirm(
          "সব Admin data reset করতে চান?"
        );


      if(!confirmReset){

        return;

      }


      try{

        await set(
          dataRef,
          defaultData
        );


        location.reload();


      }catch(error){

        console.error(
          "Firebase reset error:",
          error
        );


        alert(
          "Reset করতে সমস্যা হয়েছে।"
        );

      }

    }

  );

}


/* ================================
   LOGOUT
================================ */

const logout =
  document.getElementById(
    "logout"
  );


if(logout){

  logout.addEventListener(

    "click",

    async function(){

      try{

        await signOut(auth);

      }catch(error){

        console.error(
          "Logout error:",
          error
        );

      }


      sessionStorage.removeItem(
        "esfc_admin_login"
      );


      window.location.href =
        "./admin-login.html";

    }

  );

}