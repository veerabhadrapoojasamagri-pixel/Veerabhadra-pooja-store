const fs = require('fs');
let c = fs.readFileSync('public/js/main.js', 'utf8');

const regex1 = /const name = document\.getElementById\('fullName'\)\.value\.trim\(\);[\s\S]*?let message = `Hello! I would like to book a \*Vratam Peta Rental\* package:\\n\\n`;/;
const replacement1 = `const name = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phoneNumber').value.trim();
      const date = document.getElementById('bookingDate').value;
      const duration = parseInt(document.getElementById('duration').value, 10);
      const address = document.getElementById('address').value.trim();
      
      const rentalDropdown = document.getElementById('rentalItemDropdown');
      const selectedOption = rentalDropdown ? rentalDropdown.options[rentalDropdown.selectedIndex] : null;

      let itemName = 'Vratam Peta Setup Kit';
      let itemPrice = 299;

      if (selectedOption && selectedOption.value) {
        itemName = selectedOption.getAttribute('data-name') || itemName;
        itemPrice = parseInt(selectedOption.getAttribute('data-price') || itemPrice, 10);
      } else if (rentalDropdown) {
        alert('Please select a rental item.');
        return;
      }

      if (!name || !phone || !date || !address) {
        alert('Please fill out all fields.');
        return;
      }

      const proceed = confirm("Are you sure you want to proceed with booking " + itemName + "?");
      if (!proceed) return;

      const totalAmount = (itemPrice * duration) + 500;
      const orderId = await saveOrderToStorage({
        customerName: name,
        mobileNumber: phone,
        address: address,
        items: [{ name: itemName, price: itemPrice, quantity: duration }],
        totalAmount: totalAmount,
        paymentMethod: 'UPI/Cash',
        status: 'Pending'
      });

      let message = \`Hello! I would like to book a rental package:\\n\\n\`;`;

c = c.replace(regex1, replacement1);

const regex2 = /const rentalItems = allItems\.filter\(i => i\.type === 'rental'\);\s+if \(rentalItems\.length === 0\) {/;
const replacement2 = `const rentalItems = allItems.filter(i => i.type === 'rental');

  const rentalDropdown = document.getElementById('rentalItemDropdown');
  if (rentalDropdown) {
    let optionsHtml = '<option value="">-- Select Rental Item --</option>';
    rentalItems.forEach(item => {
      optionsHtml += \`<option value="\${item.id}" data-price="\${item.price}" data-name="\${item.name.replace(/"/g, '&quot;')}">\${item.name} (₹\${item.price}/day)</option>\`;
    });
    rentalDropdown.innerHTML = optionsHtml;
  }

  if (rentalItems.length === 0) {`;

c = c.replace(regex2, replacement2);

fs.writeFileSync('public/js/main.js', c);
console.log("Done");
