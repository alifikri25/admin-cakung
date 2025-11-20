import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postingService } from '../services/posting.service';
import { assetService } from '../services/asset.service';
import MarkdownEditor from '../components/MarkdownEditor';
import ImageUploader from '../components/ImageUploader';
import { Save, X, Plus } from 'lucide-react';
import { useCache } from '../contexts/CacheContext';

export default function PostForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { invalidatePattern } = useCache();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        excerpt: '',
        date: new Date().toISOString().split('T')[0],
    });

    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([
        'Berita',
        'Pengumuman',
        'Acara',
        'Informasi'
    ]);
    const [newCategory, setNewCategory] = useState('');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            loadPost();
        }
    }, [id]);

    const loadPost = async () => {
        try {
            const post = await postingService.getPostingById(id);
            setFormData({
                title: post.title,
                category: post.category,
                excerpt: post.excerpt,
                date: post.date,
            });
        } catch (error) {
            console.error('Failed to load post:', error);
            alert('Failed to load post');
        }
    };

    const handleAddCategory = () => {
        if (newCategory && !categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
            setFormData({ ...formData, category: newCategory });
            setNewCategory('');
            setShowAddCategory(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let post;
            if (isEdit) {
                post = await postingService.updatePosting(id, formData);
            } else {
                post = await postingService.createPosting(formData);
            }

            // Upload images if any
            if (images.length > 0) {
                await assetService.uploadAssets(images, post.id);
            }

            // Invalidate cache after create/update
            invalidatePattern('posts');

            navigate('/');
        } catch (error) {
            console.error('Failed to save post:', error);
            alert('Failed to save post: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                        {isEdit ? 'Edit Post' : 'Create New Post'}
                    </h1>
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                    {isEdit ? 'Update your post details below' : 'Fill in the details to create a new post'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 lg:p-6 space-y-6 border border-gray-100 dark:border-gray-700">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Enter post title"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
                        </label>
                        <div className="flex gap-2">
                            <select
                                required
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setShowAddCategory(!showAddCategory)}
                                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        {showAddCategory && (
                            <div className="flex gap-2 mt-2">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="New category name"
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Excerpt (Markdown)
                    </label>
                    <MarkdownEditor
                        value={formData.excerpt}
                        onChange={(value) => setFormData({ ...formData, excerpt: value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Images
                    </label>
                    <ImageUploader images={images} onChange={setImages} />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 dark:hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
