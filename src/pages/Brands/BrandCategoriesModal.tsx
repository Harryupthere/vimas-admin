import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { toApiError } from '../../services/api';
import { brandsService } from '../../services/brands.service';
import { categoriesService } from '../../services/categories.service';
import type { Brand } from '../../types/brand.types';
import styles from './Brands.module.scss';

export interface BrandCategoriesModalProps {
  brand: Brand | null;
  onClose: () => void;
}

export function BrandCategoriesModal({ brand, onClose }: BrandCategoriesModalProps) {
  const queryClient = useQueryClient();
  const open = brand !== null;

  const allCategoriesQuery = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: () => categoriesService.list({ page: 1, limit: 200 }),
    enabled: open,
  });

  const mappedQuery = useQuery({
    queryKey: ['brands', 'categories', brand?.id],
    queryFn: () => brandsService.getCategoriesForBrand(brand!.id),
    enabled: open,
  });

  const mappedIds = useMemo(() => new Set((mappedQuery.data ?? []).map((c) => c.id)), [mappedQuery.data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['brands', 'categories', brand?.id] });
  };

  const mapMutation = useMutation({
    mutationFn: (categoryId: number) => brandsService.mapCategory({ categoryId, brandId: brand!.id }),
    onSuccess: invalidate,
    onError: (err) => toast.error(toApiError(err).message),
  });

  const unmapMutation = useMutation({
    mutationFn: (categoryId: number) => brandsService.unmapCategory({ categoryId, brandId: brand!.id }),
    onSuccess: invalidate,
    onError: (err) => toast.error(toApiError(err).message),
  });

  const isLoading = allCategoriesQuery.isLoading || mappedQuery.isLoading;

  return (
    <Modal open={open} onClose={onClose} title={`Categories for "${brand?.name ?? ''}"`} size="sm">
      <p className={styles.hint}>Check a category to link it to this brand.</p>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={styles.categoryList}>
          {(allCategoriesQuery.data?.items ?? []).map((category) => {
            const checked = mappedIds.has(category.id);
            const pending = mapMutation.isPending || unmapMutation.isPending;
            return (
              <label key={category.id} className={styles.categoryRow}>
                {category.name}
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={pending}
                  onChange={() =>
                    checked ? unmapMutation.mutate(category.id) : mapMutation.mutate(category.id)
                  }
                />
              </label>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
