
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import type { BlogPost, MultilingualString } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { ImageUploader } from '../../components/common/ImageUploader';
import { Modal } from '../../components/common/Modal';
import { MultilingualInput, MultilingualTextarea } from '../../components/common/Multilingual';
import { useI18n } from '../../contexts/I18nContext';

const PostForm: React.FC<{ post: Partial<BlogPost>, onSave: (data: any) => void, onCancel: () => void }> = ({ post, onSave, onCancel }) => {
    const [formData, setFormData] = useState(post);
    const { t } = useI18n();

    const handleMultilingualChange = (fieldName: keyof BlogPost, value: MultilingualString) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };
    
    const handleImageChange = (value: string) => {
        setFormData(prev => ({ ...prev, imageUrl: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <MultilingualInput
                label={t('admin.blog.form.title')}
                name="title"
                value={formData.title || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('title', value)}
            />
            <MultilingualInput
                label={t('admin.blog.form.author')}
                name="author"
                value={formData.author || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('author', value)}
            />
             <div>
                <label className="block text-sm font-medium">{t('admin.blog.form.image')}</label>
                <ImageUploader 
                    initialValue={formData.imageUrl || ''}
                    onValueChange={handleImageChange}
                />
            </div>
            <MultilingualTextarea
                label={t('admin.blog.form.content')}
                name="content"
                value={formData.content || { es: '', en: '', fr: '' }}
                onChange={(value) => handleMultilingualChange('content', value)}
                rows={10}
            />
            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button type="button" variant="light" onClick={onCancel}>{t('admin.blog.form.cancel')}</Button>
                <Button type="submit">{t('admin.blog.form.save')}</Button>
            </div>
        </form>
    );
};

const AdminBlogPage: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const { t, t_dynamic } = useI18n();

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getBlogPosts();
            setPosts(data);
        } catch (error) {
            console.error("Failed to fetch blog posts", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleCreateNew = () => {
        setEditingPost({ title: { es: '', en: '', fr: '' }, author: { es: '', en: '', fr: '' }, content: { es: '', en: '', fr: '' }, imageUrl: '' });
        setIsModalOpen(true);
    };
    
    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.blog.confirmDelete'))) {
            await api.deleteBlogPost(id);
            fetchPosts();
        }
    };

    const handleSave = async (data: Omit<BlogPost, 'id' | 'publishedDate'> & { id?: string }) => {
        await api.saveBlogPost(data);
        fetchPosts();
        setIsModalOpen(false);
        setEditingPost(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">{t('admin.blog.title')}</h1>
                <Button onClick={handleCreateNew}>{t('admin.blog.add')}</Button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <Card>
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.blog.postTitle')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.blog.author')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.blog.date')}</th>
                                    <th className="p-4 text-sm font-semibold text-gray-600">{t('admin.blog.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {posts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{t_dynamic(post.title)}</td>
                                        <td className="p-4 text-gray-600">{t_dynamic(post.author)}</td>
                                        <td className="p-4 text-gray-600">{new Date(post.publishedDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button variant="secondary" size="sm" onClick={() => handleEdit(post)}>{t('admin.blog.edit')}</Button>
                                                <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>{t('admin.blog.delete')}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="md:hidden">
                        <div className="p-4 space-y-4">
                            {posts.map(post => (
                                <Card key={post.id} className="p-4 border">
                                    <h3 className="font-bold text-lg">{t_dynamic(post.title)}</h3>
                                    <p className="text-sm text-gray-600">{t_dynamic(post.author)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(post.publishedDate).toLocaleDateString()}</p>
                                    <div className="mt-4 pt-2 border-t flex justify-end space-x-2">
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(post)}>{t('admin.blog.edit')}</Button>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(post.id)}>{t('admin.blog.delete')}</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {editingPost && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPost.id ? t('admin.blog.modalEditTitle') : t('admin.blog.modalCreateTitle')}>
                    <PostForm post={editingPost} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                </Modal>
            )}
        </div>
    );
};

export default AdminBlogPage;