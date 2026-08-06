import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { Table, type TableColumn } from '../../components/Table';
import { toApiError } from '../../services/api';
import { brandsService } from '../../services/brands.service';
import type { Brand } from '../../types/brand.types';
import { formatDate } from '../../utils/formatters';
import { BrandCategoriesModal } from './BrandCategoriesModal';
import { BrandFormModal } from './BrandFormModal';
import styles from './Brands.module.scss';

const LIMIT = 10;

export default function BrandsPage() {
  const [page, setPage] = useState(1);
  const [editingBrand, setEditingBrand] = useState<Brand | null | undefined>(undefined);
  const [categoriesBrand, setCategoriesBrand] = useState<Brand | null>(null);

  const brandsQuery = useQuery({
    queryKey: ['brands', page, LIMIT],
    queryFn: () => brandsService.list({ page, limit: LIMIT }),
  });

  const columns: TableColumn<Brand>[] = [
    { key: 'id', label: 'ID', width: '80px', render: (b) => `#${b.id}` },
    { key: 'name', label: 'Name' },
    { key: 'createdAt', label: 'Created', render: (b) => formatDate(b.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (b) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setCategoriesBrand(b)}>
            Categories
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setEditingBrand(b)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Brands"
        description="Manage brands and which categories they belong to."
        actions={<Button onClick={() => setEditingBrand(null)}>Add Brand</Button>}
      />

      <Table
        columns={columns}
        data={brandsQuery.data?.items ?? []}
        rowKey={(b) => b.id}
        loading={brandsQuery.isLoading}
        error={brandsQuery.isError ? toApiError(brandsQuery.error).message : null}
        emptyMessage="No brands found"
      />

      {brandsQuery.data && (
        <Pagination
          page={brandsQuery.data.page}
          totalPages={brandsQuery.data.totalPages}
          total={brandsQuery.data.total}
          limit={brandsQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <BrandFormModal open={editingBrand !== undefined} brand={editingBrand ?? null} onClose={() => setEditingBrand(undefined)} />
      <BrandCategoriesModal brand={categoriesBrand} onClose={() => setCategoriesBrand(null)} />
    </div>
  );
}
