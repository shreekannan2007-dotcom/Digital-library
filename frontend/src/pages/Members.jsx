import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';

const Members = ({ showNotification }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const initialForm = { name: '', email: '', phone: '', address: '' };
  const [formData, setFormData] = useState(initialForm);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      let url = '/members/?';
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(url);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to fetch members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/members/', formData);
      showNotification('success', 'Library member added successfully!');
      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchMembers();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.email?.[0] || 'Failed to add member.';
      showNotification('error', errMsg);
    }
  };

  const handleEditOpen = (member) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/members/${selectedMember.id}/`, formData);
      showNotification('success', 'Member details updated successfully!');
      setIsEditModalOpen(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to update member.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove member "${name}"?`)) {
      try {
        await api.delete(`/members/${id}/`);
        showNotification('success', 'Member deleted.');
        fetchMembers();
      } catch (err) {
        console.error(err);
        showNotification('error', 'Cannot delete member with active borrow records.');
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title"><Users size={28} color="#6366f1" /> Member Management</h1>
          <p className="page-subtitle">Register and manage library patrons and active borrowers</p>
        </div>
        <button onClick={() => { setFormData(initialForm); setIsAddModalOpen(true); }} className="btn btn-primary">
          <Plus size={18} /> Add New Member
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search members by Name, Email, Phone, Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Members...</div>
        ) : members.length === 0 ? (
          <div className="empty-state">No library members found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Contact Info</th>
                  <th>Address</th>
                  <th>Active Borrows</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>MEM-{member.id}</td>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{member.name}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={12} /> {member.email}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                        <Phone size={12} /> {member.phone}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={12} color="#94a3b8" /> {member.address}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${member.active_borrows_count > 0 ? 'warning' : 'secondary'}`}>
                        {member.active_borrows_count} Active
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditOpen(member)} className="btn btn-secondary btn-sm" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(member.id, member.name)} className="btn btn-danger btn-sm" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
        title={isAddModalOpen ? "Register New Member" : "Edit Member"}
      >
        <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea name="address" className="form-control" value={formData.address} onChange={handleInputChange} required />
          </div>

          <div className="modal-footer" style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{isAddModalOpen ? "Register Member" : "Update Member"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
