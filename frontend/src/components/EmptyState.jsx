import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No records found',
  description = 'There are no items matching your criteria. Try adjusting your filters or create a new entry.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
