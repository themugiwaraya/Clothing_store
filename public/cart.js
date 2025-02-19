const API_URL = "http://localhost:5000";  

window.addToCart = async function addToCart(productId, name, price, image_url, url) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to add items to your cart.");
        window.location.href = "login.html";
        return;
    }

    console.log("📌 Sending Add to Cart request with data:", { productId, name, price, image_url, url });

    const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId, name, price, image_url, url }),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error("❌ Server error:", text);
        alert(`Error adding to cart: ${text}`);
        return;
    }

    const data = await response.json();
    console.log("✅ Server Response:", data);
    alert("Added to cart!");
    loadCart(); 
}

async function loadCart() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to view your cart.");
        window.location.href = "login.html";
        return;
    }

    const response = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const cartItems = await response.json();

    const cartDiv = document.getElementById("cartItems");
    cartDiv.innerHTML = "";

    if (cartItems.length === 0) {
        cartDiv.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cartItems.forEach(product => {
        cartDiv.innerHTML += `
            <div class="cart-item">
                <img src="${product.image_url}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Price: ${product.price}</p>
                <p>Quantity: ${product.quantity}</p>
                <button onclick="removeFromCart('${product._id}')">Remove</button>
            </div>
        `;
    });
}

async function removeFromCart(cartItemId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in.");
        window.location.href = "login.html";
        return;
    }

    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    if (response.ok) {
        console.log("✅ Removed from cart:", data);
        loadCart(); 
    } else {
        console.error("❌ Error removing from cart:", data);
        alert(`Error: ${data.error}`);
    }
}

document.addEventListener("DOMContentLoaded", loadCart);
