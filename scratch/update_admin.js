const fs = require('fs');
let js = fs.readFileSync('public/js/admin.js', 'utf8');

// 1. Add global uploadedImages array
js = js.replace('const DEFAULT_ITEMS = [];', 'const DEFAULT_ITEMS = [];\nlet uploadedImages = [];');

// 2. Rewrite handleFiles
const oldHandleFiles = `  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file (PNG, JPG, JPEG).');
        return;
      }
      
      // Update file input files programmatically
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      // Clear url input since local file is selected
      urlInput.value = '';

      // Preview setup and client-side compression
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Approximate base64 size to KB
          const sizeKB = Math.round(compressedDataUrl.length / 1333); 
          const sizeStr = sizeKB + ' KB (Compressed)';
          
          showPreview(compressedDataUrl, file.name, sizeStr);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }`;

const newHandleFiles = `  function handleFiles(files) {
    if (files.length > 0) {
      let filesProcessed = 0;
      urlInput.value = '';

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
              renderPreviews();
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }`;

js = js.replace(oldHandleFiles, newHandleFiles);

// 3. Replace showPreview / hidePreview with renderPreviews
const oldPreviews = `function showPreview(src, name, sizeInfo) {
  const preview = document.getElementById('dropzonePreview');
  const prompt = document.querySelector('.dropzone-prompt');
  const previewImg = document.getElementById('previewImage');
  const previewName = document.getElementById('previewName');
  const previewSize = document.getElementById('previewSize');

  if (previewImg) previewImg.src = src;
  if (previewName) previewName.textContent = name;
  if (previewSize) previewSize.textContent = sizeInfo || '';
  
  if (preview) preview.style.display = 'flex';
  if (prompt) prompt.style.display = 'none';
}

function hidePreview() {
  const preview = document.getElementById('dropzonePreview');
  const prompt = document.querySelector('.dropzone-prompt');
  const previewImg = document.getElementById('previewImage');
  const fileInput = document.getElementById('itemImageFile');

  if (preview) preview.style.display = 'none';
  if (prompt) prompt.style.display = 'block';
  if (previewImg) previewImg.src = '';
  if (fileInput) fileInput.value = '';
}`;

const newPreviews = `function renderPreviews() {
  const previewGrid = document.getElementById('dropzonePreview');
  const prompt = document.getElementById('dropzonePrompt');
  
  if (uploadedImages.length > 0) {
    previewGrid.style.display = 'flex';
    prompt.style.display = 'none';
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
    prompt.style.display = 'block';
    previewGrid.innerHTML = '';
    const fileInput = document.getElementById('itemImageFile');
    if (fileInput) fileInput.value = '';
  }
}

window.renderPreviews = renderPreviews;
`;

js = js.replace(oldPreviews, newPreviews);

// 4. In DOMContentLoaded, we also bind removeBtn. We need to remove that part.
const oldRemoveBind = `  // Remove preview button handler
  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hidePreview();
    });
  }`;
js = js.replace(oldRemoveBind, '');

fs.writeFileSync('public/js/admin.js', js);
console.log('Done modifying admin.js');
