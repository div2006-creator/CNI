import React from 'react';
import { useParams } from 'react-router-dom';
import { WorkspaceLayout } from '../components/workspace/WorkspaceLayout';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <WorkspaceLayout
        caseTitle={id === 'case-802' ? 'Project Silverline' : 'Operation NorthStar'}
        caseNumber={id === 'case-802' ? 'INV-2026-0412' : 'INV-2026-0891'}
      />
    </div>
  );
};
