from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pymongo
from bson import ObjectId
from flask_cors import CORS
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

try:
    mongo.cx.server_info()  
    print("✅ Подключено к MongoDB Atlas")
except Exception as e:
    print(f"❌ Ошибка подключения: {e}")

users = mongo.db.users
products = mongo.db.products
cart = mongo.db.cart

products.create_index([("category", pymongo.ASCENDING)])
products.create_index([("price", pymongo.ASCENDING)])
products.create_index([("_id", pymongo.ASCENDING)])

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")  

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "role": role
    }
    
    users.insert_one(user)
    return jsonify({"message": "User created"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if bcrypt.check_password_hash(user["password"], password):
        token = create_access_token(identity=str(user["_id"]))  
        return jsonify({"token": token, "role": user["role"], "userId": str(user["_id"])}), 200
    return jsonify({"error": "Invalid credentials"}), 400

@app.route("/profile/<user_id>", methods=["GET"])
@jwt_required()
def profile(user_id):
    user = users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404

    user_data = {"username": user["username"], "email": user["email"], "role": user["role"]}
    return jsonify(user_data), 200

@app.route("/product", methods=["POST"])
@jwt_required()
def add_product():
    user_id = get_jwt_identity()

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Access denied. Only admins can add products."}), 403

    data = request.json
    name = data.get("name")
    price = data.get("price")
    image_url = data.get("image_url")
    category = data.get("category", "unknown")

    if not name or not price or not image_url:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        price = float(price)
    except ValueError:
        return jsonify({"error": "Invalid price format"}), 400

    product = {
        "name": name,
        "price": price,
        "image_url": image_url,
        "category": category
    }
    
    result = products.insert_one(product)
    
    return jsonify({"message": "Product added successfully", "product_id": str(result.inserted_id)}), 201

@app.route("/product", methods=["GET"])
def get_products():
    category = request.args.get("category")
    price_min = request.args.get("price_min", type=float)
    price_max = request.args.get("price_max", type=float)
    search = request.args.get("search", "").strip()

    query = {}
    if category:
        query["category"] = category
    if price_min is not None or price_max is not None:
        query["price"] = {}
        if price_min:
            query["price"]["$gte"] = price_min
        if price_max:
            query["price"]["$lte"] = price_max
    if search:
        query["name"] = {"$regex": search, "$options": "i"}  

    products_list = products.find(query)

    result = [
        {
            "_id": str(p["_id"]),
            "name": p["name"],
            "price": p["price"],
            "image_url": p["image_url"],
            "category": p.get("category", "unknown")  
        } 
        for p in products_list
    ]

    return jsonify(result), 200


@app.route("/cart", methods=["POST"])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()  

    data = request.json
    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not ObjectId.is_valid(product_id):
        return jsonify({"error": "Invalid product ID"}), 400

    product = products.find_one({"_id": ObjectId(product_id)})
    if not product:
        return jsonify({"error": "Product not found"}), 404

    cart_item = cart.find_one({"user_id": ObjectId(user_id), "product_id": ObjectId(product_id)})
    if cart_item:
        cart.update_one({"_id": cart_item["_id"]}, {"$inc": {"quantity": quantity}})
    else:
        cart.insert_one({
            "user_id": ObjectId(user_id),
            "product_id": ObjectId(product_id),
            "name": product["name"],
            "price": product["price"],
            "image_url": product["image_url"],
            "quantity": quantity
        })
    
    return jsonify({"message": "Product added to cart"}), 201


@app.route("/cart", methods=["GET"])
@jwt_required()
def view_cart():
    user_id = get_jwt_identity()  

    cart_items = cart.find({"user_id": ObjectId(user_id)})
    result = [{"_id": str(item["_id"]), "name": item["name"], "price": item["price"], "image_url": item["image_url"], "quantity": item["quantity"]} for item in cart_items]
    
    return jsonify(result), 200

@app.route("/product/<product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    user_id = get_jwt_identity()

    user = users.find_one({"_id": ObjectId(user_id)})
    if not user or user.get("role") != "admin":
        return jsonify({"error": "Access denied. Only admins can delete products."}), 403

    if not ObjectId.is_valid(product_id):
        return jsonify({"error": "Invalid product ID"}), 400

    product = products.find_one({"_id": ObjectId(product_id)})
    if not product:
        return jsonify({"error": "Product not found"}), 404

    products.delete_one({"_id": ObjectId(product_id)})

    cart.delete_many({"product_id": ObjectId(product_id)})

    return jsonify({"message": "Product deleted successfully"}), 200

if __name__ == "__main__":
    app.run(port=5000, debug=True)
