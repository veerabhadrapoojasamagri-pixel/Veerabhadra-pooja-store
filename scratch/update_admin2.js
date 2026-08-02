const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. Update image extraction in handleFormSubmit
const oldExtraction = `  const fileInput = document.getElementById('itemImageFile');
  let imageUrl = document.getElementById('itemImageUrl').value.trim();
  const description = document.getElementById('itemDescription').value.trim();

  // Check dropzone preview element for uploaded/selected image data
  const previewImg = document.getElementById('previewImage');
  if (!imageUrl && previewImg && previewImg.src && previewImg.src !== window.location.href && previewImg.src.length > 50) {
    imageUrl = previewImg.src;
  }`;

const newExtraction = `  const fileInput = document.getElementById('itemImageFile');
  let imageUrl = document.getElementById('itemImageUrl').value.trim();
  const description = document.getElementById('itemDescription').value.trim();

  if (imageUrl && !uploadedImages.includes(imageUrl)) {
    uploadedImages.push(imageUrl);
  }
  
  if (uploadedImages.length === 0) {
    showToast('Please provide at least one image.');
    return;
  }
  
  const finalImageUrl = uploadedImages[0];
  const finalImages = [...uploadedImages];`;

js = js.replace(oldExtraction, newExtraction);

// 2. Update itemData construction in handleFormSubmit
const oldItemData = `  // Construct item record
  const itemData = {
    id: id || 'item-' + Date.now(),
    name,
    category,
    image: imageUrl || (type === 'rental' ? 'images/vratam-peta.png' : 'images/brass-diya.png'),
    type,`;

const newItemData = `  // Construct item record
  const itemData = {
    id: id || 'item-' + Date.now(),
    name,
    category,
    image: finalImageUrl,
    images: finalImages,
    type,`;

js = js.replace(oldItemData, newItemData);

// 3. Update editItem function to populate uploadedImages
const oldEditItemStart = `function editItem(id) {
  const item = globalProducts.find(p => p.id === id);
  if (!item) return;

  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemDescription').value = item.description || '';
  document.getElementById('itemRating').value = item.rating || 5.0;
  
  document.getElementById('itemImageUrl').value = item.image || '';
  
  // Show preview if image exists
  if (item.image) {
    showPreview(item.image, 'Saved Image');
  } else {
    hidePreview();
  }`;

const newEditItemStart = `function editItem(id) {
  const item = globalProducts.find(p => p.id === id);
  if (!item) return;

  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemDescription').value = item.description || '';
  document.getElementById('itemRating').value = item.rating || 5.0;
  
  document.getElementById('itemImageUrl').value = '';
  
  uploadedImages = item.images && item.images.length > 0 ? [...item.images] : (item.image ? [item.image] : []);
  if(window.renderPreviews) renderPreviews();
`;

js = js.replace(oldEditItemStart, newEditItemStart);

// 4. Update clearItemForm to reset uploadedImages
const oldClearForm = `function clearItemForm() {
  document.getElementById('itemId').value = '';
  document.getElementById('itemName').value = '';
  document.getElementById('itemCategory').value = '';
  document.getElementById('itemPrice').value = '';
  document.getElementById('itemMrp').value = '';
  document.getElementById('rentalPrice').value = '';
  document.getElementById('rentalDeposit').value = '';
  document.getElementById('rentalHeight').value = '';
  document.getElementById('rentalWidth').value = '';
  document.getElementById('itemImageUrl').value = '';
  document.getElementById('itemDescription').value = '';
  document.getElementById('itemRating').value = '5.0';
  document.getElementById('hasVariants').checked = false;
  
  hidePreview();`;

const newClearForm = `function clearItemForm() {
  document.getElementById('itemId').value = '';
  document.getElementById('itemName').value = '';
  document.getElementById('itemCategory').value = '';
  document.getElementById('itemPrice').value = '';
  document.getElementById('itemMrp').value = '';
  document.getElementById('rentalPrice').value = '';
  document.getElementById('rentalDeposit').value = '';
  document.getElementById('rentalHeight').value = '';
  document.getElementById('rentalWidth').value = '';
  document.getElementById('itemImageUrl').value = '';
  document.getElementById('itemDescription').value = '';
  document.getElementById('itemRating').value = '5.0';
  document.getElementById('hasVariants').checked = false;
  
  uploadedImages = [];
  if(window.renderPreviews) renderPreviews();`;

js = js.replace(oldClearForm, newClearForm);

fs.writeFileSync('public/js/admin.js', js);
console.log('admin.js updated successfully.');
