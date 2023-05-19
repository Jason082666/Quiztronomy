# Quiztronomy

An interactive gaming platform for earning and playing.

## Description

Quiztronomy is a combination of QA & gaming platform designed for users to create customized quizzes and hold game room for players to participate in the competitions. The core concept is to foster an interactive and immersive learning environment by leveraging gamification techniques.

## Usage

### Player account:

- `Email: elon@gmail.com `
- `Password: 123456789 `

![image](https://quiztronomy.xyz/img/login.gif)

### Be a game host :

As an game host, you can either create your own quiz manually or search from our system, furthermore, we offer `quiz-generator` robot to generate the quiz automatically for you !

- Create your own quiz by hand
  ![image](https://quiztronomy.xyz/img/manal-generate.gif)
- Create your own quiz by robot

  ![image](https://quiztronomy.xyz/img/ai-generate.gif)

- Adjust the quiz order and quiz time

  ![image](https://quiztronomy.xyz/img/prepare.gif)

- Host view

  ![image](https://quiztronomy.xyz/img/host.gif)

### Be a game player :

You don't need to sign up to play the game, but you can only view the game history with an account !

- Playing view:

  ![image](https://quiztronomy.xyz/img/player.gif)

---

## Feature

- Implemented gaussian-based decaying recommendation algorithm on quiz fuzzy search feature via `Elasticsearch`
- Integrated `OpenAI API` to fulfill quiz automated-generation feature
- Created game room segmentation for game host and multiple players by `Socket.IO`
- Real-time ranking through `Redis sorted sets` for gaming excitement augmentation
- Enrich user experience by cutting down waiting times with `queue service`
- Cached game history data in Redis to optimize loading time of game-record page
- Established stateless server by leveraging `EC2, Mongo Atlas, ElastiCache, CloudWatch Logs` to achieve scalability

## Back-end Structure

<img src="https://quiztronomy.xyz/img/structure.png">

## Database Schema

### Mongo Atlas

- GameRoom collection:

```js
{
  _id: ObjectId;
  id: string;
  name: string;
  founder: {
    id: string;
    name: string;
  }
  roomStatus: string;
  history: [
    {
      question: string,
      date: date,
      answer: [string],
      explain: string,
      type: string,
      id: string,
      _id: ObjectId,
    },
  ];
  score: [
    {
      id: string,
      name: string,
      score: number,
    },
  ];
}
```

- User collection:

```js
{
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  totalGame: number;
  totalScore: number;
  history: [
    {
      roomId: string,
      roomName: string,
      date: date,
      host: string,
      rank: number,
      score: string,
    },
  ];
  hostHistory: [
    {
      roomId: ObjectId,
      roomName: string,
      date: date,
    },
  ];
}
```

### ElasticSearch

- quiz

```js
{
  question: string;
  option: {
    A: string;
    B: string;
    C: string;
    D: string;
  }
  answer: [string];
  explain: string;
  type: string;
  timestamp: date;
  createTime: date;
  popularity: number;
}
```

## Roadmap

- Implement RWD on the website, make it prettier on mobile

- Ehance unit test and interation test coverage
- Use OpenAI API to tag all the users search terms, choose the top 5 terms, and feed OpenAI to generate new quizzes, enrich system quizzes

- Add more quiz type to raise user experience

- Offer "change name" functionality for user to change their name

- Add photo uploading functionality, and show the personalized photo during the game

- Add "Forgot Password" functionality

## Contact Information

Reach me if you have further question

- Name: 蔡見昇
- Email: <span><a href="mailto:see89826@gmail.com">see89826@gmail.com</a></span>
- Linkedin: [Jason Tsai](https://www.linkedin.com/in/jason-tsai-812b14200/)

Enjoy your thrilling gaming experience !

## Contribution

Special thanks to <span><a href="https://www.freepik.com/"> freepik</a></span> for offering free image usage.

## License

Quiztronomy is licensed under <span><a href="https://github.com/Jason082666/Quiztronomy/blob/main/LICENSE">MIT</a></span>
