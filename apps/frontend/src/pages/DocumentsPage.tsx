import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { documentApi, type DocumentItem } from '../lib/document-api';

const formatDate = (dateIso: string) =>
  new Date(dateIso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

export function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadDocuments = async () => {
    try {
      setErrorMessage(null);
      const response = await documentApi.listDocuments();
      setDocuments(response.items);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load documents';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      const uploadedBy = user?.id ?? 'anonymous';
      await documentApi.uploadPdf(file, uploadedBy);
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document';
      setErrorMessage(message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Documents</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Document Management</h2>
            <p className="mt-2 text-sm text-slate-600">Upload PDF files and track their processing status.</p>
          </div>

          <div>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={triggerFilePicker}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Upload PDF'}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Uploaded Documents</h3>

        {errorMessage ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-600">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-sm text-slate-600">No documents uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">File Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Upload Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {documents.map((document) => (
                  <tr key={document.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{document.originalName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDate(document.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{document.status}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{formatSize(document.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
