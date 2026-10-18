'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useResource, ResourceState, DeleteDialog, Pager } from '@/components/admin/shared';
export function AdminProducts() {
  const [page, setPage] = useState(1),
    [query, setQuery] = useState(''),
    [draft, setDraft] = useState(''),
    [deleted, setDeleted] = useState(null);
  const resource = useResource(
    `/admin/products?limit=10&page=${page}&q=${encodeURIComponent(query)}`,
  );
  async function remove(item) {
    await api(`/admin/products/${item._id}`, { method: 'DELETE' });
    if (resource.data.items.length === 1 && page > 1) setPage(page - 1);
    else resource.refresh();
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Sản phẩm</h1>
          <p>Quản lý bộ sưu tập, nội dung và trạng thái hiển thị.</p>
        </div>
        <Button asChild>
          <Link href="/admin/san-pham/tao-moi">
            <Plus />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>
      <form
        className="admin-search"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(draft);
          setPage(1);
        }}
      >
        <input
          className="input"
          aria-label="Tìm sản phẩm"
          placeholder="Tìm theo tên sản phẩm…"
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" variant="outline">
          Tìm kiếm
        </Button>
      </form>
      {!resource.data || resource.error ? (
        <ResourceState resource={resource} />
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Trạng thái</th>
                  <th>Nổi bật</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {resource.data.items.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div className="table-product">
                        <Image src={p.thumbnail} alt="" width={54} height={48} />
                        <div>
                          {p.name}
                          <small>{p.isDemo ? 'Ảnh tham khảo · cần xác nhận' : p.slug}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.category?.name}</td>
                    <td>
                      <span className={`status-badge ${p.status === 'draft' ? 'draft' : ''}`}>
                        {p.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td>
                      {p.isFeatured ? (
                        <Star size={15} fill="#b3996c" color="#b3996c" aria-label="Nổi bật" />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/san-pham/${p._id}`} aria-label={`Sửa ${p.name}`}>
                            <Pencil size={15} />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleted(p)}
                          aria-label={`Xóa ${p.name}`}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {resource.data.total === 0 && (
            <div className="empty-state">
              <p>Chưa có sản phẩm phù hợp.</p>
            </div>
          )}
          <Pager page={page} pages={resource.data.pages} onChange={setPage} />
        </div>
      )}
      <DeleteDialog
        key={deleted?._id || 'none'}
        item={deleted}
        onClose={() => setDeleted(null)}
        onDelete={remove}
      />
    </>
  );
}
