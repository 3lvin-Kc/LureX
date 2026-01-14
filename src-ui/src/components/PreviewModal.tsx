import React from 'react'
import { SearchResult } from '../types'


interface PreviewModalProps {
  result: SearchResult
  onClose: () => void
  onOpen?: () => void
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  result,
  onClose,
  onOpen,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{result.title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="preview-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Source</span>
              <span className="metadata-value">
                {result.source_type === 'gmail' ? '📧 Email' : '📄 File'}
              </span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Date</span>
              <span className="metadata-value">
                {new Date(result.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="preview-section">
            <h3>Content Preview</h3>
            <p className="preview-text">{result.snippet || 'No preview available'}</p>
          </div>

          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="metadata-section">
              <h3>Details</h3>
              <div className="metadata-grid">
                {Object.entries(result.metadata).map(([key, value]) => (
                  <div key={key} className="metadata-row">
                    <span className="metadata-key">{key}</span>
                    <span className="metadata-val">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {onOpen && (
            <button className="btn-primary" onClick={onOpen}>
              Open
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PreviewModal
