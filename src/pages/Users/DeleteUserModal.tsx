import { useState } from 'react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Textarea } from '../../components/Textarea';

export interface DeleteUserModalProps {
  open: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

export function DeleteUserModal({ open, loading, onCancel, onConfirm }: DeleteUserModalProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Delete User"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => onConfirm(reason)} loading={loading} disabled={!reason.trim()}>
            Delete User
          </Button>
        </>
      }
    >
      <Textarea
        label="Reason for deletion"
        placeholder="Explain why this user is being removed…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
        hint="Sets is_admin_deleted — this is a soft delete, the account can be restored later."
      />
    </Modal>
  );
}
