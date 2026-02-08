window.alert("Saving is currently disabled. Please contact the developer if you’re interested in this application.")
let number = 0;
const fileInput = document.getElementById("fileInput");
const imageBox = document.getElementById("product_image");
const redBtn = document.getElementById("reduce_btn");
const incBtn = document.getElementById("increase_btn");
const prdQuntity = document.getElementById("num_of_product");
const product_name = document.getElementById("product_name");
const submit_product = document.getElementById("submit_product");
const product_cost = document.getElementById("product_cost");
const display = document.getElementById("display");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const linkCont = document.querySelector(".linkCont");

let imgSrc = "";

// Increase and decrease product count
redBtn.addEventListener("click", () => {
  number = Math.max(0, number - 1);
  prdQuntity.textContent = number;
});

incBtn.addEventListener("click", () => {
  number++;
  prdQuntity.textContent = number;
});

// Select product image
imageBox.addEventListener("click", () => {
  fileInput.click();
});

// 🔧 Compress image before saving
function compressImage(file, maxWidth = 400, maxHeight = 400, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize proportionally
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height *= maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width *= maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed base64
        const compressedData = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedData);
      };
    };
    reader.readAsDataURL(file);
  });
}

// Handle image input change
fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Compress the image before storing
    imgSrc = await compressImage(file);
    imageBox.src = imgSrc;
  }
});

// Local storage helpers
const getSavedProducts = () => JSON.parse(localStorage.getItem("products")) || [];

const saveProducts = (products) => {
  localStorage.setItem("products", JSON.stringify(products));
};

// Add new product
submit_product.addEventListener("click", () => {
  if (product_name.value.trim() === "" || product_cost.value.trim() === "" || number === 0) {
    alert("Please fill all fields and make sure quantity is not 0.");
    return;
  }

  const newProduct = {
    name: product_name.value.trim(),
    cost: parseFloat(product_cost.value),
    quantity: number,
    img: imgSrc || "/images/images (1).jpeg",
    sold: 0,
    soldOut: false,
  };

  const products = getSavedProducts();
  products.push(newProduct);
  saveProducts(products);

  displayProduct(newProduct);
  resetInputs();
});

// Display a single product
function displayProduct(product) {
  const div = document.createElement("div");
  div.classList.add("display-item");

  const productname = document.createElement("h4");
  productname.textContent = product.name;

  const img = document.createElement("img");
  img.src = product.img;
  img.style.height = "50%";
  img.style.width = "80%";
  img.style.border = "2px dashed grey";
  img.style.borderRadius = "4px";
  img.style.boxShadow = "0 0 2px black";

  const itmDiv = document.createElement("div");
  itmDiv.className = "itmDiv";

  const p = document.createElement("p");
  p.textContent = `Number Of Product(s): ${product.quantity}`;

  const perCost = document.createElement("p");
  perCost.textContent = `Cost per Product: $${product.cost}`;

  const totalCost = document.createElement("p");
  totalCost.textContent = `Total Cost: $${product.cost * product.quantity}`;

  const product_sold = document.createElement("p");
  product_sold.textContent = "Product Sold";
  product_sold.className = "product_sold";

  const btnDiv = document.createElement("div");
  btnDiv.className = "btnDiv";

  const btnone = document.createElement("button");
  btnone.textContent = "-";
  const sold = document.createElement("p");
  sold.textContent = product.sold;
  const btnTwo = document.createElement("button");
  btnTwo.textContent = "+";

  const soldOut = document.createElement("img");

  // If product already sold out
  if (product.soldOut || product.quantity - product.sold <= 0) {
    soldOut.src = "/images/images__2_-removebg-preview.png";
    soldOut.className = "soldOut";
    btnone.disabled = true;
    btnTwo.disabled = true;
  }

  btnone.addEventListener("click", () => {
    product.sold = Math.max(0, product.sold - 1);
    sold.textContent = product.sold;
  });

  btnTwo.addEventListener("click", () => {
    if (product.sold < product.quantity) {
      product.sold++;
      sold.textContent = product.sold;
    }
  });

  const updateBtn = document.createElement("button");
  updateBtn.textContent = "Update";

  updateBtn.addEventListener("click", () => {
    const remaining = product.quantity - product.sold;
    p.textContent = `Number Of Product(s): ${remaining}`;
    totalCost.textContent = `Total Cost: $${product.cost * remaining}`;

    if (remaining <= 0) {
      product.soldOut = true;
      soldOut.src = "SoldOut.png";
      soldOut.className = "soldOut";
      btnone.disabled = true;
      btnTwo.disabled = true;
      updateBtn.disabled = true;
    }

    product.quantity = remaining;
    product.sold = 0;
    sold.textContent = 0;

    const products = getSavedProducts();
    const index = products.findIndex((p) => p.name === product.name);
    if (index !== -1) {
      products[index] = product;
      saveProducts(products);
    }

    alert(`Product "${product.name}" updated successfully.`);
  });

  const clrBtn = document.createElement("button");
  clrBtn.textContent = "Clear Product";
  clrBtn.addEventListener("click", () => {
    const products = getSavedProducts().filter((p) => p.name !== product.name);
    saveProducts(products);

    // Save to history before removing
    const history = JSON.parse(localStorage.getItem("product_history")) || [];
    history.push({
      ...product,
      dateCleared: new Date().toLocaleString(),
    });
    localStorage.setItem("product_history", JSON.stringify(history));

    display.removeChild(div);
  });

  btnDiv.append(btnone, sold, btnTwo);

  const updDiv = document.createElement("div");
  updDiv.className = "updDiv";
  updDiv.append(updateBtn, clrBtn);

  itmDiv.append(p, perCost, totalCost);

  div.append(productname, img, product_sold, btnDiv, itmDiv, updDiv, soldOut);
  display.appendChild(div);
}

// Reset form
function resetInputs() {
  imageBox.src = "/images/images (1).jpeg";
  product_name.value = "";
  product_cost.value = "";
  number = 0;
  prdQuntity.textContent = 0;
  imgSrc = "";
}

// Load saved products
/*window.addEventListener("load", () => {
  const products = getSavedProducts();
  products.forEach(displayProduct);
});

// 🔍 Search filter
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim().toLowerCase();
  const allProducts = getSavedProducts();
  const results = allProducts.filter((p) => p.name.toLowerCase().includes(query));
  
  display.innerHTML = "";
  results.forEach(displayProduct);

  if (results.length === 0) {
    const noPrdDiv = document.createElement("div");
    noPrdDiv.style.width = "90vw";
    noPrdDiv.style.height = "40vh";
    noPrdDiv.style.display = "flex";
    noPrdDiv.style.alignItems = "center";
    noPrdDiv.style.justifyContent = "center";

    const noProduct = document.createElement("h2"); 
    noProduct.textContent = "No Product Found";
    noProduct.style.fontSize = "30px";

    noPrdDiv.appendChild(noProduct);
    display.appendChild(noPrdDiv);
  }
});*/