import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Save, ChevronDown, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { API_URL } from '../config';
import "./StrukturOrganisasi.css";

// Card dimensions
const CARD_WIDTH = 200;
const CARD_HEIGHT = 100;
const HORIZONTAL_GAP = 40;
const VERTICAL_GAP = 80;

/* ================= MEMBER CARD ================= */
const MemberCard = ({ member, onEdit, onAddChild, onDelete, isSelected }) => {
    const getRoleColor = (role) => {
        switch (role) {
            case 'lurah': return '#3B82F6';
            case 'sekretaris': return '#10B981';
            case 'kasi': return '#F59E0B';
            case 'bendahara':
            case 'pengurus': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    return (
        <div
            className={`member-card ${isSelected ? 'selected' : ''}`}
            style={{
                left: `${member.x}px`,
                top: `${member.y}px`,
                width: `${CARD_WIDTH}px`,
                minHeight: `${CARD_HEIGHT}px`,
                borderLeftColor: getRoleColor(member.role),
            }}
        >
            <div className="card-content">
                <div className="card-photo">
                    {member.photo && member.photo !== 'foto' ? (
                        <img src={member.photo} alt={member.name} />
                    ) : (
                        <span className="photo-placeholder">FOTO</span>
                    )}
                </div>
                <div className="card-info">
                    <div className="card-name">{member.name || "-"}</div>
                    <div className="card-position">{member.position}</div>
                </div>
            </div>

            <div className="card-actions">
                <button className="btn-action btn-edit" onClick={() => onEdit(member)} title="Edit">
                    <Edit2 size={14} />
                </button>
                <button className="btn-action btn-add-child" onClick={() => onAddChild(member.id)} title="Tambah Bawahan">
                    <Plus size={14} />
                </button>
                <button className="btn-action btn-delete" onClick={() => onDelete(member.id)} title="Hapus">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

/* ================= CONNECTOR LINES ================= */
const ConnectorLines = ({ members }) => {
    const getPoints = (member) => ({
        top: { x: member.x + CARD_WIDTH / 2, y: member.y },
        bottom: { x: member.x + CARD_WIDTH / 2, y: member.y + CARD_HEIGHT },
    });

    return (
        <svg className="connector-svg">
            {members.map(parent => {
                const children = members.filter(m => m.parent_id === parent.id);
                if (children.length === 0) return null;

                const pPts = getPoints(parent);

                return children.map(child => {
                    const cPts = getPoints(child);
                    const midY = pPts.bottom.y + (cPts.top.y - pPts.bottom.y) / 2;

                    return (
                        <path
                            key={`${parent.id}-${child.id}`}
                            d={`M ${pPts.bottom.x} ${pPts.bottom.y} V ${midY} H ${cPts.top.x} V ${cPts.top.y}`}
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            className="connector-line"
                        />
                    );
                });
            })}
        </svg>
    );
};

/* ================= PARENT DROPDOWN ================= */
const ParentDropdown = ({ members, selectedParentId, onChange, currentMemberId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Build tree structure for display
    const buildHierarchy = (parentId = null, depth = 0) => {
        return members
            .filter(m => m.parent_id === parentId && m.id !== currentMemberId)
            .sort((a, b) => a.id - b.id)
            .flatMap(m => [
                { ...m, depth },
                ...buildHierarchy(m.id, depth + 1)
            ]);
    };

    const hierarchy = buildHierarchy();
    const selectedMember = members.find(m => m.id === selectedParentId);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="parent-dropdown" ref={dropdownRef}>
            <button
                type="button"
                className="dropdown-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>
                    {selectedParentId === null
                        ? "(Tanpa Atasan - Root)"
                        : selectedMember
                            ? `${selectedMember.position} - ${selectedMember.name || 'Kosong'}`
                            : "Pilih Atasan"}
                </span>
                <ChevronDown size={16} className={isOpen ? 'rotate' : ''} />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div
                        className={`dropdown-item ${selectedParentId === null ? 'active' : ''}`}
                        onClick={() => { onChange(null); setIsOpen(false); }}
                    >
                        <span className="item-label">(Tanpa Atasan - Root)</span>
                    </div>
                    {hierarchy.map(m => (
                        <div
                            key={m.id}
                            className={`dropdown-item ${selectedParentId === m.id ? 'active' : ''}`}
                            style={{ paddingLeft: `${12 + m.depth * 20}px` }}
                            onClick={() => { onChange(m.id); setIsOpen(false); }}
                        >
                            {m.depth > 0 && <span className="tree-indent">└─</span>}
                            <span className="item-label">{m.position} - {m.name || 'Kosong'}</span>
                            <span className="item-level">Level {m.level}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ================= MODAL ================= */
const MemberModal = ({
    isOpen,
    onClose,
    onSave,
    onDelete,
    member,
    members,
    title,
    defaultParentId
}) => {
    const [formData, setFormData] = useState({
        name: "",
        position: "",
        photo: "",
        parent_id: null,
        role: "staf",
    });

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || "",
                position: member.position || "",
                photo: member.photo || "",
                parent_id: member.parent_id,
                role: member.role || "staf",
            });
        } else {
            setFormData({
                name: "",
                position: "",
                photo: "",
                parent_id: defaultParentId || null,
                role: "staf",
            });
        }
    }, [member, defaultParentId]);

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
                } else if (width > maxSize) {
                    width = height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                setFormData(prev => ({ ...prev, photo: canvas.toDataURL("image/jpeg", 0.8) }));
            };
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        // Calculate level based on parent
        let level = 0;
        if (formData.parent_id !== null) {
            const parent = members.find(m => m.id === formData.parent_id);
            level = parent ? parent.level + 1 : 0;
        }

        onSave({
            ...formData,
            level,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Photo Upload */}
                    <div className="form-group photo-group">
                        <div className="photo-preview-wrapper">
                            {formData.photo ? (
                                <>
                                    <img src={formData.photo} alt="Preview" className="photo-preview" />
                                    <button
                                        type="button"
                                        className="btn-remove-photo"
                                        onClick={() => setFormData(prev => ({ ...prev, photo: "" }))}
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            ) : (
                                <span className="photo-placeholder">FOTO</span>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                    </div>

                    {/* Name */}
                    <div className="form-group">
                        <label>Nama</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nama lengkap"
                        />
                    </div>

                    {/* Position */}
                    <div className="form-group">
                        <label>Jabatan</label>
                        <input
                            type="text"
                            value={formData.position}
                            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                            placeholder="Jabatan/Posisi"
                        />
                    </div>

                    {/* Parent Selection */}
                    <div className="form-group">
                        <label>Atasan (Parent)</label>
                        <ParentDropdown
                            members={members}
                            selectedParentId={formData.parent_id}
                            onChange={(id) => setFormData(prev => ({ ...prev, parent_id: id }))}
                            currentMemberId={member?.id}
                        />
                    </div>

                    {/* Role */}
                    <div className="form-group">
                        <label>Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                        >
                            <option value="lurah">Lurah</option>
                            <option value="sekretaris">Sekretaris</option>
                            <option value="kasi">Kepala Seksi</option>
                            <option value="bendahara">Bendahara</option>
                            <option value="pengurus">Pengurus</option>
                            <option value="staf">Staf</option>
                        </select>
                    </div>
                </div>

                <div className="modal-footer">
                    {member && (
                        <button className="btn btn-danger" onClick={() => onDelete(member.id)}>
                            <Trash2 size={16} />
                            Hapus
                        </button>
                    )}
                    <div className="footer-right">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Batal
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            <Save size={16} />
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN COMPONENT ================= */
export default function StrukturOrganisasi() {
    const [members, setMembers] = useState([]);
    const [positionedMembers, setPositionedMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [editingMember, setEditingMember] = useState(null);
    const [defaultParentId, setDefaultParentId] = useState(null);

    // Calculate positions based on hierarchy
    const calculatePositions = useCallback((data) => {
        if (data.length === 0) return [];

        // Group by level
        const levelGroups = new Map();
        data.forEach(m => {
            const group = levelGroups.get(m.level) || [];
            group.push(m);
            levelGroups.set(m.level, group);
        });

        // Sort each group by parent_id then by id for consistent ordering
        levelGroups.forEach((group, level) => {
            group.sort((a, b) => {
                if (a.parent_id !== b.parent_id) {
                    return (a.parent_id || 0) - (b.parent_id || 0);
                }
                return a.id - b.id;
            });
        });

        const containerWidth = 1400;
        const positioned = [];

        // Process each level
        const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

        sortedLevels.forEach(level => {
            const group = levelGroups.get(level);
            const y = 50 + level * (CARD_HEIGHT + VERTICAL_GAP);
            const count = group.length;
            const totalWidth = count * CARD_WIDTH + (count - 1) * HORIZONTAL_GAP;
            const startX = (containerWidth - totalWidth) / 2;

            group.forEach((member, index) => {
                positioned.push({
                    ...member,
                    x: startX + index * (CARD_WIDTH + HORIZONTAL_GAP),
                    y: y,
                });
            });
        });

        return positioned;
    }, []);

    // Fetch data
    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/organization`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            setMembers(data);
            setPositionedMembers(calculatePositions(data));
            setError(null);
        } catch (err) {
            setError("Gagal memuat data struktur organisasi");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [calculatePositions]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // CRUD Operations
    const createMember = async (data) => {
        try {
            const response = await fetch(`${API_URL}/api/organization`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await fetchMembers();
            closeModal();
        } catch (err) {
            console.error("Create error:", err);
            alert("Gagal menambah data");
        }
    };

    const updateMember = async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/api/organization/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await fetchMembers();
            closeModal();
        } catch (err) {
            console.error("Update error:", err);
            alert("Gagal mengupdate data");
        }
    };

    const deleteMember = async (id) => {
        if (!window.confirm("Yakin ingin menghapus data ini?")) return;

        try {
            const response = await fetch(`${API_URL}/api/organization/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            await fetchMembers();
            closeModal();
        } catch (err) {
            console.error("Delete error:", err);
            alert("Gagal menghapus data");
        }
    };

    // Modal handlers
    const openCreateModal = (parentId = null) => {
        setEditingMember(null);
        setDefaultParentId(parentId);
        setModalTitle(parentId ? "Tambah Bawahan" : "Tambah Anggota Baru");
        setModalOpen(true);
    };

    const openEditModal = (member) => {
        setEditingMember(member);
        setDefaultParentId(null);
        setModalTitle("Edit Data");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingMember(null);
        setDefaultParentId(null);
    };

    const handleSave = (data) => {
        if (editingMember) {
            updateMember(editingMember.id, data);
        } else {
            createMember(data);
        }
    };

    // Calculate canvas size
    const maxY = positionedMembers.length > 0
        ? Math.max(...positionedMembers.map(m => m.y)) + CARD_HEIGHT + 100
        : 600;

    if (loading) {
        return (
            <div className="struktur-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Memuat struktur organisasi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="struktur-container">
                <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchMembers}>Coba Lagi</button>
                </div>
            </div>
        );
    }

    return (
        <div className="struktur-container">
            <div className="struktur-header">
                <h1>Struktur Organisasi</h1>
                <p>Kelurahan Cakung Barat</p>
            </div>

            <div className="canvas-wrapper">
                <TransformWrapper
                    initialScale={0.8}
                    minScale={0.3}
                    maxScale={2}
                    centerOnInit={true}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <div className="zoom-controls">
                                <button onClick={() => zoomIn()} title="Zoom In">
                                    <ZoomIn size={18} />
                                </button>
                                <button onClick={() => zoomOut()} title="Zoom Out">
                                    <ZoomOut size={18} />
                                </button>
                                <button onClick={() => resetTransform()} title="Reset">
                                    <RotateCcw size={18} />
                                </button>
                            </div>

                            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                                <div className="canvas" style={{ width: '1400px', height: `${maxY}px` }}>
                                    <ConnectorLines members={positionedMembers} />
                                    {positionedMembers.map(member => (
                                        <MemberCard
                                            key={member.id}
                                            member={member}
                                            onEdit={openEditModal}
                                            onAddChild={openCreateModal}
                                            onDelete={deleteMember}
                                        />
                                    ))}
                                </div>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </div>

            {/* Floating Add Button */}
            <button className="btn-floating" onClick={() => openCreateModal(null)}>
                <Plus size={24} />
                <span>Tambah Anggota</span>
            </button>

            {/* Modal */}
            <MemberModal
                isOpen={modalOpen}
                onClose={closeModal}
                onSave={handleSave}
                onDelete={deleteMember}
                member={editingMember}
                members={members}
                title={modalTitle}
                defaultParentId={defaultParentId}
            />
        </div>
    );
}
