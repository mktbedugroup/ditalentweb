import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { api } from '../../services/api';
import type { BlogPost } from '../../types';
import * as ReactRouterDOM from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
const { Link } = ReactRouterDOM;

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    const { t, t_dynamic } = useI18n();
    return (
        <Link to={`/blog/${post.id}`} className="block group">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {post.imageUrl && <img src={post.imageUrl} alt={t_dynamic(post.title)} className="h-48 w-full object-cover" />}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-secondary transition-colors">{t_dynamic(post.title)}</h3>
                    <p className="mt-2 text-sm text-gray-500">{t('blog.by')} {t_dynamic(post.author)} &bull; {new Date(post.publishedDate).toLocaleDateString()}</p>
                    <p className="mt-3 text-gray-700 line-clamp-3">{t_dynamic(post.content)}</p>
                </div>
            </div>
        </Link>
    );
};


const BlogPage: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await api.getBlogPosts();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch blog posts", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">{t('blog.title')}</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            {t('blog.subtitle')}
          </p>
        </div>
        
        {loading ? (
             <p className="text-center">{t('blog.loading')}</p>
        ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map(post => (
                    <BlogCard key={post.id} post={post} />
                ))}
            </div>
        ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-lg text-gray-600">{t('blog.noPosts')}</p>
            </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;