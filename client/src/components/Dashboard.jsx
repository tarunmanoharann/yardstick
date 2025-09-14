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
    
    // Basic validation
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required');
      return;
    }

    try {
      await noteService.createNote({ title: title.trim(), content: content.trim() });
      setTitle('');
      setContent('');
      setError('');
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
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
              <p className="text-slate-600 text-lg">Welcome back, {user?.email}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Organization</span>
                  <span className="font-semibold text-slate-800">{user?.tenant.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Plan</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isProPlan 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isProPlan ? '✦ Pro' : 'Free'}
                  </span>
                </div>
                {!isProPlan && (
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-200">
                    <span className="text-sm font-medium text-slate-600">Usage</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-800">{noteCount}/3</span>
                      {limitReached && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Limit Reached
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {upgradeMessage && (
          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-6 rounded-r-xl mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-emerald-800 font-medium">{upgradeMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-r-xl mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade to Pro section (Admin only) */}
        {isAdmin && !isProPlan && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 mr-3 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-2xl font-bold">Upgrade to Pro</h3>
                </div>
                <p className="text-indigo-100 mb-6 text-lg">Unlock unlimited notes, advanced collaboration features, and priority support for your entire team.</p>
                <button 
                  onClick={handleUpgradeToPro}
                  className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-xl"
                >
                  Upgrade Now
                </button>
              </div>
              <div className="hidden lg:block text-indigo-200 opacity-30">
                <svg className="w-32 h-32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Create Note Form */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Create Note</h2>
              </div>
              
              {limitReached && !isProPlan ? (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6 rounded-xl">
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-2 rounded-lg mr-4">
                      <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-800 mb-2">Plan Limit Reached</h4>
                      <p className="text-amber-700 mb-4">You've reached your free plan limit of 3 notes. Upgrade to Pro for unlimited notes.</p>
                      {isAdmin && (
                        <button 
                          onClick={handleUpgradeToPro}
                          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold py-2 px-6 rounded-lg"
                        >
                          Upgrade to Pro
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-3">Note Title</label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-semibold text-slate-700 mb-3">Note Content</label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your note content here..."
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white resize-none text-slate-800 placeholder-slate-400"
                    />
                  </div>
                  <button 
                    onClick={handleCreateNote}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Note
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes List */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-slate-100 p-2 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Your Notes:</h2>
              </div>
              <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-semibold">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </div>
            </div>
            
            {isLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                  <p className="text-slate-600 mt-4 font-medium">Loading your notes...</p>
                </div>
              </div>
            ) : notes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12">
                <div className="text-center">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No notes yet</h3>
                  <p className="text-slate-500">Create your first note to get started organizing your thoughts.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note, index) => (
                  <div 
                    key={note._id} 
                    className="bg-white rounded-2xl border border-slate-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {note.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed line-clamp-3">{note.content}</p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                        <div className="flex items-center text-sm text-slate-500">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(note.createdAt).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="bg-red-50 text-red-600 py-2 px-4 rounded-lg flex items-center font-medium"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;