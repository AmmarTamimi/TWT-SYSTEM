// app/lib/downloadReceipt.ts

type DonationForReceipt = {
  id: number;
  amount: number;
  description: string | null;
  reciept: string | null;
  category: string;
  meeting_id: number | null;
  created_at: string;
  User?: { id: string; name: string; cnic: string } | null;
  Meeting?: {
    id: string;
    title: string;
    meeting_number: number;
    date?: string;
  } | null;
};

const categoryLabels: Record<string, string> = {
  ZAKAT: "Zakat",
  FITRANA: "Fitrana",
  SADQA: "Sadqa",
  MEETING_FUND: "Meeting Fund",
  MEETING_DUE: "Meeting Due",
  GENERAL: "General",
};

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(n);
}

/* Escape user-supplied values before injecting them into HTML */
function esc(s: unknown) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    (
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }) as Record<string, string>
    )[c]
  );
}

export function downloadReceipt(donation: DonationForReceipt) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return;

  const categoryLabel = esc(
    categoryLabels[donation.category] ?? donation.category
  );
  const donorName = esc(donation.User?.name ?? "—");
  const donorCnic = esc(donation.User?.cnic ?? "—");
  const meetingTitle = esc(donation.Meeting?.title ?? "—");
  const meetingNumber = esc(donation.meeting_id ?? "—");
  const amountFormatted = esc(formatMoney(Number(donation.amount)));
  const description = donation.description ? esc(donation.description) : "";

  const rawDate = (donation as any).createdAt ?? (donation as any).created_at;
  const createdDate = rawDate
    ? esc(
        new Date(rawDate).toLocaleString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      )
    : "—";

  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Donation Receipt</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #d4e8d8;
            color: #1a1a1a;
            -webkit-font-smoothing: antialiased;
          }

          @page {
            size: A4;
            margin: 8mm;
          }

          /* ---------- SCREEN LAYOUT ---------- */
          body {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 20px;
            min-height: 100vh;
          }

          .page {
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .receipt {
            width: 100%;
            max-width: 700px;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow:
              0 24px 60px rgba(44, 110, 73, 0.22),
              0 6px 18px rgba(0, 0, 0, 0.06);
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* ---------- HEADER ---------- */
          .header {
            background: linear-gradient(135deg, #2c6e49 0%, #1f5234 60%, #18402a 100%);
            color: #ffffff;
            padding: 24px 32px 48px;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,0.12), rgba(255,255,255,0));
            border-radius: 50%;
          }

          .brand-row {
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            z-index: 1;
          }

          .logo {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #ffffff 0%, #e8f5ee 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 17px;
            color: #2c6e49;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
            flex-shrink: 0;
          }

          .brand-name {
            font-size: 17px;
            font-weight: 700;
            letter-spacing: -0.3px;
          }
          .brand-tag {
            font-size: 9.5px;
            opacity: 0.85;
            letter-spacing: 1.8px;
            text-transform: uppercase;
            margin-top: 2px;
            color: #c9e6d3;
          }

          .doc-type {
            margin-top: 20px;
            position: relative;
            z-index: 1;
          }
          .doc-type h1 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.6px;
            color: #ffffff;
          }
          .doc-type p {
            font-size: 12px;
            opacity: 0.85;
            margin-top: 3px;
            color: #c9e6d3;
          }

          /* ---------- BODY ---------- */
          .body { padding: 0 32px 24px; background: #ffffff; }

          /* ---------- AMOUNT BLOCK ---------- */
          .amount-card {
            background: linear-gradient(135deg, #2c6e49 0%, #3a8a5f 100%);
            border-radius: 16px;
            padding: 22px 26px;
            margin-top: -32px;
            position: relative;
            z-index: 3;
            box-shadow:
              0 14px 30px rgba(44, 110, 73, 0.28),
              0 3px 10px rgba(0, 0, 0, 0.08);
            overflow: hidden;
          }

          .amount-card::before {
            content: '';
            position: absolute;
            top: -40px;
            right: -40px;
            width: 140px;
            height: 140px;
            background: radial-gradient(circle, rgba(255,255,255,0.15), rgba(255,255,255,0));
            border-radius: 50%;
          }

          .amount-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.8px;
            color: #b8e0c6;
            font-weight: 600;
            position: relative;
            z-index: 1;
          }
          .amount-value {
            font-size: 36px;
            font-weight: 800;
            color: #ffffff;
            margin-top: 4px;
            letter-spacing: -1px;
            line-height: 1.05;
            position: relative;
            z-index: 1;
          }
          .amount-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            background: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.35);
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 0.9px;
            position: relative;
            z-index: 1;
          }
          .amount-badge::before {
            content: '';
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #a8f0c0;
            box-shadow: 0 0 6px #a8f0c0;
          }

          /* ---------- INFO SECTIONS ---------- */
          .section-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.8px;
            color: #2c6e49;
            font-weight: 700;
            margin: 20px 0 8px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .section-title::after {
            content: '';
            flex: 1;
            height: 2px;
            background: linear-gradient(90deg, #d1e7dd 0%, transparent 100%);
            border-radius: 2px;
          }

          .info-card {
            background: linear-gradient(135deg, #f0f9f4 0%, #e8f5ee 100%);
            border: 1px solid #d1e7dd;
            border-radius: 12px;
            padding: 2px 18px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px dashed #c9e6d3;
            gap: 20px;
          }
          .info-row:last-child { border-bottom: none; }
          .info-label {
            font-size: 12px;
            color: #5a7d67;
            font-weight: 500;
            flex-shrink: 0;
          }
          .info-value {
            font-size: 12.5px;
            color: #1a3d2a;
            font-weight: 700;
            text-align: right;
            word-break: break-word;
          }
          .info-value.mono {
            font-family: 'Courier New', monospace;
            letter-spacing: 0.4px;
            color: #2c6e49;
            font-weight: 700;
          }

          /* ---------- THANK YOU ---------- */
          .thank-box {
            margin-top: 20px;
            padding: 18px 24px;
            background: linear-gradient(135deg, #f0f9f4 0%, #e0f2e6 100%);
            border-radius: 12px;
            border: 2px solid #c9e6d3;
            text-align: center;
          }
          .thank-box h3 {
            font-size: 15px;
            color: #2c6e49;
            font-weight: 800;
            margin-bottom: 5px;
            letter-spacing: -0.2px;
          }
          .thank-box p {
            font-size: 11.5px;
            color: #3f5f4d;
            line-height: 1.55;
            max-width: 440px;
            margin: 0 auto;
            font-weight: 500;
          }

          /* ---------- FOOTER ---------- */
          .footer {
            background: linear-gradient(135deg, #1f5234 0%, #18402a 100%);
            padding: 16px 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10.5px;
            gap: 16px;
          }
          .footer-left {
            font-weight: 600;
            color: #c9e6d3;
          }
          .footer-right {
            text-align: right;
            font-style: italic;
            color: #a8e0b8;
            font-weight: 500;
          }

          /* ---------- PRINT: white sheet, receipt centered on A4 ---------- */
          @media print {
            html, body {
              background: #ffffff !important;
              padding: 0;
              margin: 0;
              min-height: 0;
              height: auto;
              display: block;
            }

            .page {
              height: 275mm;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              page-break-after: avoid;
              break-after: avoid;
            }

            .receipt {
              max-width: 170mm;
              box-shadow: none;
              border: 1px solid #c9e6d3;
              border-radius: 12px;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="receipt">
            <!-- Header -->
            <div class="header">
              <div class="brand-row">
                <div class="logo">TW</div>
                <div>
                  <div class="brand-name">Tamimi Welfare Trust</div>
                  <div class="brand-tag">Official Donation Receipt</div>
                </div>
              </div>

              <div class="doc-type">
                <h1>Donation Receipt</h1>
                <p>Thank you for your generous contribution.</p>
              </div>
            </div>

            <!-- Body -->
            <div class="body">
              <!-- Amount -->
              <div class="amount-card">
                <div class="amount-label">Amount Received</div>
                <div class="amount-value">${amountFormatted}</div>
                <div class="amount-badge">${categoryLabel}</div>
              </div>

              <!-- Donation Details -->
              <div class="section-title">Donation Details</div>
              <div class="info-card">
                <div class="info-row">
                  <div class="info-label">Date Created</div>
                  <div class="info-value">${createdDate}</div>
                </div>
              </div>

              <!-- Donor -->
              <div class="section-title">Donor Information</div>
              <div class="info-card">
                <div class="info-row">
                  <div class="info-label">Full Name</div>
                  <div class="info-value">${donorName}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">CNIC Number</div>
                  <div class="info-value mono">${donorCnic}</div>
                </div>
              </div>

              <!-- Meeting -->
              <div class="section-title">Meeting Details</div>
              <div class="info-card">
                <div class="info-row">
                  <div class="info-label">Meeting</div>
                  <div class="info-value">${meetingTitle}</div>
                </div>
                <div class="info-row">
                  <div class="info-label">Meeting Number</div>
                  <div class="info-value mono">#${meetingNumber}</div>
                </div>
              </div>

              ${
                description
                  ? `
                  <div class="section-title">Note</div>
                  <div class="info-card">
                    <div class="info-row">
                      <div class="info-label">Description</div>
                      <div class="info-value">${description}</div>
                    </div>
                  </div>
                `
                  : ""
              }

              <!-- Thank you -->
              <div class="thank-box">
                <h3>JazakAllah Khair</h3>
                <p>
                  Your contribution supports our mission to serve communities
                  with compassion and dignity.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-left">Tamimi Welfare Trust · Est. 2014</div>
              <div class="footer-right">Compassion. Community. Change.</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function () {
            setTimeout(function () { window.print(); }, 400);
          };
        </script>
      </body>
    </html>
  `);
  w.document.close();
}