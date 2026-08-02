const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. Replace handleFiles completely
const handleFilesRegex = /function handleFiles\(files\) \{[\s\S]*?\}\s*\}\s*\}/;
const newHandleFiles = `function handleFiles(files) {
    if (files.length > 0) {
      let filesProcessed = 0;
      const urlInput = document.getElementById('itemImageUrl');
      if (urlInput) urlInput.value = '';

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
              if (window.renderPreviews) renderPreviews();
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }`;
js = js.replace(handleFilesRegex, newHandleFiles);

// 2. Replace showPreview
const showPreviewRegex = /function showPreview\(src,\s*name,\s*sizeInfo\)\s*\{[\s\S]*?\n\}/;
const newShowPreview = `function renderPreviews() {
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
function showPreview(src, name, sizeInfo) {
  if (src && !uploadedImages.includes(src)) uploadedImages.push(src);
  renderPreviews();
}`;
js = js.replace(showPreviewRegex, newShowPreview);

// 3. Replace hidePreview
const hidePreviewRegex = /function hidePreview\(\)\s*\{[\s\S]*?\n\}/;
const newHidePreview = `function hidePreview() {
  uploadedImages = [];
  if (window.renderPreviews) renderPreviews();
}`;
js = js.replace(hidePreviewRegex, newHidePreview);

// 4. Update clearForm (not clearItemForm, it's clearForm)
const clearFormRegex = /function clearForm\(\)\s*\{[\s\S]*?hidePreview\(\);\s*\}/;
const newClearForm = `function clearForm() {
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
  
  hidePreview();
}`;
js = js.replace(clearFormRegex, newClearForm);

// 5. Update remove preview button handler
js = js.replace(/if\s*\(\s*removeBtn\s*\)\s*\{\s*removeBtn\.addEventListener\([\s\S]*?\}\);?\s*\}/, '');

fs.writeFileSync('public/js/admin.js', js);
console.log('Fixed handleFiles and previews');
