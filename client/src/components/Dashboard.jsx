import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { noteService, tenantService } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isProPlan, setIsProPlan] = useState(false);
  const [noteCount, setNoteCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');

  // Fetch notes
  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await noteService.getAllNotes();
      setNotes(response.data.notes);
      setIsProPlan(response.data.isProPlan);
      setNoteCount(response.data.noteCount);
      setLimitReached(response.data.noteCount >= 3 && !response.data.isProPlan);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create note
  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await noteService.createNote({ title, content });
      setTitle('');
      setContent('');
      fetchNotes();
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setLimitReached(true);
      }
      setError(err.response?.data?.message || 'Failed to create note');
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    try {
      await noteService.deleteNote(id);
      fetchNotes();
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  // Upgrade to Pro
  const handleUpgradeToPro = async () => {
    try {
      setUpgradeMessage('');
      await tenantService.upgradeToPro(user.tenant.slug);
      setIsProPlan(true);
      setLimitReached(false);
      setUpgradeMessage('Successfully upgraded to Pro plan!');
    } catch (err) {
      setError('Failed to upgrade subscription');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user?.email}</h2>
        <div className="tenant-info">
          <p>Tenant: {user?.tenant.name}</p>
          <p>Subscription: {isProPlan ? 'Pro' : 'Free'}</p>
          {!isProPlan && (
            <p className="note-limit">
              Notes: {noteCount}/3 {limitReached && '(Limit Reached)'}
            </p>
          )}
        </div>
      </div>

      {upgradeMessage && <div className="success-message">{upgradeMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Upgrade to Pro section (Admin only) */}
      {isAdmin && !isProPlan && (
        <div className="upgrade-section">
          <h3>Upgrade to Pro</h3>
          <p>Upgrade to Pro plan for unlimited notes.</p>
          <button onClick={handleUpgradeToPro}>Upgrade Now</button>
        </div>
      )}

      {/* Create Note Form */}
      <div className="create-note-section">
        <h3>Create New Note</h3>
        {limitReached && !isProPlan ? (
          <div className="limit-message">
            <p>You've reached the maximum number of notes for the Free plan.</p>
            {isAdmin ? (
              <button onClick={handleUpgradeToPro}>Upgrade to Pro</button>
            ) : (
              <p>Please ask your admin to upgrade to Pro plan.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleCreateNote}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Note title"
              />
            </div>
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Note content"
                rows="4"
              />
            </div>
            <button type="submit">Create Note</button>
          </form>
        )}
      </div>

      {/* Notes List */}
      <div className="notes-list">
        <h3>Your Notes</h3>
        {isLoading ? (
          <p>Loading notes...</p>
        ) : notes.length === 0 ? (
          <p>No notes yet. Create your first note above.</p>
        ) : (
          <div className="notes-grid">
            {notes.map((note) => (
              <div key={note._id} className="note-card">
                <h4>{note.title}</h4>
                <p>{note.content}</p>
                <div className="note-footer">
                  <small>
                    Created: {new Date(note.createdAt).toLocaleDateString()}
                  </small>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteNote(note._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;