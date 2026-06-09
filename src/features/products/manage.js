export function buildProductPayload() {
  return {
    title: document.getElementById("prodTitle").value.trim(),
    description: document.getElementById("prodDesc").value.trim(),
    brand: document.getElementById("prodBrand").value.trim(),
    price: parseFloat(document.getElementById("prodPrice").value),
    condition: document.getElementById("prodCondition").value,
    stockQuantity: parseInt(document.getElementById("prodStock").value) || 1,
    location: document.getElementById("prodLocation").value.trim(),
    categoryId: parseInt(document.getElementById("prodCategory").value),
  };
}
