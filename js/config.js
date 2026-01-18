console.log("Config Module Loaded");

const CONFIG = {
    // --- 1. PERSONALIZATION ---
    // Change this to the name you want to see on the Home Screen
    OWNER_NAME: "Mr. Raghavendra", 

    // --- 2. SECURITY ---
    AUTH: {
       
        SESSION_EXPIRY_MS: 12 * 60 * 60 * 1000 
    },

    // --- 3. FINANCIAL SETTINGS ---
    // These values are used in Salary Calculations (staff.js)
    RATES: {
        // Amount paid per hour of Overtime (Time-based staff)
        OT_PER_HOUR: 45,      
        
        // Amount deducted for "No Pay Leave" (NPL) status
        NPL_FINE: 500,        
        
        // Optional: Monthly attendance bonus (currently unused, but ready for future)
        ATTENDANCE_BONUS: 600 
    }
};