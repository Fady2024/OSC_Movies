interface BookingEmailData {
  customerName: string;
  movieTitle: string;
  moviePoster: string;
  showtimeDate: string;
  showtimeTime: string;
  hall: string;
  seats: string[];
  totalAmount: number;
  bookingId: string;
}

export function bookingConfirmationTemplate(data: BookingEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f0f; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 28px; font-weight: bold; color: #a855f7; }
        .card { background: #1a1a2e; border-radius: 16px; padding: 32px; margin-bottom: 24px; border: 1px solid #2a2a4a; }
        .movie-title { font-size: 22px; font-weight: bold; color: #ffffff; margin-bottom: 8px; }
        .poster { width: 100%; max-height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2a2a4a; }
        .detail-label { color: #9ca3af; font-size: 14px; }
        .detail-value { color: #ffffff; font-weight: 600; font-size: 14px; }
        .seats { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .seat-badge { background: #a855f7; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .total { text-align: right; font-size: 24px; font-weight: bold; color: #a855f7; margin-top: 16px; }
        .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 32px; }
        .booking-id { background: #2a2a4a; padding: 8px 16px; border-radius: 8px; font-family: monospace; font-size: 12px; color: #a855f7; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎬 OSC_Movies</div>
          <p style="color: #9ca3af; margin-top: 8px;">Booking Confirmation</p>
        </div>

        <div class="card">
          <p style="color: #9ca3af; font-size: 14px;">Hi ${data.customerName},</p>
          <p style="color: #ffffff; font-size: 16px;">Your booking has been confirmed!</p>

          <img src="${data.moviePoster}" alt="${data.movieTitle}" class="poster" />

          <div class="movie-title">${data.movieTitle}</div>

          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${data.showtimeDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time</span>
            <span class="detail-value">${data.showtimeTime}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Hall</span>
            <span class="detail-value">${data.hall}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Seats</span>
            <div class="seats">
              ${data.seats.map((s) => `<span class="seat-badge">${s}</span>`).join("")}
            </div>
          </div>

          <div class="total">$${data.totalAmount.toFixed(2)}</div>
        </div>

        <div style="text-align: center;">
          <span class="booking-id">Booking ID: ${data.bookingId}</span>
        </div>

        <div class="footer">
          <p>Thank you for choosing OSC_Movies!</p>
          <p>If you have any questions, contact us at support@oscmovies.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface PasswordResetData {
  customerName: string;
  resetUrl: string;
}

export function passwordResetTemplate(data: PasswordResetData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f0f; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 28px; font-weight: bold; color: #a855f7; }
        .card { background: #1a1a2e; border-radius: 16px; padding: 32px; text-align: center; border: 1px solid #2a2a4a; }
        .btn { display: inline-block; background: #a855f7; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎬 OSC_Movies</div>
        </div>

        <div class="card">
          <h2 style="color: #ffffff; margin-bottom: 16px;">Password Reset</h2>
          <p style="color: #9ca3af; font-size: 14px;">Hi ${data.customerName},</p>
          <p style="color: #9ca3af; font-size: 14px;">You requested a password reset. Click the button below to set a new password.</p>
          <a href="${data.resetUrl}" class="btn">Reset Password</a>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">This link expires in 1 hour.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this, ignore this email.</p>
        </div>

        <div class="footer">
          <p>© 2026 OSC_Movies. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface ShowtimeReminderData {
  customerName: string;
  movieTitle: string;
  showtimeDate: string;
  showtimeTime: string;
  hall: string;
}

export function showtimeReminderTemplate(data: ShowtimeReminderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f0f0f; color: #ffffff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 28px; font-weight: bold; color: #a855f7; }
        .card { background: #1a1a2e; border-radius: 16px; padding: 32px; text-align: center; border: 1px solid #2a2a4a; }
        .emoji { font-size: 48px; margin-bottom: 16px; }
        .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎬 OSC_Movies</div>
        </div>

        <div class="card">
          <div class="emoji">🍿</div>
          <h2 style="color: #ffffff; margin-bottom: 16px;">Showtime Reminder</h2>
          <p style="color: #9ca3af; font-size: 14px;">Hi ${data.customerName},</p>
          <p style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.movieTitle}</p>
          <p style="color: #a855f7; font-size: 16px; margin-top: 8px;">${data.showtimeDate} at ${data.showtimeTime}</p>
          <p style="color: #9ca3af; font-size: 14px;">Hall: ${data.hall}</p>
          <p style="color: #6b7280; font-size: 13px; margin-top: 20px;">Don't forget your ticket! See you at the cinema 🎬</p>
        </div>

        <div class="footer">
          <p>© 2026 OSC_Movies. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
