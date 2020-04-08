const repondreButtons = document.querySelectorAll(".repondre");
var textareas = document.querySelectorAll("textarea");
const reponsesButtons = document.querySelectorAll(".reponses");
const typeInput = document.getElementById("m");
const formsAns = document.querySelectorAll(".form-ans");
const moodInputs = document.querySelectorAll(".mood-inputs");
const imageFile = document.getElementById("file-input");
var socket = io();
import api from "./api.js";

// window.onload = function(e){
//   console.log('yolo')
//   window.scrollTo(0, 100);
// }
imageFile.onchange = function (e){
  document.getElementById("file-preview").classList.remove('hidden')
    if(imageFile.files[0]){
      const tmpUrl = URL.createObjectURL(imageFile.files[0]);
      document.getElementById("img-preview").src = tmpUrl;
  }
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
  console.log()
  if (!document.getElementById("file-preview").classList.contains("hidden")) document.getElementById("file-preview").classList.add('hidden')
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
  if (document.getElementById("m").value == "") return;
  let moodSelected = '';
  moodInputs.forEach((input) => {
    if (input.checked) moodSelected = input.value;
    input.checked = false;
  });
  const formData = new FormData();
  formData.append('text', document.getElementById("m").value);
  formData.append('mood', moodSelected);
  if(imageFile.files[0]) formData.append('file', imageFile.files[0]);
    api.post('/new', formData)
    .then(res => {
      resetMessage()});
    // socket.emit(
    //   "chat message",
    //   document.getElementById("m").value,
    //   moodSelected
    // );
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
  const msgPlaceholder = createElement(
    "div",
    document
      .getElementById("messages")
      .lastElementChild.querySelector(".message-by-date"),
    ""
  );
  const newMsg = createElement(
    "div",
    msgPlaceholder,
    ["message"],
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
    .scrollTo(0, document.getElementById("messages").scrollHeight);
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
    // document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText = `${formerText[0]++} Réponses`
    // const formerText = document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText;
    // document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText = `${formerText[0]++} Réponses`
  }

  AnsPlaceholder.classList.remove("hidden");
  const position = AnsPlaceholder.offsetTop;
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
    const position = answersForm.offsetTop / 2;
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
