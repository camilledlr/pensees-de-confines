const repondreButtons = document.querySelectorAll(".repondre");
var textareas = document.querySelectorAll("textarea");
const reponsesButtons = document.querySelectorAll(".reponses");
const typeInput = document.getElementById("m");
const formsAns = document.querySelectorAll(".form-ans");
const moodInputs = document.querySelectorAll(".mood-inputs");
const imageFile = document.getElementById("file-input");
const searchInput = document.getElementById("search-input");
const results = document.getElementById('results-placeholder');
const result = document.querySelectorAll('song-result');
const songButton = document.querySelector(".song-label");
var socket = io();
import api from "./api.js";
var selectedSong;

function preventScrolling() {
  document.body.style.overflow = 'hidden'
  const allowScrolling = setTimeout(() => {
    document.body.style.overflow = 'auto'
  }, 1000);
}

function displayResults (apiRes) {
  apiRes.forEach((track)=> {
    const result= createElement('div', results, ['song-result']);
    const image = document.createElement('img');
    result.appendChild(image);
    image.src = track.album.images[0].url
    const infos= createElement('div', result, ['song-infos']);
    const title= createElement('h3', infos, '', track.name);
    const artist= createElement('p', infos, '', track.artists[0].name);
    result.onclick = function (e) {
      selectedSong = track.id;
      result.classList.toggle('select-song')
      document.getElementById('song-input').value = track.id;
      document.getElementById("file-preview").classList.remove('hidden');
      document.getElementById("img-preview").src = image.src;
      console.log('on submit', track.id)
    }
  })
}


// request spotify
//https://api.spotify.com/v1/search?q=bob%20year:2014&type=album
searchInput.onchange = function (e){
  api.get(`/search?q=${e.target.value}`)
  .then(apiRes=> {
    results.innerHTML =''
    displayResults(apiRes.data)})
  .catch(apiErr => console.log(apiErr))
}
//preview select file
imageFile.onchange = function (e){
  document.getElementById("file-preview").classList.remove('hidden')
    if(imageFile.files[0]){
      const tmpUrl = URL.createObjectURL(imageFile.files[0]);
      document.getElementById("img-preview").src = tmpUrl;
  }
} 
// display search modal
songButton.onclick = function(e) {
  preventScrolling()
  document.getElementById('search-modal').classList.toggle('hidden')
  document.querySelector('.footer').classList.toggle('hidden')
}

document.getElementById('close-modal').onclick = function clodeModal (e) {
  document.getElementById('search-modal').classList.add('hidden')
  document.querySelector('.footer').classList.toggle('hidden')
}

//display alert
function displayAlert(text) {
  document.getElementById('alert').classList.remove('hidden')
  document.getElementById('alert').innerText = text
  const closeAlert = setTimeout(() => {
    document.getElementById('alert').classList.add('hidden')
  }, 3000);
}

function createElement(
  elementType,
  parentNode,
  classList,
  text,
  id,
  customAttribute
) {
  const newElement = document.createElement(elementType);
  parentNode.appendChild(newElement);
  if (text) newElement.innerText = text;
  if (classList)
    classList.forEach((className) => newElement.classList.add(className));
  if (id) newElement.setAttribute("id", id);
  if (customAttribute) newElement.setAttribute("data-msg-id", customAttribute);
  return newElement;
}
function addMoodElement(parentNode, icn) {
  const moodPlace = createElement("div", parentNode, ["mood-placeholder"]);
  const icnplace = createElement("i", moodPlace, ["far", icn, "fa-2x"]);
  return moodPlace;
}
function addSendAnswer(parentNode) {
  const button = createElement("button", parentNode, "", "", "send-answer");
  const icnplace = createElement("i", button, [
    "fas",
    "fa-paper-plane",
    "fa-2x",
  ]);
  return button;
}

//changer couleur des icns quand sélectionnés
document.getElementById("form-msg").onchange = function (e) {
  moodInputs.forEach((input) => {
    if (input.checked) {
      document.querySelector(`.mood-labels[for="${input.id}"]`).style.color =
        "teal";
    } else {
      document.querySelector(`.mood-labels[for="${input.id}"]`).style.color =
        "indianred";
    }
  });
};

