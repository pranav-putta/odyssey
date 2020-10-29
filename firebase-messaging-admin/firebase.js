let serviceAccount = require("./serviceAccountKey.json");
let admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://odyssey-4329f.firebaseio.com",
});

// feedback
admin
  .messaging()
  .send({
    topic: "alerts",
    notification: {
      title: "Feedback",
      body: "Share your thoughts",
    },
    data: {
      messageType: "card",
      content: JSON.stringify({
        title: "Feedback",
        body: "Share your thoughts",
        buttons: [
          {
            label: "Share",
            color: "blue",
            action: {
              action: "link",
              path:
                "https://www.callcentrehelper.com/images/stories/2017/11/feedback-up-down-thumbs-760.png",
            },
          },
          {
            label: "Close",
            color: "black",
            action: {
              action: "none",
            },
          },
        ],
        image:
          "https://www.callcentrehelper.com/images/stories/2017/11/feedback-up-down-thumbs-760.png",
      }),
    },
  })
  .then((val) => {
    console.log(val);
  })
  .catch((val) => {
    console.error(val);
  })
  .finally(() => {
    console.log("done");
  });
