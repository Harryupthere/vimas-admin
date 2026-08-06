import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { toApiError } from '../../services/api';
import { productMediaService } from '../../services/productMedia.service';
import { productsService } from '../../services/products.service';
import styles from './Products.module.scss';

export interface ProductMediaModalProps {
  productId: number | null;
  onClose: () => void;
}

// There's no GET-media-by-product endpoint — media is only ever available
// embedded in the product's own `productMedia` relation, so this modal
// re-fetches the product itself after every add/remove.
export function ProductMediaModal({ productId, onClose }: ProductMediaModalProps) {
  const queryClient = useQueryClient();
  const open = productId !== null;
  const [mediaUrl, setMediaUrl] = useState('');

  const productQuery = useQuery({
    queryKey: ['products', 'detail', productId],
    queryFn: () => productsService.getById(productId as number),
    enabled: open,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['products', 'detail', productId] });

  const addMutation = useMutation({
    mutationFn: () => productMediaService.create({ product_id: productId as number, media_url: mediaUrl.trim() }),
    onSuccess: () => {
      setMediaUrl('');
      invalidate();
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => productMediaService.remove(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(toApiError(err).message),
  });

  const handleClose = () => {
    setMediaUrl('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Manage Product Media" size="md">
      {productQuery.isLoading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.mediaGrid}>
            {(productQuery.data?.productMedia ?? []).map((media) => (
              <div key={media.id} className={styles.mediaItem}>
                {media.media_type === 'image' ? (
                  <img src={media.media_url} alt="" className={styles.mediaImg} />
                ) : (
                  <video src={media.media_url} className={styles.mediaImg} />
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

          <div className={styles.addMediaRow}>
            <Input
              placeholder="https://example.com/image.jpg"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />
            <Button
              onClick={() => addMutation.mutate()}
              loading={addMutation.isPending}
              disabled={!mediaUrl.trim()}
            >
              Add
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
