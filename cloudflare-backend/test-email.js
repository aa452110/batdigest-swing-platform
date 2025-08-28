// Test email sending directly
async function testEmail() {
  const emailData = {
    personalizations: [
      {
        to: [{ email: 'brianduryea@gmail.com' }],
      },
    ],
    from: {
      email: 'noreply@batdigest.com',
      name: '$500 Swing',
    },
    subject: 'Test Email from $500 Swing',
    content: [
      {
        type: 'text/plain',
        value: 'This is a test email to verify MailChannels is working correctly.',
      },
      {
        type: 'text/html',
        value: '<h1>Test Email</h1><p>This is a test email to verify MailChannels is working correctly.</p><p>If you receive this, email sending is configured properly!</p>',
      },
    ],
  };

  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed to send');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();