const elements = {
  toggleCartBtn: document.getElementById("btn-cart"),
  cart: document.getElementById("cart"),
  cartShowEmpty: document.getElementById("cart-empty-content"),
  cartShowContent: document.getElementById("cart-content"),
  cartCountUI: document.getElementById("cart-count"),
  itemsContainer: document.getElementById("items-container"),
  cartOrderTotalSpan: document.getElementById("cart-order-total"),
  confirmOrderBtn: document.getElementById("btn-confirm-order"),
  dessertsContainer: document.getElementById("desserts-container"),
  confirmModal: document.getElementById("confirm-modal"),
  modalItemsContainer: document.getElementById("modal-items-container"),
  modalOrderTotalSpan: document.getElementById("modal-order-total"),
  modalBtn: document.getElementById("btn-modal"),
};
const appProducts = new Map();
let cartItemTemplate = null;
let confirmedItemTemplate = null;

class ShoppingCart {
  constructor() {
    this.items = new Map();
    this.orderTotal = 0;
    this.orderCount = 0;
  }

  addProduct(id) {
    this.items.set(id, { p: appProducts.get(id), qty: 1 });
  }

  removeProduct(id) {
    this.items.delete(id);
  }

  updateItemQuantity(id, delta) {
    let currentQty = this.getItemQuantity(id);
    const nextQty = currentQty + delta;
    if (nextQty === 0) {
      this.removeProduct(id);
      return -1;
    }
    this.items.get(id).qty = nextQty;
  }

  getItemQuantity(id) {
    return this.items.get(id)?.qty ?? 0;
  }

  getTotal() {
    this.orderTotal = 0;
    this.orderCount = 0;
    let total = [];
    this.items.forEach((v, k) => {
      const price = v.p.price;
      const totalPrice = Number(price) * v.qty;
      this.orderTotal += totalPrice;
      this.orderCount += v.qty;
      total.push({
        id: k,
        name: v.p.name,
        singlePrice: price,
        quantity: v.qty,
        totalPrice: totalPrice,
        thumbnail: v.p.thumb,
      });
    });
    return total;
  }

  getOrderTotal() {
    return this.orderTotal;
  }

  getOrderCount() {
    return this.orderCount;
  }
}

function handleToggleCartBtn() {
  const current = window.getComputedStyle(elements.cart).display;
  const next = current === "none" ? "block" : "none";
  elements.cart.style.display = next;
}

function fetchDataAndTemplate() {
  const dataPromise = fetch("./data.json").then((r) => r.json());
  const templatePromise = fetch("./assets/template-dessert.html").then((r) =>
    r.text()
  );
  return Promise.all([dataPromise, templatePromise]);
}

function showDessertItems(data, dessertTemplate) {
  let items = "";
  data.forEach((dessert) => {
    const dessertHTML = dessertTemplate
      .replaceAll("dssrtid", dessert.id)
      .replaceAll("dssrtimgdesk", dessert.image.desktop)
      .replaceAll("dssrtimgtab", dessert.image.tablet)
      .replaceAll("dssrtimgmob", dessert.image.mobile)
      .replaceAll("dssrtname", dessert.name)
      .replaceAll("dssrtcat", dessert.category)
      .replaceAll("dssrtprc", dessert.price);
    items += dessertHTML;
  });
  elements.dessertsContainer.innerHTML = items;
}

function addAppProducts(data) {
  data.forEach((item) => {
    appProducts.set(item.id, {
      name: item.name,
      price: item.price,
      thumb: item.image.thumbnail,
    });
  });
}

function updateCartUI(shpCart) {
  const data = shpCart.getTotal();
  const orderTotal = shpCart.getOrderTotal();
  const orderCount = shpCart.getOrderCount();
  elements.cartCountUI.textContent = orderCount;
  if (orderCount === 0) {
    elements.cartShowEmpty.classList.remove("hidden");
    elements.cartShowContent.classList.add("hidden");
    return;
  }
  elements.cartShowEmpty.classList.add("hidden");
  elements.cartShowContent.classList.remove("hidden");
  elements.cartOrderTotalSpan.textContent = `$${orderTotal}`;
  let HTML = "";
  data.forEach((item, i) => {
    HTML += cartItemTemplate
      .replaceAll("dssrtid", item.id)
      .replaceAll("dssrtname", item.name)
      .replaceAll("dssrtqty", item.quantity)
      .replaceAll("dssrtprc", item.singlePrice)
      .replaceAll("dssrtttl", item.totalPrice);
    if (i !== data.length - 1) {
      HTML += "<hr>";
    }
  });
  elements.itemsContainer.innerHTML = HTML;
}

