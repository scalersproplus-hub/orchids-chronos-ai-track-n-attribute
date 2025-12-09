import React, { useState, useEffect } from 'react';
import { Star, Plus, X, ChevronDown, Filter, Bookmark, Clock, Trash2, Edit2, Check } from 'lucide-react';
import { SavedView } from '../../types';
import { useApp } from '../../contexts/AppContext';

interface SavedViewsProps {
  currentFilters: {
    platform: 'All' | 'Facebook' | 'Google' | 'TikTok';
    dateRange: { start: Date | null; end: Date | null };
    status?: 'Active' | 'Paused' | 'All';
  };
  onApplyView: (filters: SavedView['filters']) => void;
}

const STORAGE_KEY = 'chronos_saved_views';

const DEFAULT_VIEWS: SavedView[] = [
  {
    id: 'default_1',
    name: 'Q4 Facebook High Spenders',
    filters: {
      platform: 'Facebook',
      dateRange: { start: '2024-10-01', end: '2024-12-31' },
      status: 'Active',
      minSpend: 1000
    },
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default_2',
    name: 'Google Top Performers',
    filters: {
      platform: 'Google',
      dateRange: { start: '2024-11-01', end: '2024-12-31' },
      minRoas: 2.0
    },
    isFavorite: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default_3',
    name: 'TikTok This Month',
    filters: {
      platform: 'TikTok',
      dateRange: { 
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      }
    },
    isFavorite: false,
    createdAt: new Date().toISOString()
  }
];

