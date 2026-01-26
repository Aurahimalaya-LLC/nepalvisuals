import crypto from 'crypto';

const generateStrongPassword = (length = 16) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one character from each category
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];

    // Fill the rest
    for (let i = password.length; i < length; i++) {
        password += allChars[crypto.randomInt(0, allChars.length)];
    }

    // Shuffle the password to avoid predictable patterns
    const passwordArray = password.split('');
    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }

    return passwordArray.join('');
};

const newPassword = generateStrongPassword(16); // Generates a 16-character password

console.log('\n================================================');
console.log('       SECURE PASSWORD GENERATED        ');
console.log('================================================');
console.log(`Account:  krishna@aurahimalaya.org`);
console.log('------------------------------------------------');
console.log(`PASSWORD: ${newPassword}`);
console.log('------------------------------------------------');
console.log('Copy this password immediately and store it securely.');
console.log('================================================\n');
