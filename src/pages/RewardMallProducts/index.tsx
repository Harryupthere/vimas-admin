import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Select } from '../../components/Select';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { rewardMallCategoriesService } from '../../services/rewardMallCategories.service';
import { rewardMallProductsService } from '../../services/rewardMallProducts.service';
import type { RewardMallProduct } from '../../types/rewardMallProduct.types';
import { RewardMallProductFormModal } from './RewardMallProductFormModal';
import { RewardMallProductMediaModal } from './RewardMallProductMediaModal';
import styles from './RewardMallProducts.module.scss';

const LIMIT = 10;

type PendingAction = { type: 'publish' | 'unpublish' | 'delete'; product: RewardMallProduct };

export default function RewardMallProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [editingProduct, setEditingProduct] = useState<RewardMallProduct | null | undefined>(undefined);
  const [mediaProductId, setMediaProductId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ['rewardMallCategories', 'all'],
    queryFn: () => rewardMallCategoriesService.list(),
  });

  const productsQuery = useQuery({
    queryKey: ['rewardMallProducts', page, LIMIT, categoryId],
    queryFn: () =>
      rewardMallProductsService.list({ page, limit: LIMIT, categoryId: categoryId ? Number(categoryId) : undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: (id: number) =>
      rewardMallProductsService.update(id, { status: pendingAction?.type === 'publish' ? 1 : 0 }),
    onSuccess: () => {
      toast.success(pendingAction?.type === 'publish' ? 'Product published.' : 'Product unpublished.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallProducts'] });
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rewardMallProductsService.remove(id),
    onSuccess: () => {
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['rewardMallProducts'] });
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<RewardMallProduct>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (p) => (
        <div className={styles.productCell}>
          <span className={styles.productName}>{p.name}</span>
          {p.subTitle && <span className={styles.productSub}>{p.subTitle}</span>}
        </div>
      ),
    },
    { key: 'category', label: 'Category', render: (p) => p.category?.name ?? '—' },
    { key: 'pointPrice', label: 'Point Price', render: (p) => `${p.pointPrice} pts` },
    { key: 'stock', label: 'Stock', render: (p) => String(p.stock) },
    {
      key: 'status',
      label: 'Status',
      render: (p) => <StatusBadge label={p.status ? 'Published' : 'Draft'} tone={statusToneFromFlag(p.status ?? 0)} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (p) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setMediaProductId(p.id)}>
            Media
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditingProduct(p)}>
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPendingAction({ type: p.status ? 'unpublish' : 'publish', product: p })}
          >
            {p.status ? 'Unpublish' : 'Publish'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingAction({ type: 'delete', product: p })}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleConfirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.type === 'delete') {
      deleteMutation.mutate(pendingAction.product.id);
    } else {
      statusMutation.mutate(pendingAction.product.id);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reward Mall Products"
        description="Products buyers can redeem with reward points, instead of paying cash."
        actions={<Button onClick={() => setEditingProduct(null)}>Add Product</Button>}
      />

      <div className={styles.filters}>
        <div className={styles.filterSelect}>
          <Select
            placeholder="All categories"
            options={(categoriesQuery.data ?? []).map((c) => ({ value: String(c.id), label: c.name }))}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={productsQuery.data?.items ?? []}
        rowKey={(p) => p.id}
        loading={productsQuery.isLoading}
        error={productsQuery.isError ? toApiError(productsQuery.error).message : null}
        emptyMessage="No reward mall products found"
      />

      {productsQuery.data && (
        <Pagination
          page={productsQuery.data.page}
          totalPages={productsQuery.data.totalPages}
          total={productsQuery.data.total}
          limit={productsQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <RewardMallProductFormModal
        open={editingProduct !== undefined}
        product={editingProduct ?? null}
        onClose={() => setEditingProduct(undefined)}
      />

      <RewardMallProductMediaModal productId={mediaProductId} onClose={() => setMediaProductId(null)} />

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction?.type === 'delete'
            ? 'Delete Product'
            : pendingAction?.type === 'publish'
              ? 'Publish Product'
              : 'Unpublish Product'
        }
        message={
          pendingAction?.type === 'delete'
            ? `This will permanently delete "${pendingAction.product.name}". This cannot be undone.`
            : pendingAction?.type === 'publish'
              ? 'This reward will become visible and redeemable by buyers.'
              : 'This reward will be hidden from buyers.'
        }
        confirmLabel={pendingAction?.type === 'delete' ? 'Delete' : 'Confirm'}
        danger={pendingAction?.type === 'delete'}
        loading={statusMutation.isPending || deleteMutation.isPending}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
