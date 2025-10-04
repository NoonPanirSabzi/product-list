const elements = {
  dessertsContainer: document.getElementById("desserts-container"),
};

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

async function main() {
  const [data, template] = await fetchDataAndTemplate();
  showDessertItems(data, template);
}

main();
