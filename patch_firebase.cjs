const fs = require('fs');
let content = fs.readFileSync('src/services/firebase.ts', 'utf8');

const importRegex = /import \{\s*getAuth,[\s\S]*?\} from 'firebase\/auth';/;
const newImport = `import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
} from 'firebase/auth';`;

content = content.replace(importRegex, newImport);

const authHelpers = `export async function signInWithUsername(username: string, password?: string): Promise<User> {
  const email = \`\${username.toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@tester.silsila.app\`;
  const pass = password && password.trim().length > 0 ? password : 'Silsila#OpenAccess123';
  
  try {
    // Try to sign in first
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        // If user not found, try to register
        const createResult = await createUserWithEmailAndPassword(auth, email, pass);
        return createResult.user;
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          throw new Error('Incorrect password for this username.');
        }
        throw createError;
      }
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password for this username.');
    }
    throw error;
  }
}
`;

content = content.replace('export async function signInAnonymouslyUser', authHelpers + '\nexport async function signInAnonymouslyUser');

fs.writeFileSync('src/services/firebase.ts', content);
console.log('patched firebase.ts');
