# SRCC Business Club Website & Membership Management System

A full-stack web application designed for the **SRCC Business Club** with automated monthly fee calculations, tenure lifecycle management, and a dedicated club administration portal.

---

## Key Features

1. **Member Fee Calculation Engine**:
   - **Monthly Fee**: 50 TK per month from the member's `joined_date`.
   - **Tenure Limit**: 1.5 years (18 months maximum).
   - **Formulas**:
     $$\text{Elapsed Months} = \min(18, \text{months from join date to today})$$
     $$\text{Paid (TK)} = \text{Months Paid} \times 50\text{ TK}$$
     $$\text{Not Paid / Due (TK)} = (\text{Elapsed Months} \times 50) - \text{Paid}$$
2. **Interactive Admin Controls**:
   - **Slider & Dropdown** for each member (0 to 18 months) to instantly record paid dues.
   - Quick **+1 Month** (+50 TK) shortcut button.
   - Instant calculation updates with zero page reloads.
3. **Multi-Field Real-Time Search**:
   - Filter or search instantly by **Role**, **ID**, or **Name**.
   - Additional filters for Blood Group, Role, and Payment Status (Has Due vs Cleared).
4. **Automatic 1.5-Year Auto-Deletion / Archive**:
   - Members who joined more than 1.5 years ago (18 months) are automatically retired from the active roster.
   - Archived records can be viewed in the Admin "1.5-Yr Auto-Purged" modal, with a 1-click restore feature.
5. **Database Fields Stored**:
   - `Name`, `Role`, `ID`, `Number` (Phone), `Blood` Group, `Months Paid`, `Paid (TK)`, `Not Paid / Due (TK)`, `Joined Date`.
6. **Public Club Portal**:
   - Executive Committee showcase.
   - Club pillars & activities.
   - **Public Member Dues & Status Lookup** (by Student ID or Phone number).
   - Online member registration.

---

## How to Run

### Quick Start (Windows)
Double-click `run.bat` in this folder, or run:
```powershell
.\run.bat
```

### Manual Start

#### Backend Server (Port 5000):
```powershell
cd server
npm start
```

#### Frontend Client (Port 5173):
```powershell
cd client
npm run dev
```

Open your browser at: `http://localhost:5173`
