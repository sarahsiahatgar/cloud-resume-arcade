# ☁️ Sara's AWS Serverless Arcade & Cloud Portfolio

Welcome to the repository for my AWS Cloud Portfolio! This is a full-stack, multi-page serverless web application that combines interactive retro arcade games, live visitor analytics, a real-time suggestion box, and my professional cloud engineering background.

🌐 **Live Demo:** [https://www.sarasiahatgar.com/](https://www.sarasiahatgar.com/)

---

## 🌟 Features & Multi-Page Layout

### 🏠 Home Page (`index.html`)
* **Interactive Arcade Games:** Play fully functional versions of **Tic-Tac-Toe** (featuring an AI opponent and win tracking) and **Snake** (complete with touch controls, difficulty settings, and persistent scoring).
* **Serverless Visitor Counter:** A live visitor counter that dynamically increments and displays traffic using AWS Lambda and DynamoDB.

### 🕹️ More Arcade Games (`games.html`)
* **AWS Memory Match:** A card-matching game featuring popular AWS service icons.
* **Space Invaders:** A retro canvas arcade game with randomized fleet formations (Scatter, V-Formation, Fortress, and Flanks).
* **Connect Four:** A strategic turn-based game played against an AI opponent.
* **Serverless Suggestion Box:** A real-time feedback form allowing visitors to submit game ideas that are processed and saved live to the cloud.

### 🧪 Beta Games (`beta-games.html`)
* **Raindrop Math Game:** An interactive educational arcade game where players solve math problems as raindrops fall.
* **AI-Gorilla Game:** Features dynamic elements powered by **Amazon Bedrock (Nova Micro)**.
* **Viking II & Pac-Man (Under Construction):** Upcoming cloud-powered arcade games featuring an integrated high-score leaderboard backend.

### 👤 About & Portfolio (`about.html`)
* **Professional Bio:** An overview of my Computer Science background, education, IT technical skills, and personal projects.

---

## 🏗️ AWS Cloud Architecture & Backend Services

This project is built using a modern, serverless architecture on Amazon Web Services:

1. **Amazon S3:** Hosts the static front-end web files (HTML, CSS, JavaScript, and game assets).
2. **AWS CloudFront:** Content Delivery Network (CDN) providing global edge caching, fast distribution, and low latency.
3. **AWS Certificate Manager (ACM):** Provisions and manages the SSL/TLS security certificate for secure HTTPS communication.
4. **Amazon Route 53 / Checkdomain DNS:** Manages custom domain name routing and records to map traffic seamlessly to the CloudFront distribution.
5. **Amazon API Gateway:** Managed REST API endpoint routing HTTP requests securely between the browser and backend.
6. **AWS Lambda:** Serverless Python function execution layer handling visitor counter increments, suggestion box submissions, and high-score logic.
7. **Amazon DynamoDB:** Fully managed NoSQL database storing persistent visitor analytics, user suggestions, and high-score records.
8. **Amazon Bedrock (Nova Micro):** Powers intelligent backend features, generative AI-driven responses, and dynamic elements in the Beta section.
9. **Amazon SES (Simple Email Service):** Handles automated transactional email notifications triggered by backend events.
10. **AWS CloudWatch:** Monitors application logs, Lambda performance, and operational health metrics.
11. **AWS CloudShell:** Used for browser-based command line management, deployment scripts, and resource interactions.

---

## 🚀 Connect With Me

* **LinkedIn:** [Sara Siahatgar](https://www.linkedin.com/in/sara-siahatgar-b6a0151b5/)
* **Portfolio Website:** [sarasiahatgar.com](https://www.sarasiahatgar.com/)
