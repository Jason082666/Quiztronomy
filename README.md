# Quiztronomy
<div><img alt="AppVeyor" src="https://img.shields.io/badge/License-MIT-GREEN" display:inine>
<img alt="AppVeyor" src="https://img.shields.io/badge/laguage-javascript-red">
<img alt="AppVeyor" src="https://img.shields.io/badge/release-v1.0.0-blue">
<img alt="AppVeyor" src="https://img.shields.io/badge/author-Jason082666-yellow"></div>


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

  - Step 1 : Caculate the popularity `(Decay by time)`, if user pick the quiz for gaming, this quiz's currentLikes + `1.5`, or the currentLikes - `0.5`

    ```js
    const decayFactor = 0.5;
    const decayWindow = 604800000;

    function gaussian(x, sigma) {
      return Math.exp(-(x ** 2) / (2 * sigma ** 2));
    }

    export function calculatePopularity(
      currentLikes,
      previousPopularity,
      lastUpdate
    ) {
      const currentTime = Date.now();
      const popularityAge = currentTime - lastUpdate;
      const decay = gaussian(popularityAge, decayWindow);
      return (
        (1 - decayFactor) * currentLikes + decayFactor * decay * previousPopularity
      );
    }
    ```


    >The function starts by defining two constants: decayFactor and decayWindow. decayFactor represents the weight given to the decayed popularity, while decayWindow determines the rate at which the popularity decays. the function computes the estimated popularity by combining the current likes and the decayed previous popularity. The current likes are weighted by 1 - decayFactor, while the decayed previous popularity is weighted by decayFactor * decay. The result is the sum of these two components.


  - Step 2: Get total scores by suming up the quiz popularity  score and the fuzzy search score, then limit top five quizzes for recommendation


    ```js
    Total score for recommendation = 0.5 * quiz popularity score + 0.5 * fuzzy search score
    ```    

- Integrated `OpenAI API` to fulfill quiz automated-generation feature
- Created game room segmentation for game host and multiple players by `Socket.IO`
- Real-time ranking through `Redis sorted sets` for gaming excitement augmentation
- Enrich user experience by cutting down waiting times with `queue service`
- Cached game history data in Redis to optimize loading time of game-record page
- Established stateless server by leveraging `EC2, Mongo Atlas, ElastiCache, CloudWatch Logs` to achieve scalability

## Back-end Structure

<img src="https://quiztronomy.xyz/img/structure.png">

## Database Schema

### Mongo Atlas <span><img src="https://quiztronomy.xyz/img/mongo.gif"></span>

<img src="https://quiztronomy.xyz/img/db_structure.png">

### ElasticSearch <span><img src="https://quiztronomy.xyz/img/es.png" ></span>

- quiz
<img src="https://quiztronomy.xyz/img/db_structure2.png">


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
