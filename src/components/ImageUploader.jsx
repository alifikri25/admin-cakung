import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';

export default function ImageUploader({ images, onChange, onGenerateAI, isGenerating }) {
    const [previews, setPreviews] = useState([]);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        addFiles(files);
    };

    const addFiles = (files) => {
        const newImages = [...images, ...files];
        onChange(newImages);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => [...prev, { file, url: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleGenerateAI = () => {
        if (onGenerateAI && previews.length > 0) {
            onGenerateAI(previews[0]);
        }
    };

    return (
        <div>
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer bg-white dark:bg-gray-800"
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-gray-600 dark:text-gray-300">
                        <p className="text-lg font-medium">Click or drag images here</p>
                        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Support for multiple images</p>
                    </div>
                </label>
            </div>

            {previews.length > 0 && (
                <>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={preview.url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {onGenerateAI && (
                        <button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={isGenerating}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-purple-500/30"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Generating with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    Generate Judul & Deskripsi dengan AI
                                </>
                            )}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

