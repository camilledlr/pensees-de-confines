    const repondreButtons = document.querySelectorAll('.repondre')
    const reponsesButtons = document.querySelectorAll('.reponses')
    const typeInput = document.getElementById('m')
    const formsAns = document.querySelectorAll('.form-ans')
    var socket = io();
    document.getElementById('form-msg').onsubmit = function(e){
      e.preventDefault();
      socket.emit('chat message', document.getElementById('m').value);
      document.getElementById('m').value = ''
      return false;
    };
    formsAns.forEach((form)=>{
      form.onsubmit = function(e){ // faut faire un query selector All ici + un forEach
        e.preventDefault();
        const id = e.target.getAttribute("data-msg-id")
        socket.emit('post answer', id, e.target.firstElementChild.value);
        e.target.firstElementChild.value = '';
        e.target.parentNode.classList.toggle('hidden')
        return false;
      };
    })
    typeInput.oninput = function(e) {
      console.log('héhooo')
      socket.emit('ontype');
      var timeoooo = setTimeout(() => {
        socket.emit('stop ontype');
        console.log('yoooo')
      }, 3000);
    }
function createElement (elementType, parentNode, classList, text, id, customAttribute) {
      const newElement = document.createElement(elementType);
      parentNode.appendChild(newElement);
      if(text) newElement.innerText = text;
      if(classList) classList.forEach((className)=>newElement.classList.add(className))
      if (id) newElement.setAttribute("id", id);
      if (customAttribute) newElement.setAttribute("data-msg-id",  customAttribute);
      return newElement
    }
    socket.on('chat message', function(msg){
  const msgPlaceholder = createElement('div', document.getElementById('messages'),'');
  const newMsg = createElement('div', msgPlaceholder,['message'], msg.text, "", msg._id);
  const repondre = createElement('p', newMsg,['repondre'], 'Répondre' );
  const reponses = createElement('p', newMsg,['reponses'], msg.response.length ?`${msg.response.length} Réponses`:'');
  const replyPlaceholder  = createElement('div',msgPlaceholder,['hidden','reply-placeholder']);
  const replyForm  = createElement('form',replyPlaceholder ,['form-ans'], "", msg._id);
  const replyInput  = createElement('textarea',replyForm ,'', "", "ans");
  const button = createElement('button',replyForm, '', 'Send', 'send-answer');
  const answersPlaceholder = createElement('div', msgPlaceholder,['hidden','answers'], "", "", msg._id);
  msg.response.forEach((response)=> createElement('div', answersPlaceholder,['answer'],response, ""))
  reponses.onclick = (e)=>{
    answersPlaceholder .classList.toggle('hidden')
    }
  repondre.onclick = (e)=>{
    replyPlaceholder.classList.toggle('hidden')
    }
    replyForm.onsubmit = function(e){ 
      e.preventDefault();
      socket.emit('post answer',  msg._id, replyInput.value);
      replyInput.value = '';
      replyPlaceholder.classList.toggle('hidden')
      return false;
    };
     document.getElementById('messages').scrollTo(0,document.getElementById('messages').scrollHeight);
    });
    socket.on('post answer', function(ans, msg_id){
      const AnsPlaceholder = document.querySelector(`.answers[data-msg-id="${msg_id}"]`)
      const newAns = createElement('div', AnsPlaceholder,['answer'], ans)
        if (!AnsPlaceholder.hasChildNodes()) {
          const AnswerNb = createElement('p', document.querySelector(`.message[data-msg-id="${msg_id}"]`),['reponses'], '1 Réponse')
          AnswerNb.onclick = (e)=>{
            document.querySelector(`.answers[data-msg-id="${msg_id}"]`).classList.toggle('hidden')
            }
        } else {
          const formerNb = document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText.split(' ')[0];
        document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText = `${Number(formerNb)+1} Réponses`
        // document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText = `${formerText[0]++} Réponses`
        // const formerText = document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText;
        // document.querySelector(`.message[data-msg-id="${msg_id}"]`).querySelector(`.reponses`).innerText = `${formerText[0]++} Réponses`
        }

        // AnsPlaceholder.appendChild(newAns);
        document.getElementById('messages').scrollTo(0,AnsPlaceholder.scrollHeight);
    //  newAns.classList.add('answer');
    //  newAns.innerText = ans
    });
    socket.on('ontype', function(){
      document.getElementById('is-typing').classList.remove('hidden')
    });
    socket.on('stop ontype', function(){
      document.getElementById('is-typing').classList.add('hidden')
    });

    repondreButtons.forEach((button)=>{
      button.onclick = (e)=>{
      const answersForm = e.target.parentElement.nextSibling.nextSibling
      answersForm.classList.toggle('hidden')
      }
    }
    )
    reponsesButtons.forEach((button)=>{
      button.onclick = (e)=>{
      const answersPlaceholder = e.target.parentElement.parentElement.querySelector('.answers');
      answersPlaceholder.classList.toggle('hidden')
      }
    }
    )