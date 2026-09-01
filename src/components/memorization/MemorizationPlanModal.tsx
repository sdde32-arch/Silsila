import React from 'react';
import { MemorizationPlanPage } from './MemorizationPlanPage';
import { MemorizationPlan } from '../../services/memorizationEngine';
import { useScrollLock } from '../../hooks/useScrollLock';

interface MemorizationPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated?: (plan: MemorizationPlan) => void;
}

export const MemorizationPlanModal: React.FC<MemorizationPlanModalProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  useScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF9F5] overflow-y-auto">
      <MemorizationPlanPage
        onClose={onClose}
        onPlanCreated={onPlanCreated}
      />
    </div>
  );
};
