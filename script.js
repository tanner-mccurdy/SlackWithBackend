const mySenderId = 1; // fixes the issue of random senderId causing messages to not appear in the channel after sending

function changeChannel(e) {
  document.querySelector(".active").classList.remove("active");
  e.currentTarget.classList.add("active");
  populateMessages(e.currentTarget.getAttribute("data-channel"));
  document.querySelector("#channel-title").innerText =
    e.currentTarget.innerText;
}

function populateMessages(chat) {
  document.querySelectorAll(".message").forEach((item) => item.remove());
  let template = document.querySelector("template");

  fetch(`https://slackclonebackendapi.onrender.com/messages?channelId=${chat}`)
    .then((response) => response.json())
    .then((messages) => {
      messages.forEach((message) => {
        fetch(
          `https://slackclonebackendapi.onrender.com/users?id=${message.senderId}`
        )
          .then((response) => response.json())
          .then((userData) => {
            let newMessage = template.content.firstElementChild.cloneNode(true);

            newMessage.querySelector(".sender").innerText =
              userData[0].name + ":";
            newMessage.querySelector(".text").innerText = message.text;

            if (message.senderId === mySenderId) {
              newMessage.classList.add("self");
            }

            document.querySelector("#chat-messages").appendChild(newMessage);
          });
      });
    });
}

async function init() {
  fetch("https://slackclonebackendapi.onrender.com/channels")
    .then((response) => response.json())
    .then((channels) => {
      channels.forEach((channel, index) => {
        let button = document.createElement("button");
        button.classList.add("channel");
        button.setAttribute("data-channel", channel.id);
        button.innerText = channel.name;

        if (index === 0) {
          button.classList.add("active");
        }

        document.querySelector(".channel-list").appendChild(button);
      });

      document
        .querySelectorAll(".channel")
        .forEach((item) => item.addEventListener("click", changeChannel));

      if (channels.length > 0) {
        document.querySelector("#channel-title").innerText = channels[0].name;
        populateMessages(channels[0].id);
      }
    });

    // Send button click
document
  .querySelector("#chat-form button")
  .addEventListener("click", sendMessage);

// Press Enter to send
document
  .querySelector("#message-input")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
}

init();

// Extra Credit

function sendMessage() {
  const input = document.querySelector("#message-input");
  const text = input.value.trim();

  if (!text) return;

  const activeChannel = document.querySelector(".channel.active");
  const channelId = Number(activeChannel.getAttribute("data-channel"));

  const newMessage = {
    text: text,
    channelId: channelId,
    senderId: mySenderId,
    timestamp: new Date().toISOString(),
  };

  fetch("https://slackclonebackendapi.onrender.com/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newMessage),
  })
    .then((response) => response.json())
    .then(() => {
      input.value = "";
      populateMessages(channelId);
    });
}
