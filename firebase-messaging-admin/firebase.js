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
      topic: "general_alerts",
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
                path: "https://www.odysseyapp.us/feedback.html",
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
  const htmlContent = `
  <img style="width:100%;height:${250}" src="https://static.onecms.io/wp-content/uploads/sites/6/2020/11/24/HUC2-FF-002475.jpg"/>
  <div style="margin:7.5%">
    <h1>Baby Yoda</h1>
    <p>This man is so lit you literally just have to check him out. I swear to god if you don't I'm going to bite your cock off HEHEHEH</p>
    <a style="" href="dismiss">Ok</a>  
  </div>
  `;

  let n = {
    title: "Hello",
    body: "Hi",
    type: 0,
    time: Date.now(),
    seen: false,
    location: 0,
    content: htmlContent,
  };

  admin
    .messaging()
    .send({
      topic: "general_alerts",
      notification: {
        title: "Your Rep has some NEWS JIII",
        body: "Check it out on the app",
      },
      data: {
        messageType: "card",
        content: JSON.stringify(n),
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

const testBill = async () => {
  let bill = { assembly: 101, chamber: "SB", number: 1 };
  let notification = {
    title: "Bill update",
    body: "message",
    type: 3,
    location: 0,
    time: "asap",
    content: JSON.stringify(bill),
    seen: false,
  };

  await admin
    .messaging()
    .sendToTopic("general_alerts", {
      notification: {
        title: "Oh JIIIII there is a bill update waiting for you mera raja",
        body: "SB JERO JERO JERO ONE HAS PASSED YOU FRUITCAKE 🤪",
        sound: "default",
      },
      data: {
        content: JSON.stringify(notification),
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

testBill();
