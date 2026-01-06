import { useEffect, useState, useRef } from "react";
import { Plus } from "lucide-react";
import "./StrukturAdmin.css";
import logo from "../assets/logo.png";

const API_URL =
  "https://cakung-barat-server-1065513777845.asia-southeast2.run.app/api/organization";

/* ================= NODE ================= */
const Node = ({ data, onEdit, onAdd }) => {
  return (
    <div className="node" onClick={onEdit}>
      <div className="photo">
        {data.photo ? <img src={data.photo} alt="" /> : <span className="photo-label">Foto</span>}
      </div>

      <div className="info">
        <div className="name">{data.name}</div>
        <div className="title">{data.position}</div>
      </div>

      <button
        className="btn-add"
        onClick={(e) => {
          e.stopPropagation();
          onAdd(data.id);
        }}
      >
        +
      </button>
    </div>
  );
};

/* ================= MODAL ================= */
const Modal = ({ title, data, onClose, onSave, onDelete }) => {
  const [name, setName] = useState(data?.name || "");
  const [position, setPosition] = useState(data?.position || "");
  const [photo, setPhoto] = useState(data?.photo || "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > width && height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        } else if (width > maxSize && width === height) {
          width = height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.8));
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>

        <div className="photo-upload-container">
          <div className="photo-preview-wrapper">
            {!photo && <span className="photo-label">Foto</span>}
            {photo && <img src={photo} alt="preview" className="photo-preview" />}
          </div>

          {photo && (
            <button type="button" className="btn-remove-photo" onClick={() => setPhoto("")}>
              ✕
            </button>
          )}

          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="modal-field">
          <label>Nama</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="modal-field">
          <label>Jabatan</label>
          <input value={position} onChange={(e) => setPosition(e.target.value)} />
        </div>

        <div className="modal-actions">
          {data && (
            <button className="btn-delete" onClick={onDelete}>
              Hapus
            </button>
          )}
          <button onClick={onClose}>Batal</button>
          <button onClick={() => onSave({ name, position, photo })}>Simpan</button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN ================= */
export default function StrukturAdmin() {
  const [flat, setFlat] = useState([]);
  const [tree, setTree] = useState([]);
  const [editNode, setEditNode] = useState(null);
  const [addParent, setAddParent] = useState(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const nodeRefs = useRef({});

  const buildTree = (data) => {
    const map = {};
    data.forEach((n) => (map[n.id] = { ...n, children: [] }));
    data.forEach((n) => {
      if (map[n.parent_id]) map[n.parent_id].children.push(map[n.id]);
    });
    return data.filter((n) => !map[n.parent_id]).map((n) => map[n.id]);
  };

  const getConnections = (nodes) => {
    const connections = [];
    const traverse = (node) => {
      node.children.forEach((child) => {
        connections.push({ parentId: node.id, childId: child.id });
        traverse(child);
      });
    };
    nodes.forEach(traverse);
    return connections;
  };

  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => {
        setFlat(data);
        setTree(buildTree(data));
      });
  }, []);

  const saveEdit = ({ name, position, photo }) => {
    fetch(`${API_URL}/${editNode.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, position, photo }),
    }).then(() => {
      const updated = flat.map((n) =>
        n.id === editNode.id ? { ...n, name, position, photo } : n
      );
      setFlat(updated);
      setTree(buildTree(updated));
      setEditNode(null);
    });
  };

  const deleteNode = (id) => {
    if (!window.confirm("Yakin hapus data ini?")) return;
    fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(() => {
      const updated = flat.filter((n) => n.id !== id);
      setFlat(updated);
      setTree(buildTree(updated));
      setEditNode(null);
    });
  };

  const saveAdd = ({ name, position, photo }, isRootNode = false) => {
    const parentId = isRootNode ? 0 : addParent;
    const parentNode = flat.find((n) => n.id === parentId);
    const level = parentNode ? parentNode.level + 1 : 1;
    const role = "user";

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        position,
        photo,
        parent_id: parentId,
        level,
        role,
      }),
    })
      .then(async (r) => {
        const text = await r.text();
        console.log("Server response:", text);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return JSON.parse(text);
      })
      .then((newNode) => {
        const updated = [...flat, newNode];
        setFlat(updated);
        setTree(buildTree(updated));
        setAddParent(null);
        setShowAddNew(false);
      })
      .catch((err) => {
        console.error("POST error:", err);
        alert("Gagal menambah data. Cek console untuk detail.");
      });
  };

  const renderTree = (n) => (
    <div
      key={n.id}
      className="tree-node"
      ref={(el) => {
        if (el) nodeRefs.current[n.id] = el;
      }}
    >
      <Node data={n} onEdit={() => setEditNode(n)} onAdd={(id) => setAddParent(id)} />
      {n.children.length > 0 && <div className="children">{n.children.map(renderTree)}</div>}
    </div>
  );

  const connections = getConnections(tree);

  return (
    <div className="container">
      <img src={logo} className="logo" />
      <h1>STRUKTUR ORGANISASI</h1>

      <svg className="lines-svg">
        {connections.map((conn, i) => {
          const parentEl = nodeRefs.current[conn.parentId];
          const childEl = nodeRefs.current[conn.childId];
          if (!parentEl || !childEl) return null;
          const pr = parentEl.getBoundingClientRect();
          const cr = childEl.getBoundingClientRect();
          return (
            <line
              key={i}
              x1={pr.left + pr.width / 2}
              y1={pr.top + pr.height / 2}
              x2={cr.left + cr.width / 2}
              y2={cr.top + cr.height / 2}
              stroke="#333"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      <div className="org-chart">{tree.map(renderTree)}</div>

      {/* Floating Add Button */}
      <button
        className="btn-add-new"
        onClick={() => setShowAddNew(true)}
        title="Tambah Anggota Baru"
      >
        <Plus size={24} />
        <span className="btn-add-new-text">Tambah Anggota</span>
      </button>

      {editNode && (
        <Modal
          title="Edit Data"
          data={editNode}
          onClose={() => setEditNode(null)}
          onSave={saveEdit}
          onDelete={() => deleteNode(editNode.id)}
        />
      )}

      {addParent && <Modal title="Tambah Anggota" onClose={() => setAddParent(null)} onSave={saveAdd} />}

      {showAddNew && (
        <Modal
          title="Tambah Anggota Baru"
          onClose={() => setShowAddNew(false)}
          onSave={(data) => saveAdd(data, true)}
        />
      )}
    </div>
  );
}