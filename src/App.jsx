import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, Users, Image, Menu, X, AlertCircle } from 'lucide-react';

const API_BASE = 'https://cakung-barat-server-1065513777845.asia-southeast1.run.app';

function App() {
  const [currentPage, setCurrentPage] = useState('gallery');
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState('');
  
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    excerpt: '',
    files: []
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    position: '',
    file: null
  });

  const [editingPosting, setEditingPosting] = useState(null);

  useEffect(() => {
    fetchPostings();
  }, [currentPage]);

  const fetchPostings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/postings`);
      if (!response.ok) throw new Error('Gagal mengambil data');
      const data = await response.json();
      
      const category = currentPage === 'gallery' ? 'gallery' : 'profile';
      const filtered = data.filter(post => post.category && post.category.includes(category));
      setPostings(filtered);
    } catch (error) {
      console.error('Error fetching postings:', error);
      setError('Gagal mengambil data dari server');
    }
    setLoading(false);
  };

  const uploadAssets = async (files) => {
    const uploadedAssets = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('description', '');

      try {
        const response = await fetch(`${API_BASE}/api/assets`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Gagal upload asset');
        const asset = await response.json();
        uploadedAssets.push(asset.id);
      } catch (error) {
        console.error('Error uploading asset:', error);
        throw error;
      }
    }
    
    return uploadedAssets;
  };

  const createGallery = async () => {
    if (!galleryForm.title || !galleryForm.excerpt || galleryForm.files.length === 0) {
      setError('Semua field harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const assetIds = await uploadAssets(galleryForm.files);
      
      const posting = {
        category: ['gallery'],
        title: [galleryForm.title],
        excerpt: [galleryForm.excerpt],
        date: new Date().toISOString(),
        img: [],
        asset_ids: assetIds
      };

      const response = await fetch(`${API_BASE}/api/postings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posting)
      });

      if (!response.ok) throw new Error('Gagal membuat posting');
      
      setGalleryForm({ title: '', excerpt: '', files: [] });
      document.getElementById('galleryFileInput').value = '';
      fetchPostings();
    } catch (error) {
      console.error('Error creating gallery:', error);
      setError('Gagal membuat galeri: ' + error.message);
    }
    setLoading(false);
  };

  const createProfile = async () => {
    if (!profileForm.name || !profileForm.position || !profileForm.file) {
      setError('Semua field harus diisi');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const assetIds = await uploadAssets([profileForm.file]);
      
      const posting = {
        category: ['profile'],
        title: [profileForm.name],
        excerpt: [profileForm.position],
        date: new Date().toISOString(),
        img: [],
        asset_ids: assetIds
      };

      const response = await fetch(`${API_BASE}/api/postings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posting)
      });

      if (!response.ok) throw new Error('Gagal membuat posting');
      
      setProfileForm({ name: '', position: '', file: null });
      document.getElementById('profileFileInput').value = '';
      fetchPostings();
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Gagal membuat profile: ' + error.message);
    }
    setLoading(false);
  };

  const updatePosting = async () => {
    if (!editingPosting) return;

    setLoading(true);
    setError('');
    
    try {
      let assetIds = editingPosting.asset_ids || [];
      
      if (editingPosting.newFile) {
        const newAssetIds = await uploadAssets([editingPosting.newFile]);
        assetIds = [...assetIds, ...newAssetIds];
      }

      const posting = {
        category: editingPosting.category,
        title: [editingPosting.title],
        excerpt: [editingPosting.excerpt],
        date: editingPosting.date,
        img: editingPosting.img || [],
        asset_ids: assetIds
      };

      const response = await fetch(`${API_BASE}/api/postings/${editingPosting.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posting)
      });

      if (!response.ok) throw new Error('Gagal update posting');
      
      setEditingPosting(null);
      fetchPostings();
    } catch (error) {
      console.error('Error updating posting:', error);
      setError('Gagal update: ' + error.message);
    }
    setLoading(false);
  };

  const deletePosting = async (id) => {
    if (!confirm('Hapus posting ini?')) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/postings/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Gagal hapus posting');
      fetchPostings();
    } catch (error) {
      console.error('Error deleting posting:', error);
      setError('Gagal hapus: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-blue-900 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-8">Admin Cakung Barat</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentPage('gallery')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                currentPage === 'gallery' ? 'bg-blue-700' : 'hover:bg-blue-800'
              }`}
            >
              <Image size={20} />
              <span>Galeri</span>
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
                currentPage === 'profile' ? 'bg-blue-700' : 'hover:bg-blue-800'
              }`}
            >
              <Users size={20} />
              <span>Struktur Organisasi</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl font-semibold">
            {currentPage === 'gallery' ? 'Manajemen Galeri' : 'Manajemen Struktur Organisasi'}
          </h2>
          <div className="w-10"></div>
        </header>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {currentPage === 'gallery' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Tambah Galeri Baru</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Judul Kegiatan *</label>
                    <input
                      type="text"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({...galleryForm, title: e.target.value})}
                      placeholder="Contoh: Kerja Bakti RW 05"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deskripsi Kegiatan *</label>
                    <textarea
                      value={galleryForm.excerpt}
                      onChange={(e) => setGalleryForm({...galleryForm, excerpt: e.target.value})}
                      placeholder="Deskripsi singkat tentang kegiatan"
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Foto Kegiatan (Multiple) *</label>
                    <input
                      id="galleryFileInput"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setGalleryForm({...galleryForm, files: [...e.target.files]})}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {galleryForm.files.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">{galleryForm.files.length} foto dipilih</p>
                    )}
                  </div>
                  <button
                    onClick={createGallery}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    <Upload size={18} />
                    <span>{loading ? 'Menyimpan...' : 'Tambah Galeri'}</span>
                  </button>
                </div>
              </div>

              {editingPosting && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Edit Galeri</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Judul Kegiatan</label>
                      <input
                        type="text"
                        value={editingPosting.title}
                        onChange={(e) => setEditingPosting({...editingPosting, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Deskripsi</label>
                      <textarea
                        value={editingPosting.excerpt}
                        onChange={(e) => setEditingPosting({...editingPosting, excerpt: e.target.value})}
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tambah Foto Baru (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingPosting({...editingPosting, newFile: e.target.files[0]})}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={updatePosting}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        onClick={() => setEditingPosting(null)}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Daftar Galeri</h3>
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Memuat data...</p>
                ) : postings.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">Belum ada galeri</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {postings.map((posting) => (
                      <div key={posting.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                        {posting.asset_ids && posting.asset_ids.length > 0 && (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm">{posting.asset_ids.length} foto</span>
                          </div>
                        )}
                        <div className="p-4">
                          <h4 className="font-semibold text-lg mb-2">{posting.title ? posting.title[0] : 'Tanpa Judul'}</h4>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{posting.excerpt ? posting.excerpt[0] : ''}</p>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingPosting({
                                id: posting.id,
                                title: posting.title ? posting.title[0] : '',
                                excerpt: posting.excerpt ? posting.excerpt[0] : '',
                                category: posting.category,
                                date: posting.date,
                                img: posting.img,
                                asset_ids: posting.asset_ids
                              })}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={16} />
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              onClick={() => deletePosting(posting.id)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                              <span className="text-sm">Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Tambah Anggota Organisasi</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama *</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      placeholder="Nama lengkap"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Jabatan *</label>
                    <input
                      type="text"
                      value={profileForm.position}
                      onChange={(e) => setProfileForm({...profileForm, position: e.target.value})}
                      placeholder="Contoh: Lurah / Sekretaris"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Foto *</label>
                    <input
                      id="profileFileInput"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfileForm({...profileForm, file: e.target.files[0]})}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    onClick={createProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                  >
                    <Upload size={18} />
                    <span>{loading ? 'Menyimpan...' : 'Tambah Anggota'}</span>
                  </button>
                </div>
              </div>

              {editingPosting && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Edit Anggota</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nama</label>
                      <input
                        type="text"
                        value={editingPosting.title}
                        onChange={(e) => setEditingPosting({...editingPosting, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Jabatan</label>
                      <input
                        type="text"
                        value={editingPosting.excerpt}
                        onChange={(e) => setEditingPosting({...editingPosting, excerpt: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Foto Baru (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditingPosting({...editingPosting, newFile: e.target.files[0]})}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={updatePosting}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button
                        onClick={() => setEditingPosting(null)}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Daftar Anggota Organisasi</h3>
                {loading ? (
                  <p className="text-center py-8 text-gray-500">Memuat data...</p>
                ) : postings.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">Belum ada anggota</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {postings.map((posting) => (
                      <div key={posting.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Users className="text-gray-400" size={48} />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-center">{posting.title ? posting.title[0] : 'Tanpa Nama'}</h4>
                          <p className="text-sm text-gray-600 text-center mb-3">{posting.excerpt ? posting.excerpt[0] : ''}</p>
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => setEditingPosting({
                                id: posting.id,
                                title: posting.title ? posting.title[0] : '',
                                excerpt: posting.excerpt ? posting.excerpt[0] : '',
                                category: posting.category,
                                date: posting.date,
                                img: posting.img,
                                asset_ids: posting.asset_ids
                              })}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={16} />
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              onClick={() => deletePosting(posting.id)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                              <span className="text-sm">Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;