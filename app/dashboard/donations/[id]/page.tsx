"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "../../../components/ui/Card"; // Adjust path
import { Button } from "../../../components/ui/Button"; // Adjust path
import {
  ArrowLeft,
  Download,
  Wallet,
  User as UserIcon,
  CreditCard,
  Calendar,
  FileText,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2
} from "lucide-react";

interface DonationDetail {
  id: string;
  userId: string;
  amount: number;
  date: string;
  description: string | null;
  reciept: string;
  category: string;
  created_at: string;
  User?: {
    name: string;
    cnic: string;
    contact_num: string;
  } | null;
}

const categoryLabels: Record<string, string> = {
  ZAKAT: "Zakat",
  FITRANA: "Fitrana",
  SADQA: "Sadqa",
  MEETING_FUND: "Meeting Fund",
  MEETING_DUE: "Meeting Due",
  GENERAL: "General",
};

export default function DonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const donationId = params.id as string;

  const [donation, setDonation] = useState<DonationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the specific donation
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/donations/${donationId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load donation");
        if (!cancelled) setDonation(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [donationId]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatMoney(amount: number) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Reuse the exact same receipt generator we built for the main page
  const handleDownloadReceipt = () => {
    if (!donation) return;

    const w = window.open("", "_blank", "width=900,height=1100");
    if (!w) return;

    const esc = (s: unknown) =>
      String(s ?? "").replace(/[&<>"']/g, (c) =>
        (({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c)
      );

    const categoryLabel = esc(categoryLabels[donation.category] || donation.category);
    const donorName = esc(donation.User?.name || "Member");
    const donorCnic = esc(donation.User?.cnic || "—");
    const amountFormatted = esc(formatMoney(donation.amount));
    const description = donation.description ? esc(donation.description) : "";
    const receiptNo = esc(donation.reciept);
    const createdDate = esc(formatDate(donation.date || donation.created_at));

    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Donation Receipt - ${receiptNo}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
            html, body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #d4e8d8; color: #1a1a1a; }
            @page { size: A4; margin: 8mm; }
            body { display: flex; justify-content: center; align-items: flex-start; padding: 20px; min-height: 100vh; }
            .page { width: 100%; display: flex; justify-content: center; }
            .receipt { width: 100%; max-width: 700px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 60px rgba(44,110,73,0.22), 0 6px 18px rgba(0,0,0,0.06); }
            .header { background: linear-gradient(135deg, #2c6e49 0%, #1f5234 60%, #18402a 100%); color: #ffffff; padding: 24px 32px 48px; position: relative; overflow: hidden; }
            .brand-row { display: flex; align-items: center; gap: 12px; position: relative; z-index: 1; }
            .logo { width: 44px; height: 44px; background: linear-gradient(135deg, #ffffff 0%, #e8f5ee 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 17px; color: #2c6e49; }
            .brand-name { font-size: 17px; font-weight: 700; }
            .brand-tag { font-size: 9.5px; opacity: 0.85; letter-spacing: 1.8px; text-transform: uppercase; margin-top: 2px; color: #c9e6d3; }
            .doc-type { margin-top: 20px; position: relative; z-index: 1; }
            .doc-type h1 { font-size: 24px; font-weight: 800; color: #ffffff; }
            .doc-type p { font-size: 12px; opacity: 0.85; margin-top: 3px; color: #c9e6d3; }
            .body { padding: 0 32px 24px; background: #ffffff; }
            .amount-card { background: linear-gradient(135deg, #2c6e49 0%, #3a8a5f 100%); border-radius: 16px; padding: 22px 26px; margin-top: -32px; position: relative; z-index: 3; box-shadow: 0 14px 30px rgba(44,110,73,0.28); }
            .amount-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.8px; color: #b8e0c6; font-weight: 600; }
            .amount-value { font-size: 36px; font-weight: 800; color: #ffffff; margin-top: 4px; }
            .amount-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.2); color: #fff; border: 1px solid rgba(255,255,255,0.35); margin-top: 10px; text-transform: uppercase; }
            .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1.8px; color: #2c6e49; font-weight: 700; margin: 20px 0 8px; display: flex; align-items: center; gap: 10px; }
            .section-title::after { content: ''; flex: 1; height: 2px; background: linear-gradient(90deg, #d1e7dd, transparent); border-radius: 2px; }
            .info-card { background: linear-gradient(135deg, #f0f9f4 0%, #e8f5ee 100%); border: 1px solid #d1e7dd; border-radius: 12px; padding: 2px 18px; }
            .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #c9e6d3; gap: 20px; }
            .info-row:last-child { border-bottom: none; }
            .info-label { font-size: 12px; color: #5a7d67; font-weight: 500; }
            .info-value { font-size: 12.5px; color: #1a3d2a; font-weight: 700; text-align: right; }
            .info-value.mono { font-family: 'Courier New', monospace; color: #2c6e49; }
            .thank-box { margin-top: 20px; padding: 18px 24px; background: linear-gradient(135deg, #f0f9f4 0%, #e0f2e6 100%); border-radius: 12px; border: 2px solid #c9e6d3; text-align: center; }
            .thank-box h3 { font-size: 15px; color: #2c6e49; font-weight: 800; margin-bottom: 5px; }
            .thank-box p { font-size: 11.5px; color: #3f5f4d; line-height: 1.55; max-width: 440px; margin: 0 auto; font-weight: 500; }
            .footer { background: linear-gradient(135deg, #1f5234 0%, #18402a 100%); padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; }
            .footer-left { font-weight: 600; color: #c9e6d3; }
            .footer-right { text-align: right; font-style: italic; color: #a8e0b8; font-weight: 500; }
            @media print {
              html, body { background: #ffffff !important; padding: 0; margin: 0; display: block; }
              .page { height: 275mm; display: flex; align-items: center; justify-content: center; }
              .receipt { max-width: 170mm; box-shadow: none; border: 1px solid #c9e6d3; border-radius: 12px; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="receipt">
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
              <div class="body">
                <div class="amount-card">
                  <div class="amount-label">Amount Received</div>
                  <div class="amount-value">${amountFormatted}</div>
                  <div class="amount-badge">${categoryLabel}</div>
                </div>

                <div class="section-title">Receipt Information</div>
                <div class="info-card">
                  <div class="info-row">
                    <div class="info-label">Receipt Number</div>
                    <div class="info-value mono">${receiptNo}</div>
                  </div>
                  <div class="info-row">
                    <div class="info-label">Date Issued</div>
                    <div class="info-value">${createdDate}</div>
                  </div>
                </div>

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

                ${description ? `
                  <div class="section-title">Note</div>
                  <div class="info-card">
                    <div class="info-row">
                      <div class="info-label">Description</div>
                      <div class="info-value">${description}</div>
                    </div>
                  </div>
                ` : ""}

                <div class="thank-box">
                  <h3>JazakAllah Khair</h3>
                  <p>Your contribution supports our mission to serve communities with compassion and dignity.</p>
                </div>
              </div>
              <div class="footer">
                <div class="footer-left">Tamimi Welfare Trust · Est. 2014</div>
                <div class="footer-right">Compassion. Community. Change.</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function () { setTimeout(function () { window.print(); }, 400); };
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2c6e49]" />
        <p>Loading donation details...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-lg font-semibold text-gray-800">{error || "Donation not found"}</h2>
        <Button
          onClick={() => router.push("/dashboard/donations")}
          className="mt-6 bg-[#2c6e49] hover:bg-[#1f5234] text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Donations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/donations"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2c6e49] transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Donations
      </Link>

      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#2c6e49]/10 to-green-50/50 rounded-2xl p-6 border border-[#2c6e49]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" />
            Receipt {donation.reciept || `#${donation.id.split("-")[0]}`}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#2c6e49]">
            {formatMoney(donation.amount)}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 border border-green-200">
              {categoryLabels[donation.category] || donation.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Verified
            </span>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleDownloadReceipt}
            className="w-full sm:w-auto bg-[#2c6e49] hover:bg-[#1f5234] text-white shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Donor Info Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Donor Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                  <p className="font-semibold text-gray-800">{donation.User?.name || "—"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">CNIC Number</p>
                  <p className="font-mono font-medium text-gray-700">{donation.User?.cnic || "—"}</p>
                </div>
              </div>

              {donation.User?.contact_num && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Contact Number</p>
                    <p className="font-medium text-gray-700">{donation.User.contact_num}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Info Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Transaction Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Date & Time</p>
                  <p className="font-medium text-gray-800">{formatDate(donation.date || donation.created_at)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500 mt-0.5">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Description / Note</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100 mt-1">
                    {donation.description || "No description provided."}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}