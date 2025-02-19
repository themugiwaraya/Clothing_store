# Clothing Store API

## 👤 Developers: Alibi 

### 📌 Overview
This project is a REST API for a clothing store, built with Flask and MongoDB. The API enables user authentication, product management, shopping cart functionality, and order processing.

### ⚡ Features
- ✅ User Authentication (Signup, Login, JWT tokens)
- ✅ Product Management (Create, Read, Update, Delete – CRUD)
- ✅ Shopping Cart (Add, Remove, View)
- ✅ Optimized MongoDB with Indexes (`id`, `category`, `price`)
- ✅ API Documentation
- ✅ Deployment on Render

### 📂 Project Structure
```
clothing_store_backend/
│── app.py              # Main Flask server
│── public/             # Frontend assets (CSS, JS, HTML)
|   ├── app.js
|   ├── index.html
|   ├── cart.html
|   ├── cart.js
|   ├── login.html
|   ├── profile.html
|   ├── signup.html
|   ├── user.js
|   ├── style.css                      
│── requirements.txt     # Dependencies
│── .env                 # Environment variables (ignored in Git)
│── .gitignore           # Ignored files
│── README.md            # Documentation
```

### 📦 Database Structure (MongoDB)

#### **Users Collection (`users`):**
```json
{
  "_id": ObjectId,
  "username": "test",
  "email": "test@example.com",
  "password": "hashed_password",  
  "role": "user",  
  "avatar": "https://example.com/avatar.jpg"
}
```

#### **Products Collection (`products`):**
```json
{
  "_id": ObjectId,
  "name": "qazaq republic",
  "category": "sweatshirts",
  "price": 10000₸,
  "image_url": "https://example.com/hoodie.jpg",
  "description": "Warm and comfortable hoodie."
}
```

#### **Cart Collection (`cart`):**
```json
{
  "_id": ObjectId,
  "userId": ObjectId,  
  "products": [
    {
      "productId": ObjectId,
      "name": "qazaq republic",
      "price": 10000₸,
      "quantity": 2
    }
  ]
}
```

### 🚀 Getting Started

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/themugiwaraya/Clothing_store.git
cd clothing_store_backend
```

#### 2️⃣ Set Up a Virtual Environment & Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

#### 3️⃣ Configure Environment Variables (`.env`)
Create a `.env` file and add:
```ini
SECRET_KEY=your_secret_key
MONGO_URI=mongodb://localhost:27017/clothing_store
```

#### 4️⃣ Run the Server
```bash
flask run
```
API will be available at: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

### 📡 API Endpoints

#### 1. Authentication
| Method | Endpoint  | Description |
|--------|----------|-------------|
| POST   | `/signup` | Register a new user |
| POST   | `/login`  | Log in a user, returns JWT |

#### 2. Product Management
| Method | Endpoint        | Description |
|--------|----------------|-------------|
| GET    | `/products`     | Fetch all products |
| POST   | `/products`     | Add a new product (admin only) |
| PUT    | `/products/:id` | Update a product (admin only) |
| DELETE | `/products/:id` | Delete a product (admin only) |

#### 3. Shopping Cart
| Method  | Endpoint                  | Description |
|---------|---------------------------|-------------|
| POST    | `/cart`                    | Add product to cart |
| GET     | `/cart/:userId`            | View user’s cart |
| DELETE  | `/cart/:userId/:productId` | Remove product from cart |

### 📜 License
This project is licensed under the MIT License.

