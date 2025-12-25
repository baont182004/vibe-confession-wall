import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api, { reportEntity } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { cn } from '../lib/utils';

const limitOptions = [10, 20, 50];

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

const Toast = ({ message, variant = 'success', onClose }) => {
  if (!message) return null;
  const tone =
    variant === 'error'
      ? 'border-[var(--red)]/40 bg-[var(--red)]/10 text-[var(--red)]'
      : 'border-[var(--green)]/40 bg-[var(--green)]/10 text-[var(--green)]';

  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg ${tone}`}>
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, title, description, confirmLabel, variant = 'destructive', loading, onConfirm, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-4 text-sm text-[var(--textMuted)]">
      <p>{description}</p>
      <div className="flex w-full justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Hủy
        </Button>
        <Button variant={variant} size="sm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Đang xử lý...' : confirmLabel}
        </Button>
      </div>
    </div>
  </Modal>
);

const ActionMenu = ({ items }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="border border-[var(--border)]"
        type="button"
        aria-label="Mở menu hành động"
      >
        <span className="text-lg leading-none">⋯</span>
      </Button>
    </PopoverTrigger>
    <PopoverContent className="space-y-1 px-1 py-2 w-48">
      {items.map((item) => (
        <Button
          key={item.key}
          variant={item.variant || 'ghost'}
          size="sm"
          className="justify-start w-full"
          onClick={item.onClick}
          disabled={item.disabled}
          type="button"
        >
          {item.label}
        </Button>
      ))}
    </PopoverContent>
  </Popover>
);

const formatDateTime = (value) => {
  if (!value) return '---';
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const truncate = (value, length = 90) => {
  if (!value) return '';
  if (value.length <= length) return value;
  return `${value.slice(0, length)}…`;
};

const MetricCard = ({ label, value, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex flex-col gap-1 rounded-2xl border bg-[var(--surface)] p-5 text-left transition-all focus-visible:outline-none',
      active
        ? 'border-[var(--accent-1)] shadow-[0_20px_45px_rgba(57,214,197,0.25)]'
        : 'border-[var(--border)] hover:border-[var(--accent-1)]'
    )}
  >
    <span className="text-xs uppercase tracking-[0.4em] text-[var(--textMuted)]">{label}</span>
    <span className="text-3xl font-semibold">{value}</span>
    </button>
  );

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  const [toast, setToast] = useState({ message: '', variant: 'success' });
  const showToast = (message, variant = 'success') => {
    setToast({ message, variant });
  };

  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [postsItems, setPostsItems] = useState([]);
  const [postsPage, setPostsPage] = useState(1);
  const [postsPageSize, setPostsPageSize] = useState(10);
  const [postsTotalItems, setPostsTotalItems] = useState(0);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [postsSearchInput, setPostsSearchInput] = useState('');
  const [postsSearch, setPostsSearch] = useState('');
  const postsSearchDebounced = useDebounce(postsSearchInput, 300);
  const [postsAuthorFilter, setPostsAuthorFilter] = useState('');
  const [postsStatusFilter, setPostsStatusFilter] = useState('');

  const [commentsItems, setCommentsItems] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsPageSize, setCommentsPageSize] = useState(10);
  const [commentsTotalItems, setCommentsTotalItems] = useState(0);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [commentsSearchInput, setCommentsSearchInput] = useState('');
  const [commentsSearch, setCommentsSearch] = useState('');
  const commentsSearchDebounced = useDebounce(commentsSearchInput, 300);
  const [commentsPostFilter, setCommentsPostFilter] = useState('');
  const [commentsStatusFilter, setCommentsStatusFilter] = useState('');

  const [previewPost, setPreviewPost] = useState(null);
  const [previewComments, setPreviewComments] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setPostsSearch(postsSearchDebounced.trim());
  }, [postsSearchDebounced]);

  useEffect(() => {
    setCommentsSearch(commentsSearchDebounced.trim());
  }, [commentsSearchDebounced]);

  useEffect(() => {
    setPostsPage(1);
  }, [postsSearch, postsAuthorFilter, postsStatusFilter]);

  useEffect(() => {
    setCommentsPage(1);
  }, [commentsSearch, commentsPostFilter, commentsStatusFilter]);

  const fetchOverview = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setOverviewError('');
    try {
      const { data } = await api.get('/admin/overview');
      setOverview(data);
    } catch (error) {
      setOverviewError('Không thể tải dữ liệu tổng quan.');
    } finally {
    }
  }, [user]);

  const fetchPosts = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setPostsLoading(true);
    setPostsError('');
    try {
      const params = {
        page: postsPage,
        limit: postsPageSize,
      };
      if (postsSearch) params.q = postsSearch;
      if (postsAuthorFilter) params.author = postsAuthorFilter;
      if (postsStatusFilter) params.status = postsStatusFilter;
      const { data } = await api.get('/admin/posts', { params });
      setPostsItems(data.items || []);
      setPostsPage(data.page || 1);
      setPostsPageSize(data.pageSize || postsPageSize);
      setPostsTotalItems(data.totalItems ?? 0);
      setPostsTotalPages(data.totalPages || 1);
    } catch (error) {
      setPostsError('Không thể tải bài viết.');
    } finally {
      setPostsLoading(false);
    }
  }, [user, postsPage, postsPageSize, postsSearch, postsAuthorFilter, postsStatusFilter]);

  const fetchComments = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setCommentsLoading(true);
    setCommentsError('');
    try {
      const params = {
        page: commentsPage,
        limit: commentsPageSize,
      };
      if (commentsSearch) params.q = commentsSearch;
      if (commentsPostFilter) params.postId = commentsPostFilter;
      if (commentsStatusFilter) params.status = commentsStatusFilter;
      const { data } = await api.get('/admin/comments', { params });
      setCommentsItems(data.items || []);
      setCommentsPage(data.page || 1);
      setCommentsPageSize(data.pageSize || commentsPageSize);
      setCommentsTotalItems(data.totalItems ?? 0);
      setCommentsTotalPages(data.totalPages || 1);
    } catch (error) {
      setCommentsError('Không thể tải bình luận.');
    } finally {
      setCommentsLoading(false);
    }
  }, [user, commentsPage, commentsPageSize, commentsSearch, commentsPostFilter, commentsStatusFilter]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchOverview();
  }, [fetchOverview, user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchPosts();
  }, [fetchPosts, user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchComments();
  }, [fetchComments, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchOverview(), fetchPosts(), fetchComments()]);
      setLastRefresh(new Date().toISOString());
      showToast('Dữ liệu đã được làm mới.');
    } catch (error) {
      showToast('Không thể làm mới dữ liệu.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const openPreview = useCallback(async (post) => {
    if (!post) return;
    setPreviewPost(post);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewComments([]);
    try {
      const { data } = await api.get(`/posts/${post._id}/comments`, { params: { page: 1, limit: 8 } });
      setPreviewComments(data.comments || []);
    } catch (error) {
      setPreviewError('Không thể tải bình luận.');
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const closePreview = () => {
    setPreviewPost(null);
    setPreviewComments([]);
    setPreviewLoading(false);
    setPreviewError('');
  };

  const handleAction = (type, payload) => {
    setPendingAction({ type, payload });
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      if (pendingAction.type === 'delete-post') {
        await api.delete(`/admin/posts/${pendingAction.payload._id}`);
        showToast('Bài viết đã được xóa.');
        await Promise.all([fetchPosts(), fetchComments()]);
      }
      if (pendingAction.type === 'hide-post') {
        await reportEntity('post', pendingAction.payload._id, 'Ẩn bài viết theo yêu cầu admin');
        showToast('Yêu cầu ẩn đã được gửi.');
        await fetchPosts();
      }
      if (pendingAction.type === 'delete-comment') {
        await api.delete(`/admin/comments/${pendingAction.payload._id}`);
        showToast('Bình luận đã được xóa.');
        await fetchComments();
      }
    } catch (error) {
      showToast('Yêu cầu thất bại, thử lại.', 'error');
    } finally {
      setActionLoading(false);
      setPendingAction(null);
      fetchOverview();
    }
  };

  useEffect(() => {
    if (!toast.message) return undefined;
    const timer = setTimeout(() => setToast((prev) => ({ ...prev, message: '' })), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  if (user && user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8 pb-10">
      <Toast message={toast.message} variant={toast.variant} onClose={() => setToast({ message: '', variant: 'success' })} />
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg font-semibold tracking-[0.15em] uppercase">ADMIN · Bảng điều hành</h1>
        <div className="flex flex-col items-end gap-1">
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Đang làm mới...' : 'Làm mới'}
          </Button>
          <span className="text-xs text-[var(--textMuted)]">
            {lastRefresh
              ? `Cập nhật: ${new Date(lastRefresh).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
              : 'Chưa cập nhật'}
          </span>
        </div>
      </div>
      {overviewError && <p className="text-sm text-[var(--red)]">{overviewError}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { id: 'posts', label: 'Bài viết', value: overview ? overview.postsCount : '…' },
          { id: 'comments', label: 'Bình luận', value: overview ? overview.commentsCount : '…' },
          { id: 'users', label: 'Người dùng', value: overview ? overview.usersCount : '…' },
        ].map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            active={activeTab === metric.id}
            onClick={() => setActiveTab(metric.id)}
          />
        ))}
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1">
        <TabsTrigger value="posts" className="px-3 py-2 text-xs uppercase tracking-[0.3em]">
          Bài viết
        </TabsTrigger>
        <TabsTrigger value="comments" className="px-3 py-2 text-xs uppercase tracking-[0.3em]">
          Bình luận
        </TabsTrigger>
        <TabsTrigger value="users" className="px-3 py-2 text-xs uppercase tracking-[0.3em]">
          Người dùng
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        <Card className="space-y-4 border border-[var(--border)] p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--textMuted)]">Bộ lọc</p>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Tìm theo nội dung"
                  value={postsSearchInput}
                  onChange={(event) => setPostsSearchInput(event.target.value)}
                  className="min-w-[200px]"
                />
                <Input
                  placeholder="ID tác giả"
                  value={postsAuthorFilter}
                  onChange={(event) => setPostsAuthorFilter(event.target.value)}
                  className="min-w-[160px]"
                />
                <Select value={postsStatusFilter || 'all-status'} onValueChange={(value) => setPostsStatusFilter(value === 'all-status' ? '' : value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue>{postsStatusFilter ? `Trạng thái: ${postsStatusFilter}` : 'Tất cả trạng thái'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-status">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="hidden">Đã ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={String(postsPageSize)} onValueChange={(value) => {
                setPostsPageSize(Number(value));
                setPostsPage(1);
              }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue>{postsPageSize} / trang</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((limit) => (
                    <SelectItem key={`posts-${limit}`} value={String(limit)}>
                      {limit} / trang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => {
                setPostsSearchInput('');
                setPostsSearch('');
                setPostsAuthorFilter('');
                setPostsStatusFilter('');
                setPostsPage(1);
              }}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface2)] shadow-sm">
            {postsError && <div className="p-4 text-sm text-[var(--red)]">{postsError}</div>}
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
                <thead className="sticky top-0 bg-[var(--surface)] text-xs uppercase tracking-[0.25em] text-[var(--textMuted)]">
                  <tr>
                    <th className="px-4 py-3">Tác giả</th>
                    <th className="px-4 py-3">Nội dung</th>
                    <th className="px-4 py-3">Bình luận</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface2)]">
                  {postsLoading &&
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={`skeleton-post-${idx}`} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-52 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-16 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-24 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3" />
                      </tr>
                    ))}
                  {!postsLoading && !postsItems.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-[var(--textMuted)]">
                        Không có bài viết phù hợp.
                      </td>
                    </tr>
                  )}
                  {!postsLoading &&
                    postsItems.map((post) => {
                      const menuItems = [
                        {
                          key: `view-${post._id}`,
                          label: 'Xem bài viết',
                          onClick: () => openPreview(post),
                        },
                        post.status === 'active' && {
                          key: `hide-${post._id}`,
                          label: 'Ẩn bài viết',
                          onClick: () => handleAction('hide-post', post),
                        },
                        {
                          key: `delete-${post._id}`,
                          label: 'Xóa vĩnh viễn',
                          variant: 'destructive',
                          onClick: () => handleAction('delete-post', post),
                        },
                      ].filter(Boolean);

                      return (
                        <tr key={post._id} className="border-b border-[var(--border)]">
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold">{post.authorId?.nickname || 'Không rõ'}</div>
                            <div className="text-xs text-[var(--textMuted)]">
                              #{post.authorId?._id?.slice(-6)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="line-clamp-2 text-sm text-[var(--text)]">{post.content}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold text-[var(--blue)]">
                              {post.commentCount ?? 0} Bình luận
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-[var(--textMuted)]">{formatDateTime(post.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <ActionMenu items={menuItems} />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-start gap-2 border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--textMuted)] sm:flex-row sm:items-center sm:justify-between">
              <span>
                Hiển thị trang {postsPage} / {postsTotalPages} · Tổng {postsTotalItems} bài
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPostsPage((prev) => Math.max(1, prev - 1))}
                  disabled={postsPage <= 1 || postsLoading}
                >
                  Trước
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPostsPage((prev) => Math.min(postsTotalPages, prev + 1))}
                  disabled={postsPage >= postsTotalPages || postsLoading}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="comments">
        <Card className="space-y-4 border border-[var(--border)] p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--textMuted)]">Bộ lọc</p>
              <div className="flex flex-wrap gap-3">
                <Input
                  placeholder="Tìm nội dung"
                  value={commentsSearchInput}
                  onChange={(event) => setCommentsSearchInput(event.target.value)}
                  className="min-w-[220px]"
                />
                <Input
                  placeholder="ID bài viết"
                  value={commentsPostFilter}
                  onChange={(event) => setCommentsPostFilter(event.target.value)}
                  className="min-w-[180px]"
                />
                <Select
                  value={commentsStatusFilter || 'all-comments'}
                  onValueChange={(value) => setCommentsStatusFilter(value === 'all-comments' ? '' : value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue>{commentsStatusFilter ? `Trạng thái: ${commentsStatusFilter}` : 'Tất cả trạng thái'}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-comments">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="deleted">Đã xóa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={String(commentsPageSize)} onValueChange={(value) => {
                setCommentsPageSize(Number(value));
                setCommentsPage(1);
              }}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue>{commentsPageSize} / trang</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {limitOptions.map((limit) => (
                    <SelectItem key={`comments-${limit}`} value={String(limit)}>
                      {limit} / trang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => {
                setCommentsSearchInput('');
                setCommentsSearch('');
                setCommentsPostFilter('');
                setCommentsStatusFilter('');
                setCommentsPage(1);
              }}>
                Xóa bộ lọc
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface2)] shadow-sm">
            {commentsError && <div className="p-4 text-sm text-[var(--red)]">{commentsError}</div>}
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
                <thead className="sticky top-0 bg-[var(--surface)] text-xs uppercase tracking-[0.25em] text-[var(--textMuted)]">
                  <tr>
                    <th className="px-4 py-3">Tác giả</th>
                    <th className="px-4 py-3">Bình luận</th>
                    <th className="px-4 py-3">Bài viết</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--surface2)]">
                  {commentsLoading &&
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={`skeleton-comment-${idx}`} className="animate-pulse">
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-52 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-32 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 rounded bg-[var(--surface)]" />
                        </td>
                        <td className="px-4 py-3" />
                      </tr>
                    ))}
                  {!commentsLoading && !commentsItems.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm text-[var(--textMuted)]">
                        Không có bình luận phù hợp.
                      </td>
                    </tr>
                  )}
                  {!commentsLoading &&
                    commentsItems.map((comment) => (
                      <tr key={comment._id} className="border-b border-[var(--border)]">
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold">{comment.authorId?.nickname || 'Không rõ'}</div>
                          <div className="text-xs text-[var(--textMuted)]">
                            #{comment.authorId?._id?.slice(-6)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="line-clamp-2 text-sm text-[var(--text)]">{comment.content}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="line-clamp-2 text-sm">{truncate(comment.postId?.content ?? 'Không có nội dung', 90)}</p>
                          {comment.postId && (
                            <Link to={`/posts/${comment.postId._id}`} className="text-xs font-semibold text-[var(--blue)]">
                              Xem bài viết
                            </Link>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--textMuted)]">{formatDateTime(comment.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <ActionMenu
                            items={[
                              {
                                key: `delete-comment-${comment._id}`,
                                label: 'Xóa bình luận',
                                variant: 'destructive',
                                onClick: () => handleAction('delete-comment', comment),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-start gap-2 border-t border-[var(--border)] px-4 py-3 text-sm text-[var(--textMuted)] sm:flex-row sm:items-center sm:justify-between">
              <span>
                Hiển thị trang {commentsPage} / {commentsTotalPages} · Tổng {commentsTotalItems} bình luận
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentsPage((prev) => Math.max(1, prev - 1))}
                  disabled={commentsPage <= 1 || commentsLoading}
                >
                  Trước
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommentsPage((prev) => Math.min(commentsTotalPages, prev + 1))}
                  disabled={commentsPage >= commentsTotalPages || commentsLoading}
                >
                  Sau
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <Card className="space-y-5 border border-[var(--border)] p-6">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--textMuted)]">Người dùng</p>
            <h2 className="text-2xl font-semibold">Tổng quan tài khoản</h2>
            <p className="text-sm text-[var(--textMuted)]">Dữ liệu cập nhật gần nhất từ tổng quan hệ thống.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-xs uppercase text-[var(--textMuted)]">Tổng cộng</p>
              <p className="text-3xl font-semibold">{overview ? overview.usersCount : '…'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-xs uppercase text-[var(--textMuted)]">7 ngày gần nhất</p>
              <p className="text-3xl font-semibold">
                {overview ? overview.last7Days?.reduce((sum, entry) => sum + (entry.count || 0), 0) : '…'}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-xs uppercase text-[var(--textMuted)]">Người mới mỗi ngày</p>
              <ul className="space-y-1 text-sm text-[var(--textMuted)]">
                {overview?.last7Days?.map((entry) => (
                  <li key={entry._id} className="flex items-center justify-between">
                    <span>{entry._id}</span>
                    <span className="font-semibold text-[var(--text)]">{entry.count} người</span>
                  </li>
                )) || (
                  <li>Đang tải ...</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>

    <Modal
      isOpen={Boolean(previewPost)}
      onClose={closePreview}
      title={`Bài viết của ${previewPost?.authorId?.nickname || 'Không rõ'}`}
    >
      <div className="space-y-4">
        <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-xs text-[var(--textMuted)]">
            {previewPost ? formatDateTime(previewPost.createdAt) : 'Đang tải...'}
          </p>
          <p className="text-lg font-semibold">{previewPost?.content}</p>
          <div className="flex flex-wrap gap-3 text-sm text-[var(--textMuted)]">
            <span>{previewPost?.commentCount ?? 0} bình luận</span>
            <span>{previewPost?.reactionCounts?.heart ?? 0} ❤️</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {previewPost?.status === 'active' && (
              <Button variant="ghost" size="sm" onClick={() => handleAction('hide-post', previewPost)}>
                Ẩn bài viết
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => handleAction('delete-post', previewPost)}>
              Xóa bài viết
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface2)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Bình luận ({previewPost?.commentCount ?? previewComments.length})</p>
            <span className="text-xs text-[var(--textMuted)]">Cuộn trong vùng</span>
          </div>
          <div className="mt-3 max-h-60 space-y-3 overflow-y-auto pr-1">
            {previewLoading && <p className="text-sm text-[var(--textMuted)]">Đang tải...</p>}
            {previewError && <p className="text-sm text-[var(--red)]">{previewError}</p>}
            {!previewLoading && !previewComments.length && !previewError && (
              <p className="text-sm text-[var(--textMuted)]">Chưa có bình luận.</p>
            )}
            {previewComments.map((comment) => (
              <div key={comment._id} className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="flex items-center justify-between text-xs text-[var(--textMuted)]">
                  <span>{comment.authorId?.nickname || 'Không rõ'}</span>
                  <span>{formatDateTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>

    <ConfirmDialog
      isOpen={Boolean(pendingAction)}
      title={
        pendingAction?.type === 'delete-post'
          ? 'Xóa bài viết'
          : pendingAction?.type === 'hide-post'
          ? 'Ẩn bài viết'
          : 'Xóa bình luận'
      }
      description={
        pendingAction?.type === 'delete-post'
          ? 'Hành động này sẽ xóa bài viết và tất cả bình luận liên quan.'
          : pendingAction?.type === 'hide-post'
          ? 'Bài viết sẽ được gửi yêu cầu ẩn để xử lý nội dung.'
          : 'Bình luận sẽ bị xóa vĩnh viễn khỏi hệ thống.'
      }
      confirmLabel={
        pendingAction?.type === 'hide-post'
          ? 'Gửi yêu cầu ẩn'
          : pendingAction?.type === 'delete-post'
          ? 'Xóa bài viết'
          : 'Xóa bình luận'
      }
      loading={actionLoading}
      onConfirm={handleConfirmAction}
      onClose={() => setPendingAction(null)}
    />
  </div>
);
}
