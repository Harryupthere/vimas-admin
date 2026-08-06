import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { StatusBadge, statusToneFromFlag } from '../../components/StatusBadge';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { productsService } from '../../services/products.service';
import type { Product } from '../../types/product.types';
import { formatCurrency } from '../../utils/formatters';
import { ProductFormModal } from './ProductFormModal';
import { ProductMediaModal } from './ProductMediaModal';
import styles from './Products.module.scss';

const LIMIT = 10;

type PendingAction = { type: 'publish' | 'unpublish' | 'delete'; product: Product };

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>(undefined);
  const [mediaProductId, setMediaProductId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const productsQuery = useQuery({
    queryKey: ['products', page, LIMIT],
    queryFn: () => productsService.list({ page, limit: LIMIT }),
  });

  const statusMutation = useMutation({
    mutationFn: (id: number) => productsService.updateStatus(id, { status: pendingAction?.type === 'publish' ? 1 : 0 }),
    onSuccess: () => {
      toast.success(pendingAction?.type === 'publish' ? 'Product published.' : 'Product unpublished.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsService.remove(id),
    onSuccess: () => {
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setPendingAction(null);
    },
    onError: (err) => toast.error(toApiError(err).message),
  });

  const columns: TableColumn<Product>[] = [
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
    { key: 'brand', label: 'Brand', render: (p) => p.brand?.name ?? '—' },
    { key: 'sellingPrice', label: 'Price', render: (p) => formatCurrency(p.sellingPrice) },
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
        title="Products"
        description="Manage the product catalog, pricing, and points sharing."
        actions={<Button onClick={() => setEditingProduct(null)}>Add Product</Button>}
      />

      <Table
        columns={columns}
        data={productsQuery.data?.items ?? []}
        rowKey={(p) => p.id}
        loading={productsQuery.isLoading}
        error={productsQuery.isError ? toApiError(productsQuery.error).message : null}
        emptyMessage="No products found"
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

      <ProductFormModal
        open={editingProduct !== undefined}
        product={editingProduct ?? null}
        onClose={() => setEditingProduct(undefined)}
      />

      <ProductMediaModal productId={mediaProductId} onClose={() => setMediaProductId(null)} />

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
              ? 'This product will become visible to buyers.'
              : 'This product will be hidden from buyers.'
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
