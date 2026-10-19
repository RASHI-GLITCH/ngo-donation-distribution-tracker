# FundHub - Donation & Expense Tracking Platform

## Overview

FundHub is a comprehensive donation and expense tracking platform that enables:
- **Donors**: Browse NGOs and make donations
- **NGO Admins**: Track donations, manage expenses, and view analytics
- **App Admins**: Monitor platform-wide analytics and fund flows

## Features

### Phase 1 (Completed) ✅

#### Donor Features
- Browse NGO directory with categories and search
- View NGO missions and details
- Make donations to specific NGOs
- Track donation history
- View donations by NGO
- Download donation receipts

#### NGO Admin Features
- View donations received by their NGO
- Track funds received
- Record expenses with categories
- View expense analytics (pie charts)
- Monitor fund allocation
- Generate monthly expense reports

#### App Admin Features
- Platform-wide statistics (total donations, expenses, donors, NGOs)
- Donations by NGO (pie chart)
- Expenses by category (pie chart)
- Monthly donation trends (bar chart)
- Top NGOs by donations
- Top expense categories

### Phase 2 (Completed) ✅

#### Expense Tracking
- Categorize expenses (Staff, Office, Equipment, etc.)
- Add descriptions for tracking
- Monthly expense trends visualization
- Category-wise expense distribution

#### Receipt Generation
- Automatic receipt generation for donations
- Print receipt option
- Download receipt as text file
- Tax deduction information

#### Analytics & Reporting
- Bar charts for monthly trends
- Pie charts for distribution analysis
- Real-time data updates
- Platform-wide overview

### Phase 3 (To Do)

- Razorpay payment gateway integration
- Actual payment processing
- Payment verification and webhook handling
- Donor receipt delivery via email
- Advanced filtering and search
- Export reports as PDF/CSV

## Technology Stack

- **Frontend**: React 18 + TypeScript + React Router 6
- **Styling**: TailwindCSS 3 + Radix UI
- **Charts**: Recharts
- **Data Storage**: Browser localStorage (mock implementation)
- **Payment Gateway**: Razorpay (to be integrated)

## Project Structure

```
client/
├── pages/
│   ├── RoleSelection.tsx      # Role selection page
│   ├── Auth.tsx               # Login/Register page
│   ├── NGOBrowse.tsx          # Donor: NGO browsing & donation
│   ├── NGODashboard.tsx       # NGO Admin dashboard
│   ├── AppAdminDashboard.tsx  # App Admin dashboard
│   └── ...
├── context/
│   ├── AuthContext.tsx        # Authentication (mock)
│   ├── DonationContext.tsx    # Donation management
│   └── NGOContext.tsx         # NGO & expense management
├── components/
│   ├── AnalyticsChart.tsx     # Recharts wrapper
│   ├── DonationReceipt.tsx    # Receipt generation
│   └── ...
└── lib/
    ├── razorpay.ts           # Razorpay integration
    └── ...
```

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The app will start at http://localhost:8080

### Login Test Accounts

The app uses mock authentication with localStorage. You can create test accounts by:

1. Select a role (Donor, NGO Admin, or App Admin)
2. Click "Sign Up"
3. Enter any name and email
4. Create any password
5. Start using the app

#### Pre-configured Test Users

```
Donor:
Email: donor@example.com
Password: password123

NGO Admin (Education for All):
Email: admin@educationforall.org
Password: password123

App Admin:
Email: admin@fundhub.com
Password: password123
```

**Note**: These accounts won't exist until you create them in the signup form.

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and update with your values:

```bash
cp .env.example .env.local
```

#### Razorpay Setup (Phase 3)

1. Create account at https://dashboard.razorpay.com
2. Get your Key ID and Key Secret from Dashboard → Settings → API Keys
3. Add to `.env.local`:

```
VITE_RAZORPAY_KEY_ID=your_key_id
VITE_RAZORPAY_KEY_SECRET=your_key_secret
```

## Current Implementation

### Data Storage

All data is currently stored in browser **localStorage**:
- User accounts: `fundhub_mock_users`
- Current user: `fundhub_current_user`
- Donations: `fundhub_donations`
- Expenses: `fundhub_expenses`
- NGOs: `fundhub_ngos`

### Authentication

- Mock authentication system using localStorage
- No password hashing (development only)
- Users can log in with any credentials
- Session persists across page refreshes

### Donations

- Stored as objects with donor, NGO, amount, and timestamp
- Real-time updates when new donations are made
- Tracked by NGO for analytics

### Expenses

- Categorized by type (Staff, Office, Equipment, etc.)
- Tracked by NGO admin
- Monthly aggregation for trend visualization

## Future Enhancements (Phase 3+)

1. **Razorpay Integration**
   - Real payment processing
   - Payment verification
   - Webhook handling for payment status

2. **Backend Services**
   - User authentication with hashing
   - Database (PostgreSQL/Firebase)
   - API endpoints for payment processing
   - Email notifications

3. **Advanced Features**
   - PDF receipt generation
   - Email receipt delivery
   - Advanced filtering
   - CSV/PDF export
   - NGO verification system
   - Donation campaign tracking
   - Real-time notifications

## Building for Production

```bash
pnpm build
```

This creates optimized production builds in `dist/` directory.

## Testing

```bash
pnpm test
```

## Troubleshooting

### Payment Not Processing

- Ensure Razorpay script loads correctly
- Check Razorpay Key ID in environment variables
- Verify browser console for errors

### Data Not Persisting

- Check browser storage is enabled
- Clear localStorage if data is corrupted:
  ```javascript
  localStorage.clear()
  ```

### Chart Not Displaying

- Ensure Recharts is installed: `pnpm install recharts`
- Check browser console for errors
- Verify data is available in the component

## Security Notes

⚠️ **Important**: This is a development implementation using localStorage.

For production:
- Use proper authentication (Firebase, Auth0, etc.)
- Implement secure password hashing
- Use HTTPS for all communications
- Implement CSRF protection
- Use environment variables for secrets
- Implement proper access control
- Validate all inputs on backend
- Implement rate limiting

## Support

For issues or questions, please refer to:
- Codebase: Check existing components and contexts
- Environment: See `.env.example` for configuration
- Payment Gateway: Visit https://razorpay.com/docs

## License

This project is proprietary and confidential.
