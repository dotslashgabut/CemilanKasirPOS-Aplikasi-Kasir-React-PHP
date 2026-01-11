// Helper function to generate improved print layouts
import { Transaction, StoreSettings, Purchase } from '../types';
import { formatDateDateOnly } from '../utils';

const formatDateWithTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timePart = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.');
    return `${datePart} ${timePart}`;
};

const formatNumber = (val: number) => {
    return val.toLocaleString('id-ID');
};


export const generatePrintInvoice = (tx: Transaction, settings: StoreSettings, formatIDR: (val: number) => string, formatDate: (date: string) => string) => {
    const type = settings.printerType || '58mm';
    const isA4 = type === 'A4';

    // CSS based on printer type
    let css = '';
    const bodyBase = `body { width: 100%; margin: 0; padding: 0; background-color: #fff; display: flex; justify-content: center; }`;
    let containerCss = '';

    if (type === '80mm') {
        containerCss = `font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 78mm; color: #000; text-align: left;`;
        css = `${bodyBase} .print-page { ${containerCss} box-sizing: border-box; }`;
    } else if (isA4) {
        containerCss = `font-family: Arial, sans-serif; font-size: 10pt; padding: 2px 10px; width: 100%; max-width: 210mm; color: #000; line-height: 1; text-align: left;`;
        css = `
            ${bodyBase}
            .print-page { ${containerCss} box-sizing: border-box; }
            .header-title { text-align: center; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
            .header-grid { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: flex-start; }
            .store-info { width: 50%; }
            .customer-info { width: 45%; }
            
            .store-name { font-size: 12pt; font-weight: bold; margin: 0 0 4px 0; }
            .store-jargon { font-style: italic; color: #000; font-size: 9pt; margin: 0 0 4px 0; }
            .info-text { margin: 0 0 4px 0; font-size: 10pt; }
            
            .customer-title { margin: 0 0 4px 0; font-size: 10pt; }
            .customer-name { font-weight: bold; font-size: 11pt; margin: 0 0 4px 0; text-transform: uppercase; }
            
            table { width: 100%; border-collapse: collapse; margin: 2px 0; }
            th, td { border: 1px solid #000; padding: 2px 4px; font-size: 10pt; }
            th { text-align: center; background-color: white; font-weight: bold; }
            td { vertical-align: middle; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .footer-container { display: flex; justify-content: space-between; margin-top: 2px; }
            .footer-left { flex: 1; padding-right: 15px; }
            .footer-right { display: flex; justify-content: flex-end; }
            
            .payment-info { margin-bottom: 8px; }
            .payment-info-title { font-weight: bold; margin: 0 0 4px 0; }
            .payment-note-container { margin-top: 10px; font-size: 10pt; line-height: 1.4; }

            .summary-table { width: 100%; border-collapse: collapse; }
            .summary-table td { border: 1px solid #000; padding: 2px 4px; }
            
            .signature-section { display: flex; justify-content: space-between; margin-top: 5px; padding: 0 10px; }
            .sig-box { text-align: center; width: 120px; }
            .sig-title { margin-bottom: 20px; margin-top: 0; }
            .sig-line { border-top: 1px dotted #000; font-weight: bold; padding-top: 5px; margin: 0; }
            
            /* Helper for date alignment if needed */
            .date-row { text-align: right; margin: 0; }
        `;
    } else {
        containerCss = `font-family: 'Courier New', monospace; font-size: 11px; padding: 5px; width: 56mm; color: #000; text-align: left;`;
        css = `${bodyBase} .print-page { ${containerCss} box-sizing: border-box; }`;
    }

    // Calculations
    const discountAmount = tx.discountAmount || 0;
    const subTotal = tx.totalAmount + discountAmount;

    // Items HTML
    let itemsHtml = '';
    if (isA4) {
        itemsHtml = `
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No</th>
                        <th style="width: 100px;">Kode</th>
                        <th>Nama Barang</th>
                        <th style="width: 80px;">Qty</th>
                        <th style="width: 120px;">Harga</th>
                        <th style="width: 120px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${tx.items.map((item, idx) => `
                        <tr>
                            <td class="text-center">${idx + 1}</td>
                            <td>${item.sku || '-'}</td>
                            <td>${item.name}</td>
                            <td class="text-center">${item.qty} ${item.unit || 'Pcs'}</td>
                            <td class="text-right">${formatNumber(item.finalPrice)}</td>
                            <td class="text-right">${formatNumber(item.finalPrice * item.qty)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        itemsHtml = tx.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
                <div style="max-width: 60%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${item.name} x${item.qty} ${item.unit || 'Pcs'}</div>
                <div>${formatIDR(item.finalPrice * item.qty)}</div>
            </div>
        `).join('');
    }

    // A4 Content Construction
    if (isA4) {
        const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';

        return `
        <html>
            <head>
                <title>Faktur Penjualan #${tx.invoiceNumber || tx.id.substring(0, 8)}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="print-page">
                    <div class="header-title">FAKTUR PENJUALAN</div>
                    
                    <div class="header-grid">
                        <div class="store-info">
                            <div class="store-name">${settings.name}</div>
                            ${settings.showJargon ? `<div class="store-jargon">${settings.jargon}</div>` : ''}
                            ${settings.showAddress ? `<div class="info-text">${settings.address}</div>` : ''}
                            <div class="info-text">${settings.phone}</div>
                        </div>
                        <div class="customer-info">
                            <div class="customer-title">Kepada Yth.</div>
                            <div class="customer-name">${tx.customerName}</div>
                            <div class="info-text">${tx.customerAddress || '-'}</div>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1px; border-bottom: 1px solid #000;">
                        <tr>
                            <td style="border: none; padding: 0 0 2px 0; width: 50%;">
                                 <div class="info-text" style="font-size: 11pt;">
                                    No. Faktur: ${tx.invoiceNumber || tx.id.substring(0, 8)} / ${tx.paymentStatus === 'LUNAS' ? 'Lunas' : tx.paymentStatus === 'SEBAGIAN' ? 'Sebagian' : 'Belum Lunas'}
                                </div>
                            </td>
                            <td style="border: none; padding: 0 0 2px 0; text-align: right; width: 50%;">
                                <div class="info-text">
                                    ${formatDateWithTime(tx.date)}
                                </div>
                            </td>
                        </tr>
                    </table>

                    ${itemsHtml}

                    <div class="footer-container">
                        <div class="footer-left">
                            ${bankInfo ? `
                                <div class="payment-info">
                                    <div class="payment-info-title">Informasi Pembayaran:</div>
                                    <div style="font-size: 10pt; white-space: pre-wrap;">${bankInfo}</div>
                                </div>
                            ` : ''}
                            
                            ${tx.paymentNote ? `
                                <div style="margin-top: 10px; font-size: 10pt;">
                                    <strong>Catatan:</strong> <span style="white-space: pre-wrap;">${tx.paymentNote}</span>
                                </div>
                            ` : ''}

                             ${tx.returnNote ? `
                                <div class="payment-note-container">
                                    <strong>Catatan Retur:</strong> ${tx.returnNote}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="footer-right">
                             <table class="summary-table" style="width: auto;">
                                <tr>
                                    <td style="width: 120px;">Sub Total</td>
                                    <td style="width: 120px; text-align: right;">${formatNumber(subTotal)}</td>
                                </tr>
                                <tr>
                                    <td>Diskon</td>
                                    <td style="text-align: right;">${formatNumber(discountAmount)}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold;">Total Bayar</td>
                                    <td style="text-align: right; font-weight: bold;">${formatNumber(tx.totalAmount)}</td>
                                </tr>
                                <tr>
                                    <td>Bayar (${tx.paymentMethod})</td>
                                    <td style="text-align: right;">${formatNumber(tx.amountPaid)}</td>
                                </tr>
                                ${tx.change < 0 ? `
                                <tr>
                                    <td style="color: #000;">Sisa Utang</td>
                                    <td style="text-align: right; color: #000;">${formatNumber(Math.abs(tx.change))}</td>
                                </tr>
                                ` : `
                                <tr>
                                    <td>Kembalian</td>
                                    <td style="text-align: right;">${formatNumber(tx.change)}</td>
                                </tr>
                                `}
                            </table>
                        </div>
                    </div>

                    <div class="signature-section">
                        <div class="sig-box">
                            <div class="sig-title">Tanda Terima</div>
                            <div style="margin-top: 5px;">.........................</div>
                        </div>
                         <div class="sig-box">
                            <div class="sig-title">Hormat Kami</div>
                            <div style="font-weight: bold; margin-top: 5px;">${tx.cashierName}</div>
                        </div>
                    </div>
                </div>
                
                <script>window.print(); setTimeout(function(){ window.close(); }, 1000);</script>
            </body>
        </html>
        `;
    } else {
        // ... (Existing Thermal POS Layout)
        let headerHtml = `
            <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
                <h3 style="margin:0; font-size: 14px;">${settings.name}</h3>
                ${settings.showJargon ? `<p style="margin:2px 0; font-style:italic;">${settings.jargon}</p>` : ''}
                ${settings.showAddress ? `<p style="margin:2px 0;">${settings.address}</p>` : ''}
                <p style="margin:2px 0;">${settings.phone}</p>
            </div>
            <div style="margin-bottom: 10px; font-size: 90%;">
                <div>Tgl: ${formatDate(tx.date)}</div>
                <div>No: ${tx.invoiceNumber || tx.id.substring(0, 8)}</div>
                <div>Kasir: ${tx.cashierName}</div>
                <div>Plg: ${tx.customerName}</div>
            </div>
        `;

        const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';

        let contentHtml = `
            <div style="margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><strong>TOTAL</strong> <strong>${formatIDR(tx.totalAmount)}</strong></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">BAYAR (${tx.paymentMethod}) <span>${formatIDR(tx.amountPaid)}</span></div>
                ${tx.change > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">KEMBALIAN <span>${formatIDR(tx.change)}</span></div>` : ''}
                ${tx.change < 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">SISA UTANG <span>${formatIDR(Math.abs(tx.change))}</span></div>` : ''}
            </div>
            <div class="footer">
                ${settings.showBank && bankInfo ? `<p style="margin:5px 0;">${bankInfo}</p>` : ''}
                <p style="margin:5px 0;">${settings.footerMessage}</p>
            </div>
        `;

        return `
        <html>
            <head>
                <title>Nota #${tx.id.substring(0, 8)}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="print-page">
                    ${headerHtml}
                    ${itemsHtml}
                    ${contentHtml}
                </div>
                <script>window.print(); setTimeout(function(){ window.close(); }, 1000);</script>
            </body>
        </html>
        `;
    }
};

export const generatePrintGoodsNote = (tx: Transaction, settings: StoreSettings, formatIDR: (val: number) => string, formatDate: (date: string) => string) => {
    const type = settings.printerType || '58mm';
    const isA4 = type === 'A4';

    // Calculations
    const discountAmount = tx.discountAmount || 0;
    const subTotal = tx.totalAmount + discountAmount;

    // CSS based on printer type
    let css = '';
    const bodyBase = `body { width: 100%; margin: 0; padding: 0; background-color: #fff; display: flex; justify-content: center; }`;
    let containerCss = '';

    if (type === '80mm') {
        containerCss = `font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 78mm; color: #000; text-align: left;`;
        css = `${bodyBase} .print-page { ${containerCss} box-sizing: border-box; }`;
    } else if (isA4) {
        containerCss = `font-family: Arial, sans-serif; font-size: 10pt; padding: 2px 10px; width: 100%; max-width: 210mm; color: #000; line-height: 1; text-align: left;`;
        css = `
            ${bodyBase}
            .print-page { ${containerCss} box-sizing: border-box; }
            .header-title { text-align: center; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
            .header-grid { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: flex-start; }
            .store-info { width: 50%; }
            .customer-info { width: 45%; }
            
            .store-name { font-size: 12pt; font-weight: bold; margin: 0 0 4px 0; }
            .store-jargon { font-style: italic; color: #000; font-size: 9pt; margin: 0 0 4px 0; }
            .info-text { margin: 0 0 4px 0; font-size: 10pt; }
            
            .customer-title { margin: 0 0 4px 0; font-size: 10pt; }
            .customer-name { font-weight: bold; font-size: 11pt; margin: 0 0 4px 0; text-transform: uppercase; }
            
            table { width: 100%; border-collapse: collapse; margin: 2px 0; }
            th, td { border: 1px solid #000; padding: 2px 4px; font-size: 10pt; }
            th { text-align: center; background-color: white; font-weight: bold; }
            td { vertical-align: middle; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .footer-container { display: flex; justify-content: space-between; margin-top: 2px; }
            .footer-left { flex: 1; padding-right: 15px; }
            .footer-right { display: flex; justify-content: flex-end; }
            
            .payment-info { margin-bottom: 8px; }
            .payment-info-title { font-weight: bold; margin: 0 0 4px 0; }
            
            .summary-table { width: 100%; border-collapse: collapse; }
            .summary-table td { border: 1px solid #000; padding: 2px 4px; }

            .signature-section { display: flex; justify-content: space-between; margin-top: 5px; padding: 0 10px; }
            .sig-box { text-align: center; width: 120px; }
            .sig-title { margin-bottom: 20px; margin-top: 0; }
            .sig-line { border-top: 1px dotted #000; font-weight: bold; padding-top: 5px; margin: 0; }

            .date-row { text-align: right; margin: 0; }
        `;
    } else {
        containerCss = `font-family: 'Courier New', monospace; font-size: 11px; padding: 5px; width: 56mm; color: #000; text-align: left;`;
        css = `${bodyBase} .print-page { ${containerCss} box-sizing: border-box; }`;
    }

    // Items HTML
    let itemsHtml = '';
    if (isA4) {
        itemsHtml = `
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No</th>
                        <th style="width: 100px;">Kode</th>
                        <th>Nama Barang</th>
                        <th style="width: 80px;">Qty</th>
                        <th style="width: 120px;">Harga</th>
                        <th style="width: 120px;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${tx.items.map((item, idx) => `
                        <tr>
                            <td class="text-center">${idx + 1}</td>
                            <td>${item.sku || '-'}</td>
                            <td>${item.name}</td>
                            <td class="text-center">${item.qty} ${item.unit || 'Pcs'}</td>
                            <td class="text-right">${formatNumber(item.finalPrice)}</td>
                            <td class="text-right">${formatNumber(item.finalPrice * item.qty)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        itemsHtml = tx.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
                <div style="max-width: 60%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${item.name} x${item.qty} ${item.unit || 'Pcs'}</div>
                <div>${formatIDR(item.finalPrice * item.qty)}</div>
            </div>
        `).join('');
    }

    if (isA4) {
        const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';
        return `
        <html>
            <head>
                <title>Nota Barang #${tx.invoiceNumber || tx.id.substring(0, 8)}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="print-page">
                    <div class="header-title">NOTA BARANG</div>
                    
                    <div class="header-grid">
                        <div class="store-info">
                            <div class="store-name">${settings.name}</div>
                            ${settings.showAddress ? `<div class="info-text">${settings.address}</div>` : ''}
                            <div class="info-text">${settings.phone}</div>
                        </div>
                        <div class="customer-info">
                            <div class="customer-title">Kepada Yth.</div>
                            <div class="customer-name">${tx.customerName}</div>
                            <div class="info-text">${tx.customerAddress || '-'}</div>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1px; border-bottom: 1px solid #000;">
                        <tr>
                            <td style="border: none; padding: 0 0 2px 0; width: 50%;">
                                <div class="info-text" style="font-size: 11pt;">
                                    No. Faktur: ${tx.invoiceNumber || tx.id.substring(0, 8)} / ${tx.paymentStatus === 'LUNAS' ? 'Lunas' : tx.paymentStatus === 'SEBAGIAN' ? 'Sebagian' : 'Belum Lunas'}
                                </div>
                            </td>
                            <td style="border: none; padding: 0 0 2px 0; text-align: right; width: 50%;">
                                <div class="info-text">
                                    ${formatDateWithTime(tx.date)}
                                </div>
                            </td>
                        </tr>
                    </table>

                    ${itemsHtml}

                   <div class="footer-container">
                        <div class="footer-left">
                            ${bankInfo ? `
                                <div class="payment-info">
                                    <div class="payment-info-title">Informasi Pembayaran:</div>
                                    <div style="font-size: 10pt; white-space: pre-wrap;">${bankInfo}</div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="footer-right">
                             <table class="summary-table" style="width: auto;">
                                <tr>
                                    <td style="width: 120px;">Sub Total</td>
                                    <td style="width: 120px; text-align: right;">${formatNumber(subTotal)}</td>
                                </tr>
                                <tr>
                                    <td>Diskon</td>
                                    <td style="text-align: right;">${formatNumber(discountAmount)}</td>
                                </tr>
                                <tr>
                                    <td style="font-weight: bold;">Total Bayar</td>
                                    <td style="text-align: right; font-weight: bold;">${formatNumber(tx.totalAmount)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <div class="signature-section">
                        <div class="sig-box">
                            <div class="sig-title">Tanda Terima</div>
                            <div style="margin-top: 5px;">.........................</div>
                        </div>
                         <div class="sig-box">
                            <div class="sig-title">Hormat Kami</div>
                            <div style="font-weight: bold; margin-top: 5px;">${tx.cashierName}</div>
                        </div>
                    </div>
                    

                </div>

                <script>window.print(); setTimeout(function(){ window.close(); }, 1000);</script>
            </body>
        </html>
        `;
    }

    // Fallback POS
    let headerHtml = `
            <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
                <h3 style="margin:0; font-size: 14px;">${settings.name}</h3>
                <p style="margin-top: 5px; font-weight: bold;">NOTA BARANG</p>
            </div>
            <div style="margin-bottom: 10px; font-size: 90%;">
                <div>Tgl: ${formatDate(tx.date)}</div>
                <div>No: ${tx.invoiceNumber || tx.id.substring(0, 8)}</div>
                <div>Plg: ${tx.customerName}</div>
            </div>
        `;

    const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';

    let contentHtml = `
            <div style="margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><strong>TOTAL</strong> <strong>${formatIDR(tx.totalAmount)}</strong></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">BAYAR (${tx.paymentMethod}) <span>${formatIDR(tx.amountPaid)}</span></div>
                ${tx.change > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">KEMBALIAN <span>${formatIDR(tx.change)}</span></div>` : ''}
                ${tx.change < 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">SISA UTANG <span>${formatIDR(Math.abs(tx.change))}</span></div>` : ''}
            </div>
            <div class="footer">
                ${settings.showBank && bankInfo ? `<p style="margin:5px 0;">${bankInfo}</p>` : ''}
                <p style="margin:5px 0;">${settings.footerMessage}</p>
            </div>
        `;

    return `
        <html>
            <head>
                <title>Nota Barang #${tx.id.substring(0, 8)}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="print-page">
                    ${headerHtml}
                    ${itemsHtml}
                    ${contentHtml}
                </div>
                <script>window.print(); setTimeout(function(){ window.close(); }, 1000);</script>
            </body>
        </html>
    `;
};

export const generatePrintSuratJalan = (tx: Transaction, settings: StoreSettings, formatDate: (date: string) => string, formatIDR: (val: number) => string) => {
    // Surat Jalan is typically A4
    const discountAmount = tx.discountAmount || 0;
    const subTotal = tx.totalAmount + discountAmount;

    const bodyBase = `body { width: 100%; margin: 0; padding: 0; background-color: #fff; display: flex; justify-content: center; }`;
    const containerCss = `font-family: Arial, sans-serif; font-size: 10pt; padding: 2px 10px; width: 100%; max-width: 210mm; color: #000; line-height: 1; text-align: left;`;

    const css = `
        ${bodyBase}
        .print-page { ${containerCss} box-sizing: border-box; }
        .header-title { text-align: center; font-size: 12pt; font-weight: bold; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px; }
        .header-grid { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: flex-start; }
        .store-info { width: 50%; }
        .customer-info { width: 45%; }
        
        .store-name { font-size: 12pt; font-weight: bold; margin: 0 0 4px 0; }
        .store-jargon { font-style: italic; color: #000; font-size: 9pt; margin: 0 0 4px 0; }
        .info-text { margin: 0 0 4px 0; font-size: 10pt; }
        
        .customer-title { margin: 0 0 4px 0; font-size: 10pt; }
        .customer-name { font-weight: bold; font-size: 11pt; margin: 0 0 4px 0; text-transform: uppercase; }
        
        table { width: 100%; border-collapse: collapse; margin: 5px 0; }
        th, td { border: 1px solid #000; padding: 2px 4px; font-size: 10pt; }
        th { text-align: center; background-color: white; font-weight: bold; }
        td { vertical-align: middle; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        
        .footer-container { display: flex; justify-content: space-between; margin-top: 5px; }
        .footer-left { flex: 1; padding-right: 15px; }
        .footer-right { display: flex; justify-content: flex-end; }
        
        .summary-table { width: 100%; border-collapse: collapse; }
        .summary-table td { border: 1px solid #000; padding: 2px 4px; }

        .signature-section { display: flex; justify-content: space-between; margin-top: 5px; padding: 0 10px; }
        .sig-box { text-align: center; width: 120px; }
        .sig-title { margin-bottom: 20px; margin-top: 0; }
        .sig-line { border-top: 1px dotted #000; font-weight: bold; padding-top: 5px; margin: 0; }

        .date-row { text-align: right; margin: 0; }
    `;

    const itemsHtml = tx.items.map((item, idx) => `
        <tr>
            <td class="text-center">${idx + 1}</td>
            <td>${item.sku || '-'}</td>
            <td>${item.name}</td>
            <td class="text-center">${item.qty} ${item.unit || 'Pcs'}</td>
        </tr>
    `).join('');

    // Bank Info (Multiline support)
    const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';

    return `
        <html>
            <head>
                <title>Surat Jalan #${tx.invoiceNumber || tx.id.substring(0, 8)}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="print-page">
                    <div class="header-title">SURAT JALAN</div>
                    
                    <div class="header-grid">
                        <div class="store-info">
                            <div class="store-name">${settings.name}</div>
                            ${settings.showAddress ? `<div class="info-text">${settings.address}</div>` : ''}
                            <div class="info-text">${settings.phone}</div>
                        </div>
                        <div class="customer-info">
                            <div class="customer-title">Kepada Yth.</div>
                            <div class="customer-name">${tx.customerName}</div>
                            <div class="info-text">${tx.customerAddress || '-'}</div>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1px; border-bottom: 1px solid #000;">
                        <tr>
                            <td style="border: none; padding: 0 0 2px 0; width: 50%;">
                                <div class="info-text" style="font-size: 11pt;">
                                    No. Faktur: ${tx.invoiceNumber || '#' + tx.id.substring(0, 8)} / ${tx.paymentStatus === 'LUNAS' ? 'Lunas' : tx.paymentStatus === 'SEBAGIAN' ? 'Sebagian' : 'Belum Lunas'}
                                </div>
                            </td>
                            <td style="border: none; padding: 0 0 2px 0; text-align: right; width: 50%;">
                                <div class="info-text">
                                     ${formatDateWithTime(tx.date)}
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 40px;">No</th>
                                <th style="width: 100px;">Kode</th>
                                <th>Nama Barang</th>
                                <th style="width: 80px;">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div class="footer-container">
                        <div class="footer-left">
                             ${bankInfo ? `
                            <div class="payment-info">
                                <div class="payment-info-title">Informasi Pembayaran:</div>
                                <div style="font-size: 10pt; white-space: pre-wrap;">${bankInfo}</div>
                            </div>
                            ` : ''}
                            ${tx.paymentNote ? `
                                <div style="margin-top: 10px; font-size: 10pt;">
                                    <strong>Catatan:</strong> <span style="white-space: pre-wrap;">${tx.paymentNote}</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="footer-right">
                        </div>
                    </div>

                    <div class="signature-section">
                        <div class="sig-box">
                            <div class="sig-title">Tanda Terima</div>
                            <div style="margin-top: 5px;">.........................</div>
                        </div>
                        <div class="sig-box">
                            <div class="sig-title">Supir / Ekspedisi</div>
                            <div style="margin-top: 5px;">.........................</div>
                        </div>
                        <div class="sig-box">
                            <div class="sig-title">Hormat Kami</div>
                            <div style="font-weight: bold; margin-top: 5px;">${tx.cashierName}</div>
                        </div>
                    </div>
                </div>
                <script>window.print();</script>
            </body>
        </html>
    `;
};

export const generatePrintTransactionDetail = (tx: Transaction, settings: StoreSettings, formatIDR: (val: number) => string, formatDate: (date: string) => string) => {
    const css = `
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; max-width: 210mm; margin: 0 auto; color: #000; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { margin: 0 0 3px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { margin-bottom: 5px; }
        .label { font-weight: bold; display: inline-block; width: 100px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .text-right { text-align: right; }
        .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .status-paid { color: green; font-weight: bold; }
        .status-unpaid { color: red; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
    `;

    const itemsHtml = tx.items.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${item.name}</td>
            <td class="text-right">${item.qty} ${item.unit || 'Pcs'}</td>
            <td class="text-right">${formatIDR(item.finalPrice)}</td>
            <td class="text-right">${formatIDR(item.finalPrice * item.qty)}</td>
        </tr>
    `).join('');

    const paymentHistoryHtml = tx.paymentHistory ? tx.paymentHistory.map((ph, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${formatDate(ph.date)}</td>
            <td>${ph.method} ${ph.bankName ? `(${ph.bankName})` : ''}</td>
            <td>${ph.note || '-'}</td>
            <td class="text-right">${formatIDR(ph.amount)}</td>
        </tr>
    `).join('') : `
        <tr>
            <td>1</td>
            <td>${formatDate(tx.date)}</td>
            <td>${tx.paymentMethod}</td>
            <td>Pembayaran Awal</td>
            <td class="text-right">${formatIDR(tx.amountPaid)}</td>
        </tr>
    `;

    const remaining = tx.totalAmount - tx.amountPaid;

    return `
        <html>
            <head>
                <title>Detail Transaksi #${tx.id}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="header">
                    <h2>${settings.name}</h2>
                    <p>Laporan Detail Transaksi</p>
                </div>

                <div class="info-grid">
                    <div>
                        <div class="info-item"><span class="label">No. Transaksi:</span> ${tx.invoiceNumber || '#' + tx.id}</div>
                        <div class="info-item"><span class="label">Tanggal:</span> ${formatDate(tx.date)}</div>
                        <div class="info-item"><span class="label">Kasir:</span> ${tx.cashierName}</div>
                    </div>
                    <div>
                        <div class="info-item"><span class="label">Pelanggan:</span> ${tx.customerName}</div>
                        <div class="info-item"><span class="label">Status:</span> <span class="${remaining <= 0 ? 'status-paid' : 'status-unpaid'}">${tx.paymentStatus}</span></div>
                        ${tx.returnNote ? `<div class="info-item"><span class="label">Catatan Retur:</span> ${tx.returnNote}</div>` : ''}
                    </div>
                </div>

                <div class="section-title">Rincian Barang</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th>Nama Barang</th>
                            <th class="text-right" style="width: 60px;">Qty</th>
                            <th class="text-right" style="width: 120px;">Harga</th>
                            <th class="text-right" style="width: 120px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold;">Total Transaksi</td>
                            <td class="text-right" style="font-weight: bold;">${formatIDR(tx.totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="section-title">Riwayat Pembayaran & Angsuran</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th>Tanggal</th>
                            <th>Metode</th>
                            <th>Catatan</th>
                            <th class="text-right" style="width: 120px;">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentHistoryHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold;">Total Dibayar</td>
                            <td class="text-right" style="font-weight: bold;">${formatIDR(tx.amountPaid)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold; color: #000;">
                                ${remaining > 0 ? 'Sisa Piutang' : 'Kembalian'}
                            </td>
                            <td class="text-right" style="font-weight: bold; color: #000;">
                                ${formatIDR(Math.abs(remaining))}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer">
                    <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                </div>
                <script>window.print();</script>
            </body>
        </html>
    `;
};

export const generatePrintPurchaseDetail = (purchase: Purchase, settings: StoreSettings, formatIDR: (val: number) => string, formatDate: (date: string) => string) => {
    const css = `
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; max-width: 210mm; margin: 0 auto; color: #000; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        h2 { margin: 0 0 3px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-item { margin-bottom: 5px; }
        .label { font-weight: bold; display: inline-block; width: 100px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .text-right { text-align: right; }
        .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 5px; }
        .status-paid { color: #000; font-weight: bold; }
        .status-unpaid { color: #000; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #000; }
    `;

    const itemsHtml = purchase.items && purchase.items.length > 0 ? purchase.items.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${item.name}</td>
            <td class="text-right">${item.qty} ${item.unit || 'Pcs'}</td>
            <td class="text-right">${formatIDR(item.finalPrice)}</td>
            <td class="text-right">${formatIDR(item.finalPrice * item.qty)}</td>
        </tr>
    `).join('') : `<tr><td colspan="5" class="text-center">Tidak ada rincian barang (Pembelian Manual)</td></tr>`;

    const paymentHistoryHtml = purchase.paymentHistory ? purchase.paymentHistory.map((ph, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${formatDate(ph.date)}</td>
            <td>${ph.method} ${ph.bankName ? `(${ph.bankName})` : ''}</td>
            <td>${ph.note || '-'}</td>
            <td class="text-right">${formatIDR(ph.amount)}</td>
        </tr>
    `).join('') : `
        <tr>
            <td>1</td>
            <td>${formatDate(purchase.date)}</td>
            <td>${purchase.paymentMethod}</td>
            <td>Pembayaran Awal</td>
            <td class="text-right">${formatIDR(purchase.amountPaid)}</td>
        </tr>
    `;

    const remaining = purchase.totalAmount - purchase.amountPaid;

    return `
        <html>
            <head>
                <title>Detail Pembelian #${purchase.id}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="header">
                    <h2>${settings.name}</h2>
                    <p>Laporan Detail Pembelian Stok</p>
                </div>

                <div class="info-grid">
                    <div>
                        <div class="info-item"><span class="label">No. Ref:</span> ${purchase.invoiceNumber || '#' + purchase.id}</div>
                        <div class="info-item"><span class="label">Tanggal:</span> ${formatDate(purchase.date)}</div>
                    </div>
                    <div>
                        <div class="info-item"><span class="label">Supplier:</span> ${purchase.supplierName}</div>
                        <div class="info-item"><span class="label">Status:</span> <span class="${remaining <= 0 ? 'status-paid' : 'status-unpaid'}">${purchase.paymentStatus}</span></div>
                        ${purchase.returnNote ? `<div class="info-item"><span class="label">Catatan Retur:</span> ${purchase.returnNote}</div>` : ''}
                    </div>
                </div>

                <div class="section-title">Keterangan Pembelian</div>
                <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #eee; background: #f9f9f9;">
                    ${purchase.description}
                </div>

                <div class="section-title">Rincian Barang</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th>Nama Barang</th>
                            <th class="text-right" style="width: 60px;">Qty</th>
                            <th class="text-right" style="width: 120px;">Harga Beli</th>
                            <th class="text-right" style="width: 120px;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold;">Total Pembelian</td>
                            <td class="text-right" style="font-weight: bold;">${formatIDR(purchase.totalAmount)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="section-title">Riwayat Pembayaran & Angsuran Utang</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th>Tanggal</th>
                            <th>Metode</th>
                            <th>Catatan</th>
                            <th class="text-right" style="width: 120px;">Jumlah</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentHistoryHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold;">Total Dibayar</td>
                            <td class="text-right" style="font-weight: bold;">${formatIDR(purchase.amountPaid)}</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="text-right" style="font-weight: bold; color: #000;">
                                Sisa Utang
                            </td>
                            <td class="text-right" style="font-weight: bold; color: #000;">
                                ${formatIDR(remaining)}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                <div class="footer">
                    <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
                </div>
                <script>window.print();</script>
            </body>
        </html>
    `;
};

export const generatePrintPurchaseNote = (purchase: Purchase, settings: StoreSettings, formatIDR: (val: number) => string, formatDate: (date: string) => string) => {
    const type = settings.printerType || '58mm';
    const isA4 = type === 'A4';

    // CSS based on printer type
    let css = '';
    if (type === '80mm') {
        css = `body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; width: 78mm; margin: 0 auto; color: #000; }`;
    } else if (isA4) {
        css = `
            body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; max-width: 210mm; margin: 0 auto; color: #000; }
            .header-container { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
            .store-info { width: 50%; }
            .supplier-info { width: 40%; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 5px 0; }
            th, td { border: 1px solid #333; padding: 3px 5px; text-align: left; font-size: 11px; }
            th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            
            .bottom-section { display: flex; justify-content: space-between; margin-top: 10px; }
            .left-bottom { width: 55%; }
            .right-bottom { width: 40%; }
            
            .total-row { display: flex; justify-content: space-between; padding: 2px 0; }
            .total-row.final { font-weight: bold; border-top: 1px solid #333; margin-top: 3px; padding-top: 3px; font-size: 12px; }
            
            .footer { margin-top: 15px; text-align: center; font-size: 10px; border-top: 1px dashed #ccc; padding-top: 5px; }
        `;
    } else {
        css = `body { font-family: 'Courier New', monospace; font-size: 11px; padding: 5px; width: 56mm; margin: 0 auto; color: #000; }`;
    }

    // Items HTML
    let itemsHtml = '';
    if (isA4) {
        itemsHtml = `
            <table>
                <thead>
                    <tr>
                        <th style="width: 40px;">No</th>
                        <th>Nama Barang</th>
                        <th style="width: 60px;">Qty</th>
                        <th style="width: 120px; text-align: right;">Harga</th>
                        <th style="width: 120px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${purchase.items && purchase.items.length > 0 ? purchase.items.map((item, idx) => `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td>${item.name}</td>
                            <td style="text-align: center;">${item.qty} ${item.unit || 'Pcs'}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice)}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice * item.qty)}</td>
                        </tr>
                    `).join('') : `<tr><td colspan="5" style="text-align:center;">${purchase.description}</td></tr>`}
                </tbody>
            </table>
        `;
    } else {
        itemsHtml = purchase.items && purchase.items.length > 0 ? purchase.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
                <div style="max-width: 60%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${item.name} x${item.qty} ${item.unit || 'Pcs'}</div>
                <div>${formatIDR(item.finalPrice * item.qty)}</div>
            </div>
        `).join('') : `<div style="text-align:center; margin: 10px 0;">${purchase.description}</div>`;
    }

    // Header Content
    let headerHtml = '';
    if (isA4) {
        headerHtml = `
            <div class="header-container">
                <div class="store-info">
                    <h2 style="margin: 0 0 2px 0; font-size: 18px;">${settings.name}</h2>
                    ${settings.showAddress ? `<p style="margin: 0 0 1px 0; font-size: 10px;">${settings.address}</p>` : ''}
                    <p style="margin: 0; font-size: 10px;">${settings.phone}</p>
                </div>
                <div class="supplier-info">
                    <h3 style="margin: 0 0 3px 0; font-size: 14px;">NOTA PEMBELIAN</h3>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>No:</strong> ${purchase.id.substring(0, 8)}</p>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Tanggal:</strong> ${formatDate(purchase.date)}</p>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Supplier:</strong> ${purchase.supplierName}</p>
                </div>
            </div>
        `;
    } else {
        headerHtml = `
            <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
                <h3 style="margin:0; font-size: 14px;">${settings.name}</h3>
                <p style="margin-top: 5px; font-weight: bold;">NOTA PEMBELIAN</p>
            </div>
            <div style="margin-bottom: 10px; font-size: 90%;">
                <div>Tgl: ${formatDate(purchase.date)}</div>
                <div>No: ${purchase.id.substring(0, 8)}</div>
                <div>Supp: ${purchase.supplierName}</div>
            </div>
        `;
    }

    // Total Section
    let contentHtml = '';
    const remaining = purchase.totalAmount - purchase.amountPaid;

    if (isA4) {
        contentHtml = `
            <div class="bottom-section">
                <div class="left-bottom">
                    <div style="margin-top: 8px; padding: 8px; border: 1px solid #ddd; background: #fff; font-size: 10px;">
                        <strong>Keterangan:</strong> ${purchase.description}
                    </div>
                </div>
                <div class="right-bottom">
                    <div class="total-row final">
                        <span>TOTAL PEMBELIAN</span>
                        <span>${formatIDR(purchase.totalAmount)}</span>
                    </div>
                    <div class="total-row">
                        <span>Bayar (${purchase.paymentMethod})</span>
                        <span>${formatIDR(purchase.amountPaid)}</span>
                    </div>
                    ${remaining > 0 ? `
                    <div class="total-row" style="color: #000;">
                        <span>Sisa Utang</span>
                        <span>${formatIDR(remaining)}</span>
                    </div>` : ''}
                </div>
            </div>
        `;
    } else {
        contentHtml = `
            <div style="margin-top: 5px; border-top: 1px dashed #000; padding-top: 5px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><strong>TOTAL</strong> <strong>${formatIDR(purchase.totalAmount)}</strong></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">BAYAR (${purchase.paymentMethod}) <span>${formatIDR(purchase.amountPaid)}</span></div>
                ${remaining > 0 ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;">SISA UTANG <span>${formatIDR(remaining)}</span></div>` : ''}
            </div>
            <div class="footer">
                <p style="margin:5px 0;">Simpan struk ini sebagai bukti pembelian.</p>
            </div>
        `;
    }

    return `
        <html>
            <head>
                <title>Nota Pembelian #${purchase.id.substring(0, 8)}</title>
                <style>${css}</style>
            </head>
            <body>
                ${headerHtml}
                ${itemsHtml}
                ${contentHtml}
                <script>window.print(); setTimeout(function(){ window.close(); }, 1000);</script>
            </body>
        </html>
    `;
};

export const generatePrintDashboard = (
    data: {
        totalRevenue: number;
        totalTransactions: number;
        totalReceivables: number;
        totalItemsSold: number;
        lowStockItems: number;
        revenueTrend: { name: string; total: number }[];
        itemsSoldTrend: { name: string; total: number }[];
        topProducts: { name: string; qty: number }[];
        topCategories: { name: string; qty: number }[];
        categoryPerformance: { name: string; value: number }[];
        monthlyRevenue?: { month: string; total: number }[];
        timeLabel: string;
        periodDetails: string;
    },
    settings: StoreSettings,
    formatIDR: (val: number) => string,
    theme: { h: string | number; s: string; l: string } = { h: 348, s: '90%', l: '56%' }
) => {
    const primaryColor = `hsl(${theme.h}, ${theme.s}, ${theme.l})`;
    const primaryLight = `hsl(${theme.h}, ${theme.s}, 96%)`;
    const primaryBorder = `hsl(${theme.h}, ${theme.s}, 90%)`;
    const primaryDark = `hsl(${theme.h}, ${theme.s}, 45%)`;

    const css = `
        body { margin: 0; padding: 0; background-color: #fff; font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #1e293b; font-size: 10px; }
        .page { width: 210mm; min-height: 297mm; padding: 12mm; margin: 0 auto; box-sizing: border-box; position: relative; }
        
        .header { margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start; }
        .store-brand h1 { margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px; }
        .store-brand p { margin: 2px 0 0; font-size: 10px; color: #64748b; }
        .report-info { text-align: right; }
        .report-title { font-size: 15px; font-weight: 700; color: ${primaryColor}; margin: 0; }
        .report-period { font-size: 10px; font-weight: 500; color: #64748b; margin-top: 2px; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
        .stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; }
        .stat-label { font-size: 9px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .stat-value { font-size: 15px; font-weight: 700; color: #0f172a; }
        .stat-sub { font-size: 9px; color: #94a3b8; margin-top: 2px; }
        
        .section-title { font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; border-left: 3px solid ${primaryColor}; padding-left: 8px; }
        
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .chart-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; page-break-inside: avoid; }
        .chart-header { font-size: 10px; font-weight: 600; color: #475569; margin-bottom: 10px; text-align: center; }
        
        /* Vertical Track Bar Chart CSS */
        .v-charts-container { display: flex; align-items: stretch; justify-content: space-between; height: 100px; gap: 4px; padding-bottom: 2px; }
        .v-chart-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; }
        /* Fixed label height to ensure consistent track height across all tabs */
        .v-chart-label { height: 35px; width: 100%; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #64748b; text-align: center; margin-top: 4px; }
        .v-chart-track { width: 80%; flex: 1; background-color: #f1f5f9; border-radius: 4px; position: relative; display: flex; align-items: flex-end; overflow: hidden; }
        .v-chart-fill { width: 100%; border-radius: 3px 3px 0 0; min-height: 2px; background-color: ${primaryColor}; transition: height 0.3s; }
        .v-chart-fill.alt { background-color: #10b981; }

        .v-chart-value {
            position: absolute;
            bottom: 50%;
            left: 50%;
            transform: translate(-50%, 50%) rotate(-90deg);
            white-space: nowrap;
            font-size: 7px;
            font-weight: 600;
            color: #334155;
            z-index: 2;
        }
        
        /* Helper for rotating dense labels */
        .v-chart-label.rotated span { writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg); display: block; white-space: nowrap; }

        /* Horizontal Bars */
        .horz-bars { display: flex; flex-direction: column; gap: 8px; }
        .hb-item { display: flex; align-items: center; gap: 8px; font-size: 9px; }
        .hb-label { width: 80px; text-align: right; color: #475569; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hb-track { flex: 1; height: 14px; background: #f1f5f9; border-radius: 3px; overflow: hidden; position: relative; }
        .hb-fill { height: 100%; background: ${primaryColor}; display: flex; align-items: center; padding-left: 6px; font-size: 8px; color: #fff; font-weight: 600; }
        .hb-fill.cat { background: #10b981; }
        
        /* Pie Chart Simulation */
        .pie-container { display: flex; align-items: center; justify-content: center; gap: 15px; }
        .pie-chart { width: 90px; height: 90px; border-radius: 50%; position: relative; }
        .pie-legend { font-size: 9px; display: flex; flex-direction: column; gap: 4px; }
        .legend-item { display: flex; align-items: center; gap: 4px; }
        .legend-color { width: 8px; height: 8px; border-radius: 2px; }
        
        .footer { margin-top: 15px; border-top: 1px dashed #cbd5e1; padding-top: 8px; font-size: 8px; color: #94a3b8; display: flex; justify-content: space-between; }
        
        @media print {
            body { background: #fff; }
            .page { margin: 0; padding: 8mm; width: 100%; border: none; }
            .no-print { display: none; }
        }
    `;

    // Calculate max for scale
    const maxRevenue = Math.max(...data.revenueTrend.map(d => d.total), 1);
    const maxItems = Math.max(...data.itemsSoldTrend.map(d => d.total), 1);
    const maxProductQty = Math.max(...data.topProducts.map(d => d.qty), 1);
    const maxCategoryQty = Math.max(...data.topCategories.map(d => d.qty), 1);

    // Conic Gradient for Pie Chart
    const totalCatValue = data.categoryPerformance.reduce((sum, i) => sum + i.value, 0) || 1;
    let currentAngle = 0;
    const colors = [primaryColor, '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const gradientParts = data.categoryPerformance.map((item, idx) => {
        const percentage = (item.value / totalCatValue) * 100;
        const color = colors[idx % colors.length];
        const start = currentAngle;
        currentAngle += percentage;
        return `${color} ${start}% ${currentAngle}%`;
    }).join(', ');
    const pieStyle = `background: conic-gradient(${gradientParts});`;

    return `
    <html>
        <head>
            <title>Laporan Dashboard - ${settings.name}</title>
            <style>${css}</style>
        </head>
        <body>
            <div class="page">
                <div class="header">
                    <div class="store-brand">
                        <h1>${settings.name}</h1>
                        <p>${settings.address || ''} ${settings.phone ? ' - ' + settings.phone : ''}</p>
                    </div>
                    <div class="report-info">
                        <div class="report-title">LAPORAN DASHBOARD</div>
                        <div class="report-period">${data.timeLabel} (${data.periodDetails})</div>
                    </div>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-label">Omzet</div>
                        <div class="stat-value" style="color: ${primaryColor};">${formatIDR(data.totalRevenue)}</div>
                        <div class="stat-sub">${data.totalTransactions} Transaksi</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Total Piutang</div>
                        <div class="stat-value" style="color: #ea580c;">${formatIDR(data.totalReceivables)}</div>
                        <div class="stat-sub">Belum Lunas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Item Terjual</div>
                        <div class="stat-value" style="color: #10b981;">${data.totalItemsSold}</div>
                        <div class="stat-sub">Unit Barang</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Stok Menipis</div>
                        <div class="stat-value" style="color: #ef4444;">${data.lowStockItems}</div>
                        <div class="stat-sub">Perlu Restock</div>
                    </div>
                </div>

                <div class="charts-row" style="grid-template-columns: 1fr; margin-bottom: 10px;">
                    <div class="chart-box">
                        <div class="chart-header">Tren Pendapatan</div>
                        <div class="v-charts-container">
                            ${data.revenueTrend.length > 0 ? data.revenueTrend.map(d => `
                                <div class="v-chart-col">
                                    <div class="v-chart-track">
                                        <div class="v-chart-value">${d.total > 0 ? d.total.toLocaleString('id-ID') : ''}</div>
                                        <div class="v-chart-fill" style="height: ${(d.total / maxRevenue) * 100}%;"></div>
                                    </div>
                                    <div class="v-chart-label ${data.revenueTrend.length > 12 ? 'rotated' : ''}"><span>${d.name}</span></div>
                                </div>
                            `).join('') : '<div style="width:100%; text-align:center; padding-top:40px; color:#ccc;">Tidak ada data</div>'}
                        </div>
                    </div>
                </div>
                
                <div class="charts-row" style="grid-template-columns: 1fr;">
                     <div class="chart-box">
                        <div class="chart-header">Tren Item Terjual</div>
                        <div class="v-charts-container">
                             ${data.itemsSoldTrend.length > 0 ? data.itemsSoldTrend.map(d => `
                                <div class="v-chart-col">
                                    <div class="v-chart-track">
                                        <div class="v-chart-value">${d.total > 0 ? d.total : ''}</div>
                                        <div class="v-chart-fill alt" style="height: ${(d.total / maxItems) * 100}%;"></div>
                                    </div>
                                    <div class="v-chart-label ${data.itemsSoldTrend.length > 12 ? 'rotated' : ''}"><span>${d.name}</span></div>
                                </div>
                            `).join('') : '<div style="width:100%; text-align:center; padding-top:40px; color:#ccc;">Tidak ada data</div>'}
                        </div>
                    </div>
                </div>
                
                <div class="charts-row">
                    <div class="chart-box">
                        <div class="chart-header">5 Produk Terlaris</div>
                        <div class="horz-bars">
                            ${data.topProducts.map(p => `
                                <div class="hb-item">
                                    <div class="hb-label">${p.name}</div>
                                    <div class="hb-track">
                                        <div class="hb-fill" style="width: ${(p.qty / maxProductQty) * 100}%">
                                            ${p.qty}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                     <div class="chart-box">
                        <div class="chart-header">5 Kategori Terlaris</div>
                         <div class="horz-bars">
                            ${data.topCategories.map(c => `
                                <div class="hb-item">
                                    <div class="hb-label">${c.name}</div>
                                    <div class="hb-track">
                                        <div class="hb-fill cat" style="width: ${(c.qty / maxCategoryQty) * 100}%">
                                            ${c.qty}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                 <div class="charts-row">
                    <div class="chart-box" style="grid-column: span 2;">
                        <div class="chart-header">Pendapatan per Kategori</div>
                        <div class="pie-container">
                            <div class="pie-chart" style="${pieStyle}"></div>
                            <div class="pie-legend">
                                 ${data.categoryPerformance.map((c, idx) => `
                                    <div class="legend-item">
                                        <div class="legend-color" style="background: ${colors[idx % colors.length]}"></div>
                                        <span>${c.name}: ${formatIDR(c.value)} (${((c.value / totalCatValue) * 100).toFixed(1)}%)</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                ${data.monthlyRevenue && data.monthlyRevenue.length > 0 ? `
                <div style="margin-top: 15px; page-break-inside: avoid;">
                    <div class="section-title">Omzet per Bulan</div>
                    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px;">
                        ${data.monthlyRevenue.map(m => `
                            <div style="background: ${primaryLight}; border: 1px solid ${primaryBorder}; padding: 4px; border-radius: 4px; text-align: center;">
                                <div style="font-size: 9px; color: #64748b; margin-bottom: 2px;">${m.month}</div>
                                <div style="font-size: 10px; font-weight: 700; color: ${primaryDark};">${formatIDR(m.total)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="footer">
                    <div>Dicetak Oleh: Admin</div>
                    <div>${new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</div>
                </div>
            </div>
            <script>window.print();</script>
        </body>
    </html>
    `;
};
