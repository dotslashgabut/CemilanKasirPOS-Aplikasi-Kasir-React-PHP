// Helper function to generate improved print layouts
import { Transaction, StoreSettings, Purchase } from '../types';

export const generatePrintInvoice = (tx: Transaction, settings: StoreSettings, formatIDR: (val: number) => string, formatDate: (date: string) => string) => {
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
            .customer-info { width: 40%; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #333; padding: 3px 5px; text-align: left; font-size: 11px; }
            th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            
            .bottom-section { display: flex; justify-content: space-between; margin-top: 10px; }
            .left-bottom { width: 55%; }
            .right-bottom { width: 40%; }
            
            .bank-info { margin-bottom: 10px; padding: 8px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; }
            .bank-info h4 { margin: 0 0 3px 0; font-size: 11px; text-decoration: underline; }
            .bank-info p { margin: 0; line-height: 1.3; font-size: 10px; }
            
            .notes-section { margin-top: 8px; padding: 8px; border: 1px solid #ddd; background: #fff; font-size: 10px; }
            
            .total-row { display: flex; justify-content: space-between; padding: 2px 0; }
            .total-row.final { font-weight: bold; border-top: 1px solid #333; margin-top: 3px; padding-top: 3px; font-size: 12px; }
            
            .signatures { display: flex; justify-content: space-between; margin-top: 10px; text-align: center; }
            .sig-box { width: 40%; }
            .sig-line { margin-top: 40px; border-top: 1px solid black; padding-top: 2px; font-weight: bold; }
            
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
                    ${tx.items.map((item, idx) => `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td>${item.name}</td>
                            <td style="text-align: center;">${item.qty}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice)}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice * item.qty)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        itemsHtml = tx.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <div style="max-width: 60%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${item.name} x${item.qty}</div>
                <div>${formatIDR(item.finalPrice * item.qty)}</div>
            </div>
        `).join('');
    }

    // Header Content
    let headerHtml = '';
    if (isA4) {
        headerHtml = `
            <div class="header-container">
                <div class="store-info">
                    <h2 style="margin: 0 0 2px 0; font-size: 18px;">${settings.name}</h2>
                    ${settings.showJargon ? `<p style="margin: 0 0 2px 0; font-style: italic; color: #555; font-size: 10px;">${settings.jargon}</p>` : ''}
                    ${settings.showAddress ? `<p style="margin: 0 0 1px 0; font-size: 10px;">${settings.address}</p>` : ''}
                    <p style="margin: 0; font-size: 10px;">${settings.phone}</p>
                </div>
                <div class="customer-info">
                    <h3 style="margin: 0 0 5px 0; font-size: 14px;">NOTA PENJUALAN</h3>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>No:</strong> ${tx.id.substring(0, 8)}</p>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Tanggal:</strong> ${formatDate(tx.date)}</p>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Kepada Yth:</strong> ${tx.customerName}</p>
                </div>
            </div>
        `;
    } else {
        headerHtml = `
            <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
                <h3 style="margin:0; font-size: 14px;">${settings.name}</h3>
                ${settings.showJargon ? `<p style="margin:2px 0; font-style:italic;">${settings.jargon}</p>` : ''}
                ${settings.showAddress ? `<p style="margin:2px 0;">${settings.address}</p>` : ''}
                <p style="margin:2px 0;">${settings.phone}</p>
            </div>
            <div style="margin-bottom: 10px; font-size: 90%;">
                <div>Tgl: ${formatDate(tx.date)}</div>
                <div>No: ${tx.id.substring(0, 8)}</div>
                <div>Kasir: ${tx.cashierName}</div>
                <div>Plg: ${tx.customerName}</div>
            </div>
        `;
    }

    // Bank Info (Multiline support)
    const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';

    // Total Section
    let contentHtml = '';
    if (isA4) {
        contentHtml = `
            <div class="bottom-section">
                <div class="left-bottom">
                    ${bankInfo ? `
                    <div class="bank-info">
                        <h4>Informasi Pembayaran:</h4>
                        <p>${bankInfo}</p>
                    </div>
                    ` : ''}
                    ${tx.paymentNote ? `
                    <div class="notes-section">
                        <strong>Catatan:</strong> ${tx.paymentNote}
                    </div>` : ''}
                    ${tx.returnNote ? `
                    <div class="notes-section">
                        <strong>Catatan Retur:</strong> ${tx.returnNote}
                    </div>` : ''}
                </div>
                <div class="right-bottom">
                    <div class="total-row final">
                        <span>TOTAL TAGIHAN</span>
                        <span>${formatIDR(tx.totalAmount)}</span>
                    </div>
                    <div class="total-row">
                        <span>Bayar (${tx.paymentMethod})</span>
                        <span>${formatIDR(tx.amountPaid)}</span>
                    </div>
                    ${tx.change > 0 ? `
                    <div class="total-row">
                        <span>Kembalian</span>
                        <span>${formatIDR(tx.change)}</span>
                    </div>` : ''}
                    ${tx.change < 0 ? `
                    <div class="total-row" style="color: red;">
                        <span>Sisa Utang</span>
                        <span>${formatIDR(Math.abs(tx.change))}</span>
                    </div>` : ''}
                </div>
            </div>

            <div class="signatures">
                <div class="sig-box">
                    <p>Penerima</p>
                    <div class="sig-line">${tx.customerName}</div>
                </div>
                <div class="sig-box">
                    <p>Hormat Kami</p>
                    <div class="sig-line">${tx.cashierName}</div>
                </div>
            </div>
        `;
    } else {
        contentHtml = `
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
    }

    return `
        <html>
            <head>
                <title>Nota #${tx.id.substring(0, 8)}</title>
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

export const generatePrintGoodsNote = (tx: Transaction, settings: StoreSettings, formatIDR: (val: number) => string, formatDate: (date: string) => string) => {
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
            .customer-info { width: 40%; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #333; padding: 3px 5px; text-align: left; font-size: 11px; }
            th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
            
            .bottom-section { display: flex; justify-content: space-between; margin-top: 10px; }
            .left-bottom { width: 55%; }
            .right-bottom { width: 40%; }
            
            .bank-info { margin-bottom: 10px; padding: 8px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; }
            .bank-info h4 { margin: 0 0 3px 0; font-size: 11px; text-decoration: underline; }
            .bank-info p { margin: 0; line-height: 1.3; font-size: 10px; }

            .total-row { display: flex; justify-content: space-between; padding: 2px 0; }
            .total-row.final { font-weight: bold; border-top: 1px solid #333; margin-top: 3px; padding-top: 3px; font-size: 12px; }
            
            .signatures { display: flex; justify-content: space-between; margin-top: 10px; text-align: center; }
            .sig-box { width: 40%; }
            .sig-line { margin-top: 40px; border-top: 1px solid black; padding-top: 2px; font-weight: bold; }

            .footer { margin-top: 15px; text-align: center; font-size: 10px; }
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
                    ${tx.items.map((item, idx) => `
                        <tr>
                            <td style="text-align: center;">${idx + 1}</td>
                            <td>${item.name}</td>
                            <td style="text-align: center;">${item.qty}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice)}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice * item.qty)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } else {
        itemsHtml = tx.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <div style="max-width: 60%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${item.name} x${item.qty}</div>
                <div>${formatIDR(item.finalPrice * item.qty)}</div>
            </div>
        `).join('');
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
                <div class="customer-info">
                    <h3 style="margin: 0 0 5px 0; font-size: 14px;">NOTA BARANG</h3>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>No:</strong> ${tx.id.substring(0, 8)}</p>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Tanggal:</strong> ${formatDate(tx.date)}</p>
                    <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Kepada Yth:</strong> ${tx.customerName}</p>
                </div>
            </div>
        `;
    } else {
        headerHtml = `
            <div style="text-align: center; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px;">
                <h3 style="margin:0; font-size: 14px;">${settings.name}</h3>
                <p style="margin-top: 5px; font-weight: bold;">NOTA BARANG</p>
            </div>
            <div style="margin-bottom: 10px; font-size: 90%;">
                <div>Tgl: ${formatDate(tx.date)}</div>
                <div>No: ${tx.id.substring(0, 8)}</div>
                <div>Plg: ${tx.customerName}</div>
            </div>
        `;
    }

    // Bank Info (Multiline support)
    const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';

    let contentHtml = '';
    if (isA4) {
        contentHtml = `
            <div class="bottom-section">
                <div class="left-bottom">
                    ${bankInfo ? `
                    <div class="bank-info">
                        <h4>Informasi Pembayaran:</h4>
                        <p>${bankInfo}</p>
                    </div>
                    ` : ''}
                </div>
                <div class="right-bottom">
                    <div class="total-row final">
                        <span>TOTAL TAGIHAN</span>
                        <span>${formatIDR(tx.totalAmount)}</span>
                    </div>
                </div>
            </div>

            <div class="signatures">
                <div class="sig-box">
                    <p>Penerima</p>
                    <div class="sig-line">${tx.customerName}</div>
                </div>
                <div class="sig-box">
                    <p>Hormat Kami</p>
                    <div class="sig-line">${tx.cashierName}</div>
                </div>
            </div>
            
            <div class="footer">
                <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
            </div>
        `;
    } else {
        contentHtml = `
            <div class="footer">
                <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan.</p>
            </div>
        `;
    }

    return `
        <html>
            <head>
                <title>Nota Barang #${tx.id.substring(0, 8)}</title>
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

export const generatePrintSuratJalan = (tx: Transaction, settings: StoreSettings, formatDate: (date: string) => string, formatIDR: (val: number) => string) => {
    // Surat Jalan is typically A4
    const css = `
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; max-width: 210mm; margin: 0 auto; color: #000; }
        .header-container { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
        .store-info { width: 50%; }
        .customer-info { width: 40%; text-align: right; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { border: 1px solid #333; padding: 3px 5px; text-align: left; font-size: 11px; }
        th { background-color: #f0f0f0; font-weight: bold; text-align: center; }
        
        .bottom-section { display: flex; justify-content: space-between; margin-top: 10px; }
        .left-bottom { width: 55%; }
        .right-bottom { width: 40%; }
        
        .bank-info { margin-bottom: 10px; padding: 8px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; }
        .bank-info h4 { margin: 0 0 3px 0; font-size: 11px; text-decoration: underline; }
        .bank-info p { margin: 0; line-height: 1.3; font-size: 10px; }

        .total-row { display: flex; justify-content: space-between; padding: 2px 0; }
        .total-row.final { font-weight: bold; border-top: 1px solid #333; margin-top: 3px; padding-top: 3px; font-size: 12px; }

        .signatures { display: flex; justify-content: space-between; margin-top: 10px; text-align: center; }
        .sig-box { width: 30%; }
        .sig-line { margin-top: 40px; border-top: 1px solid black; padding-top: 2px; font-weight: bold; }
    `;

    const itemsHtml = tx.items.map((item, idx) => `
        <tr>
            <td style="text-align:center">${idx + 1}</td>
            <td>${item.name}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:center">Unit</td>
            <td style="text-align:right">${formatIDR(item.finalPrice)}</td>
            <td style="text-align:right">${formatIDR(item.finalPrice * item.qty)}</td>
        </tr>
    `).join('');

    // Bank Info (Multiline support)
    const bankInfo = settings.showBank && settings.bankAccount ? settings.bankAccount.replace(/\n/g, '<br/>') : '';

    return `
        <html>
            <head>
                <title>Surat Jalan #${tx.id}</title>
                <style>${css}</style>
            </head>
            <body>
                <div class="header-container">
                    <div class="store-info">
                        <h2 style="margin: 0 0 2px 0; font-size: 18px;">${settings.name}</h2>
                        ${settings.showAddress ? `<p style="margin: 0 0 1px 0; font-size: 10px;">${settings.address}</p>` : ''}
                        <p style="margin: 0; font-size: 10px;">${settings.phone}</p>
                    </div>
                    <div class="customer-info">
                        <h3 style="margin: 0 0 5px 0; font-size: 14px;">SURAT JALAN</h3>
                        <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>No. Ref:</strong> #${tx.id.substring(0, 8)}</p>
                        <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Tanggal:</strong> ${formatDate(tx.date)}</p>
                        <p style="margin: 0 0 1px 0; font-size: 10px;"><strong>Kepada Yth:</strong> ${tx.customerName}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 40px;">No</th>
                            <th>Nama Barang</th>
                            <th style="width: 60px;">Qty</th>
                            <th style="width: 60px;">Satuan</th>
                            <th style="width: 100px; text-align: right;">Harga</th>
                            <th style="width: 100px; text-align: right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div class="bottom-section">
                    <div class="left-bottom">
                         ${bankInfo ? `
                        <div class="bank-info">
                            <h4>Informasi Pembayaran:</h4>
                            <p>${bankInfo}</p>
                        </div>
                        ` : ''}
                    </div>
                    <div class="right-bottom">
                        <div class="total-row final">
                            <span>TOTAL TAGIHAN</span>
                            <span>${formatIDR(tx.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div class="signatures">
                    <div class="sig-box">
                        <p>Penerima</p>
                        <div class="sig-line">${tx.customerName}</div>
                    </div>
                    <div class="sig-box">
                        <p>Supir / Ekspedisi</p>
                        <div class="sig-line">( ....................... )</div>
                    </div>
                    <div class="sig-box">
                        <p>Hormat Kami</p>
                        <div class="sig-line">${tx.cashierName}</div>
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
        h2 { margin: 0 0 5px 0; }
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
            <td class="text-right">${item.qty}</td>
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
                        <div class="info-item"><span class="label">No. Transaksi:</span> #${tx.id}</div>
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
                            <td colspan="4" class="text-right" style="font-weight: bold; color: ${remaining > 0 ? 'red' : 'green'};">
                                ${remaining > 0 ? 'Sisa Piutang' : 'Kembalian'}
                            </td>
                            <td class="text-right" style="font-weight: bold; color: ${remaining > 0 ? 'red' : 'green'};">
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
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { margin: 0 0 5px 0; }
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

    const itemsHtml = purchase.items && purchase.items.length > 0 ? purchase.items.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${item.name}</td>
            <td class="text-right">${item.qty}</td>
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
                        <div class="info-item"><span class="label">No. Ref:</span> #${purchase.id}</div>
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
                            <td colspan="4" class="text-right" style="font-weight: bold; color: ${remaining > 0 ? 'red' : 'green'};">
                                Sisa Utang
                            </td>
                            <td class="text-right" style="font-weight: bold; color: ${remaining > 0 ? 'red' : 'green'};">
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
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
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
                            <td style="text-align: center;">${item.qty}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice)}</td>
                            <td style="text-align: right;">${formatIDR(item.finalPrice * item.qty)}</td>
                        </tr>
                    `).join('') : `<tr><td colspan="5" style="text-align:center;">${purchase.description}</td></tr>`}
                </tbody>
            </table>
        `;
    } else {
        itemsHtml = purchase.items && purchase.items.length > 0 ? purchase.items.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                <div style="max-width: 60%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${item.name} x${item.qty}</div>
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
                    <h3 style="margin: 0 0 5px 0; font-size: 14px;">NOTA PEMBELIAN</h3>
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
                    <div class="total-row" style="color: red;">
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