export const SavedViews: React.FC<SavedViewsProps> = ({ currentFilters, onApplyView }) => {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const { addToast } = useApp();

  // Load saved views from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSavedViews(JSON.parse(stored));
    } else {
      setSavedViews(DEFAULT_VIEWS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VIEWS));
    }
  }, []);

  // Save to localStorage when views change
  const persistViews = (views: SavedView[]) => {
    setSavedViews(views);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  };

  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) return;

    const newView: SavedView = {
      id: `view_${Date.now()}`,
      name: newViewName.trim(),
      filters: {
        platform: currentFilters.platform,
        dateRange: {
          start: currentFilters.dateRange.start?.toISOString().split('T')[0] || '',
          end: currentFilters.dateRange.end?.toISOString().split('T')[0] || ''
        },
        status: currentFilters.status
      },
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    persistViews([...savedViews, newView]);
    setNewViewName('');
    setIsCreateModalOpen(false);
    addToast({ type: 'success', message: `View "${newViewName}" saved successfully` });
  };

  const handleApplyView = (view: SavedView) => {
    const updatedViews = savedViews.map(v => 
      v.id === view.id ? { ...v, lastUsedAt: new Date().toISOString() } : v
    );
    persistViews(updatedViews);
    onApplyView(view.filters);
    setIsDropdownOpen(false);
    addToast({ type: 'info', message: `Applied view: ${view.name}` });
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedViews = savedViews.map(v =>
      v.id === id ? { ...v, isFavorite: !v.isFavorite } : v
    );
    persistViews(updatedViews);
  };

  const deleteView = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const view = savedViews.find(v => v.id === id);
    const updatedViews = savedViews.filter(v => v.id !== id);
    persistViews(updatedViews);
    addToast({ type: 'success', message: `View "${view?.name}" deleted` });
  };

  const startEditing = (view: SavedView, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(view.id);
    setEditName(view.name);
  };

  const saveEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editName.trim()) return;
    const updatedViews = savedViews.map(v =>
      v.id === id ? { ...v, name: editName.trim() } : v
    );
    persistViews(updatedViews);
    setEditingId(null);
    setEditName('');
  };

  const favoriteViews = savedViews.filter(v => v.isFavorite);
  const recentViews = [...savedViews]
    .filter(v => v.lastUsedAt)
    .sort((a, b) => new Date(b.lastUsedAt!).getTime() - new Date(a.lastUsedAt!).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Favorites Bar */}
      {favoriteViews.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Star className="w-3 h-3" /> Quick Views:
          </span>
          {favoriteViews.map(view => (
            <button
              key={view.id}
              onClick={() => handleApplyView(view)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-chronos-900 border border-chronos-700 rounded-full text-gray-300 hover:bg-chronos-800 hover:border-chronos-600 hover:text-white transition-all group"
            >
              <Bookmark className="w-3 h-3 text-chronos-400" />
              <span>{view.name}</span>
              <button
                onClick={(e) => toggleFavorite(view.id, e)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-gray-500 hover:text-white" />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Main Dropdown & Save Button */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-chronos-900 border border-chronos-800 rounded-lg text-sm text-gray-300 hover:border-chronos-600 hover:text-white transition-all"
          >
            <Filter className="w-4 h-4" />
            <span>Saved Views</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-2 w-80 bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Recent Views */}
                {recentViews.length > 0 && (
                  <div className="p-2 border-b border-chronos-800">
                    <div className="px-2 py-1 text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Recently Used
                    </div>
                    {recentViews.map(view => (
                      <ViewItem
                        key={view.id}
                        view={view}
                        isEditing={editingId === view.id}
                        editName={editName}
                        setEditName={setEditName}
                        onApply={handleApplyView}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteView}
                        onStartEdit={startEditing}
                        onSaveEdit={saveEdit}
                      />
                    ))}
                  </div>
                )}

                {/* All Views */}
                <div className="p-2 max-h-64 overflow-y-auto">
                  <div className="px-2 py-1 text-xs text-gray-500 font-medium flex items-center gap-1">
                    <Bookmark className="w-3 h-3" /> All Saved Views
                  </div>
                  {savedViews.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-gray-500 text-center">No saved views yet</p>
                  ) : (
                    savedViews.map(view => (
                      <ViewItem
                        key={view.id}
                        view={view}
                        isEditing={editingId === view.id}
                        editName={editName}
                        setEditName={setEditName}
                        onApply={handleApplyView}
                        onToggleFavorite={toggleFavorite}
                        onDelete={deleteView}
                        onStartEdit={startEditing}
                        onSaveEdit={saveEdit}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-chronos-500/20 border border-chronos-500/30 rounded-lg text-sm text-chronos-400 hover:bg-chronos-500/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Save View</span>
        </button>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setIsCreateModalOpen(false)}>
          <div className="bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-chronos-800">
              <h3 className="font-semibold text-white">Save Current View</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-chronos-800 rounded transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">View Name</label>
                <input
                  type="text"
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                  placeholder="e.g., Q4 Facebook High Spenders"
                  className="w-full px-3 py-2 bg-chronos-950 border border-chronos-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-chronos-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCurrentView()}
                />
              </div>
              <div className="bg-chronos-950 border border-chronos-800 rounded-lg p-3">
                <h4 className="text-xs text-gray-500 mb-2">Current Filters</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Platform:</span>
                    <span className="text-white">{currentFilters.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date Range:</span>
                    <span className="text-white">
                      {currentFilters.dateRange.start?.toLocaleDateString() || 'Any'} - {currentFilters.dateRange.end?.toLocaleDateString() || 'Any'}
                    </span>
                  </div>
                  {currentFilters.status && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-white">{currentFilters.status}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-chronos-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrentView}
                disabled={!newViewName.trim()}
                className="px-4 py-2 text-sm bg-chronos-500 text-white rounded-lg hover:bg-chronos-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ViewItem subcomponent
const ViewItem: React.FC<{
  view: SavedView;
  isEditing: boolean;
  editName: string;
  setEditName: (name: string) => void;
  onApply: (view: SavedView) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onStartEdit: (view: SavedView, e: React.MouseEvent) => void;
  onSaveEdit: (id: string, e: React.MouseEvent) => void;
}> = ({ view, isEditing, editName, setEditName, onApply, onToggleFavorite, onDelete, onStartEdit, onSaveEdit }) => (
  <div
    onClick={() => !isEditing && onApply(view)}
    className="flex items-center justify-between p-2 rounded-lg hover:bg-chronos-800 cursor-pointer group"
  >
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <button onClick={(e) => onToggleFavorite(view.id, e)} className="flex-shrink-0">
        <Star className={`w-4 h-4 ${view.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`} />
      </button>
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 px-2 py-1 bg-chronos-950 border border-chronos-700 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-chronos-500"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(view.id, e as unknown as React.MouseEvent)}
        />
      ) : (
        <span className="text-sm text-gray-300 truncate">{view.name}</span>
      )}
    </div>
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {isEditing ? (
        <button onClick={(e) => onSaveEdit(view.id, e)} className="p-1 hover:bg-chronos-700 rounded">
          <Check className="w-3.5 h-3.5 text-green-400" />
        </button>
      ) : (
        <>
          <button onClick={(e) => onStartEdit(view, e)} className="p-1 hover:bg-chronos-700 rounded">
            <Edit2 className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <button onClick={(e) => onDelete(view.id, e)} className="p-1 hover:bg-chronos-700 rounded">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </>
      )}
    </div>
  </div>
);
