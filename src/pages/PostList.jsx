import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postingService } from '../services/posting.service';
import { Edit, Trash2, Plus, Calendar, Tag } from 'lucide-react';
import { useCache } from '../contexts/CacheContext';

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getCached, setCached, invalidatePattern } = useCache();

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            // Try to get from cache first
            const cached = getCached('posts-list');
            if (cached) {
                setPosts(cached);
                setLoading(false);
                return;
            }

            // Fetch from API if no cache
            const data = await postingService.getAllPostings(1, 100);
            setPosts(data);

            // Cache the data for 5 minutes
            setCached('posts-list', data, 5 * 60 * 1000);
        } catch (error) {
            console.error('Failed to load posts:', error);
            alert('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await postingService.deletePosting(id);
            setPosts(posts.filter(p => p.id !== id));

            // Invalidate cache after delete
            invalidatePattern('posts');
        } catch (error) {
            console.error('Failed to delete post:', error);
            alert('Failed to delete post');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                            Posts Management
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all your blog posts</p>
                    </div>
                    <Link
                        to="/posts/new"
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-500/30 transition-all duration-200 font-medium"
                    >
                        <Plus size={20} />
                        Create New Post
                    </Link>
                </div>
            </div>

            {/* Posts Grid */}
            {posts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-700">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plus size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No posts yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first post!</p>
                        <Link
                            to="/posts/new"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Create First Post
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 lg:gap-6">
                    {posts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 dark:border-gray-700"
                        >
                            <div className="p-4 lg:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                <Tag size={16} />
                                                <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                                                    {post.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                <Calendar size={16} />
                                                <span>{new Date(post.date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex lg:flex-col gap-2">
                                        <Link
                                            to={`/posts/edit/${post.id}`}
                                            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
                                        >
                                            <Edit size={18} />
                                            <span className="lg:hidden">Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors font-medium"
                                        >
                                            <Trash2 size={18} />
                                            <span className="lg:hidden">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
