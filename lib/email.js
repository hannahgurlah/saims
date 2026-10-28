function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendUserWelcomeEmail(user) {
  const apiKey = process.env.RESEND_API_KEY || "";
  const from = process.env.RESEND_FROM_EMAIL || "";
  const loginUrl = process.env.APP_URL || "https://saims.depedregion7.com/login.html";

  if (!apiKey || !from) {
    return { sent: false, reason: "Email delivery is not configured." };
  }

  const displayName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || user.username;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [user.email],
      subject: "Your SAIMS account has been created",
      html: `
        <p>Hello ${escapeHtml(displayName)},</p>
        <p>You have been added as a user of the School Asset Inventory Management System (SAIMS).</p>
        <p><strong>Username:</strong> ${escapeHtml(user.username)}<br>
        <strong>Role:</strong> ${escapeHtml(user.role)}<br>
        <strong>Assignment:</strong> ${escapeHtml(user.role === "admin" ? "All offices and schools" : (user.assignments || [user.assignment]).filter(Boolean).join(", ") || "Not assigned")}</p>
        <p><a href="${escapeHtml(loginUrl)}">Sign in to SAIMS</a></p>
        <p>For security, contact your SAIMS administrator for your temporary password.</p>
      `,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Unable to send SAIMS user notification:", response.status, details);
    return { sent: false, reason: "The email provider rejected the notification." };
  }

  return { sent: true, reason: "" };
}

module.exports = { sendUserWelcomeEmail };
