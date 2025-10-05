const elements = {
  toggleCartBtn: document.getElementById("btn-cart"),
  cart: document.getElementById("cart"),
  dessertsContainer: document.getElementById("desserts-container"),
};
const appProducts = new Map();

class ShoppingCart {
  constructor() {
    this.items = new Map();
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
    appProducts.set(item.id, { name: item.name, price: item.price });
  });
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
    });
    itemQtyBtn.addEventListener("click", (e) => {
      if (e.target.getAttribute("data-action") === "inc-qty") {
        shpCart.updateItemQuantity(itemID, +1);
        itemQtySpan.textContent = shpCart.getItemQuantity(itemID);
      } else if (e.target.getAttribute("data-action") === "dec-qty") {
        if (shpCart.updateItemQuantity(itemID, -1) === -1) {
          itemQtySpan.textContent = 1;
          addToCartBtn.classList.toggle("hidden");
          itemQtyBtn.classList.toggle("hidden");
          return;
        }
        itemQtySpan.textContent = shpCart.getItemQuantity(itemID);
      }
    });
  });
}

async function main() {
  const shoppingCart = new ShoppingCart();
  elements.toggleCartBtn.addEventListener("click", handleToggleCartBtn);
  const [data, template] = await fetchDataAndTemplate();
  showDessertItems(data, template);
  addAppProducts(data);
  addProductBtnsListeners(shoppingCart);
}

main();
