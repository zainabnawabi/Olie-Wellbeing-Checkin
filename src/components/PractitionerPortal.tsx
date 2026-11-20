import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  FolderArchive,
  Lock,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  DASS21_PYTHON_CODE,
  DASS21_QUESTIONS,
  SeverityLevel,
} from '../data/dass21Data';
import {
  StoredCheckInResponse,
  auth,
  deletePractitionerResponse,
  fetchAllDass21Responses,
  isPractitionerEmail,
  sendPractitionerVerificationEmail,
  signInPractitioner,
  signInPractitionerWithPassword,
  signOutPractitioner,
  subscribePractitionerResponses,
} from '../firebase';
import { downloadProjectSourceZip } from '../utils/projectZipExport';

interface PractitionerPortalProps {
  onExitPortal: () => void;
}

function severityPillClass(severity: SeverityLevel): string {
  switch (severity) {
    case 'Normal':
      return 'bg-[#D7F7B2] text-[#11131D] border-[#82CF38]';
    case 'Mild':
      return 'bg-[#D6EDFF] text-[#11131D] border-[#7ABDF7]';
    case 'Moderate':
      return 'bg-[#FFEBA0] text-[#11131D] border-[#E0B836]';
    case 'Severe':
      return 'bg-[#FFD1E3] text-[#11131D] border-[#EA8AB0]';
    case 'Extremely Severe':
      return 'bg-[#FCD5D5] text-[#8F1212] border-[#E58A8A]';
  }
}

