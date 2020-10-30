let serviceAccount = require("./serviceAccountKey.json");
let admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://odyssey-4329f.firebaseio.com",
});

// feedback
const feedback = () => {
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
          body:
            "Hope you're enjoying Odyssey so far! Share your thoughts about the app. Tell us what we can do better.",
          buttons: [
            {
              label: "Share",
              color: "#2196f3",
              action: {
                action: "link",
                path: "https://www.odysseyapp.us/feedback",
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
          image: "https://i.imgur.com/TKwoTbQ.png",
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
};

const edgar = () => {
  admin
    .messaging()
    .send({
      topic: "alerts",
      notification: {
        title: "Your Rep has some news",
        body: "Check it out on the app",
      },
      data: {
        messageType: "card",
        content: JSON.stringify({
          title: "Gonzales Podcast",
          body:
            "Mr. Gonzales's newest edition of his podcast is coming out this friday, make sure to reserve a spot",
          buttons: [
            {
              label: "Open",
              color: "#2196f3",
              action: {
                action: "link",
                path: "https://www.odysseyapp.us/feedback",
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
            "https://media.nbcchicago.com/2020/10/qanon-race-to-watch.png?fit=1200%2C675",
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
};

feedback();
