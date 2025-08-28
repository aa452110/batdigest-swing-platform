var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-RMX6V4/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/email.ts
async function sendEmail(options) {
  try {
    const response = await fetch("https://batdigest-email.brianduryea.workers.dev", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        template: "default",
        data: {
          fromName: "$500 Swing",
          title: options.subject,
          message: options.html,
          // Pass the raw HTML for custom template
          customHtml: options.html
        }
      })
    });
    if (!response.ok) {
      const error = await response.text();
      console.error("Email worker error:", error);
      return false;
    }
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
__name(sendEmail, "sendEmail");
async function sendWelcomeEmailViaService(emailService, to, firstName, planName) {
  try {
    const response = await emailService.fetch(new Request("https://email/", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        to,
        subject: "Welcome to $500 Swing!",
        template: "welcome",
        data: {
          firstName,
          planName: planName.charAt(0).toUpperCase() + planName.slice(1),
          // Capitalize plan name
          fromName: "$500 Swing"
        }
      })
    }));
    if (!response.ok) {
      const error = await response.text();
      console.error("Email service error:", error);
      return false;
    }
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error("Failed to send welcome email via service:", error);
    return false;
  }
}
__name(sendWelcomeEmailViaService, "sendWelcomeEmailViaService");
var emailTemplates = {
  welcome: /* @__PURE__ */ __name((firstName, planName) => ({
    subject: "Welcome to $500 Swing!",
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
        <h2 style="color: #0f172a; margin: 0 0 20px 0;">Welcome aboard, ${firstName}! \u{1F389}</h2>
        
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
          Remember: it's not about the bat\u2014it's about the mechanic. We're here to help you build a $500 swing with the bat you already have.
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
          \xA9 2024 $500 Swing \xB7 A Bat Digest Product<br>
          <a href="http://localhost:5004/account" style="color: #14b8a6; text-decoration: none;">Manage Account</a> \xB7 
          <a href="mailto:support@batdigest.com" style="color: #14b8a6; text-decoration: none;">Support</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  }), "welcome"),
  analysisReady: /* @__PURE__ */ __name((firstName, analysisId) => ({
    subject: "Your Swing Analysis is Ready!",
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
    `
  }), "analysisReady")
};

// src/index.ts
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": env.CORS_ORIGIN || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      if (url.pathname === "/api/submissions/init" && request.method === "POST") {
        return await handleSubmissionInit(request, env, corsHeaders);
      }
      if (url.pathname === "/api/submissions/confirm" && request.method === "POST") {
        return await handleSubmissionConfirm(request, env, corsHeaders);
      }
      if (url.pathname === "/api/queue" && request.method === "GET") {
        return await handleGetQueue(request, env, corsHeaders);
      }
      if (url.pathname === "/api/auth/signup" && request.method === "POST") {
        return await handleSignup(request, env, corsHeaders);
      }
      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        return await handleLogin(request, env, corsHeaders);
      }
      if (url.pathname === "/api/test-email" && request.method === "GET") {
        const emailTemplate = emailTemplates.welcome("Brian", "Performance");
        const emailSent = await sendEmail({
          to: "brianduryea@gmail.com",
          from: "noreply@batdigest.com",
          subject: "Test Email from $500 Swing",
          html: emailTemplate.html
        });
        return new Response(JSON.stringify({
          success: emailSent,
          message: emailSent ? "Test email sent!" : "Failed to send email"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({ error: "Internal Server Error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
  },
  async queue(batch, env) {
    for (const message of batch.messages) {
      await processVideoSubmission(message.body, env);
      message.ack();
    }
  }
};
async function handleSubmissionInit(request, env, corsHeaders) {
  const data = await request.json();
  const submissionId = data.submissionId || crypto.randomUUID();
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const r2Key = `submissions/${submissionId}/video.mp4`;
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
    data.athleteInfo?.email || "",
    data.athleteName,
    data.athleteInfo?.height || null,
    data.athleteInfo?.weight || null,
    data.athleteInfo?.age || null,
    data.athleteInfo?.battingStance || "right",
    timestamp,
    data.notes || null,
    r2Key,
    "uploading",
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
  const uploadUrl = await generateR2UploadUrl(env, r2Key);
  const response = {
    uploadURL: uploadUrl,
    r2Key,
    submissionId
  };
  return new Response(JSON.stringify(response), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleSubmissionInit, "handleSubmissionInit");
async function handleSubmissionConfirm(request, env, corsHeaders) {
  const { submissionId, r2Key } = await request.json();
  await env.DB.prepare(`
    UPDATE submissions 
    SET status = 'processing', updated_at = ?
    WHERE id = ?
  `).bind((/* @__PURE__ */ new Date()).toISOString(), submissionId).run();
  await env.VIDEO_QUEUE.send({
    submissionId,
    r2Key,
    timestamp: Date.now()
  });
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleSubmissionConfirm, "handleSubmissionConfirm");
async function handleGetQueue(request, env, corsHeaders) {
  const { results } = await env.DB.prepare(`
    SELECT * FROM submissions 
    WHERE status IN ('processing', 'ready')
    ORDER BY created_at DESC
    LIMIT 50
  `).all();
  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(handleGetQueue, "handleGetQueue");
async function generateR2UploadUrl(env, key) {
  const url = new URL(`https://r2.batdigest.com/${key}`);
  return url.toString();
}
__name(generateR2UploadUrl, "generateR2UploadUrl");
async function handleSignup(request, env, corsHeaders) {
  const { email, password, firstName, lastName, planType } = await request.json();
  if (!email || !password || !firstName || !lastName) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const accountId = crypto.randomUUID();
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const existing = await env.DB.prepare(
      "SELECT id FROM accounts WHERE email = ?"
    ).bind(email).first();
    if (existing) {
      return new Response(JSON.stringify({ error: "Email already exists" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    await env.DB.prepare(`
      INSERT INTO accounts (id, name, email, type, subscription, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      accountId,
      `${firstName} ${lastName}`,
      email,
      "individual",
      planType || "starter",
      timestamp,
      timestamp
    ).run();
    const user = {
      id: accountId,
      email,
      firstName,
      lastName,
      planType: planType || "starter",
      subscriptionStatus: "active",
      createdAt: timestamp,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
    };
    const emailSent = await sendWelcomeEmailViaService(env.EMAIL_SERVICE, email, firstName, planType || "Starter");
    if (emailSent) {
      console.log(`Welcome email sent to ${email}`);
    } else {
      console.error(`Failed to send welcome email to ${email}`);
    }
    return new Response(JSON.stringify({
      success: true,
      user,
      token: `mock-token-${accountId}`,
      // Simple token for demo
      emailSent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ error: "Failed to create account" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleSignup, "handleSignup");
async function handleLogin(request, env, corsHeaders) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Missing email or password" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    const account = await env.DB.prepare(
      "SELECT * FROM accounts WHERE email = ?"
    ).bind(email).first();
    if (!account) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const [firstName, ...lastNameParts] = account.name.split(" ");
    const lastName = lastNameParts.join(" ");
    const user = {
      id: account.id,
      email: account.email,
      firstName,
      lastName,
      planType: account.subscription,
      subscriptionStatus: "active",
      createdAt: account.created_at,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString()
    };
    return new Response(JSON.stringify({
      success: true,
      user,
      token: `mock-token-${account.id}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Login error:", error);
    return new Response(JSON.stringify({ error: "Login failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(handleLogin, "handleLogin");
async function processVideoSubmission(data, env) {
  const { submissionId, r2Key } = data;
  try {
    await env.DB.prepare(`
      UPDATE submissions 
      SET status = 'ready', updated_at = ?
      WHERE id = ?
    `).bind((/* @__PURE__ */ new Date()).toISOString(), submissionId).run();
    console.log(`Processed submission ${submissionId}`);
  } catch (error) {
    console.error(`Failed to process ${submissionId}:`, error);
    await env.DB.prepare(`
      UPDATE submissions 
      SET status = 'failed', error_message = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      error.message,
      (/* @__PURE__ */ new Date()).toISOString(),
      submissionId
    ).run();
  }
}
__name(processVideoSubmission, "processVideoSubmission");

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-RMX6V4/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-RMX6V4/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
