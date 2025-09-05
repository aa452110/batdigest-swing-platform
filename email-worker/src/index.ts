interface Env {
  ALLOWED_ORIGINS: string;
  MAILGUN_API_KEY: string;
  MAILGUN_DOMAIN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers - be more permissive for server-to-server
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    try {
      const { to, subject, template, data } = await request.json();

      if (!to || !subject || !template) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: to, subject, template' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Generate email HTML based on template
      const emailHtml = generateEmailHtml(template, data);
      
      // Send via Mailgun
      let response;
      
      if (env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN) {
        const mailgunUrl = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;
        
        const form = new FormData();
        form.append('from', `${data?.fromName || '$500 Swing'} <noreply@${env.MAILGUN_DOMAIN}>`);
        form.append('to', to);
        form.append('subject', subject);
        form.append('text', stripHtml(emailHtml));
        form.append('html', emailHtml);
        
        response = await fetch(mailgunUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa('api:' + env.MAILGUN_API_KEY),
          },
          body: form,
        });
      } else {
        // Fallback to MailChannels (currently not working due to auth issues)
        response = await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: to }],
              },
            ],
            from: {
              email: 'noreply@batdigest.com',
              name: data?.fromName || 'BatDigest',
            },
            subject: subject,
            content: [
              {
                type: 'text/plain',
                value: stripHtml(emailHtml),
              },
              {
                type: 'text/html',
                value: emailHtml,
              },
            ],
          }),
        });
      }

      if (!response.ok) {
        const error = await response.text();
        console.error('Email sending error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to send email' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Email sent successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Email worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};

function generateEmailHtml(template: string, data: any): string {
  // If custom HTML is provided, use that directly
  if (data.customHtml) {
    return data.customHtml;
  }
  
  switch (template) {
    case 'welcome':
      return welcomeEmail(data);
    case 'analysis-ready':
      return analysisReadyEmail(data);
    case 'test':
      return testEmail(data);
    default:
      return defaultEmail(data);
  }
}

function welcomeEmail(data: any): string {
  const { firstName, planName } = data;
  return `
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
          Thank you for joining $500 Swing with the <strong>${planName}</strong> plan. You're about to transform your swing with real analysis from college players.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://500swing.com/account" style="display: inline-block; padding: 15px 30px; background-color: #14b8a6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Your Account</a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function analysisReadyEmail(data: any): string {
  const { firstName, analysisId } = data;
  return `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <h2>Hey ${firstName}!</h2>
  <p>Your swing analysis is ready! Check it out at:</p>
  <a href="https://500swing.com/analysis/${analysisId}">View Your Analysis</a>
</body>
</html>
  `;
}

function testEmail(data: any): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <h2>Test Email</h2>
  <p>This is a test email from BatDigest Email Service.</p>
  <p>If you're seeing this, email sending is working correctly!</p>
  <p>Data received: ${JSON.stringify(data)}</p>
</body>
</html>
  `;
}

function defaultEmail(data: any): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <h2>${data.title || 'Notification'}</h2>
  <p>${data.message || 'You have a new notification.'}</p>
</body>
</html>
  `;
}

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