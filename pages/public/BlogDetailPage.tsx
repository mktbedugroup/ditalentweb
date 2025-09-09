import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const { useParams, Link } = ReactRouterDOM;
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { api } from '../../services/api';
import type { BlogPost } from '../../types';
import { useI18n } from '../../contexts/I18nContext';

const BlogDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, t_dynamic } = useI18n();

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      setLoading(true);
      setError(null);
      try {
        const postData = await api.getBlogPostById(postId);
        if (postData) {
          setPost(postData);
        } else {
          setError(t('blogDetail.postNotFound'));
        }
      } catch (e) {
        setError(t('blogDetail.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [postId, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t('blogDetail.loading')}</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center bg-white p-10 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-red-600">{t('blogDetail.errorTitle')}</h2>
            <p className="mt-4 text-gray-600">{error || t('blogDetail.postNotFound')}</p>
            <Link to="/blog">
              <Button className="mt-6">{t('blogDetail.backToBlog')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="bg-white shadow-lg rounded-lg overflow-hidden">
                {post.imageUrl && <img className="w-full h-96 object-cover" src={post.imageUrl} alt={t_dynamic(post.title)} />}
                <div className="p-8">
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">{t_dynamic(post.title)}</h1>
                    <p className="mt-4 text-md text-gray-500">
                        {t('blog.by')} <span className="font-semibold text-gray-700">{t_dynamic(post.author)}</span> {t('blogDetail.on')} {new Date(post.publishedDate).toLocaleDateString()}
                    </p>
                    <div className="mt-8 prose lg:prose-xl max-w-none text-gray-700 whitespace-pre-wrap">
                        {t_dynamic(post.content)}
                    </div>
                </div>
            </article>
            <div className="text-center mt-8">
                <Link to="/blog">
                    <Button variant="secondary">{t('blogDetail.backToAllPosts')}</Button>
                </Link>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;