var resetMessage = () => {
  document.getElementById("m").value = "";
  imageFile.value='';
  document.getElementById("img-preview").src = '';
  document.getElementById('song-input').value ='';
  if (!document.getElementById("file-preview").classList.contains("hidden")) document.getElementById("file-preview").classList.add('hidden')
  if (!document.getElementById('search-modal').classList.contains("hidden")) document.getElementById('search-modal').classList.add('hidden')
  document.getElementById("m").style.cssText = "height: fit-content";
  document
    .querySelectorAll(".mood-labels")
    .forEach((label) => (label.style.color = "indianred"));
  const container = document.querySelector("#mood-select");
  const icns = document.querySelector(".icn-placeholder");
  if (!icns.classList.contains("hidden")) {
    icns.classList.toggle("hidden");
    const hideIcons = setTimeout(() => {
      container.classList.remove("expand");
    }, 50);
  }
}
// Poster un message
document.getElementById("form-msg").onsubmit = function (e) {
  e.preventDefault();
  if (document.getElementById("m").value == "") return displayAlert('Il manque un texte à ton post :)');
  let moodSelected = '';
  let song = document.getElementById('song-input').value
  moodInputs.forEach((input) => {
    if (input.checked) moodSelected = input.value;
    input.checked = false;
  });
  const formData = new FormData();
  formData.append('text', document.getElementById("m").value);
  formData.append('mood', moodSelected);
  if (song) formData.append('song', song);
  if(imageFile.files[0]) formData.append('file', imageFile.files[0]);
    api.post('/new', formData)
    .then(res => {
      resetMessage()})
    .catch(apiErr => {if (imageFile.files[0]) {displayAlert('Le format du fichier est invalide :(')
    }else { displayAlert('Une erreur est survenue : (') }
  })
  preventScrolling()
};

// poster une réponse
formsAns.forEach((form) => {
  form.onsubmit = function (e) {
    e.preventDefault();
    const id = e.target.getAttribute("data-msg-id");
    socket.emit("post answer", id, e.target.firstElementChild.value);
    e.target.firstElementChild.value = "";
    e.target.parentNode.classList.toggle("hidden");
    return false;
  };
  preventScrolling()
});

// Déclencher l'événement "is typing"
typeInput.onkeydown = function (e) {
  socket.emit("ontype");
  var timeoooo = setTimeout(() => {
    socket.emit("stop ontype");
  }, 3000);
};

// Afficher un nouveau message
socket.on("chat message", function (msg) {
  const msgclass = msg.file || msg.song ? 'message-with-media' : 'message'
  const msgByDate = document.getElementById('messages').querySelector(':nth-child(2)')
  const formerFirst = msgByDate.firstChild
  const msgPlaceholder = document.createElement('div');
  msgByDate.insertBefore(msgPlaceholder, formerFirst)
  const newMsg = createElement(
    "div",
    msgPlaceholder,
    [msgclass],
    "",
    "",
    msg._id
  );
  const dateMsg = createElement(
    "p",
    newMsg,
    ["message-date"],
    moment(msg.send_date).format("hh:mm"),
    ""
  );
  const textMsg = createElement(
    "span",
    newMsg,
    ["message-text"],
    msg.text,
    "",
    msg._id
  );
  if (msg.file) {
    const imgMsg = createElement("img",newMsg,["message-file"])
    imgMsg.src = msg.file
    imgMsg.alt = 'image'
  }
  if (msg.song) {
    const songPh = createElement("div",newMsg,["player-div"])
    const songMsg = createElement("iframe",songPh,["player"])
    songMsg.src = `https://open.spotify.com/embed/track/${msg.song}}`
    songMsg.setAttribute('frameborder', "0");
    songMsg.setAttribute('allowtransparency', "true");
    songMsg.setAttribute('allow', "encrypted-media");
  }
  if (msg.mood) {
    const moodMsg = addMoodElement(newMsg, msg.mood);
  }
  const actionsMsg = createElement("div", newMsg, ["message-actions"]);
  const repondre = createElement("p", actionsMsg, ["repondre"], "Répondre");
  const reponses = createElement(
    "p",
    actionsMsg,
    ["reponses"],
    msg.response.length ? `${msg.response.length} Réponses` : ""
  );
  const replyPlaceholder = createElement("div", msgPlaceholder, [
    "hidden",
    "reply-placeholder",
  ]);
  const replyForm = createElement(
    "form",
    replyPlaceholder,
    ["form-ans"],
    "",
    msg._id
  );
  const replyInput = createElement("textarea", replyForm, "", "", "ans");
  const button = addSendAnswer(replyForm);
  const answersPlaceholder = createElement(
    "div",
    msgPlaceholder,
    ["hidden", "answers"],
    "",
    "",
    msg._id
  );
  msg.response.forEach((response) =>
    createElement("div", answersPlaceholder, ["answer"], response, "")
  );
  reponses.onclick = (e) => {
    answersPlaceholder.classList.toggle("hidden");
  };
  repondre.onclick = (e) => {
    replyPlaceholder.classList.toggle("hidden");
  };
  replyForm.onsubmit = function (e) {
    e.preventDefault();
    socket.emit("post answer", msg._id, replyInput.value);
    replyInput.value = "";
    replyPlaceholder.classList.toggle("hidden");
    return false;
  };
  document
    .getElementById("messages")
    .scrollTo(0, 0);
    preventScrolling()
});

