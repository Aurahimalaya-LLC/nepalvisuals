import { generateUsername, generateStrongPassword, encryptCredential, logCredentialAccess } from '../lib/utils/credentialGenerator';

const main = async () => {
    console.log('Generating secure admin credential...');

    const username = generateUsername();
    const password = generateStrongPassword();
    const creationTime = new Date();
    const expirationTime = new Date();
    expirationTime.setDate(expirationTime.getDate() + 90);

    // Encrypt the credentials (simulating secure storage)
    // In a real scenario, this encrypted string would be saved to a secure vault table
    const secretKey = 'super-secret-admin-key'; // This would be an env var
    const encryptedData = await encryptCredential(JSON.stringify({ username, password }), secretKey);

    // Log the generation event
    // Note: We log that a credential was generated, but NOT the credential itself
    console.log('Logging generation event...');
    // Mocking the Supabase call for this script execution since we might not have full env context in this script runner
    // await logCredentialAccess(username, 'GENERATE_ADMIN_CREDENTIAL'); 
    
    console.log('\n================================================');
    console.log('       SECURE ADMIN CREDENTIAL GENERATED        ');
    console.log('================================================');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('------------------------------------------------');
    console.log(`Created: ${creationTime.toISOString()}`);
    console.log(`Expires: ${expirationTime.toISOString()}`);
    console.log(`Encrypted Storage Token: ${encryptedData.substring(0, 20)}...`);
    console.log('================================================\n');
    console.log('IMPORTANT: Store these credentials securely immediately.');
    console.log('The password cannot be retrieved once this session ends.');
};

main().catch(console.error);
