const API_URL = "http://localhost:5000";

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    loadCategories();
    checkAdminAccess();
});

async function loadProducts(category = "all") {
    try {
        const response = await fetch(`${API_URL}/product`);
        if (!response.ok) throw new Error("Failed to fetch products");

        let products = await response.json();
        console.log("ВСЕ ТОВАРЫ:", products);

        const productsContainer = document.getElementById("products");
        productsContainer.innerHTML = ""; 
        
        console.log("Фильтруем по категории:", category);
        console.log("Доступные категории:", [...new Set(products.map(p => p.category))]);

        if (category !== "all") {
            products = products.filter(product => 
                product.category?.trim().toLowerCase() === category.trim().toLowerCase()
            );
        }

        console.log("Отфильтрованные товары:", products);

        if (products.length === 0) {
            productsContainer.innerHTML = "<p>Товары не найдены.</p>";
            return;
        }

        products.forEach((product) => {
            const productElement = document.createElement("div");
            productElement.classList.add("product");
            productElement.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Category: ${product.category}</p>
                <p>Price: ${product.price}</p>
                <button onclick="addToCart('${product._id}')">Add to Cart 🛒</button>
                ${isAdmin() ? `<button onclick="deleteProduct('${product._id}')">Delete</button>` : ""}
            `;
            productsContainer.appendChild(productElement);
        });

    } catch (error) {
        console.error("Error loading products:", error);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    document.getElementById("categoryFilter").addEventListener("change", (event) => {
        loadProducts(event.target.value);
    });
});

async function createProduct() {
    if (!isAuthenticated()) return;

    const name = document.getElementById("productName").value;
    let price = document.getElementById("productPrice").value;
    const image_url = document.getElementById("productImage").value;
    const category = document.getElementById("productCategory").value; 

    if (!name || !price || !image_url || !category) {
        alert("All fields are required!");
        return;
    }

    price = parseFloat(price); 

    const response = await fetch(`${API_URL}/product`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name, price, image_url, category }), 
    });

    if (response.ok) {
        alert("Product added!");
        loadProducts();
    } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to add product."}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    checkAdminAccess();
});

function checkAdminAccess() {
    const adminSection = document.getElementById("adminSection");
    if (isAdmin()) {
        adminSection.style.display = "block"; 
    } else {
        adminSection.style.display = "none";  
    }
}

function isAdmin() {
    return localStorage.getItem("role") === "admin"; 
}

async function updateProduct() {
    if (!isAuthenticated()) return;

    const id = document.getElementById("updateProductId").value;
    const name = document.getElementById("updateProductName").value;
    let price = document.getElementById("updateProductPrice").value;
    const image_url = document.getElementById("updateProductImage").value;
    const url = document.getElementById("updateProductUrl").value;

    if (!url) {
        alert("Product URL is required for update!");
        return;
    }

    price = `₸${parseFloat(price).toFixed(2)}`;

    const response = await fetch(`${API_URL}/product/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ name, price, image_url }),
    });

    if (response.ok) {
        alert("Product updated!");
        loadProducts();
    } else {
        alert("Error updating product!");
    }
}

async function deleteProduct(id) {
    if (!isAuthenticated()) return;
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
        const response = await fetch(`${API_URL}/product/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert("Product deleted!");
            loadProducts(); 
        } else {
            alert(`Error: ${data.error}`);
        }
    } catch (error) {
        console.error("Error deleting product:", error);
    }
}

async function addToCart(productId) {
    if (!isAuthenticated()) return;

    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Product added to cart!");
        } else {
            alert(data.error || "Failed to add product.");
        }
    } catch (error) {
        console.error("Error adding to cart:", error);
    }
}

function isAuthenticated() {
    if (!getToken()) {
        alert("Unauthorized! Please log in.");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function getToken() {
    return localStorage.getItem("token");
}

function isAdmin() {
    return localStorage.getItem("role") === "admin";
}

function checkAdminAccess() {
    const adminSection = document.getElementById("adminSection");
    if (isAdmin()) {
        adminSection.style.display = "block";
    }
}

document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();
    createProduct();
});
document.getElementById("updateForm").addEventListener("submit", function (e) {
    e.preventDefault();
    updateProduct();
});
