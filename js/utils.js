console.log("Utils Module Loaded");

// --- 1. DATE FORMATTING ---

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// --- 2. SMART TIME PARSER ---
// Converts "9", "930", "1430" -> "09:00 AM", "09:30 AM", "02:30 PM"

function parseTime12h(timeStr, type) { 
    if(!timeStr) return null; 
    
    // 1. Clean input
    let s = timeStr.toUpperCase().trim().replace(/[:\s]/g, ''); 
    
    // 2. Detect explicit AM/PM
    let isPm = s.includes('P'); 
    let isAm = s.includes('A'); 
    
    // 3. Extract just the numbers
    let digits = s.replace(/[^0-9]/g, ''); 
    if (!digits) return null; 

    let h = 0, m = 0; 

    // 4. Parse Digits
    if (digits.length <= 2) { 
        h = parseInt(digits); 
    } else if (digits.length === 3) { 
        h = parseInt(digits.substring(0, 1)); 
        m = parseInt(digits.substring(1)); 
    } else if (digits.length === 4) { 
        h = parseInt(digits.substring(0, 2)); 
        m = parseInt(digits.substring(2)); 
    } 

    // Validity Check (Allow up to 23 for 24h input)
    if (h > 23 || m > 59) return null; 

    // 5. Smart 24h Conversion
    // If user types 13, 14... 23, it is definitely PM
    if (h > 12) {
        isPm = true;
        isAm = false;
    }

    // 6. Smart Guess for 12h inputs (If no AM/PM typed)
    if (!isAm && !isPm) {
        if (h === 12) {
            isPm = true; // 12 is usually Noon
        } else if (h < 8) {
            // 1, 2, 3, 4, 5, 6, 7 -> Assume PM (Afternoon/Evening)
            isPm = true; 
        } else {
            // 8, 9, 10, 11 -> Assume AM (Morning)
            isAm = true; 
        }
    }

    // 7. Calculate standardized Minutes for Math
    let h24 = h;
    
    // If input was 12-hour format (e.g. 2 PM), convert to 14
    if (h <= 12) {
        if (isPm && h < 12) h24 += 12; 
        if (isAm && h === 12) h24 = 0; 
    }
    // If input was 24-hour format (e.g. 14), keep it, but display will be 2
    
    // Calculate display hour (1-12)
    let displayH = h24 % 12;
    if (displayH === 0) displayH = 12;

    return { 
        mins: h24 * 60 + m, 
        formatted: formatTime12hObj(displayH, m, isPm || h24 >= 12 ? 'PM' : 'AM') 
    }; 
}

function formatTime12hObj(h, m, suffix) { 
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m} ${suffix}`; 
}

// --- 3. CENTRALIZED WORK CALCULATION ---
// Calculates Hours and OT based on Start/End time strings
// Automatically deducts 30 mins for Lunch

window.calculateWorkHours = (startTimeStr, endTimeStr) => {
    const start = parseTime12h(startTimeStr, 'in');
    const end = parseTime12h(endTimeStr, 'out');
    
    if (!start || !end) return { hours: '', ot: '' };

    let sMins = start.mins;
    let eMins = end.mins;
    
    // Handle overnight shift (e.g. 10 PM to 6 AM)
    if (eMins < sMins) eMins += 24 * 60;

    // Deduct 30 mins break
    const totalMins = (eMins - sMins) - 30;
    
    // Prevent negative hours if they worked less than 30 mins
    if (totalMins <= 0) return { hours: '0', ot: '0' };

    const totalHours = totalMins / 60;
    
    // OT Calculation (Standard 8 hour shift)
    let ot = 0;
    if (totalHours > 8) ot = totalHours - 8;

    return {
        hours: totalHours.toFixed(1), // e.g. "8.5"
        ot: ot > 0 ? ot.toFixed(1) : '' // e.g. "0.5" or empty string
    };
};