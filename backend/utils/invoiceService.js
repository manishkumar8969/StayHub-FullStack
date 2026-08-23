const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// 1. Direct Gmail Service Transporter with connection timeouts
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000,
    socketTimeout: 15000
});

// 2. In-Memory PDF Invoice Buffer
const generateInvoiceBuffer = (booking, user, listing) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];

            doc.on('data', chunk => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', err => reject(err));

            // Header Branding
            doc.fillColor('#FF385C').fontSize(24).text('StayHub', 50, 50, { bold: true });
            doc.fillColor('#333333').fontSize(10).text('Official Booking Invoice & Receipt', 50, 78);
            doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, 95).lineTo(550, 95).stroke();

            // Invoice Meta Details
            const startY = 115;
            doc.fontSize(10).fillColor('#666666');
            doc.text(`Booking Ref: #${(booking._id || '').toString().slice(-8).toUpperCase()}`, 50, startY);
            doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, 50, startY + 15);
            doc.text(`Status: Paid & Confirmed`, 50, startY + 30);

            doc.text(`Billed To:`, 350, startY);
            doc.fillColor('#000000').fontSize(11).text(user.username || user.name || 'Valued Guest', 350, startY + 15);
            doc.fontSize(10).fillColor('#666666').text(user.email || '', 350, startY + 30);

            // Stay Summary Box
            const boxY = 175;
            doc.rect(50, boxY, 500, 65).fillAndStroke('#f9f9f9', '#e0e0e0');

            doc.fillColor('#FF385C').fontSize(12).text(listing.title || 'StayHub Vacation Rental', 65, boxY + 12);
            doc.fillColor('#666666').fontSize(10).text(`${listing.location || ''}, ${listing.country || 'India'}`, 65, boxY + 28);
            doc.text(`Check-In: ${new Date(booking.checkInDate || Date.now()).toLocaleDateString('en-IN')}`, 65, boxY + 45);
            doc.text(`Check-Out: ${new Date(booking.checkOutDate || Date.now()).toLocaleDateString('en-IN')}`, 250, boxY + 45);

            // Payment Summary Table
            const tableY = 265;
            doc.fillColor('#333333').fontSize(11).text('Description', 50, tableY, { bold: true });
            doc.text('Amount (INR)', 450, tableY, { align: 'right', bold: true });
            doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();

            doc.fontSize(10).fillColor('#555555').text('Accommodation Charges (Taxes & Fees included)', 50, tableY + 25);
            doc.text(`Rs. ${(booking.totalPrice || 0).toLocaleString('en-IN')}`, 450, tableY + 25, { align: 'right' });

            doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, tableY + 50).lineTo(550, tableY + 50).stroke();

            // Total
            doc.fillColor('#000000').fontSize(13).text('Grand Total:', 50, tableY + 65, { bold: true });
            doc.fillColor('#FF385C').fontSize(13).text(`Rs. ${(booking.totalPrice || 0).toLocaleString('en-IN')}`, 450, tableY + 65, { align: 'right', bold: true });

            // Footer Note
            doc.fontSize(9).fillColor('#888888').text(
                'Thank you for booking with StayHub! For any inquiries, reach us at support@stayhub.com',
                50,
                680,
                { align: 'center', width: 500 }
            );

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

// 3. Send Confirmation Email with PDF Attachment
const sendBookingConfirmationEmail = async (booking, user, listing) => {
    try {
        console.log(`[Invoice] Starting mail send to: ${user.email}`);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('[Invoice Error] EMAIL_USER or EMAIL_PASS missing in environment!');
            return;
        }

        const pdfBuffer = await generateInvoiceBuffer(booking, user, listing);

        const mailOptions = {
            from: `"StayHub Reservations" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Booking Confirmed: ${listing.title || 'Your Stay'} (Ref: #${(booking._id || '').toString().slice(-6)})`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #FF385C; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
                        <p style="margin: 5px 0 0 0;">Pack your bags, your trip is set!</p>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi <strong>${user.username || user.name || 'Traveller'}</strong>,</p>
                        <p>Thank you for your reservation with StayHub. Here are your booking details:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <h3 style="margin-top: 0; color: #FF385C;">${listing.title || 'StayHub Stay'}</h3>
                            <p style="margin: 4px 0;"><strong>Location:</strong> ${listing.location || ''}, ${listing.country || 'India'}</p>
                            <p style="margin: 4px 0;"><strong>Check-In:</strong> ${new Date(booking.checkInDate || Date.now()).toLocaleDateString('en-IN')}</p>
                            <p style="margin: 4px 0;"><strong>Check-Out:</strong> ${new Date(booking.checkOutDate || Date.now()).toLocaleDateString('en-IN')}</p>
                            <p style="margin: 4px 0;"><strong>Total Paid:</strong> ₹${(booking.totalPrice || 0).toLocaleString('en-IN')}</p>
                        </div>
                        
                        <p>We have attached your <strong>Official Tax Invoice PDF</strong> with this email.</p>
                        <p style="margin-top: 25px;">Happy Travelling,<br/><strong>Team StayHub</strong></p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `StayHub_Invoice_${(booking._id || 'booking').toString().slice(-6)}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('[Invoice Success] Email delivered! MessageID:', info.messageId);
    } catch (err) {
        console.error('[Invoice Transporter Error]:', err.message || err);
    }
};

module.exports = { sendBookingConfirmationEmail };