function addProductBtnsListeners(shpCart) {
  const itemNodes = elements.dessertsContainer.querySelectorAll(".dessert");
  itemNodes.forEach((item) => {
    const itemID = Number(item.id.slice(8));
    const addToCartBtn = item.querySelector(".btn-add-to-cart");
    const itemQtyBtn = item.querySelector(".btn-item-qty");
    const itemQtySpan = item.querySelector(`#dessert-qty-${itemID}`);
    addToCartBtn.addEventListener("click", () => {
      addToCartBtn.classList.toggle("hidden");
      itemQtyBtn.classList.toggle("hidden");
      shpCart.addProduct(itemID);
      updateCartUI(shpCart);
    });
    itemQtyBtn.addEventListener("click", (e) => {
      if (e.target.getAttribute("data-action") === "inc-qty") {
        shpCart.updateItemQuantity(itemID, +1);
        itemQtySpan.textContent = shpCart.getItemQuantity(itemID);
        updateCartUI(shpCart);
      } else if (e.target.getAttribute("data-action") === "dec-qty") {
        if (shpCart.updateItemQuantity(itemID, -1) === -1) {
          itemQtySpan.textContent = 1;
          addToCartBtn.classList.toggle("hidden");
          itemQtyBtn.classList.toggle("hidden");
        } else {
          itemQtySpan.textContent = shpCart.getItemQuantity(itemID);
        }
        updateCartUI(shpCart);
      }
    });
  });
}

function showOrderConfirmation(shpCart) {
  const data = shpCart.getTotal();
  const orderTotal = shpCart.getOrderTotal();
  elements.modalOrderTotalSpan.textContent = `$${orderTotal}`;
  let html = "";
  data.forEach((item, i) => {
    html += confirmedItemTemplate
      .replaceAll("dssrtname", item.name)
      .replaceAll("dssrtthumb", item.thumbnail)
      .replaceAll("dssrtcount", item.quantity)
      .replaceAll("dssrtprice", item.singlePrice)
      .replaceAll("dssrtttle", item.totalPrice);
    if (i !== data.length - 1) {
      html += "<hr>";
    }
  });
  elements.modalItemsContainer.innerHTML = html;
  elements.confirmModal.showModal();
}

function handleCartClick(e, shpCart) {
  if (e.target.id === "btn-confirm-order") {
    showOrderConfirmation(shpCart);
  } else if (e.target.getAttribute("data-action") === "remove-cart-item") {
    const itemID = Number(e.target.getAttribute("data-id"));
    shpCart.removeProduct(itemID);
    updateCartUI(shpCart);
    const itemNode = document.getElementById(`dessert-${itemID}`);
    itemNode.querySelector(".btn-add-to-cart").classList.remove("hidden");
    itemNode.querySelector(".btn-item-qty").classList.add("hidden");
    itemNode.querySelector(`#dessert-qty-${itemID}`).textContent = 1;
  }
}

async function main() {
  const shoppingCart = new ShoppingCart();
  elements.toggleCartBtn.addEventListener("click", handleToggleCartBtn);
  /* set cart display property to default (remove inline css by above click handler)
     when window width switches between desktop and mobile
  */
  window.matchMedia("(min-width: 80em)").addEventListener("change", () => {
    elements.cart.style.removeProperty("display");
  });
  const [data, template] = await fetchDataAndTemplate();
  showDessertItems(data, template);
  addAppProducts(data);
  const cartItemTemplatePromise = fetch(
    "./assets/template-cart-item.html"
  ).then((r) => r.text());
  const confirmedItemTemplatePromise = fetch(
    "./assets/template-confirmed-item.html"
  ).then((r) => r.text());
  [cartItemTemplate, confirmedItemTemplate] = await Promise.all([
    cartItemTemplatePromise,
    confirmedItemTemplatePromise,
  ]);
  addProductBtnsListeners(shoppingCart);
  elements.cart.addEventListener("click", (e) =>
    handleCartClick(e, shoppingCart)
  );
}

main();
