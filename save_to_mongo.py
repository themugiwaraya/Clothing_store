import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

with open("products_by_category.json", "r", encoding="utf-8") as file:
    products = json.load(file)

inserted_count = 0
for category, items in products.items():
    for item in items:
        item["category"] = category  
        try:
            collection.insert_one(item)
            inserted_count += 1
        except Exception as e:
            print(f"⚠️ Ошибка при вставке товара {item.get('_id', 'Без ID')}: {e}")

print(f"✅ Успешно сохранено {inserted_count} товаров в MongoDB!")
