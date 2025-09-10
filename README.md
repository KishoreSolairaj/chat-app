# chat-app
A real-time chat app using Angular with Ionic for the frontend and Node.js with Socket.IO for the backend. Supports personal and group messaging. Data is stored in memory (no database), so all messages and users are lost when the server restarts. Ideal for demos or prototypes.


---

## 📁 Project Structure

chat-app/
├── frontend/ --> Angular + Ionic app
├── backend/ --> Node.js + Socket.IO server



---

## How to Run

### 1. Clone the Repository

- git clone https://github.com/KishoreSolairaj/chat-app.git
- cd my-chat-app


### 2. To Run Backend

- cd backend
- npm install
- npm run dev   # or: node index.js


### 3. To Run Frontend

- cd ../frontend
- npm install
- ionic serve


## How to Use

- When the app loads, enter a name to join the chat.
- Open the same URL (http://localhost:8100) in another browser or incognito window.
- Enter a different name to simulate a second user and start chatting in real-time.
- Messages are sent instantly between users and appear in both chat windows.


## Notes

- All data (users, messages) is stored in server memory.
- Restarting the server clears all data.
- No database is used.
- Best suited for learning, demos, or prototype purposes.