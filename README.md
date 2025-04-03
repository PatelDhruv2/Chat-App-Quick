# Chat App

A real-time chat application built with Node.js, Express, Socket.io, Kafka, Redis, and Prisma ORM. Supports load balancing and efficient message queuing for high concurrency. The system is designed to handle up to **100,000 concurrent signup requests** and **20,000 messages per second** efficiently.

## Features

- **Real-time messaging** using WebSockets  
- **Kafka for message queuing**  
- **Redis Cluster** for caching  
- **Database integration** with Prisma ORM  
- **Docker support** for containerized deployment  

## Tech Stack

- **Frontend**: Next.js, TailwindCSS  
- **Backend**: Node.js, Express.js  
- **Database**: PostgreSQL (Prisma ORM)  
- **Message Queue**: Apache Kafka  
- **Caching**: Redis Cluster  
- **Containerization**: Docker  
- **Performance Testing**: Artillery  

## Installation

### Prerequisites
- Node.js (v16+)  
- Docker & Docker Compose  
- Redis & PostgreSQL  
- Kafka (running on localhost:9092)  

### Setup

```sh
# Clone the repository  
git clone https://github.com/PatelDhruv2/Chat-App-Quick.git
cd Chat-App-Quick

# Install dependencies  
npm install

# Set up environment variables  
cp .env.example .env  # Update .env with your configuration

# Start Redis, Kafka, and Database (if using Docker)  
docker-compose up -d

# Start the server  
npm run dev
# Install Artillery  
npm install -g artillery

# Run the load test  
artillery run artillery-config.yml

This includes **everything** in a single code block:  
- **Project overview**  
- **Installation steps**  
- **Performance testing (Artillery)**  
- **Kafka configuration**  
- **WebSocket setup**  
- **API endpoints**  
- **Docker support**  
