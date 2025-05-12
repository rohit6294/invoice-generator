// Initialize jsPDF
const { jsPDF } = window.jspdf;

// Handle form submission
document.getElementById('invoice-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const invoiceData = {
    invoiceNumber: document.getElementById('invoiceNumber').value,
    date: document.getElementById('date').value,
    customerName: document.getElementById('customerName').value,
    address: document.getElementById('address').value,
    productDetails: document.getElementById('productDetails').value,
    amount: parseFloat(document.getElementById('amount').value),
  };

  // Show invoice preview
  document.getElementById('preview-invoiceNumber').textContent = invoiceData.invoiceNumber;
  document.getElementById('preview-date').textContent = invoiceData.date;
  document.getElementById('preview-customerName').textContent = invoiceData.customerName;
  document.getElementById('preview-address').textContent = invoiceData.address;
  document.getElementById('preview-productDetails').textContent = invoiceData.productDetails;
  document.getElementById('preview-amount').textContent = invoiceData.amount.toFixed(2);
  document.getElementById('invoice-preview').style.display = 'block';

  // Save to backend
  try {
    const response = await fetch('https://invoice-generator-b03v.onrender.com/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    if (!response.ok) throw new Error('Failed to save invoice');
    alert('Invoice saved successfully!');
    fetchInvoices(); // Refresh the invoices table
  } catch (err) {
    console.error(err);
    alert('Error saving invoice');
  }
});

// Handle PDF download
document.getElementById('download-pdf').addEventListener('click', () => {
  const doc = new jsPDF();
  doc.text('Invoice', 10, 10);
  doc.text(`Invoice Number: ${document.getElementById('preview-invoiceNumber').textContent}`, 10, 20);
  doc.text(`Date: ${document.getElementById('preview-date').textContent}`, 10, 30);
  doc.text(`Customer Name: ${document.getElementById('preview-customerName').textContent}`, 10, 40);
  doc.text(`Address: ${document.getElementById('preview-address').textContent}`, 10, 50);
  doc.text(`Product Details: ${document.getElementById('preview-productDetails').textContent}`, 10, 60);
  doc.text(`Amount: ₹${document.getElementById('preview-amount').textContent}`, 10, 70);
  doc.save(`invoice_${document.getElementById('preview-invoiceNumber').textContent}.pdf`);
});

// Fetch and display previous invoices
async function fetchInvoices() {
  try {
    const response = await fetch('https://invoice-generator-b03v.onrender.com/api/invoices');
    const invoices = await response.json();
    const tbody = document.getElementById('invoices-body');
    tbody.innerHTML = '';
    invoices.forEach(invoice => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${invoice.invoiceNumber}</td>
        <td>${invoice.date}</td>
        <td>${invoice.customerName}</td>
        <td>₹${invoice.amount.toFixed(2)}</td>
        <td><button onclick="viewInvoice('${invoice.invoiceNumber}')">View</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    alert('Error fetching invoices');
  }
}

// View invoice details in a popup
async function viewInvoice(invoiceNumber) {
  try {
    const response = await fetch(`https://invoice-generator-b03v.onrender.com/api/invoices/${invoiceNumber}`);
    const invoice = await response.json();
    if (!invoice) throw new Error('Invoice not found');
    alert(`
      Invoice Number: ${invoice.invoiceNumber}
      Date: ${invoice.date}
      Customer Name: ${invoice.customerName}
      Address: ${invoice.address}
      Product Details: ${invoice.productDetails}
      Amount: ₹${invoice.amount.toFixed(2)}
    `);
  } catch (err) {
    console.error(err);
    alert('Error fetching invoice details');
  }
}

// Handle search by invoice number
document.getElementById('search-button').addEventListener('click', async () => {
  const invoiceNumber = document.getElementById('search-invoice').value;
  if (invoiceNumber) {
    await viewInvoice(invoiceNumber);
  } else {
    fetchInvoices();
  }
});

// Load invoices on page load
fetchInvoices();