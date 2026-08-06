import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { SearchInput } from '../../components/SearchInput';
import { Table, type TableColumn } from '../../components/Table';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { toApiError } from '../../services/api';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types/category.types';
import { formatDate } from '../../utils/formatters';
import { CategoryFormModal } from './CategoryFormModal';
import styles from './Categories.module.scss';

const LIMIT = 10;

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [editingCategory, setEditingCategory] = useState<Category | null | undefined>(undefined);

  const categoriesQuery = useQuery({
    queryKey: ['categories', page, LIMIT, debouncedSearch],
    queryFn: () => categoriesService.list({ page, limit: LIMIT, search: debouncedSearch }),
  });

  const columns: TableColumn<Category>[] = [
    { key: 'id', label: 'ID', width: '80px', render: (c) => `#${c.id}` },
    { key: 'name', label: 'Name' },
    { key: 'parent', label: 'Parent', render: (c) => c.parent?.name ?? '—' },
    { key: 'createdAt', label: 'Created', render: (c) => formatDate(c.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (c) => (
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={() => setEditingCategory(c)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Organize products into categories."
        actions={<Button onClick={() => setEditingCategory(null)}>Add Category</Button>}
      />

      <div className={styles.filters}>
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search categories…"
        />
      </div>

      <Table
        columns={columns}
        data={categoriesQuery.data?.items ?? []}
        rowKey={(c) => c.id}
        loading={categoriesQuery.isLoading}
        error={categoriesQuery.isError ? toApiError(categoriesQuery.error).message : null}
        emptyMessage="No categories found"
      />

      {categoriesQuery.data && (
        <Pagination
          page={categoriesQuery.data.page}
          totalPages={categoriesQuery.data.totalPages}
          total={categoriesQuery.data.total}
          limit={categoriesQuery.data.limit}
          onPageChange={setPage}
        />
      )}

      <CategoryFormModal
        open={editingCategory !== undefined}
        category={editingCategory ?? null}
        onClose={() => setEditingCategory(undefined)}
      />
    </div>
  );
}
