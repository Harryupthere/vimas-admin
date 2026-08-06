import { useState } from 'react';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { Textarea } from '../../components/Textarea';

export interface RemarkModalProps {
  open: boolean;
  title: string;
  danger?: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (remark: string) => void;
}

// A remark is optional — adminRemarks is appended-to server-side, admins
// often just approve/reject without leaving a note.
export function RemarkModal({ open, title, danger, loading, onCancel, onConfirm }: RemarkModalProps) {
  const [remark, setRemark] = useState('');

  const handleClose = () => {
    setRemark('');
    onCancel();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => onConfirm(remark)} loading={loading}>
            Confirm
          </Button>
        </>
      }
    >
      <Textarea
        label="Remark (optional)"
        placeholder="Add a note for the merchant…"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
      />
    </Modal>
  );
}
