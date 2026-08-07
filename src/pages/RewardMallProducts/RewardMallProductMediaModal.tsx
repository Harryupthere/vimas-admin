import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { toApiError } from '../../services/api';
import { rewardMallProductMediaService } from '../../services/rewardMallProductMedia.service';
import { rewardMallProductsService } from '../../services/rewardMallProducts.service';
import { uploadService } from '../../services/upload.service';
import type { RewardMallProductMedia } from '../../types/rewardMallProduct.types';
import styles from './RewardMallProducts.module.scss';

export interface RewardMallProductMediaModalProps {
  productId: number | null;
  onClose: () => void;
}

interface UploadTask {
  id: string;
  name: string;
  status: 'uploading' | 'error';
  error?: string;
}

const ACCEPTED_TYPES = ['image/', 'video/'];

function isAcceptedFile(file: File): boolean {
  return ACCEPTED_TYPES.some((prefix) => file.type.startsWith(prefix));
}

function inferMediaType(file: File): 'image' | 'video' {
  return file.type.startsWith('video/') ? 'video' : 'image';
}

// There's no GET-media-by-product endpoint — media is only ever available
// embedded in the product's own `media` relation, so this modal re-fetches
// the product itself after every add/remove/reorder (same pattern as the
// regular catalog Product's media modal, just camelCase field names here).
export function RewardMallProductMediaModal({ productId, onClose }: RewardMallProductMediaModalProps) {
  const queryClient = useQueryClient();
  const open = productId !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [orderedMedia, setOrderedMedia] = useState<RewardMallProductMedia[]>([]);
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isDropzoneActive, setIsDropzoneActive] = useState(false);
  const dragFromIndex = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const productQuery = useQuery({
    queryKey: ['rewardMallProducts', 'detail', productId],
    queryFn: () => rewardMallProductsService.getById(productId as number),
    enabled: open,
  });

  useEffect(() => {
    const media = productQuery.data?.media ?? [];
    setOrderedMedia([...media].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [productQuery.data]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['rewardMallProducts', 'detail', productId] });

  const removeMutation = useMutation({
    mutationFn: (id: number) => rewardMallProductMediaService.remove(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(toApiError(err).message),
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: RewardMallProductMedia[]) => {
      const changed = items.filter((item, index) => item.sortOrder !== index);
      await Promise.all(
        changed.map((item) => rewardMallProductMediaService.update(item.id, { sortOrder: items.indexOf(item) })),
      );
    },
    onSuccess: invalidate,
    onError: (err) => {
      toast.error(toApiError(err).message);
      invalidate(); // roll the optimistic local order back to what the server actually has
    },
  });

  const uploadFiles = async (fileList: FileList | File[]) => {
    if (productId === null) return;
    const files = Array.from(fileList).filter((file) => {
      if (isAcceptedFile(file)) return true;
      toast.error(`${file.name}: only image or video files are supported.`);
      return false;
    });
    if (files.length === 0) return;

    const tasks: UploadTask[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      status: 'uploading',
    }));
    setUploads((prev) => [...prev, ...tasks]);

    const startingSortOrder = orderedMedia.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const task = tasks[i];
      try {
        const { uploadUrl, fileUrl } = await uploadService.getPresignedUrl(file.name, file.type);
        await uploadService.uploadToS3(uploadUrl, file);
        await rewardMallProductMediaService.create({
          rewardMallProductId: Number(productId),
          mediaUrl: fileUrl,
          mediaType: inferMediaType(file),
          sortOrder: startingSortOrder + i,
        });
        setUploads((prev) => prev.filter((u) => u.id !== task.id));
        invalidate();
      } catch (err) {
        const message = toApiError(err).message;
        setUploads((prev) => prev.map((u) => (u.id === task.id ? { ...u, status: 'error', error: message } : u)));
      }
    }
  };

  const handleClose = () => {
    setUploads([]);
    onClose();
  };

  const handleDragStart = (index: number) => {
    dragFromIndex.current = index;
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    if (dragFromIndex.current !== null) setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    const from = dragFromIndex.current;
    dragFromIndex.current = null;
    setDragOverIndex(null);
    if (from === null || from === index) return;

    setOrderedMedia((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      reorderMutation.mutate(next);
      return next;
    });
  };

  return (
    <Modal open={open} onClose={handleClose} title="Manage Reward Product Media" size="md">
      {productQuery.isLoading ? (
        <Loader />
      ) : (
        <>
          {orderedMedia.length > 0 && (
            <>
              <p className={styles.mediaHint}>Drag to reorder — the first item is shown first to buyers.</p>
              <div className={styles.mediaGrid}>
                {orderedMedia.map((media, index) => (
                  <div
                    key={media.id}
                    className={[
                      styles.mediaItem,
                      dragFromIndex.current === index ? styles.mediaItemDragging : '',
                      dragOverIndex === index ? styles.mediaItemDragOver : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(index, e)}
                    onDrop={() => handleDrop(index)}
                    onDragEnd={() => {
                      dragFromIndex.current = null;
                      setDragOverIndex(null);
                    }}
                  >
                    <span className={styles.mediaOrderBadge}>{index + 1}</span>
                    {media.mediaType === 'image' ? (
                      <img src={media.mediaUrl} alt="" className={styles.mediaImg} />
                    ) : (
                      <video src={media.mediaUrl} className={styles.mediaImg} />
                    )}
                    <button
                      type="button"
                      className={styles.mediaRemove}
                      onClick={() => removeMutation.mutate(media.id)}
                      disabled={removeMutation.isPending}
                      aria-label="Remove media"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div
            className={[styles.dropzone, isDropzoneActive ? styles.dropzoneActive : ''].filter(Boolean).join(' ')}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDropzoneActive(true);
            }}
            onDragLeave={() => setIsDropzoneActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDropzoneActive(false);
              void uploadFiles(e.dataTransfer.files);
            }}
          >
            <span>Drag images or videos here, or</span>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={(e) => {
                void uploadFiles(e.target.files ?? []);
                e.target.value = '';
              }}
            />
          </div>

          {uploads.length > 0 && (
            <div className={styles.uploadList}>
              {uploads.map((task) => (
                <div
                  key={task.id}
                  className={[styles.uploadItem, task.status === 'error' ? styles.uploadItemError : ''].join(' ')}
                >
                  <span className={styles.uploadItemName}>{task.name}</span>
                  {task.status === 'uploading' ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      <span>{task.error ?? 'Upload failed'}</span>
                      <button
                        type="button"
                        onClick={() => setUploads((prev) => prev.filter((u) => u.id !== task.id))}
                        aria-label="Dismiss"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
