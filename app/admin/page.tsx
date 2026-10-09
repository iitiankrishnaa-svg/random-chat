'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Report } from '@/lib/supabase/types';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, UserMinus, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    setLoading(true);
    setActionMsg('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check admin status via RPC or query
      const { data: adminRow } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!adminRow) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch pending reports
      const { data: reportData, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && reportData) {
        setReports(reportData as Report[]);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: 'reviewed' | 'dismissed' | 'action_taken') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        setActionMsg(`Failed to update report: ${error.message}`);
      } else {
        setActionMsg(`Report marked as ${newStatus}`);
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
      }
    } catch (e: any) {
      setActionMsg(`Error: ${e.message}`);
    }
  };

  const handleBanUser = async (userId: string, reportId: string) => {
    if (!confirm('Are you sure you want to permanently ban this user?')) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'banned' })
        .eq('user_id', userId);

      if (error) {
        setActionMsg(`Ban failed: ${error.message}`);
      } else {
        await handleUpdateStatus(reportId, 'action_taken');
        setActionMsg(`User banned and report resolved.`);
      }
    } catch (e: any) {
      setActionMsg(`Error: ${e.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">
          This moderation dashboard is restricted to authorized administrator accounts. Your session does not possess admin rights.
        </p>
        <div className="mt-6 p-4 rounded-xl border border-gray-800 bg-gray-900/60 text-xs text-gray-500 text-left">
          To designate an admin, add your authenticated user UUID into the <code>public.admins</code> table in Supabase.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-400" />
            Moderation Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Review pending user reports and take corrective enforcement actions.</p>
        </div>
        <button
          onClick={checkAdminAndFetch}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-xs font-medium text-gray-300 hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {actionMsg && (
        <div className="mt-4 p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300">
          {actionMsg}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Reports Queue ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="p-10 rounded-2xl border border-gray-800 bg-gray-900/30 text-center text-sm text-gray-500">
            No moderation reports found. Everything is clean!
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                      {report.reason_code}
                    </span>
                    <span className="text-xs text-gray-500">
                      Status: <strong className="text-gray-300">{report.status}</strong>
                    </span>
                    <span className="text-xs text-gray-600">
                      &bull; {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-sm text-gray-300 mt-1 italic">
                      "{report.description}"
                    </p>
                  )}
                  <div className="text-xs text-gray-500 font-mono">
                    Reported User: {report.reported_id}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                        className="px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800 text-xs font-medium text-gray-300 hover:text-white"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleBanUser(report.reported_id, report.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-xs font-medium text-rose-300 hover:bg-rose-500/20 flex items-center gap-1"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Ban User
                      </button>
                    </>
                  )}
                  {report.status !== 'pending' && (
                    <span className="text-xs text-gray-500 italic">Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
