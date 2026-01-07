import { HashRouter, Routes, Route } from 'react-router-dom';
import PostList from './pages/PostList';
import PostForm from './pages/PostForm';
import StrukturOrganisasi from './pages/StrukturOrganisasi';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PostList />} />
          <Route path="/posts/new" element={<PostForm />} />
          <Route path="/posts/edit/:id" element={<PostForm />} />
          <Route path="/struktur" element={<StrukturOrganisasi />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;