import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../lib/ToastContext';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportCsvModal: React.FC<ImportCsvModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    total_rows: number;
    imported_count: number;
    duplicate_count: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { success } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please choose a CSV file first.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const res = await api.importCsv(file);
      setResult(res);
      if (res.imported_count > 0) {
        success(`Imported ${res.imported_count} transactions successfully!`, 'CSV Import Complete');
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'CSV import failed. Please verify the header format.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleCsv = () => {
    const csvContent = 
`Transaction Date,Type,Category,Amount,Currency,Merchant,Note
2026-10-01,expense,Groceries,3200,INR,Nature's Basket,Weekly fruits and vegetables
2026-10-03,income,Salary,75000,INR,Tech Corp,Monthly salary credit
2026-10-05,bill,Bills & Utilities,1450,INR,BESCOM Power,Monthly electricity bill
2026-10-08,expense,Food & Dining,850,INR,Starbucks,Coffee and snack
2026-10-12,savings,Savings & Investments,10000,INR,Zerodha,Index Fund Investment`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_transactions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>
            Import Bank Statements & CSV
          </h2>
          <button 
            onClick={onClose} 
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{
              padding: '11px 14px',
              background: 'var(--expense-light)',
              color: 'var(--expense)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              border: '1px solid var(--expense-border)'
            }} role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle2 size={44} color="var(--green-600)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>
                Import Processing Finished
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                Processed {result.total_rows} total rows from statement
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                margin: '20px 0',
                textAlign: 'left'
              }}>
                <div style={{ padding: '14px', background: 'var(--green-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>IMPORTED</div>
                  <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--green-600)', marginTop: '2px' }}>
                    {result.imported_count} rows
                  </div>
                </div>
                <div style={{ padding: '14px', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase' }}>DUPLICATES SKIPPED</div>
                  <div className="font-tabular" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--muted)', marginTop: '2px' }}>
                    {result.duplicate_count} rows
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div style={{ textAlign: 'left', background: 'var(--warning-light)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#92400E' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Row Warnings ({result.errors.length}):</div>
                  <ul style={{ paddingLeft: '18px' }}>
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                Upload exported transactions from your bank or spreadsheets. The parser automatically validates columns, dedupes existing transaction IDs, and maps categories.
              </p>

              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '32px 18px',
                textAlign: 'center',
                background: 'var(--surface-subtle)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-color 0.15s ease'
              }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  aria-label="Upload CSV file"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <Upload size={34} color="var(--green-600)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>
                  {file ? file.name : 'Select or drag your CSV statement here'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : 'UTF-8 encoded standard CSV file'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--green-600)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: 0
                  }}
                >
                  <FileText size={15} />
                  Download Sample CSV Template
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              type="button"
              disabled={!file || isUploading}
              onClick={handleUpload}
              className="btn btn-primary"
            >
              {isUploading ? 'Importing...' : 'Upload & Process'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
