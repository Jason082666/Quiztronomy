# Quiztronomy

An interactive gaming platform for earning and playing.

## Description

Quiztronomy is a combination of QA & gaming platform designed for users to create customized quizzes and hold game room for players to participate in the competitions. The core concept is to foster an interactive and immersive learning environment by leveraging gamification techniques.

## Usage

### Player account:

Email: elon@gmail.com

Password: 123456789

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
- Email: see89826@gmail.com<span><a href="mailto:see89826@gmail.com">Send email</a></span>
- Linkedin: [Jason Tsai](https://www.linkedin.com/in/jason-tsai-812b14200/)

Enjoy your thrilling gaming experience !
