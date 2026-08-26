require("dotenv").config();

const express = require("express");
const app = express();
const axios = require("axios");
const PORT = process.env.PORT || 3000;

const url = `https://graph.facebook.com/v26.0/me/messages`;
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
  const messageText = messaging.message.text.toLowerCase();

  if (messaging.postback) {
    const payload = messaging.postback.payload;

    console.log("User clicked:", payload);

    if (payload === "ORDER") {
      await sendReply(senderId, "Great! 🛒 What would you like to order?");
    } else if (payload === "PAYMENT") {
      await sendReply(senderId, "💳 What payment issue can we help you with?");
    } else if (payload === "SUPPORT") {
      await sendReply(senderId, "👋 How can our support team help you?");
    }

    return res.sendStatus(200);
  }

  if (messageText) {
    if (
      messageText == "hi" ||
      messageText == "hello" ||
      messageText == "start"
    ) {
      await sendReply(senderId, "Hello! 👋 Welcome to Dawa Liquor Store.");
    }
  } else {
    await sendReply(
      senderId,
      "Sorry, I didn't understand that. Please choose an option below.",
    );
    await sendButtonReply(senderId);
  }

  res.sendStatus(200);
});

async function sendReply(senderId, replyText) {
  try {
    const response = await axios.post(
      url,
      {
        recipient: { id: senderId },
        message: { text: replyText },
      },
      {
        params: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
        },
      },
    );

    console.log("Facebook response:", response.data);
  } catch (error) {
    console.log("Facebook error:", error.response?.data || error.message);
  }
}

async function sendButtonReply(senderId) {
  await axios.post(
    url,

    {
      recipient: {
        id: senderId,
      },

      message: {
        attachment: {
          type: "template",

          payload: {
            template_type: "button",

            text: "How can I help you?",

            buttons: [
              {
                type: "postback",
                title: "Order",
                payload: "ORDER",
              },

              {
                type: "postback",
                title: "Payment",
                payload: "PAYMENT",
              },

              {
                type: "postback",
                title: "Support",
                payload: "SUPPORT",
              },
            ],
          },
        },
      },
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
