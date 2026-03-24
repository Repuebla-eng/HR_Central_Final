// To use: node set-admin.js <user_email> <role>
// role can be: admin, manager, or employee (defaults to employee if not provided)

const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json"); 

try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    if (!/already exists/u.test(error.message)) {
        console.error('Firebase admin initialization error', error.stack);
    }
}


const args = process.argv.slice(2);
const email = args[0];
// Default role to 'employee' if not provided
const role = args[1] || 'employee';

if (!email) {
  console.error("Please provide an email.");
  console.log("Usage: node set-admin.js <user_email> [admin|manager|employee]");
  process.exit(1);
}

const validRoles = ['admin', 'manager', 'employee'];
if (!validRoles.includes(role)) {
    console.error(`Invalid role '${role}'. Please use one of: ${validRoles.join(', ')}`);
    process.exit(1);
}

async function grantRole(email, role) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    
    // Start with all claims as false
    let claims = {
        employee: false,
        manager: false,
        admin: false,
    };

    // Roles are hierarchical: admin > manager > employee
    if (role === 'admin') {
        claims.admin = true;
        claims.manager = true;
        claims.employee = true;
    } else if (role === 'manager') {
        claims.manager = true;
        claims.employee = true;
    } else { // employee
        claims.employee = true;
    }

    await admin.auth().setCustomUserClaims(user.uid, claims);

    console.log(`Success! Role '${role}' granted to ${email}.`);
    console.log('The following claims have been set on the user token:');
    console.log(claims);
    console.log('\nNOTE: The user must sign out and sign back in for the changes to take effect.');


  } catch (error) {
    if (error.code === 'auth/user-not-found') {
        console.error(`Error: User with email "${email}" not found.`);
    } else {
        console.error("Error setting custom claims:", error);
    }
    process.exit(1);
  }
}

grantRole(email, role);
