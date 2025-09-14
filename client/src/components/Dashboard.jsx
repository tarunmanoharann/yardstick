import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { noteService, tenantService } from '../services/api';
import React from 'react';

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
    <div className="bg-white p-8 rounded-lg shadow-card border border-yellow-100">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2 border-yellow-200">
        <div>
          <h2 className="text-3xl font-bold text-amber-800 mb-1">Welcome back!</h2>
          <p className="text-amber-600">{user?.email}</p>
        </div>
        <div className="text-right bg-amber-50 p-4 rounded-lg border border-amber-200">
          <p className="mb-2 text-gray-700">
            <span className="text-sm text-amber-600">Tenant:</span> 
            <span className="font-semibold text-amber-800 ml-1">{user?.tenant.name}</span>
          </p>
          <p className="mb-2 text-gray-700">
            <span className="text-sm text-amber-600">Plan:</span> 
            <span className={`font-semibold ml-1 px-2 py-1 rounded text-xs ${
              isProPlan ? 'bg-amber-500 text-white' : 'bg-yellow-200 text-amber-800'
            }`}>
              {isProPlan ? 'Pro' : 'Free'}
            </span>
          </p>
          {!isProPlan && (
            <p className="text-red-600 font-medium">
              <span className="text-sm text-amber-600">Notes:</span> {noteCount}/3 
              {limitReached && <span className="ml-1 text-red-500">(Limit Reached)</span>}
            </p>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {upgradeMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {upgradeMessage}
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Upgrade to Pro section (Admin only) */}
      {isAdmin && !isProPlan && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl mb-8 border-l-4 border-amber-400 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-amber-800 mb-2 flex items-center">
                <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Upgrade to Pro
              </h3>
              <p className="text-amber-700 mb-4">Unlock unlimited notes and premium features for your team.</p>
              <button 
                onClick={handleUpgradeToPro}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                Upgrade Now
              </button>
            </div>
            <div className="text-amber-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Create Note Form */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-amber-800 mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create New Note
        </h3>
        
        {limitReached && !isProPlan ? (
          <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl mb-6 shadow-sm">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-800 font-medium mb-2">Free Plan Limit Reached</p>
                <p className="text-yellow-700 mb-4">You've reached the maximum of 3 notes for the Free plan.</p>
                {isAdmin ? (
                  <button 
                    onClick={handleUpgradeToPro}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                ) : (
                  <p className="text-yellow-700 italic">Please ask your admin to upgrade to the Pro plan.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 shadow-sm">
            <form onSubmit={handleCreateNote} className="space-y-6">
              <div>
                <label htmlFor="title" className="block mb-2 font-medium text-amber-800">Note Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter a descriptive title..."
                  className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="content" className="block mb-2 font-medium text-amber-800">Note Content</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="Write your note content here..."
                  rows="4"
                  className="w-full p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-colors resize-vertical"
                />
              </div>
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Note
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div>
        <h3 className="text-2xl font-semibold text-amber-800 mb-6 flex items-center justify-between">
          <span className="flex items-center">
            <svg className="w-6 h-6 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Your Notes
          </span>
          <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            <p className="text-amber-600 ml-3">Loading your notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-200">
            <svg className="w-16 h-16 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-amber-600 text-lg mb-2">No notes yet</p>
            <p className="text-amber-500">Create your first note using the form above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note._id} className="bg-white p-6 rounded-xl shadow-md border border-amber-100 hover:shadow-lg hover:border-amber-200 transition-all duration-200 transform hover:scale-105">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-amber-800 leading-tight">{note.title}</h4>
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{note.content}</p>
                <div className="flex justify-between items-center pt-4 border-t border-amber-100">
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    {new Date(note.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm py-1.5 px-3 rounded-lg transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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