//Afficher une nouvelle réponse
socket.on("post answer", function (ans, msg_id) {
  const AnsPlaceholder = document.querySelector(
    `.answers[data-msg-id="${msg_id}"]`
  );
  const newAns = createElement("div", AnsPlaceholder, ["answer"], ans);
  if (!AnsPlaceholder.hasChildNodes()) {
    const AnswerNb = createElement(
      "p",
      document.querySelector(`.message[data-msg-id="${msg_id}"]`),
      ["reponses"],
      "1 Réponse"
    );
    AnswerNb.onclick = (e) => {
      document
        .querySelector(`.answers[data-msg-id="${msg_id}"]`)
        .classList.toggle("hidden");
    };
  } else {
    const formerNb = document
      .querySelector(`.message[data-msg-id="${msg_id}"]`)
      .querySelector(`.message-actions`)
      .querySelector(`.reponses`)
      .innerText.split(" ")[0];
    document
      .querySelector(`.message[data-msg-id="${msg_id}"]`)
      .querySelector(`.reponses`).innerText = `${
      Number(formerNb) + 1
    } Réponses`;
  }
  preventScrolling()
  AnsPlaceholder.classList.remove("hidden");
  const position = AnsPlaceholder.offsetTop/1.5
  document.getElementById("messages").scrollTo(0, position);

});

//Display 'is typing'
socket.on("ontype", function () {
  document.getElementById("is-typing").classList.remove("hidden");
  document.getElementById("is-typing").classList.add("is-typing");
});
socket.on("stop ontype", function () {
  document.getElementById("is-typing").classList.add("hidden");
  document.getElementById("is-typing").classList.remove("is-typing");
});

// Afficher l'input réponse
repondreButtons.forEach((button) => {
  button.onclick = (e) => {
    const answersForm =
      e.target.parentElement.parentElement.nextSibling.nextSibling;
    answersForm.classList.toggle("hidden");
    const position = answersForm.offsetTop/1.5;
    if (!answersForm.classList.contains("hidden"))
      document.getElementById("messages").scrollTo(0, position);
  };
});
// Afficher les réponses
reponsesButtons.forEach((button) => {
  button.onclick = (e) => {
    const answersPlaceholder =
      e.target.parentElement.parentElement.parentElement.lastElementChild;
    answersPlaceholder.classList.toggle("hidden");
  };
});

// Autosize textareas
textareas.forEach((ta) => {
  ta.oninput = autosize;
});

function autosize() {
  var el = this;
  setTimeout(function () {
    el.style.cssText = "height:" + el.scrollHeight + "px";
  }, 0);
}

// Display icons
document.getElementById("mood-button").onclick = (e) => {
  preventScrolling()
  const container = document.querySelector("#mood-select");
  const icns = document.querySelector(".icn-placeholder");
  if (container.classList.contains("expand")) {
    const hideIcons = setTimeout(() => {
      container.classList.remove("expand");
    }, 50);
    icns.classList.toggle("hidden");
  } else {
    container.classList.add("expand");
    const displayIcons = setTimeout(() => {
      icns.classList.toggle("hidden");
    }, 500);
  }
};
