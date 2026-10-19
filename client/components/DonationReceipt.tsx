import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Donation } from '@/context/DonationContext';
import { Download, Printer } from 'lucide-react';

interface DonationReceiptProps {
  donation: Donation;
  ngoName: string;
}

export function DonationReceipt({ donation, ngoName }: DonationReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    const receiptContent = generateReceiptText(donation, ngoName);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `receipt_${donation.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="shadow-lg border-0 print:shadow-none print:border print:border-slate-300">
      <CardHeader>
        <CardTitle className="text-center">Donation Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-slate-900">FundHub</h1>
          <p className="text-slate-600">Charity Donation Platform</p>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 font-semibold">Receipt ID</p>
            <p className="text-slate-900 font-mono">{donation.id}</p>
          </div>
          <div>
            <p className="text-slate-500 font-semibold">Date</p>
            <p className="text-slate-900">
              {donation.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Donor Information */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Donor Information</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Name</p>
              <p className="text-slate-900">{donation.donorName}</p>
            </div>
            <div>
              <p className="text-slate-500">Email</p>
              <p className="text-slate-900">{donation.donorEmail}</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Donation Details */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Donation Details</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <p className="text-slate-500">NGO</p>
              <p className="text-slate-900 font-semibold">{ngoName}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-slate-500">Amount</p>
              <p className="text-slate-900 font-semibold">
                {donation.amount} {donation.currency}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-slate-500">Payment Method</p>
              <p className="text-slate-900 font-semibold capitalize">{donation.paymentMethod}</p>
            </div>
            {donation.transactionId && (
              <div className="flex justify-between">
                <p className="text-slate-500">Transaction ID</p>
                <p className="text-slate-900 font-mono text-xs">{donation.transactionId}</p>
              </div>
            )}
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Tax Information */}
        <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
          <p className="font-semibold text-slate-900">Tax Deduction Information</p>
          <p className="text-slate-600">
            This donation may be eligible for tax deduction. Please consult with your tax advisor for more information.
          </p>
          <p className="text-slate-600">
            Tax ID: {donation.ngoName.substring(0, 3).toUpperCase()}-{Math.floor(Math.random() * 1000000)}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center border-t pt-6">
          <p className="text-xs text-slate-500">
            Thank you for your generous contribution!
          </p>
          <p className="text-xs text-slate-400 mt-2">
            This is an automated receipt. No signature required.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center pt-4 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function generateReceiptText(donation: Donation, ngoName: string): string {
  return `
FUNDHUB DONATION RECEIPT
========================

Receipt ID: ${donation.id}
Date: ${donation.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })}

DONOR INFORMATION
=================
Name: ${donation.donorName}
Email: ${donation.donorEmail}

DONATION DETAILS
================
NGO: ${ngoName}
Amount: ${donation.amount} ${donation.currency}
Payment Method: ${donation.paymentMethod}
${donation.transactionId ? `Transaction ID: ${donation.transactionId}` : ''}

TAX DEDUCTION INFORMATION
=========================
This donation may be eligible for tax deduction.
Please consult with your tax advisor for more information.

Thank you for your generous contribution!
This is an automated receipt. No signature required.
  `.trim();
}
