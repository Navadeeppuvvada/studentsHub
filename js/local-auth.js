const USERS_KEY = "studentHubUsers";
const PASSWORD_ITERATIONS = 210000;
const encoder = new TextEncoder();

function getCrypto() {
    if (!window.crypto?.subtle || !window.crypto.getRandomValues) {
        throw new Error("Secure local sign-in requires HTTPS or localhost.");
    }
    return window.crypto;
}

function toBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value) {
    const binary = atob(value);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
}

async function hashPassword(password, salt = getCrypto().getRandomValues(new Uint8Array(16))) {
    const cryptoApi = getCrypto();
    const key = await cryptoApi.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const bits = await cryptoApi.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: PASSWORD_ITERATIONS,
        hash: "SHA-256"
    }, key, 256);

    return {
        salt: toBase64(salt),
        passwordHash: toBase64(new Uint8Array(bits)),
        passwordIterations: PASSWORD_ITERATIONS
    };
}

function saveUsers(users) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Could not save local StudentHub accounts.", error);
        throw new Error("Could not save your account. Check browser storage.");
    }
}

async function loadUsers() {
    let stored;
    try {
        stored = localStorage.getItem(USERS_KEY);
    } catch (error) {
        console.error("Could not read local StudentHub accounts.", error);
        throw new Error("Could not read accounts. Check browser storage.");
    }

    let users = [];
    if (stored) {
        try {
            users = JSON.parse(stored);
        } catch (error) {
            console.error("Saved StudentHub accounts contain invalid data.", error);
            throw new Error("Saved accounts could not be read. Clear browser storage and try again.");
        }
        if (!Array.isArray(users)) {
            throw new Error("Saved accounts have an invalid format.");
        }
    }

    let migrated = false;
    for (const user of users) {
        if (!user || typeof user.password !== "string") continue;
        const credential = await hashPassword(user.password);
        delete user.password;
        Object.assign(user, credential);
        migrated = true;
    }
    if (migrated) saveUsers(users);

    return users;
}

function passwordsMatch(left, right) {
    if (left.length !== right.length) return false;
    let difference = 0;
    for (let index = 0; index < left.length; index++) {
        difference |= left[index] ^ right[index];
    }
    return difference === 0;
}

export async function createLocalAccount(name, email, password) {
    const users = await loadUsers();
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some(user =>
        typeof user?.email === "string" &&
        user.email.toLowerCase() === normalizedEmail
    )) {
        throw new Error("This email already has an account. Please sign in.");
    }

    const credential = await hashPassword(password);
    const account = { name: name.trim(), email: normalizedEmail, ...credential };
    users.push(account);
    saveUsers(users);
    return { name: account.name, email: account.email };
}

export async function authenticateLocalAccount(email, password) {
    const users = await loadUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const account = users.find(user =>
        typeof user?.email === "string" &&
        user.email.toLowerCase() === normalizedEmail
    );
    if (!account || typeof account.salt !== "string" ||
        typeof account.passwordHash !== "string") {
        return null;
    }

    let suppliedHash;
    try {
        suppliedHash = fromBase64(
            (await hashPassword(password, fromBase64(account.salt))).passwordHash
        );
    } catch (error) {
        console.error("Could not verify local account credentials.", error);
        throw new Error("Could not verify sign-in. Use HTTPS or localhost and try again.");
    }

    if (!passwordsMatch(suppliedHash, fromBase64(account.passwordHash))) return null;
    return { name: account.name, email: account.email };
}
