import { Env, SubmissionRequest, R2UploadResponse } from './types';
import { sendEmail, sendWelcomeEmailViaService, emailTemplates } from './email';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Route handling
      if (url.pathname === '/api/submissions/init' && request.method === 'POST') {
        return await handleSubmissionInit(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/submissions/confirm' && request.method === 'POST') {
        return await handleSubmissionConfirm(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/queue' && request.method === 'GET') {
        return await handleGetQueue(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
        return await handleSignup(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        return await handleLogin(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/test-email' && request.method === 'GET') {
        // Test endpoint for email
        const emailTemplate = emailTemplates.welcome('Brian', 'Performance');
        const emailSent = await sendEmail({
          to: 'brianduryea@gmail.com',
          from: 'noreply@batdigest.com',
          subject: 'Test Email from $500 Swing',
          html: emailTemplate.html,
        });
        
        return new Response(JSON.stringify({ 
          success: emailSent,
          message: emailSent ? 'Test email sent!' : 'Failed to send email'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  },

  async queue(batch: MessageBatch, env: Env): Promise<void> {
    // Process video queue items
    for (const message of batch.messages) {
      await processVideoSubmission(message.body, env);
      message.ack();
    }
  }
};

async function handleSubmissionInit(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const data: SubmissionRequest = await request.json();
  
  // Create database record
  const submissionId = data.submissionId || crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const r2Key = `submissions/${submissionId}/video.mp4`;
  
  // Insert into D1 database
  await env.DB.prepare(`
    INSERT INTO submissions (
      id, account_id, email, player_name, height, weight, age, 
      batting_stance, submission_date, player_notes, video_r2_key, 
      status, created_at, metadata, camera_angle, team, position,
      skill_level, bat_size, bat_type, league, age_group
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `).bind(
    submissionId,
    data.athleteId,
    data.athleteInfo?.email || '',
    data.athleteName,
    data.athleteInfo?.height || null,
    data.athleteInfo?.weight || null,
    data.athleteInfo?.age || null,
    data.athleteInfo?.battingStance || 'right',
    timestamp,
    data.notes || null,
    r2Key,
    'uploading',
    timestamp,
    JSON.stringify(data.metadata),
    data.angle,
    data.athleteInfo?.team || null,
    data.athleteInfo?.position || null,
    data.athleteInfo?.skillLevel || null,
    data.athleteInfo?.batSize || null,
    data.athleteInfo?.batType || null,
    data.athleteInfo?.league || null,
    data.athleteInfo?.ageGroup || null
  ).run();
  
  // Generate pre-signed upload URL for R2
  const uploadUrl = await generateR2UploadUrl(env, r2Key);
  
  const response: R2UploadResponse = {
    uploadURL: uploadUrl,
    r2Key: r2Key,
    submissionId: submissionId
  };
  
  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleSubmissionConfirm(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const { submissionId, r2Key } = await request.json();
  
  // Update status in database
  await env.DB.prepare(`
    UPDATE submissions 
    SET status = 'processing', updated_at = ?
    WHERE id = ?
  `).bind(new Date().toISOString(), submissionId).run();
  
  // Add to processing queue
  await env.VIDEO_QUEUE.send({
    submissionId,
    r2Key,
    timestamp: Date.now()
  });
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleGetQueue(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  // Get all pending submissions for coaches to analyze
  const { results } = await env.DB.prepare(`
    SELECT * FROM submissions 
    WHERE status IN ('processing', 'ready')
    ORDER BY created_at DESC
    LIMIT 50
  `).all();
  
  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function generateR2UploadUrl(env: Env, key: string): Promise<string> {
  // Generate a pre-signed URL for direct upload to R2
  // This would use R2's presigned URL functionality
  // For now, returning a placeholder - you'll need to implement based on Cloudflare's R2 API
  
  const url = new URL(`https://r2.batdigest.com/${key}`);
  
  // In production, you'd generate a proper pre-signed URL here
  // using R2's API or AWS SDK with R2 compatibility
  
  return url.toString();
}

async function handleSignup(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const { email, password, firstName, lastName, planType } = await request.json();
  
  if (!email || !password || !firstName || !lastName) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  const accountId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  try {
    // Check if email already exists
    const existing = await env.DB.prepare(
      'SELECT id FROM accounts WHERE email = ?'
    ).bind(email).first();
    
    if (existing) {
      return new Response(JSON.stringify({ error: 'Email already exists' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Create account (storing password as plain text for demo - in production use proper hashing!)
    await env.DB.prepare(`
      INSERT INTO accounts (id, name, email, type, subscription, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      accountId,
      `${firstName} ${lastName}`,
      email,
      'individual',
      planType || 'starter',
      timestamp,
      timestamp
    ).run();
    
    // For demo purposes, we'll store the password in a simple way
    // In production, use proper password hashing and a separate auth table
    
    const user = {
      id: accountId,
      email,
      firstName,
      lastName,
      planType: planType || 'starter',
      subscriptionStatus: 'active',
      createdAt: timestamp,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    // Send welcome email using the email service binding
    const emailSent = await sendWelcomeEmailViaService(env.EMAIL_SERVICE, email, firstName, planType || 'Starter');
    
    if (emailSent) {
      console.log(`Welcome email sent to ${email}`);
    } else {
      console.error(`Failed to send welcome email to ${email}`);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      user,
      token: `mock-token-${accountId}`, // Simple token for demo
      emailSent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create account' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleLogin(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  const { email, password } = await request.json();
  
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Missing email or password' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Get account by email
    const account = await env.DB.prepare(
      'SELECT * FROM accounts WHERE email = ?'
    ).bind(email).first();
    
    if (!account) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // For demo, we're not checking password properly
    // In production, verify hashed password
    
    const [firstName, ...lastNameParts] = account.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    const user = {
      id: account.id,
      email: account.email,
      firstName,
      lastName,
      planType: account.subscription,
      subscriptionStatus: 'active',
      createdAt: account.created_at,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    return new Response(JSON.stringify({ 
      success: true, 
      user,
      token: `mock-token-${account.id}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function processVideoSubmission(data: any, env: Env): Promise<void> {
  const { submissionId, r2Key } = data;
  
  try {
    // Here you would:
    // 1. Generate thumbnail
    // 2. Extract additional metadata if needed
    // 3. Optionally transcode via Cloudflare Stream
    // 4. Update database status
    
    await env.DB.prepare(`
      UPDATE submissions 
      SET status = 'ready', updated_at = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), submissionId).run();
    
    console.log(`Processed submission ${submissionId}`);
  } catch (error) {
    console.error(`Failed to process ${submissionId}:`, error);
    
    await env.DB.prepare(`
      UPDATE submissions 
      SET status = 'failed', error_message = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      error.message,
      new Date().toISOString(),
      submissionId
    ).run();
  }
}