const fs = require('fs');
const lines = fs.readFileSync('public/js/admin.js', 'utf8').split('\n');

let newLines = [];
let skip = false;
let foundHandleFormSubmit = false;
let foundEditItem = false;
let foundClearItemForm = false;
let foundHandleFiles = false;
let foundShowPreview = false;

for (let i = 0; i < lines.length; i++) {
  
  if (!foundHandleFormSubmit && lines[i].includes('async function handleFormSubmit(e) {')) {
    skip = true;
    foundHandleFormSubmit = true;
    newLines.push(lines[i]); 
  }
  
  if (skip && foundHandleFormSubmit && lines[i].includes("const rating = parseFloat(document.getElementById('itemRating').value) || 5.0;")) {
    newLines.push(`  e.preventDefault();

  const id = document.getElementById('itemId').value;
  const type = document.getElementById('itemType').value;
  
  const actionText = id ? 'update' : 'add';
  const typeText = type === 'rental' ? 'rental product' : 'inventory product';
  const proceed = confirm(\`Are you sure you want to \${actionText} this \${typeText}?\`);
  if (!proceed) return;

  const name = document.getElementById('itemName').value.trim();
  const categoryRaw = document.getElementById('itemCategory').value.trim();
  const category = categoryRaw || 'daily-essentials';
  if (categoryRaw && !poojaCategories.some(c => c.toLowerCase() === categoryRaw.toLowerCase())) {
    poojaCategories.push(categoryRaw);
    localStorage.setItem('pooja_custom_categories', JSON.stringify(poojaCategories));
    renderCategoryDatalist();
  }
  const fileInput = document.getElementById('itemImageFile');
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
  const finalImages = [...uploadedImages];

  let price, mrp, deposit, height = null, width = null;
  let variants = [];

  const hasVariants = document.getElementById('hasVariants').checked;
  if (type === 'sale' && hasVariants) {
    const rows = document.querySelectorAll('#variantsList .variant-row');
    rows.forEach(row => {
      const qtyInput = row.querySelector('.variant-qty-input');
      const unitSelect = row.querySelector('.variant-unit-select');
      const unitCustom = row.querySelector('.variant-unit-custom');
      const mrpInput = row.querySelector('.variant-mrp-input');
      const priceInput = row.querySelector('.variant-price-input');
      if (qtyInput && mrpInput && priceInput) {
        const vQty = qtyInput.value.trim();
        let vUnit = '';
        if (unitSelect) {
          if (unitSelect.value === '__custom__') {
            vUnit = unitCustom ? unitCustom.value.trim() : '';
          } else {
            vUnit = unitSelect.value;
          }
        }
        const needsSpace = vUnit && !['g', 'kg', 'ml', 'L'].includes(vUnit);
        const vName = vQty + (vUnit ? (needsSpace ? ' ' + vUnit : vUnit) : '');
        const vMrp = parseFloat(mrpInput.value) || 0;
        const vPrice = parseFloat(priceInput.value) || 0;
        if (vName) {
          variants.push({ name: vName, mrp: vMrp, price: vPrice });
        }
      }
    });

    if (variants.length > 0) {
      mrp = variants[0].mrp;
      price = variants[0].price;
    } else {
      mrp = parseFloat(document.getElementById('itemMrp').value) || 0;
      price = parseFloat(document.getElementById('itemPrice').value) || 0;
    }
    deposit = null;
  } else if (type === 'rental') {
    price = parseFloat(document.getElementById('rentalPrice').value);
    const depVal = document.getElementById('rentalDeposit').value.trim();
    deposit = depVal ? parseFloat(depVal) : null;
    mrp = null;
    
    const heightInput = document.getElementById('rentalHeight');
    const widthInput = document.getElementById('rentalWidth');
    height = heightInput ? heightInput.value.trim() : null;
    width = widthInput ? widthInput.value.trim() : null;
  } else {
    mrp = parseFloat(document.getElementById('itemMrp').value);
    price = parseFloat(document.getElementById('itemPrice').value);
    deposit = null;
  }
  const rating = parseFloat(document.getElementById('itemRating').value) || 5.0;

  // Construct item record
  const itemData = {
    id: id || 'item-' + Date.now(),
    name,
    category,
    image: finalImageUrl,
    images: finalImages,
    type,
    price,
    mrp,
    deposit,
    height: type === 'rental' ? height : undefined,
    width: type === 'rental' ? width : undefined,
    description,
    rating,
    hasVariants,
    variants
  };`);
    
    while(!lines[i].includes('hasVariants,')) {
      i++;
    }
    i += 2; // skip variants and };
    skip = false;
    foundHandleFormSubmit = false; // avoid double trigger
    continue;
  }

  if (!skip && !foundEditItem && lines[i].includes('function editItem(id) {')) {
    skip = true;
    foundEditItem = true;
    newLines.push(`function editItem(id) {
  const item = globalProducts.find(p => p.id === id);
  if (!item) return;

  document.getElementById('itemId').value = item.id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemDescription').value = item.description || '';
  document.getElementById('itemRating').value = item.rating || 5.0;
  
  document.getElementById('itemImageUrl').value = '';
  
  uploadedImages = item.images && item.images.length > 0 ? [...item.images] : (item.image ? [item.image] : []);
  if(window.renderPreviews) renderPreviews();`);
    while(!lines[i].includes('// Handle variants if any')) {
      i++;
    }
    skip = false;
    foundEditItem = false;
    newLines.push(lines[i]);
    continue;
  }

  if (!skip && !foundClearItemForm && lines[i].includes('function clearItemForm() {')) {
    skip = true;
    foundClearItemForm = true;
    newLines.push(`function clearItemForm() {
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
  if(window.renderPreviews) renderPreviews();`);
    while(!lines[i].includes('hidePreview();')) {
      i++;
    }
    skip = false;
    foundClearItemForm = false;
    continue;
  }

  if (!skip && !foundHandleFiles && lines[i].includes('function handleFiles(files) {')) {
    skip = true;
    foundHandleFiles = true;
    newLines.push(`  function handleFiles(files) {
    if (files.length > 0) {
      let filesProcessed = 0;
      const urlInput = document.getElementById('itemImageUrl');
      if(urlInput) urlInput.value = '';

      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
          showToast('Skipping non-image file: ' + file.name);
          filesProcessed++;
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            uploadedImages.push(compressedDataUrl);
            
            filesProcessed++;
            if (filesProcessed === files.length) {
              if(window.renderPreviews) renderPreviews();
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }`);
    // skip until the end of the handleFiles function body
    let braceCount = 1; // start at 1 because we matched the signature
    i++;
    while(braceCount > 0 && i < lines.length) {
      if (lines[i].includes('{')) braceCount++;
      if (lines[i].includes('}')) braceCount--;
      i++;
    }
    i--; // rewind 1 because loop increments
    skip = false;
    foundHandleFiles = false;
    continue;
  }

  if (!skip && !foundShowPreview && lines[i].includes('function showPreview(src, name, sizeInfo) {')) {
    skip = true;
    foundShowPreview = true;
    newLines.push(`function renderPreviews() {
  const previewGrid = document.getElementById('dropzonePreview');
  const prompt = document.getElementById('dropzonePrompt');
  
  if (uploadedImages.length > 0) {
    previewGrid.style.display = 'flex';
    if(prompt) prompt.style.display = 'none';
    previewGrid.innerHTML = '';
    
    uploadedImages.forEach((src, index) => {
      const container = document.createElement('div');
      container.style.position = 'relative';
      container.style.width = '80px';
      container.style.height = '80px';
      container.style.borderRadius = '8px';
      container.style.overflow = 'hidden';
      container.style.border = '1px solid #ccc';
      
      const img = document.createElement('img');
      img.src = src;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '&times;';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '2px';
      removeBtn.style.right = '2px';
      removeBtn.style.background = 'rgba(255,0,0,0.8)';
      removeBtn.style.color = '#fff';
      removeBtn.style.border = 'none';
      removeBtn.style.borderRadius = '50%';
      removeBtn.style.width = '20px';
      removeBtn.style.height = '20px';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.display = 'flex';
      removeBtn.style.alignItems = 'center';
      removeBtn.style.justifyContent = 'center';
      removeBtn.style.fontSize = '14px';
      removeBtn.style.zIndex = '10';
      
      removeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadedImages.splice(index, 1);
        renderPreviews();
      };
      
      container.appendChild(img);
      container.appendChild(removeBtn);
      previewGrid.appendChild(container);
    });
    
    // Add "Add more" button
    const addMore = document.createElement('div');
    addMore.style.width = '80px';
    addMore.style.height = '80px';
    addMore.style.borderRadius = '8px';
    addMore.style.border = '2px dashed var(--color-primary)';
    addMore.style.display = 'flex';
    addMore.style.alignItems = 'center';
    addMore.style.justifyContent = 'center';
    addMore.style.cursor = 'pointer';
    addMore.style.color = 'var(--color-primary)';
    addMore.style.fontSize = '24px';
    addMore.innerHTML = '+';
    addMore.onclick = (e) => {
       e.preventDefault();
       e.stopPropagation();
       document.getElementById('itemImageFile').click();
    };
    previewGrid.appendChild(addMore);
    
  } else {
    previewGrid.style.display = 'none';
    if(prompt) prompt.style.display = 'block';
    previewGrid.innerHTML = '';
    const fileInput = document.getElementById('itemImageFile');
    if (fileInput) fileInput.value = '';
  }
}

window.renderPreviews = renderPreviews;
function showPreview(){ renderPreviews(); }
function hidePreview(){ renderPreviews(); }
`);
    
    // skip the original showPreview function body
    let braceCount = 1;
    i++;
    while(braceCount > 0 && i < lines.length) {
      if (lines[i].includes('{')) braceCount++;
      if (lines[i].includes('}')) braceCount--;
      i++;
    }
    
    // also skip hidePreview if it's next
    if (i < lines.length && lines[i].includes('function hidePreview() {')) {
      braceCount = 1;
      i++;
      while(braceCount > 0 && i < lines.length) {
        if (lines[i].includes('{')) braceCount++;
        if (lines[i].includes('}')) braceCount--;
        i++;
      }
    }
    i--;
    skip = false;
    foundShowPreview = false;
    continue;
  }
  
  if (!skip) {
    newLines.push(lines[i]);
  }
}

let finalCode = newLines.join('\n');
finalCode = finalCode.replace(/if\s*\(\s*removeBtn\s*\)\s*\{\s*removeBtn\.addEventListener\([\s\S]*?\}\);?\s*\}/, '');

fs.writeFileSync('public/js/admin.js', finalCode);
console.log('Fixed admin.js thoroughly.');
