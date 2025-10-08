const elements = {
  toggleCartBtn: document.getElementById("btn-cart"),
  toggleCartBtnNotif: document.getElementById("btn-cart-notif"),
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

  addProduct(id, quantity) {
    this.items.set(id, { p: appProducts.get(id), qty: quantity });
  }

  removeProduct(id) {
    this.items.delete(id);
  }

  updateItemQuantity(id, delta) {
    const currentQty = this.getItemQuantity(id);
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
        totalPrice: totalPrice.toFixed(2),
        thumbnail: v.p.thumb,
      });
    });
    return total;
  }

  getOrderTotal() {
    return this.orderTotal.toFixed(2);
  }

  getOrderCount() {
    return this.orderCount;
  }

  clearCart() {
    this.orderTotal = 0;
    this.orderCount = 0;
    this.items.clear();
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
      .replaceAll("dssrtprc", dessert.price)
      .replace(
        "svgholderinc",
        `<svg data-action="inc-qty" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
<path data-action="inc-qty" d="M10.0001 2.5C14.1251 2.5 17.5001 5.875 17.5001 10C17.5001 14.125 14.1251 17.5 10.0001 17.5C5.87512 17.5 2.50012 14.125 2.50012 10C2.50012 5.875 5.87512 2.5 10.0001 2.5ZM10.0001 1.25C5.18762 1.25 1.25012 5.1875 1.25012 10C1.25012 14.8125 5.18762 18.75 10.0001 18.75C14.8126 18.75 18.7501 14.8125 18.7501 10C18.7501 5.1875 14.8126 1.25 10.0001 1.25Z" fill="white"/>
<path data-action="inc-qty" d="M15.0001 9.375H10.6251V5H9.37512V9.375H5.00012V10.625H9.37512V15H10.6251V10.625H15.0001V9.375Z" fill="currentColor"/>
</svg>`
      );
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

function updateItemsUI(itemsData) {
  itemsData.forEach(({ id, qty }) => {
    const node = document.getElementById(`dessert-${id}`);
    const img = node.querySelector(".dessert__img > picture img");
    const addToCartBtn = node.querySelector(".btn-add-to-cart");
    const itemQtyBtn = node.querySelector(".btn-item-qty");
    const itemQtySpan = node.querySelector(`#dessert-qty-${id}`);
    img.classList.add("selected");
    addToCartBtn.classList.add("hidden");
    itemQtyBtn.classList.remove("hidden");
    itemQtySpan.textContent = qty;
  });
}

function saveData(shpCart) {
  const data = [];
  shpCart
    .getTotal()
    .forEach((item) => data.push({ id: item.id, qty: item.quantity }));
  localStorage.setItem("dezertsListData", JSON.stringify(data));
}

function updateCartUI(shpCart) {
  const data = shpCart.getTotal();
  const orderTotal = shpCart.getOrderTotal();
  const orderCount = shpCart.getOrderCount();
  elements.cartCountUI.textContent = orderCount;
  if (orderCount === 0) {
    elements.cartShowEmpty.classList.remove("hidden");
    elements.cartShowContent.classList.add("hidden");
    elements.toggleCartBtnNotif.classList.add("hidden");
    return;
  }
  elements.cartShowEmpty.classList.add("hidden");
  elements.cartShowContent.classList.remove("hidden");
  elements.toggleCartBtnNotif.classList.remove("hidden");
  elements.cartOrderTotalSpan.textContent = `$${orderTotal}`;
  elements.toggleCartBtnNotif.textContent = orderCount;
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

function loadData() {
  const Cart = new ShoppingCart();
  const savedData = JSON.parse(localStorage.getItem("dezertsListData")) ?? [];
  if (savedData.length === 0) {
    return Cart;
  }
  savedData.forEach((item) => Cart.addProduct(item.id, item.qty));
  updateCartUI(Cart);
  updateItemsUI(savedData);
  return Cart;
}

function addProductBtnsListeners(shpCart) {
  const itemNodes = elements.dessertsContainer.querySelectorAll(".dessert");
  itemNodes.forEach((item) => {
    const itemID = Number(item.id.slice(8));
    const itemImg = item.querySelector(".dessert__img > picture img");
    const addToCartBtn = item.querySelector(".btn-add-to-cart");
    const itemQtyBtn = item.querySelector(".btn-item-qty");
    const itemQtySpan = item.querySelector(`#dessert-qty-${itemID}`);
    addToCartBtn.addEventListener("click", () => {
      addToCartBtn.classList.toggle("hidden");
      itemQtyBtn.classList.toggle("hidden");
      itemQtySpan.textContent = 1;
      itemImg.classList.add("selected");
      shpCart.addProduct(itemID, 1);
      updateCartUI(shpCart);
      saveData(shpCart);
    });
    itemQtyBtn.addEventListener("click", (e) => {
      if (e.target.getAttribute("data-action") === "inc-qty") {
        shpCart.updateItemQuantity(itemID, +1);
        itemQtySpan.textContent = shpCart.getItemQuantity(itemID);
        updateCartUI(shpCart);
        saveData(shpCart);
      } else if (e.target.getAttribute("data-action") === "dec-qty") {
        if (shpCart.updateItemQuantity(itemID, -1) === -1) {
          itemQtySpan.textContent = 1;
          addToCartBtn.classList.toggle("hidden");
          itemQtyBtn.classList.toggle("hidden");
          itemImg.classList.remove("selected");
        } else {
          itemQtySpan.textContent = shpCart.getItemQuantity(itemID);
        }
        updateCartUI(shpCart);
        saveData(shpCart);
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
  elements.confirmModal.scrollTop = 0;
}

function handleCartClick(e, shpCart) {
  if (e.target.id === "btn-confirm-order") {
    showOrderConfirmation(shpCart);
  } else if (e.target.getAttribute("data-action") === "remove-cart-item") {
    const itemID = Number(e.target.getAttribute("data-id"));
    shpCart.removeProduct(itemID);
    updateCartUI(shpCart);
    const itemNode = document.getElementById(`dessert-${itemID}`);
    itemNode
      .querySelector(".dessert__img > picture img")
      .classList.remove("selected");
    itemNode.querySelector(".btn-add-to-cart").classList.remove("hidden");
    itemNode.querySelector(".btn-item-qty").classList.add("hidden");
    itemNode.querySelector(`#dessert-qty-${itemID}`).textContent = 1;
    saveData(shpCart);
  }
}

function resetItemsUI() {
  elements.dessertsContainer
    .querySelectorAll(".btn-item-qty:not(.hidden)")
    .forEach((btn) => btn.classList.add("hidden"));
  elements.dessertsContainer
    .querySelectorAll(".btn-add-to-cart.hidden")
    .forEach((btn) => btn.classList.remove("hidden"));
  elements.dessertsContainer
    .querySelectorAll(".dessert__img > picture img.selected")
    .forEach((img) => img.classList.remove("selected"));
}

async function main() {
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
  const shoppingCart = loadData();
  addProductBtnsListeners(shoppingCart);
  elements.cart.addEventListener("click", (e) =>
    handleCartClick(e, shoppingCart)
  );
  elements.modalBtn.addEventListener("click", () => {
    shoppingCart.clearCart();
    updateCartUI(shoppingCart);
    resetItemsUI();
    elements.confirmModal.close();
    elements.cart.style.removeProperty("display");
    saveData(shoppingCart);
  });
}

main();
