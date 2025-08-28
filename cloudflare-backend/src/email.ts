// Email sending functionality using our Mailgun email worker

export interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Use our Mailgun email worker
    const response = await fetch('https://batdigest-email.brianduryea.workers.dev', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        template: 'default',
        data: {
          fromName: '$500 Swing',
          title: options.subject,
          message: options.html,
          // Pass the raw HTML for custom template
          customHtml: options.html
        }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Email worker error:', error);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

// Simple HTML stripper for plain text version
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Email templates
// Send welcome email using the email service binding
export async function sendWelcomeEmailViaService(emailService: Fetcher, to: string, firstName: string, planName: string): Promise<boolean> {
  try {
    const response = await emailService.fetch(new Request('https://email/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject: 'Welcome to $500 Swing!',
        template: 'welcome',
        data: {
          firstName,
          planName: planName.charAt(0).toUpperCase() + planName.slice(1), // Capitalize plan name
          fromName: '$500 Swing'
        }
      }),
    }));

    if (!response.ok) {
      const error = await response.text();
      console.error('Email service error:', error);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Failed to send welcome email via service:', error);
    return false;
  }
}

export const emailTemplates = {
  welcome: (firstName: string, planName: string) => ({
    subject: 'Welcome to $500 Swing!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #14b8a6 100%);">
        <h1 style="color: #ffffff; margin: 0; font-size: 32px;">$500 Swing</h1>
        <p style="color: #22d3ee; margin: 10px 0 0 0; font-size: 16px;">Turn Your Bat Into a Better Swing</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px;">
        <h2 style="color: #0f172a; margin: 0 0 20px 0;">Welcome aboard, ${firstName}! 🎉</h2>
        
        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Thank you for joining $500 Swing with the <strong>${planName}</strong> plan. You're about to transform your swing with real analysis from college players who know what it takes to succeed.
        </p>
        
        <div style="background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 30px 0;">
          <h3 style="color: #0f172a; margin: 0 0 10px 0;">What's Next?</h3>
          <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Download our iOS app from the App Store</li>
            <li>Record your swing from the side angle</li>
            <li>Submit for analysis</li>
            <li>Get frame-by-frame feedback within 48 hours</li>
          </ul>
        </div>
        
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0;">
          <h3 style="color: #0f172a; margin: 0 0 10px 0;">Pro Tips for Best Results:</h3>
          <ul style="color: #475569; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li><strong>Camera angle:</strong> Side view at hip height</li>
            <li><strong>Lighting:</strong> Well-lit, avoid shadows on the batter</li>
            <li><strong>Frame the shot:</strong> Include full body and bat throughout swing</li>
            <li><strong>Multiple swings:</strong> Record 3-5 swings for best analysis</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="http://localhost:5004/account" style="display: inline-block; padding: 15px 30px; background-color: #14b8a6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Your Account</a>
        </div>
        
        <p style="color: #475569; line-height: 1.6; margin: 20px 0 0 0;">
          Remember: it's not about the bat—it's about the mechanic. We're here to help you build a $500 swing with the bat you already have.
        </p>
        
        <p style="color: #475569; line-height: 1.6; margin: 20px 0 0 0;">
          Questions? Reply to this email or visit your account dashboard.
        </p>
        
        <p style="color: #475569; margin: 30px 0 0 0;">
          Best,<br>
          The $500 Swing Team
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; background-color: #f8fafc; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">
          © 2024 $500 Swing · A Bat Digest Product<br>
          <a href="http://localhost:5004/account" style="color: #14b8a6; text-decoration: none;">Manage Account</a> · 
          <a href="mailto:support@batdigest.com" style="color: #14b8a6; text-decoration: none;">Support</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),

  analysisReady: (firstName: string, analysisId: string) => ({
    subject: 'Your Swing Analysis is Ready!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #0f172a 0%, #14b8a6 100%);">
        <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Analysis Complete!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 20px;">
        <h2 style="color: #0f172a; margin: 0 0 20px 0;">Hey ${firstName}!</h2>
        
        <p style="color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Great news! Our coaches have completed your swing analysis. You can now view your personalized feedback, frame-by-frame breakdown, and recommended drills.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="http://localhost:5004/analysis/${analysisId}" style="display: inline-block; padding: 15px 30px; background-color: #14b8a6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">View Your Analysis</a>
        </div>
        
        <p style="color: #475569; line-height: 1.6; margin: 20px 0 0 0;">
          Keep practicing and submit your next video to track your progress!
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),
};