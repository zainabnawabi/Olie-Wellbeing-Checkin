import { FirebaseOptions, initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  DocumentData,
  QuerySnapshot,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import {
  DASS21_QUESTIONS,
  SeverityLevel,
  calculateDass21Results,
} from './data/dass21Data';
import { AmbientSoundType } from './utils/soundEngine';

interface LocalAppletConfig extends FirebaseOptions {
  firestoreDatabaseId?: string;
}

// Automatically uses local firebase-applet-config.json when present (e.g. AI Studio),
// or falls back cleanly to Vite environment variables (e.g. Render / GitHub deployments).
const localConfigModules = import.meta.glob<LocalAppletConfig>(
  '../firebase-applet-config.json',
  { eager: true, import: 'default' }
);
const localConfig: LocalAppletConfig =
  Object.values(localConfigModules)[0] ?? {};

const firebaseConfig: LocalAppletConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey || '',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain || '',
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId || '',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    localConfig.storageBucket ||
    '',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    localConfig.messagingSenderId ||
    '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId || '',
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID ||
    localConfig.firestoreDatabaseId ||
    '(default)',
};

const envPractitionerEmails = (import.meta.env.VITE_PRACTITIONER_EMAILS || '')
  .split(',')
  .map((item: string) => item.trim().toLowerCase())
  .filter(Boolean);

export function hasClientEmailAllowlist(): boolean {
  return envPractitionerEmails.length > 0;
}

export function isPractitionerEmail(email?: string | null): boolean {
  if (!email) return false;
  if (envPractitionerEmails.length === 0) return true;
  return envPractitionerEmails.includes(email.trim().toLowerCase());
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

export interface StoredCheckInResponse {
  id: string;
  participantName: string;
  participantAge: number;
  ambientSound: AmbientSoundType;
  depressionRaw: number;
  depressionScore: number;
  depressionSeverity: SeverityLevel;
  anxietyRaw: number;
  anxietyScore: number;
  anxietySeverity: SeverityLevel;
  stressRaw: number;
  stressScore: number;
  stressSeverity: SeverityLevel;
  answers: number[];
  createdAt: Date | null;
}

export async function signInPractitioner() {
  return signInWithPopup(auth, googleProvider);
}

export async function signInPractitionerWithPassword(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function sendPractitionerVerificationEmail() {
  if (!auth.currentUser) {
    throw new Error('Please sign in first.');
  }
  await sendEmailVerification(auth.currentUser);
}

export async function signOutPractitioner() {
  return signOut(auth);
}

export async function submitCheckInResponse(params: {
  participantName: string;
  participantAge: string;
  ambientSound: AmbientSoundType;
  answers: Record<number, 0 | 1 | 2 | 3>;
}): Promise<string> {
  const cleanName = params.participantName.trim().slice(0, 100) || 'Guest';
  const parsedAge = Math.round(Number(params.participantAge));
  const safeAge =
    Number.isFinite(parsedAge) && parsedAge >= 10 && parsedAge <= 120
      ? parsedAge
      : 18;

  const orderedAnswers = DASS21_QUESTIONS.map((q) => {
    const val = params.answers[q.no] ?? 0;
    return Math.min(3, Math.max(0, Math.round(val)));
  });

  const results = calculateDass21Results(params.answers);
  const dep = results.find((r) => r.category === 'D')!;
  const anx = results.find((r) => r.category === 'A')!;
  const str = results.find((r) => r.category === 'S')!;

  const newDocRef = doc(collection(db, 'responses'));
  const path = `responses/${newDocRef.id}`;

  try {
    await setDoc(newDocRef, {
      participantName: cleanName,
      participantAge: safeAge,
      ambientSound: params.ambientSound,
      depressionRaw: dep.rawScore,
      depressionScore: dep.finalScore,
      depressionSeverity: dep.severity,
      anxietyRaw: anx.rawScore,
      anxietyScore: anx.finalScore,
      anxietySeverity: anx.severity,
      stressRaw: str.rawScore,
      stressScore: str.finalScore,
      stressSeverity: str.severity,
      answers: orderedAnswers,
      createdAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

function mapSnapshotDocsToResponses(
  snapshot: QuerySnapshot<DocumentData>
): StoredCheckInResponse[] {
  return snapshot.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
    return {
      id: d.id,
      participantName: String(data.participantName ?? 'Guest'),
      participantAge: Number(data.participantAge ?? 0),
      ambientSound: (data.ambientSound ?? 'none') as AmbientSoundType,
      depressionRaw: Number(data.depressionRaw ?? 0),
      depressionScore: Number(data.depressionScore ?? 0),
      depressionSeverity: (data.depressionSeverity ?? 'Normal') as SeverityLevel,
      anxietyRaw: Number(data.anxietyRaw ?? 0),
      anxietyScore: Number(data.anxietyScore ?? 0),
      anxietySeverity: (data.anxietySeverity ?? 'Normal') as SeverityLevel,
      stressRaw: Number(data.stressRaw ?? 0),
      stressScore: Number(data.stressScore ?? 0),
      stressSeverity: (data.stressSeverity ?? 'Normal') as SeverityLevel,
      answers: Array.isArray(data.answers) ? data.answers.map(Number) : [],
      createdAt: ts,
    };
  });
}

export async function fetchAllDass21Responses(): Promise<StoredCheckInResponse[]> {
  const path = 'responses';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  try {
    const snapshot = await getDocs(q);
    return mapSnapshotDocsToResponses(snapshot);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribePractitionerResponses(
  onData: (rows: StoredCheckInResponse[]) => void,
  onError: (err: Error) => void
) {
  const path = 'responses';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(mapSnapshotDocsToResponses(snapshot));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function deletePractitionerResponse(responseId: string) {
  const path = `responses/${responseId}`;
  try {
    await deleteDoc(doc(db, 'responses', responseId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
