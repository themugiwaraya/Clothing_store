import urllib3
from bs4 import BeautifulSoup
import json
import time
import random

http = urllib3.PoolManager(headers={"User-Agent": "Mozilla/5.0"})

MAX_PRODUCTS_PER_CATEGORY = 15  

def get_product_urls(category_url):
    print(f"📡 Сканируем категорию: {category_url}")

    try:
        response = http.request('GET', category_url)
        if response.status != 200:
            print(f"⚠️ Ошибка загрузки категории ({response.status}): {category_url}")
            return []
    except Exception as e:
        print(f"❌ Ошибка при запросе: {category_url}\n{e}")
        return []

    soup = BeautifulSoup(response.data, 'html.parser')
    product_links = []

    for a_tag in soup.find_all("a", class_="catalog_item"):
        link = a_tag.get("href")
        if link and link.startswith("/shop"):
            full_link = "https://qazaqrepublic.com" + link
            product_links.append(full_link)

        if len(product_links) >= MAX_PRODUCTS_PER_CATEGORY:  
            break

    print(f"✅ Найдено {len(product_links)} товаров в категории (максимум {MAX_PRODUCTS_PER_CATEGORY}).")
    return product_links

def get_product_info(url, category_name):
    print(f"🔍 Парсим товар: {url}")

    try:
        response = http.request('GET', url)
        if response.status != 200:
            print(f"⚠️ Ошибка загрузки товара ({response.status}): {url}")
            return None
    except Exception as e:
        print(f"❌ Ошибка при запросе товара: {url}\n{e}")
        return None

    soup = BeautifulSoup(response.data, 'html.parser')

    def extract_text(selector, default="Не найдено"):
        tag = soup.select_one(selector)
        return tag.get_text(strip=True) if tag else default

    name = extract_text("div.item__name", "Название не найдено")

    price_tag = soup.select_one("div.item__price")
    price = "Цена не найдена"
    if price_tag:
        old_price = price_tag.find("span")  
        if old_price:
            old_price.extract()  
        price = price_tag.get_text(strip=True)

    stock_status = extract_text("div.catalog_item__label", "В наличии")

    image_url = "Изображение не найдено"
    image_tag = soup.select_one("div.catalog_item__image img")
    if image_tag and image_tag.get("src"):
        image_url = "https://qazaqrepublic.com" + image_tag["src"]

    product_id = url.rstrip("/").split("/")[-1].split("?")[0]

    return {
        "id": product_id,
        "name": name,
        "price": price,
        "stock_status": stock_status,
        "image_url": image_url,
        "url": url,
        "category": category_name  
    }

category_urls = [
    "https://qazaqrepublic.com/ru/shop/sweatshirts",
    "https://qazaqrepublic.com/ru/shop/hoodies",
    "https://qazaqrepublic.com/ru/shop/top",
    "https://qazaqrepublic.com/ru/shop/t-shirts",
    "https://qazaqrepublic.com/ru/shop/bottom",
    "https://qazaqrepublic.com/ru/shop/headwear",
    "https://qazaqrepublic.com/ru/shop/bags",
    "https://qazaqrepublic.com/ru/shop/kids",
    "https://qazaqrepublic.com/ru/shop/accessories"
]

all_products_by_category = {}

for category_url in category_urls:
    category_name = category_url.split("/")[-1]
    print(f"\n🛒 Обрабатываем категорию: {category_name}")

    product_urls = get_product_urls(category_url)
    if not product_urls:
        print(f"⚠️ Пропускаем категорию '{category_name}', так как товары не найдены.")
        continue

    all_products_by_category[category_name] = []

    for count, url in enumerate(product_urls):
        if count >= MAX_PRODUCTS_PER_CATEGORY:
            break  

        product_info = get_product_info(url, category_name)
        if product_info:
            all_products_by_category[category_name].append(product_info)
            print(f"📦 {count + 1}/{MAX_PRODUCTS_PER_CATEGORY}: {product_info['name']}")
        else:
            print(f"⚠️ Ошибка при парсинге товара: {url}")

        time.sleep(random.uniform(2, 5))  

with open('products_by_category.json', 'w', encoding='utf-8') as file:
    json.dump(all_products_by_category, file, ensure_ascii=False, indent=4)

print("\n🎉 Данные успешно сохранены в 'products_by_category.json'!")
