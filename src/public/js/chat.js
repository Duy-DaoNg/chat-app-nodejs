
const socket = io();
socket.emit('addUser', getCookie('userId'))
var currentConversation = "xxx"
var allConversation = []
var friendName =""
var currentMessagePage = 1
var maxMessagePage = 1
function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
      c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
      }
  }
  return "";
}
async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", 
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(data),
  });
  return response.json(); 
}
function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;
  
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  }
async function renderMessage(messages) {
  let scrollTarget = {};
  const imagePromises = [];
  
  messages.forEach((message, index) => {
    const imagePromise = $.Deferred();
  
    if (message.sender !== getCookie('userId')) {
      // Render replies message
      const $messageElement = $(`
        <li class="replies">
          <div class="messageTop">
            <div>
              <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
            </div>
            <div id="${'messageChat-' + message._id}">
              <div>
                ${message.messageType === 'image'
                  ? '<img class="image-box" src="' + message.fileURL + '">'
                  : '<p class="messageContent ${message._id}">' + message.text + '</p>'}
              </div>
              <div class="messageBottom">${timeSince(new Date(message.updatedAt))}</div>
            </div>
          </div>
        </li>
      `).prependTo('.messages ul');
  
      const $imageElement = $messageElement.find('img.image-box');
      if ($imageElement.length) {
        $imageElement.on('load', function () {
          imagePromise.resolve();
        });
        imagePromises.push(imagePromise.promise());
      }
      $('.message-input input').val(null);
    } else {
      // Render send message
      const $messageElement = $(`
        <li class="sent">
          <div class="messageTop">
            <div id="${'messageChat-' + message._id}">
              <div>
                ${message.messageType === 'image'
                  ? '<img class="image-box" src="' + message.fileURL + '">'
                  : '<p class="messageContent ${message._id}">' + message.text + '</p>'}
              </div>
              <div class="messageBottom">${timeSince(new Date(message.updatedAt))}</div>
            </div>
            <div>
              <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
            </div>
          </div>
        </li>
      `).prependTo('.messages ul');
  
      const $imageElement = $messageElement.find('img.image-box');
      if ($imageElement.length) {
        $imageElement.on('load', function () {
          imagePromise.resolve();
        })
        imagePromises.push(imagePromise.promise());
      }
      $('.message-input input').val(null);
    }
  
    if (index === 0) {
      scrollTarget = $(".messages ul li").children().first();
    }
  })
  
  // Wait for all images to load
  $.when.apply($, imagePromises).done(function () {
    if (scrollTarget.length) {
      $(".messages").animate({ scrollTop: scrollTarget.position().top }, 1);
    }
  })
  
}
async function loadMessagesInPageNumber(pageNumber) {
  $.ajax({
    url: `chat/message/${currentConversation}?pageNumber=${pageNumber}`,
    type: 'GET'
  })
  .then(data => {
    currentMessagePage = data.currentPage
    maxMessagePage = data.pageCount
    renderMessage(data.messages, pageNumber===1?1:0)
  })
  .catch( error => {
    console.log(error)
  })
}
async function renderContact() {
  // fetch all conversion
  const currentUserId = getCookie('userId')
  const currentUsername = getCookie('username')
  $('#currentUsername').html(currentUsername)
  $('#contacts ul').empty()
  $.ajax({
    url: `chat/conversation/${currentUserId}`,
    type: 'GET'
  })
  .then(data => {
      if(data.length > 0) {
        data.forEach(conversation => {
          allConversation.push(conversation)
          conversation.members.forEach( member => {  
            if(member.userId != currentUserId) {
              const name = conversation.sender == currentUserId ? 'You': member.username
              const message = conversation.lastMessage.messageType == 'image'?'Send a photo':(conversation.lastMessage.messageContent?conversation.lastMessage.messageContent:conversation.lastMessage)
              $(`
              <li class="contact" id="${conversation._id}">
                <div class="wrap">
                  <span class="contact-status offline"></span>
                  <img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
                  <div class="meta">
                    <p class="name">${member.username}</p>
                    <p class="preview">${name+': '+message}
                    </p>
                  </div>
                </div>
              </li>
              `).appendTo('#contacts ul');
              socket.emit('send setConversationStatus', ({receiverId:member.userId,conversationId:conversation._id}))
            }
          })
        })
      }
  })
  .then(data => {
    $("#popup-search").on("input", async function() {
      var searchValue = $(this).val()
      $.ajax({
        url: `user/${searchValue}`,
        type: 'GET'
      })
      .then(data => {
        if(data.username) {
          $(`
          <li>
            ${data.username}
          </li>
        `).appendTo("#popup-content ul");
        }
      })
    })
    $("#search input").on("input", function() {
      var searchValue = $(this).val().toLowerCase();
      $("#contacts ul li").each(function() {
        var content = $(this).text().toLowerCase();
        if (content.indexOf(searchValue) == -1) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    });
    $('li.contact').on('click', async function(e){
      if (currentConversation !=  e.currentTarget.id) {
        $(`#${e.currentTarget.id}`).toggleClass("active")
        $(`#${currentConversation}`).toggleClass("active")
        currentConversation = e.currentTarget.id
        const currentConversationData = allConversation.find(({ _id }) => _id === currentConversation)
        friendName = currentConversationData.members.find(({ userId }) => userId != currentUserId)
        $('.messages ul').empty()
        $('div.contact-profile').empty()
        currentMessagePage = 1
        maxMessagePage = 1
        $(".messages").off('scroll')
        $(`
          <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
          <p>${friendName.username}</p>
          <div class="social-media">
            <i class="fa fa-facebook" aria-hidden="true"></i>
            <i class="fa fa-twitter" aria-hidden="true"></i>
            <i class="fa fa-instagram" aria-hidden="true"></i>
          </div>
        `).appendTo("div.contact-profile")
        await loadMessagesInPageNumber(1)
        $(".messages").on('scroll', async () => {
          if ($(".messages").scrollTop() === 0) {
            if(currentMessagePage < maxMessagePage) {
              await loadMessagesInPageNumber(currentMessagePage+1)
            }
          }
        })
        var fileInput = $("<input>").attr("type", "file").hide();
        fileInput.off('change')
        var sendFileIcon = $(".send-file-icon");
        sendFileIcon.off('click')
        sendFileIcon.click(function() {
          fileInput.click();
        });
        
        fileInput.change(function() {
          if (this.files.length > 0) {
            var file = this.files[0];
            var formData = new FormData();
            formData.append("image", file); 
            formData.append("conversationId", currentConversation);
            formData.append("sender", currentUserId);
            $.ajax({
              url: "/chat/upload/image",
              type: "POST",
              data: formData,
              processData: false,
              contentType: false
            })
            .then(response => {
              console.log(response)
              socket.emit('send image', {
                senderId:getCookie('userId'),
                senderName: getCookie('username'),
                receiverId: friendName.userId,
                fileURL:response.fileURL,
                conversationId: currentConversation,
              })
              $(`
                <li class="sent">
                    <div class="messageTop">
                        <div id="${'messageChat-'+id}">
                        <div> 
                          <img class="image-box" src="${response.fileURL}">
                        </div>
                            <div class="messageBottom">${timeSince(new Date(Date.now()))}</div>
                        </div>
                        <div>
                            <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        </div>
                    </div>
                </li>
              `).appendTo('.messages ul');
              $('.contact.active .preview').html('<span>You: </span>' + 'Send a photo');
              $('.contact.active').prependTo('#contacts ul')
              $(".messages").animate({ scrollTop: $(".messages ul").height() }, 500)
            })
            $(this).val(null)
          }
        });
      }
    });
  })
  .catch((error) => {
      console.log(error)
      alert('invalid username or password')
  })
  // render conversion


}

async function renderContent() {
  $(`
      <div class="contact-profile">
      <h1 style="text-align: center; font-weight: bold;">Please pick your friend</h1>
      </div>
      <div class="messages">
        <ul>
            
        </ul>
      </div>
      <div class="message-input">
        <div class="wrap">
        
          <input class="messageInput" type="text" placeholder="Write your message..." />
          <div class="send-file-icon">
            <i class="fa fa-paperclip attachment" aria-hidden="true"></i>
          </div>
          <button class="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i></button>
        </div>
		  </div>
  `).appendTo('#frame div.content');  
}

var id = 0;
async function sendMessage() {
  var timeStamp = 45*1000;
	message = $(".message-input input").val();
	if($.trim(message) == '') {
		return false;
	}
    socket.emit('sendMessage', {
      senderId:getCookie('userId'),
      senderName: getCookie('username'),
      receiverId: friendName.userId,
      text: message,
      conversationId: currentConversation
    })
    const messageData = {
      conversationId: currentConversation,
      sender: getCookie('userId'),
      text: message
    }
    postData('chat/message',messageData)
    .then(() => {
      $(`
        <li class="sent">
            <div class="messageTop">
                <div id="${'messageChat-'+id}">
                    <div><p class="messageContent ${id}"> ${message}</p></div>
                    <div class="messageBottom">${timeSince(new Date(Date.now()-timeStamp))}</div>
                </div>
                <div>
                    <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                </div>
            </div>
        </li>
      `).appendTo('.messages ul');
      $('.message-input input').val(null);
      $('.contact.active .preview').html('<span>You: </span>' + message);
      $('.contact.active').prependTo('#contacts ul')
      $(".messages").animate({ scrollTop: $(".messages ul").height() }, 500)
    })
    
};


window.addEventListener('click', (event) => {
    if(event.target.classList[0] == 'messageContent') {
        const id = event.target.classList[1];
        $(`#messageChat-${id} .messageBottom`).toggleClass('show-time');
    }
})
window.addEventListener("load", (event) => {
  var addContactValue = ''
  renderContact()
  renderContent()
  $('#logout').click(function() {
    $.ajax({
      url: `logout`,
      type: 'GET'
    })
    .then(data => {
      window.location.href = '/'
    })
  })
  $('.submit').click(function() {
    sendMessage();
    id++;
  });
  $(window).on('keydown', function(e) {
    if (e.which == 13) {
        sendMessage();
        id++;
      return false;
    }
  });
  $("#addcontact").on("click", function (){
    $("#options").empty()
    $("#search-friend-input").val('')
    addContactValue = ''
  })
  $(".close-popup-btn").on("click", function (){
    $("#options").empty()
    addContactValue = ''
  })

  $("#search-friend-input").on("input", function() {
    $('#options').empty()
    let searchInput = $(this).val()
    $.ajax({
      url: `user/${searchInput}`,
      type: 'GET'
    })
    .then(res => {
      if (res.data.length > 0){
        $('#options').empty()
        res.data.forEach(data => {
          $(`
            <li class="list-group-item option" id=${data._id}>
              <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="Avatar 1" class="avatar">
              <span class="popup-username">${data.username}</span>
            </li>
          `).appendTo('#options')
        })
        $("#options li").on("click", function() {
          $(this).addClass("selected").siblings().removeClass("selected");
          addContactValue = {
            sender:{
              id: getCookie("userId"),
              name: getCookie("username")
            },
            receiver: {
                id: $(this)[0].id,
                name: $(this).children()[1].innerText
            }
          }
        });
      } else {
        $('#options').empty()
        $(`<p style="color: white; text-align: center">Can't find your friend</p>`).appendTo('#options')
      }
    }).catch(error => {
      console.log(error.statusText)
    })
  })
  $('#confirm-select').click(async function() {
    if (addContactValue) {
      postData('chat/conversation', addContactValue)
      .then((data) => {
        if (!data.message){
          renderContact()
          alert("Add Contact successfully")
          $('#options').empty()
          $('#search-friend-input').val('')
          socket.emit('send loadContactSignal', {receiverId:addContactValue.receiver.id} )
          addContactValue = ''
        } else {
          alert(data.message)
        }
      })
    }
  });
});
socket.on('receive image', ({senderId, senderName,fileURL,conversationId}) => {
  $(`#${conversationId} .preview`).html(`<span>${senderId === getCookie('userId') ? 'You':senderName}: </span>` + 'Send a photo');
  $(`#${conversationId}`).prependTo('#contacts ul')
  if(friendName.userId == senderId) {
    $(`
    <li class="replies">
            <div class="messageTop">
                <div>
                    <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                </div>
                <div id="${'messageChat-'+id}">
                  <div> 
                      <img class="image-box" src="${fileURL}">
                  </div>
                    <div class="messageBottom">${timeSince(Date.now())}</div>
                </div>
            </div>
        </li>
    `).appendTo('.messages ul');
  $('.message-input input').val(null);
  $(".messages").animate({ scrollTop: $(".messages ul").height() }, 500)
  id++;
}
})
socket.on('receive loadContactSignal',({message}) => {
  console.log(message)
  renderContact()
})
socket.on('receive setConversationStatus', ({conversationId}) => {
    $(`#${conversationId} .contact-status`).removeClass("offline")
    $(`#${conversationId} .contact-status`).addClass("online")
})
socket.on('resetConversationStatus', ({conversationId}) => {
    $(`#${conversationId} .contact-status`).removeClass("online")
    $(`#${conversationId} .contact-status`).addClass("offline")
})
socket.on('receive message', ({senderId, senderName, text, conversationId}) => {
  $(`#${conversationId} .preview`).html(`<span>${senderId === getCookie('userId') ? 'You':senderName}: </span>` + text);
  $(`#${conversationId}`).prependTo('#contacts ul')
  if(friendName.userId == senderId) {
      $(`
      <li class="replies">
              <div class="messageTop">
                  <div>
                      <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                  </div>
                  <div id="${'messageChat-'+id}">
                      <div><p class="messageContent ${id}">${text}</p></div>
                      <div class="messageBottom">${timeSince(Date.now())}</div>
                  </div>
              </div>
          </li>
      `).appendTo('.messages ul');
    $('.message-input input').val(null);
    $(".messages").animate({ scrollTop: $(".messages ul").height() }, 500)
    id++;
  }
})