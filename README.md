# Backend Movie App
**Backend Movie is a robust backend project designed to provide a comprehensive movie information management platform. With a clear RESTful API architecture and scalability, this project offers the necessary functionalities to build efficient movie management applications or websites.**
## Key Features: 
- Movie Information Management: Add, edit, delete, and view movie details (title, genre, director, actors, year of production, description, poster, etc.).
- Genre Management: Create, update, and delete movie genres.
- User Management (Admin): Registration, login, and role-based access control for administrators.
- Movie Search: Search for movies by title, genre, director, or actors.
- Pagination: Display movie lists in pages for optimal performance.
## Tech Stack: 
- Language: Node.js (with Express.js framework)
- Database: MongoDB 
- ORM/ODM: Mongoose 
- API Testing: Postman
- Session Management: JWT
## Installation and Running: 
1. Clone Repository:
   ```javascript
   git clone https://github.com/nphnamm/backend-movie.git
   

2. Install dependencies:
   ```javascript
   npm install
3. Environment configuration:
   Create a .env file and fill in the necessary information (e.g., database connection, server port, etc.).
   ```javascript
   PORT = 5000
   MONGO_URI =
   JWT_SECRET =
   NODE_ENV = 

   to set up these environments, you will have to create storage project in Firebase.
   # firebase credential 
   FIREBASE_TYPE =
   PROJECT_ID= 
   PRIVATE_KEY_ID= 
   PRIVATE_KEY=
   CLIENT_EMAIL="firebase-adminsdk-6q44q@moviefullstack.iam.gserviceaccount.com"
   CLIENT_ID="104633749347033414624"
   CLIENT_X509_CERT_URL=
   FIREBASE_STORAGE_BUCKET =
4. Run Server
   ```javascript
   npm start 

