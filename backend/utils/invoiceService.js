const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// 1. Configure Email Transporter (Gmail App Password)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2. Generate PDF Buffer in Memory
const generateInvoiceBuffer = (booking, user, listing) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);

        // Header Branding
        doc.fillColor('#FF385C')
           .fontSize(26)
           .text('StayHub', 50, 50, { bold: true });
        
        doc.fillColor('#333333')
           .fontSize(10)
           .text('Official Booking Invoice & Receipt', 50, 80);

        doc.moveDown();
        doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();

        // Invoice Meta Details
        doc.moveDown(1.5);
        const startY = 120;
        doc.fontSize(10).fillColor('#666666');
        doc.text(`Booking Reference: #${booking._id.toString().slice(-8).toUpperCase()}`, 50, startY);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString('en-IN')}`, 50, startY + 15);
        doc.text(`Status: Paid & Confirmed`, 50, startY + 30);

        doc.text(`Billed To:`, 350, startY);
        doc.fillColor('#000000').fontSize(11).text(user.name || 'Valued Guest', 350, startY + 15);
        doc.fontSize(10).fillColor('#666666').text(user.email || '', 350, startY + 30);

        // Stay Summary Box
        doc.moveDown(2);
        const boxY = 180;
        doc.rect(50, boxY, 500, 70).fillAndStroke('#f9f9f9', '#e0e0e0');

        doc.fillColor('#FF385C').fontSize(12).text(listing.title || 'StayHub Vacation Rental', 65, boxY + 12);
        doc.fillColor('#666666').fontSize(10).text(`${listing.location || ''}, ${listing.country || 'India'}`, 65, boxY + 28);
        doc.text(`Check-In: ${new Date(booking.checkInDate || booking.checkIn).toLocaleDateString('en-IN')}`, 65, boxY + 45);
        doc.text(`Check-Out: ${new Date(booking.checkOutDate || booking.checkOut).toLocaleDateString('en-IN')}`, 250, boxY + 45);

        // Payment Summary Table
        const tableY = 280;
        doc.fillColor('#333333').fontSize(11).text('Description', 50, tableY, { bold: true });
        doc.text('Amount (INR)', 450, tableY, { align: 'right', bold: true });
        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, tableY + 15).lineTo(550, tableY + 15).stroke();

        doc.fontSize(10).fillColor('#555555').text('Accommodation Charges (Taxes & Fees included)', 50, tableY + 25);
        doc.text(`Rs. ${booking.totalPrice?.toLocaleString('en-IN')}`, 450, tableY + 25, { align: 'right' });

        doc.strokeColor('#cccccc').lineWidth(1).moveTo(50, tableY + 50).lineTo(550, tableY + 50).stroke();

        // Total
        doc.fillColor('#000000').fontSize(14).text('Grand Total:', 50, tableY + 65, { bold: true });
        doc.fillColor('#FF385C').fontSize(14).text(`Rs. ${booking.totalPrice?.toLocaleString('en-IN')}`, 450, tableY + 65, { align: 'right', bold: true });

        // Footer Note
        doc.fontSize(9).fillColor('#888888').text(
            'Thank you for booking with StayHub! For any support or inquiries, reach us at support@stayhub.com',
            50,
            680,
            { align: 'center', width: 500 }
        );

        doc.end();
    });
};

// 3. Send Confirmation Email with PDF Attachment
const sendBookingConfirmationEmail = async (booking, user, listing) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Skipping email: EMAIL_USER or EMAIL_PASS not configured in .env');
            return;
        }

        const pdfBuffer = await generateInvoiceBuffer(booking, user, listing);

        const mailOptions = {
            from: `"StayHub Reservations" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Booking Confirmed: ${listing.title || 'Your Stay'} (Ref: #${booking._id.toString().slice(-6)})`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #FF385C; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
                        <p style="margin: 5px 0 0 0;">Pack your bags, your trip is set!</p>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi <strong>${user.name || 'Traveller'}</strong>,</p>
                        <p>Thank you for your reservation with StayHub. Here are your booking details:</p>
                        
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <h3 style="margin-top: 0; color: #FF385C;">${listing.title}</h3>
                            <p style="margin: 4px 0;"><strong>Location:</strong> ${listing.location}, ${listing.country}</p>
                            <p style="margin: 4px 0;"><strong>Check-In:</strong> ${new Date(booking.checkInDate || booking.checkIn).toLocaleDateString('en-IN')}</p>
                            <p style="margin: 4px 0;"><strong>Check-Out:</strong> ${new Date(booking.checkOutDate || booking.checkOut).toLocaleDateString('en-IN')}</p>
                            <p style="margin: 4px 0;"><strong>Total Paid:</strong> ₹${booking.totalPrice?.toLocaleString('en-IN')}</p>
                        </div>
                        
                        <p>We have attached your <strong>Official Tax Invoice PDF</strong> with this email.</p>
                        <p style="margin-top: 25px;">Happy Travelling,<br/><strong>Team StayHub</strong></p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `StayHub_Invoice_${booking._id.toString().slice(-6)}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation Email sent:', info.messageId);
    } catch (err) {
        console.error('Error sending confirmation email:', err.message);
    }
};

module.exports = { sendBookingConfirmationEmail };