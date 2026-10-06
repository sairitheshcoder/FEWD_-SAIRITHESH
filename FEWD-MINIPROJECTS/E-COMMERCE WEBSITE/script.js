// ---------- Product data ----------
const products = [
    { id: 1, name: "Laptop",        category: "electronics", price: 50000, icon: "💻", description: "High-performance laptop for students." },
    { id: 2, name: "Smartphone",    category: "electronics", price: 20000, icon: "📱", description: "Modern smartphone with excellent features." },
    { id: 3, name: "T-Shirt",       category: "clothing",    price: 599,   icon: "👕", description: "Comfortable cotton T-shirt." },
    { id: 4, name: "Running Shoes", category: "shoes",       price: 1999,  icon: "👟", description: "Comfortable shoes for daily running." }
];

// ---------- State ----------
let cart = loadCart();          // [{ id, qty }]
let currentCategory = "all";
let searchText = "";

// ---------- Element references ----------
const productContainer = document.getElementById("productContainer");
const noResults        = document.getElementById("noResults");
const cartItemsList    = document.getElementById("cartItems");
const totalElement     = document.getElementById("total");
const cartCount        = document.getElementById("cartCount");

// ---------- Helpers ----------
function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function findProduct(id) {
    return products.find(function (p) { return p.id === id; });
}

function loadCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (error) {
        return [];
    }
}

function saveCart() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
        // storage not available - the cart still works for this visit
    }
}

// ---------- Show products ----------
function displayProducts() {
    productContainer.innerHTML = "";

    const visible = products.filter(function (p) {
        const matchesCategory = currentCategory === "all" || p.category === currentCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchText.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    visible.forEach(function (p) {
        const card = document.createElement("div");
        card.className = "product " + p.category;

        card.innerHTML =
            '<div class="product-img">' + p.icon + "</div>" +
            "<h3>" + p.name + "</h3>" +
            "<p>" + p.description + "</p>" +
            '<p class="price">' + formatPrice(p.price) + "</p>" +
            '<button class="btn-add" data-id="' + p.id + '">Add to Cart</button>';

        productContainer.appendChild(card);
    });

    noResults.hidden = visible.length > 0;
}

// ---------- Cart actions ----------
function addToCart(id) {
    const item = cart.find(function (c) { return c.id === id; });

    if (item) {
        item.qty++;
    } else {
        cart.push({ id: id, qty: 1 });
    }
    updateCart();
}

function changeQuantity(id, change) {
    const item = cart.find(function (c) { return c.id === id; });
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        removeFromCart(id);
        return;
    }
    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(function (c) { return c.id !== id; });
    updateCart();
}

function clearCart() {
    cart = [];
    updateCart();
}

// ---------- Show cart ----------
function displayCart() {
    cartItemsList.innerHTML = "";
    let totalPrice = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li class="cart-empty">No products added to cart.</li>';
    }

    cart.forEach(function (c) {
        const product = findProduct(c.id);
        const lineTotal = product.price * c.qty;
        totalPrice += lineTotal;
        totalItems += c.qty;

        const li = document.createElement("li");
        li.innerHTML =
            '<span class="item-name">' + product.icon + " " + product.name + "</span>" +
            '<span class="qty-controls">' +
                '<button class="qty-btn" data-action="minus" data-id="' + c.id + '">−</button>' +
                "<span>" + c.qty + "</span>" +
                '<button class="qty-btn" data-action="plus" data-id="' + c.id + '">+</button>' +
            "</span>" +
            '<span class="item-total">' + formatPrice(lineTotal) + "</span>" +
            '<button class="remove-btn" data-action="remove" data-id="' + c.id + '">Remove</button>';

        cartItemsList.appendChild(li);
    });

    totalElement.textContent = "Total: " + formatPrice(totalPrice);
    cartCount.textContent = totalItems;
}

function updateCart() {
    saveCart();
    displayCart();
}

// ---------- Event listeners ----------
// Add to Cart buttons
productContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-add")) {
        addToCart(Number(e.target.dataset.id));
    }
});

// +, - and Remove buttons inside the cart
cartItemsList.addEventListener("click", function (e) {
    const action = e.target.dataset.action;
    const id = Number(e.target.dataset.id);

    if (action === "plus")   changeQuantity(id, 1);
    if (action === "minus")  changeQuantity(id, -1);
    if (action === "remove") removeFromCart(id);
});

// Category filter buttons
document.getElementById("filters").addEventListener("click", function (e) {
    if (!e.target.classList.contains("filter-btn")) return;

    document.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("active");
    });
    e.target.classList.add("active");

    currentCategory = e.target.dataset.category;
    displayProducts();
});

// Search box
document.getElementById("searchBox").addEventListener("input", function (e) {
    searchText = e.target.value;
    displayProducts();
});

// Clear cart button
document.getElementById("clearCart").addEventListener("click", clearCart);

// ---------- Start ----------
displayProducts();
displayCart();