# Chat App

A real-time chat application built with Node.js, Express, Socket.io, Kafka, Redis, and Prisma ORM. Supports load balancing and efficient message queuing for high concurrency. The system is designed to handle up to **100,000 concurrent signup requests** and **20,000 messages per second** efficiently.

## Features

- **Real-time messaging** using WebSockets  
- **Kafka for message queuing**  
- **Redis Cluster** for caching  
- **Nginx load balancing**  
- **Database integration** with Prisma ORM  
- **Docker support** for containerized deployment  

## Tech Stack

- **Frontend**: Next.js, TailwindCSS  
- **Backend**: Node.js, Express.js  
- **Database**: PostgreSQL (Prisma ORM)  
- **Message Queue**: Apache Kafka  
- **Caching**: Redis Cluster  
- **Load Balancer**: Nginx  
- **Containerization**: Docker  
- **Performance Testing**: Artillery  

## Installation

### Prerequisites
- Node.js (v16+)  
- Docker & Docker Compose  
- Redis & PostgreSQL  
- Kafka (running on localhost:9092)  

### Setup

1. Clone the repository:  
   ```sh
   git clone https://github.com/PatelDhruv2/Chat-App-Quick.git
   cd Chat-App-Quick
