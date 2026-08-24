require("dotenv").config();

const express = require("express");
const app = express();
const axios = require("axios");
const PORT = process.env.PORT || 3000;

const url = `https://graph.facebook.com/v25.0/me/messages`;
app.use(express.json());
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const entry = req.body.entry[0];
  const messaging = entry.messaging[0];
  const senderId = messaging.sender.id;
  const messageText = messaging.message.text;
  console.log(senderId, message);

  let replyText;

  if (messageText === "hi") {
    replyText = "Hello! How can I help you?";
  } else if (messageText === "name") {
    replyText = "I'm a simple Messenger bot.";
  } else if (messageText === "help") {
    replyText = "You can say hi, name, or bye.";
  } else if (messageText === "bye") {
    replyText = "Goodbye! Have a nice day.";
  } else {
    replyText = "Sorry, I don't understand that yet.";
  }

  await sendReply(senderId, replyText);
  res.sendStatus(200);
});

async function sendReply(senderId, ReplyText) {
  await axios.post(
    url,
    {
      recipient: { id: senderId },
      message: { text: ReplyText },
    },
    {
      params: {
        access_token: process.env.PAGE_ACCESS_TOKEN,
      },
    },
  );
}

app.listen(PORT, () => {
  console.log(`Server started at ${PORT} port`);
});