function formatDateTime(d: Date | null): string {
  if (!d) return 'Just now';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PractitionerPortal({ onExitPortal }: PractitionerPortalProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSigningInPassword, setIsSigningInPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [serverDenied, setServerDenied] = useState(false);
  const [rows, setRows] = useState<StoredCheckInResponse[]>([]);
  const [dataError, setDataError] = useState('');
  const [exportNotice, setExportNotice] = useState('');
  const [isFetchingCsv, setIsFetchingCsv] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedPip, setCopiedPip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setServerDenied(false);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isEmailAllowlisted = isPractitionerEmail(user?.email);
  const isAuthorizedPractitioner =
    Boolean(user?.emailVerified) && isEmailAllowlisted && !serverDenied;

  useEffect(() => {
    if (!authReady || !isAuthorizedPractitioner) {
      setRows([]);
      return;
    }

    setDataError('');
    const unsub = subscribePractitionerResponses(
      (nextRows) => {
        setServerDenied(false);
        setRows(nextRows);
      },
      (err) => {
        if (err.message.toLowerCase().includes('permission')) {
          setServerDenied(true);
        } else {
          setDataError(err.message);
        }
      }
    );

    return () => unsub();
  }, [authReady, isAuthorizedPractitioner]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      await signInPractitioner();
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Google sign-in did not complete. Please try again.'
      );
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningInPassword) return;
    setAuthError('');
    setIsSigningInPassword(true);
    try {
      await signInPractitionerWithPassword(loginEmail, loginPassword);
      setLoginPassword('');
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Email/password sign-in failed. Check that Email/Password auth is enabled in Firebase Console.'
      );
    } finally {
      setIsSigningInPassword(false);
    }
  };

  const handleSendVerification = async () => {
    setAuthError('');
    try {
      await sendPractitionerVerificationEmail();
      setVerificationSent(true);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Could not send verification email.'
      );
    }
  };

  const handleReloadVerification = async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    setUser(auth.currentUser);
  };

  const handleSignOut = async () => {
    setVerificationSent(false);
    await signOutPractitioner();
  };

  const sanitizeSpreadsheetCell = (val: string): string => {
    return /^[=+\-@\t\r]/.test(val) ? `'${val}` : val;
  };

  const buildSpreadsheetRows = (sourceRows: StoredCheckInResponse[] = rows) => {
    return sourceRows.map((r) => {
      const base: Record<string, string | number> = {
        'Submission ID': r.id,
        'Submitted At': r.createdAt ? r.createdAt.toISOString() : '',
        'Participant Name': sanitizeSpreadsheetCell(r.participantName),
        Age: r.participantAge,
        'Ambient Sound': r.ambientSound,
        'Depression (Raw 0-21)': r.depressionRaw,
        'Depression Score (x2)': r.depressionScore,
        'Depression Severity': r.depressionSeverity,
        'Anxiety (Raw 0-21)': r.anxietyRaw,
        'Anxiety Score (x2)': r.anxietyScore,
        'Anxiety Severity': r.anxietySeverity,
        'Stress (Raw 0-21)': r.stressRaw,
        'Stress Score (x2)': r.stressScore,
        'Stress Severity': r.stressSeverity,
      };
      DASS21_QUESTIONS.forEach((q, idx) => {
        base[`Q${q.no} (${q.level})`] = r.answers[idx] ?? '';
      });
      return base;
    });
  };

  const handleRefreshFromFirestore = async () => {
    setIsRefreshing(true);
    setDataError('');
    setExportNotice('');
    try {
      const freshRows = await fetchAllDass21Responses();
      setRows(freshRows);
      setExportNotice(`Synced ${freshRows.length} entries from Firestore.`);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to fetch entries from Firestore.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadAllExcel = async () => {
    setDataError('');
    setExportNotice('');
    let latestRows = rows;
    try {
      latestRows = await fetchAllDass21Responses();
      setRows(latestRows);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Could not fetch latest responses.');
      return;
    }

    const sheetRows = buildSpreadsheetRows(latestRows);
    const workbook = XLSX.utils.book_new();
    const responsesSheet = XLSX.utils.json_to_sheet(
      sheetRows.length > 0
        ? sheetRows
        : [{ Info: 'No participant responses submitted yet.' }]
    );
    const questionsSheet = XLSX.utils.json_to_sheet(
      DASS21_QUESTIONS.map((q) => ({
        No: q.no,
        Subscale: q.level,
        Statement: q.statement,
      }))
    );
    XLSX.utils.book_append_sheet(workbook, responsesSheet, 'All Responses');
    XLSX.utils.book_append_sheet(workbook, questionsSheet, 'DASS-21 Questions');
    XLSX.writeFile(
      workbook,
      `dass21_all_responses_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
    setExportNotice(`Exported ${latestRows.length} entries to Excel (.xlsx).`);
  };

  // Fetches all stored DASS-21 entries directly from Firestore and exports them as CSV
  const fetchAndDownloadDass21Csv = async () => {
    if (isFetchingCsv) return;
    setIsFetchingCsv(true);
    setDataError('');
    setExportNotice('');

    try {
      const freshRows = await fetchAllDass21Responses();
      setRows(freshRows);

      if (freshRows.length === 0) {
        setExportNotice('No stored DASS-21 entries found in Firestore yet.');
        return;
      }

      const sheetRows = buildSpreadsheetRows(freshRows);
      const headers = Object.keys(sheetRows[0]);
      const escapeCsv = (val: string | number) => {
        const s = String(val ?? '');
        return `"${s.replace(/"/g, '""')}"`;
      };
      const csvLines = [
        headers.map(escapeCsv).join(','),
        ...sheetRows.map((row) => headers.map((h) => escapeCsv(row[h])).join(',')),
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dass21_all_responses_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportNotice(`Fetched and exported ${freshRows.length} DASS-21 entries as CSV.`);
    } catch (err) {
      setDataError(
        err instanceof Error ? err.message : 'Failed to fetch DASS-21 entries from Firestore.'
      );
    } finally {
      setIsFetchingCsv(false);
    }
  };

  const handleDownloadPython = () => {
    const blob = new Blob([DASS21_PYTHON_CODE], {
      type: 'text/x-python;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dass21_app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadQuestionsCsv = () => {
    const header = 'No.,level,Statement';
    const dataRows = DASS21_QUESTIONS.map(
      (q) => `${q.no},${q.level},"${q.statement.replace(/"/g, '""')}"`
    );
    const blob = new Blob([[header, ...dataRows].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dass21_questions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async (text: string, which: 'pip' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    if (which === 'pip') {
      setCopiedPip(true);
      window.setTimeout(() => setCopiedPip(false), 1800);
    } else {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1800);
    }
  };

  const handleDownloadProjectZip = async () => {
    if (isExportingZip) return;
    setIsExportingZip(true);
    setDataError('');
    setExportNotice('');
    try {
      const fileCount = await downloadProjectSourceZip();
      setExportNotice(`Downloaded GitHub-ready project zip (${fileCount} files).`);
    } catch (err) {
      setDataError(
        err instanceof Error ? err.message : 'Could not build project zip archive.'
      );
    } finally {
      setIsExportingZip(false);
    }
  };

  const patientShareUrl = `${window.location.origin}/`;

  return (
    <div className="min-h-screen calm-canvas-bg text-[#11131D] p-4 sm:p-8">
      <div className="max-w-[1160px] mx-auto space-y-6">
        {/* Top Bar */}
        <div className="rounded-[28px] bg-gradient-to-r from-[#231073] via-[#4528B8] to-[#5B3EEB] text-white p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B8F23B]">
              <ShieldCheck className="w-4 h-4" />
              <span>Private Practitioner Portal</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1">
              DASS-21 Clinical Responses &amp; Exports
            </h1>
            <p className="text-sm text-white/90 mt-1">
              Hidden from patients. Only authorized practitioner accounts can view or export submitted check-ins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onExitPortal}
              className="h-11 px-5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-sm font-bold text-white flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              Patient Check-In View
            </button>
            {user && (
              <button
                type="button"
                onClick={handleSignOut}
                className="h-11 px-4 rounded-full bg-white text-[#11131D] hover:bg-[#EAE6FF] text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Auth Gate */}
        {!authReady ? (
          <div className="rounded-[28px] bg-white border border-[#CFD5E6] p-10 text-center text-sm font-semibold text-[#2B3040]">
            Checking practitioner session...
          </div>
        ) : !user ? (
          <div className="rounded-[28px] bg-white border border-[#CFD5E6] p-8 sm:p-10 text-center max-w-lg mx-auto space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#EAE6FF] text-[#4D2EEB] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#11131D]">
                Practitioner Sign-In Required
              </h2>
              <p className="text-sm text-[#2B3040] mt-2 leading-relaxed">
                Sign in with your authorized practitioner account to view participant responses and download Excel/CSV exports.
              </p>
            </div>

            {authError && (
              <p className="text-sm font-semibold text-[#B42318]">{authError}</p>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-12 rounded-full bg-[#4D2EEB] hover:bg-[#3E22CE] text-white text-base font-bold shadow-md cursor-pointer"
            >
              Sign in with Google
            </button>

            <div className="relative py-1 flex items-center">
              <div className="flex-grow border-t border-[#E5E8F2]" />
              <span className="px-3 text-xs font-bold uppercase tracking-wider text-[#686E82]">
                Or sign in with password
              </span>
              <div className="flex-grow border-t border-[#E5E8F2]" />
            </div>

            <form onSubmit={handlePasswordSignIn} className="space-y-3 text-left">
              <div>
                <label
                  htmlFor="practitioner-email"
                  className="block text-xs font-bold text-[#11131D] mb-1"
                >
                  Practitioner Email
                </label>
                <input
                  id="practitioner-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter authorized practitioner email"
                  className="w-full h-11 px-4 rounded-xl bg-[#F4F6FC] border border-[#CFD5E6] text-sm font-medium text-[#11131D] focus:outline-none focus:border-[#4D2EEB]"
                />
              </div>
              <div>
                <label
                  htmlFor="practitioner-password"
                  className="block text-xs font-bold text-[#11131D] mb-1"
                >
                  Password
                </label>
                <input
                  id="practitioner-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 px-4 rounded-xl bg-[#F4F6FC] border border-[#CFD5E6] text-sm font-medium text-[#11131D] focus:outline-none focus:border-[#4D2EEB]"
                />
              </div>
              <button
                type="submit"
                disabled={isSigningInPassword}
                className="w-full h-11 rounded-full bg-[#B8F23B] hover:bg-[#A9E42A] disabled:opacity-65 text-[#11131D] text-sm font-bold cursor-pointer"
              >
                {isSigningInPassword ? 'Signing in...' : 'Sign in with Email & Password'}
              </button>
            </form>
          </div>
        ) : isEmailAllowlisted && !user.emailVerified ? (
          <div className="rounded-[28px] bg-white border border-[#CFD5E6] p-8 sm:p-10 text-center max-w-lg mx-auto space-y-5 shadow-lg">
            <h2 className="font-display text-2xl font-bold text-[#11131D]">
              Verify Your Email Address
            </h2>
            <p className="text-sm text-[#2B3040] leading-relaxed">
              Signed in as <strong>{user.email}</strong>. Database security rules require a verified email before unlocking participant submissions. (Or sign in directly with the Google button!)
            </p>
            {verificationSent && (
              <p className="text-sm font-bold text-[#4D2EEB]">
                Verification email sent to {user.email}. Check your inbox and click the link.
              </p>
            )}
            {authError && (
              <p className="text-sm font-semibold text-[#B42318]">{authError}</p>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleSendVerification}
                className="h-11 px-5 rounded-full bg-[#4D2EEB] text-white text-sm font-bold cursor-pointer"
              >
                Send Verification Link
              </button>
              <button
                type="button"
                onClick={handleReloadVerification}
                className="h-11 px-5 rounded-full bg-[#B8F23B] text-[#11131D] text-sm font-bold cursor-pointer"
              >
                I Verified, Refresh
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="h-11 px-5 rounded-full border border-[#CFD5E6] text-[#11131D] text-sm font-bold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : !isAuthorizedPractitioner ? (
          <div className="rounded-[28px] bg-white border border-[#CFD5E6] p-8 sm:p-12 text-center max-w-lg mx-auto space-y-5 shadow-lg">
            <h2 className="font-display text-2xl font-bold text-[#11131D]">
              Access Restricted
            </h2>
            <p className="text-sm text-[#2B3040] leading-relaxed">
              You are currently signed in as <strong>{user.email}</strong>. Only an authorized practitioner account is permitted to view DASS-21 submissions.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleSignOut}
                className="h-11 px-5 rounded-full bg-[#4D2EEB] text-white text-sm font-bold cursor-pointer"
              >
                Switch Account
              </button>
              <button
                type="button"
                onClick={onExitPortal}
                className="h-11 px-5 rounded-full border border-[#CFD5E6] text-[#11131D] text-sm font-bold cursor-pointer"
              >
                Return to Check-In
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Share Link + Export Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 rounded-[28px] bg-white border border-[#CFD5E6] p-6 space-y-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#11131D]">
                      Export All Responses ({rows.length})
                    </h2>
                    <p className="text-sm text-[#2B3040]">
                      Downloads one consolidated spreadsheet with every respondent&apos;s scores and all 21 item answers.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadAllExcel}
                    className="h-12 px-6 rounded-full bg-[#B8F23B] hover:bg-[#A9E42A] text-[#11131D] text-sm font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Download Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    onClick={fetchAndDownloadDass21Csv}
                    disabled={isFetchingCsv}
                    className="h-12 px-5 rounded-full bg-[#4D2EEB] hover:bg-[#3E22CE] disabled:opacity-65 text-white text-sm font-bold flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    {isFetchingCsv ? 'Fetching CSV...' : 'Download CSV'}
                  </button>
                </div>

                {exportNotice && (
                  <p className="text-xs font-bold text-[#4D2EEB]">{exportNotice}</p>
                )}

                <div className="rounded-2xl bg-[#F2F4FB] border border-[#CFD5E6] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="truncate">
                    <span className="font-bold text-[#11131D] mr-2">Patient Link:</span>
                    <code className="font-mono text-[#2B3040]">{patientShareUrl}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(patientShareUrl, 'link')}
                    className="font-bold text-[#4D2EEB] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied Link' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Python / Reference Files */}
              <div className="lg:col-span-5 rounded-[28px] bg-white border border-[#CFD5E6] p-6 space-y-3 shadow-sm">
                <h2 className="font-display text-lg font-bold text-[#11131D]">
                  Desktop Python &amp; Reference Files
                </h2>
                <div className="bg-[#F2F4FB] border border-[#CFD5E6] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
                  <code className="font-mono text-[#11131D] truncate">
                    pip install customtkinter pandas openpyxl
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText('pip install customtkinter pandas openpyxl', 'pip')
                    }
                    className="font-bold text-[#4D2EEB] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedPip ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPip ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadProjectZip}
                    disabled={isExportingZip}
                    className="h-11 px-4 rounded-xl bg-[#B8F23B] hover:bg-[#A9E42A] disabled:opacity-65 text-[#11131D] text-sm font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>
                      {isExportingZip
                        ? 'Packaging GitHub ZIP...'
                        : 'Download Full Project (.zip for GitHub)'}
                    </span>
                    <FolderArchive className="w-4 h-4 text-[#11131D]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPython}
                    className="h-11 px-4 rounded-xl bg-[#EAE6FF] hover:bg-[#DDD5FF] border border-[#C6BCF8] text-[#11131D] text-sm font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>dass21_app.py</span>
                    <Download className="w-4 h-4 text-[#4D2EEB]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadQuestionsCsv}
                    className="h-11 px-4 rounded-xl bg-white hover:bg-[#F4F6FC] border border-[#CFD5E6] text-[#11131D] text-sm font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span>dass21_questions.csv</span>
                    <Download className="w-4 h-4 text-[#4D2EEB]" />
                  </button>
                </div>
              </div>
            </div>

            {dataError && (
              <div className="rounded-2xl bg-[#FCD5D5] border border-[#E58A8A] p-4 text-sm font-semibold text-[#8F1212]">
                {dataError}
              </div>
            )}

            {/* Submitted Responses Table */}
            <div className="rounded-[28px] bg-white border border-[#CFD5E6] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E5E8F2] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-[#11131D]">
                    Live Participant Submissions
                  </h2>
                  <span className="text-xs font-semibold text-[#2B3040]">
                    Bookmark this private view: <code className="font-mono">/#practitioner</code>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshFromFirestore}
                  disabled={isRefreshing}
                  className="h-9 px-3.5 rounded-full border border-[#CFD5E6] bg-white hover:bg-[#F2F4FB] text-xs font-bold text-[#11131D] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Syncing...' : 'Refresh from Firestore'}
                </button>
              </div>

              {rows.length === 0 ? (
                <div className="p-10 text-center text-sm font-medium text-[#2B3040]">
                  No completed submissions yet. Share the patient link and every finished check-in will appear here automatically.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F2F4FB] text-xs uppercase tracking-wider text-[#2B3040] font-bold">
                      <tr>
                        <th className="px-5 py-3.5">Participant</th>
                        <th className="px-4 py-3.5">Age</th>
                        <th className="px-4 py-3.5">Depression (x2)</th>
                        <th className="px-4 py-3.5">Anxiety (x2)</th>
                        <th className="px-4 py-3.5">Stress (x2)</th>
                        <th className="px-4 py-3.5">Submitted</th>
                        <th className="px-4 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8F2]">
                      {rows.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FAF9FF]">
                          <td className="px-5 py-4 font-bold text-[#11131D]">
                            {r.participantName}
                          </td>
                          <td className="px-4 py-4 font-mono tabular-nums text-[#2B3040]">
                            {r.participantAge}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${severityPillClass(
                                r.depressionSeverity
                              )}`}
                            >
                              <span className="font-mono">{r.depressionScore}</span>
                              <span>·</span>
                              <span>{r.depressionSeverity}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${severityPillClass(
                                r.anxietySeverity
                              )}`}
                            >
                              <span className="font-mono">{r.anxietyScore}</span>
                              <span>·</span>
                              <span>{r.anxietySeverity}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${severityPillClass(
                                r.stressSeverity
                              )}`}
                            >
                              <span className="font-mono">{r.stressScore}</span>
                              <span>·</span>
                              <span>{r.stressSeverity}</span>
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs font-medium text-[#2B3040] whitespace-nowrap">
                            {formatDateTime(r.createdAt)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {confirmDeleteId === r.id ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await deletePractitionerResponse(r.id);
                                    setConfirmDeleteId(null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#B42318] text-white text-xs font-bold cursor-pointer"
                                >
                                  Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2.5 py-1 rounded-lg border border-[#CFD5E6] text-xs font-bold text-[#11131D] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(r.id)}
                                aria-label={`Delete submission from ${r.participantName}`}
                                className="p-2 rounded-lg text-[#686E82] hover:text-[#B42318] hover:bg-[#FCD5D5]/40 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
