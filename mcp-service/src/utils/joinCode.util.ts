/**
 * Generates a random, alphanumeric, 6-character uppercase string.
 * This code is used for participants to join an existing survey session.
 *
 * @returns A 6-character unique join code (e.g., "A3B8Z1").
 */
export const generateJoinCode = (): string => {
    const length = 6;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
