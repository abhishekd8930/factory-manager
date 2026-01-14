==============================================================================
PROJECT: SRI RAGHAVENDRA FASHIONS - SMART MANAGER
VERSION: 5.5 (Production Build)
AUTHOR: Abhishek.D
COURSE: BCA Final Year Project
==============================================================================

[1] PROJECT DESCRIPTION
------------------------------------------------------------------------------
"Smart Manager" is a comprehensive web-based ERP (Enterprise Resource Planning) 
tool designed specifically for garment manufacturing units. It digitizes the 
entire factory workflow, replacing traditional manual ledgers with an intelligent, 
automated system.

The system handles:
1. Staff Management (Time-based Salaries & Piece-rate Work)
2. Biometric-style Attendance Tracking with "Smart Entry"
3. Automated Payroll Calculation (including OT, Late Fines, and Sunday Logic)
4. Production & Washing Output Analytics
5. Cashbook Accounting (Credit/Debit)

[2] KEY TECHNICAL FEATURES (HIGHLIGHTS)
------------------------------------------------------------------------------
A. HYBRID DATA ARCHITECTURE (Offline-First)
   - The app loads instantly from LocalStorage (0ms latency).
   - Syncs silently to Google Firebase Realtime Database in the background.
   - Ensures data is never lost, even if the internet disconnects during entry.

B. SMART TIME PARSER ALGORITHM (UX Innovation)
   - Eliminates the need for slow time-pickers.
   - User types "930" -> System converts to "09:30 AM".
   - User types "14" -> System converts to "02:00 PM".
   - Context-aware AM/PM guessing (e.g., "7" becomes "07:00 PM" for late shifts).

C. INTELLIGENT SALARY ENGINE
   - Auto-calculates Overtime (OT) based on 8-hour shifts.
   - "Smart Lunch Deduction": Automatically deducts 30 mins break if shift > 5 hrs.
   - "Sunday Logic": Checks the previous week's attendance to decide if Sunday 
     is Paid, Half-Paid, or Unpaid.
   - Consolidates Piece-work entries (e.g., multiple entries of "Shirt" are 
     grouped into one line item on the salary slip).

D. VOICE-ENABLED DATA ENTRY
   - Uses the Web Speech API to allow the manager to speak production logs 
     (e.g., "300 pieces of White Cotton Shirts") instead of typing.

[3] TECH STACK
------------------------------------------------------------------------------
- Frontend: HTML5, CSS3 (Tailwind CSS via CDN)
- Scripting: Vanilla JavaScript (ES6+ Modules)
- Database: Google Firebase Realtime Database
- Local Store: Browser LocalStorage (JSON persistence)
- Icons: FontAwesome 6.4

[4] FOLDER STRUCTURE
------------------------------------------------------------------------------
/ (Root)
├── index.html              # Main Single Page Application (SPA) entry point
├── manifest.json
├── css/
│   └── style.css           # Custom animations, glassmorphism, and print styles
├── js/
│   ├── config.js           # Global settings (Rates, Admin creds)
│   ├── firebase-init.js    # Cloud database connection logic
│   ├── state.js            # Centralized Data Store (Redux-like pattern)
│   ├── auth.js             # Login/Logout and Session management
│   ├── utils.js            # Helper algorithms (Time parser, Date formatting)
│   ├── main.js             # Router and Global Shortcuts
│   └── modules/
│       ├── home.js         # Dashboard widgets & Calendar logic
│       ├── dashboard.js    # Charts & Production/Washing Logs
│       ├── history.js      # Searchable archives
│       ├── attendance.js   # Monthly Book & Daily Views
│       ├── accounting.js   # Cashbook logic
│       └── staff/
│           ├── core.js     # Shared staff helpers
│           ├── list.js     # Grid view & Add Staff Modal
│           ├── ledger.js   # Individual Employee Ledger (Time/Piece)
│           └── finance.js  # Salary Calculation & Slip Generation
├──README.json

[5] SETUP & INSTALLATION
------------------------------------------------------------------------------
1. Ensure you have an active internet connection (for Tailwind CSS & Firebase).
2. Open `index.html` in a modern browser (Chrome/Edge recommended for Voice API).
3. Default Login Credentials (Configured in js/config.js):
   - Username: admin
   - Password: admin123

[6] KEYBOARD SHORTCUTS
------------------------------------------------------------------------------
Global:
- Alt + 1-6: Switch Tabs (Home, Dashboard, Staff, etc.)
- Alt + N:   Add New Entry (Context aware)
- Ctrl + S:  Save Current Form

Inside Ledgers:
- 'D' key:   Auto-fill Default Time (9:30 AM - 7:00 PM)
- 'A' key:   Toggle AM
- 'P' key:   Toggle PM
- 'L/N/H':   Quick Mark (Leave / No-Pay / Holiday)

==============================================================================
                    EXAMINER DEMO CHEAT SHEET (VIVA TIPS)
==============================================================================

1. DEMONSTRATE "SMART TIME" (Wow Factor)
   - Go to Staff -> Select an Employee -> Ledger.
   - In the "In Time" box, just type "930" and press Enter. 
   - Show how it auto-formats to "09:30 AM" and jumps to the next box.

2. DEMONSTRATE "AUTO HISTORY FILL" (Efficiency)
   - Go to Attendance Tab -> Daily View.
   - Click "Auto-Fill (History)".
   - Explain: "Sir, this algorithm looks at the last 2 days. If the employee 
     came at 9:30 AM both days, it predicts they came at 9:30 AM today too."

3. DEMONSTRATE "SALARY SLIP" (Complexity)
   - Go to Staff -> Click the "Info (i)" icon on top right.
   - Show the "Wage Summary".
   - Explain: "This isn't just a sum. It calculates net pay by deducting 
     advances and adding attendance bonuses dynamically."

4. DEMONSTRATE "VOICE INPUT" (Modern Tech)
   - Go to Dashboard.
   - Click the Microphone icon in the "Daily Production" row.
   - Say "Five hundred pieces of denim trousers".
   - Watch it type automatically.

==============================================================================