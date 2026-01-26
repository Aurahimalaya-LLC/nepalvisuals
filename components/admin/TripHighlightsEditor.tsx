import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TourHighlight, TourService } from '../../lib/services/tourService';
import { RichTextEditor } from '../common/RichTextEditor';
import MediaLibraryModal from '../common/MediaLibraryModal';

interface TripHighlightsEditorProps {
  tourId: string;
  highlights: TourHighlight[];
  onUpdate: () => void;
  itinerary?: { title: string; description: string | null }[];
}

interface SortableHighlightItemProps {
  highlight: TourHighlight; 
  onEdit: (h: TourHighlight) => void; 
  onDelete: (id: string) => void;
  onToggleVisibility: (h: TourHighlight) => void;
}

const SortableHighlightItem: React.FC<SortableHighlightItemProps> = ({ 
  highlight, 
  onEdit, 
  onDelete, 
  onToggleVisibility 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: highlight.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg p-4 mb-3 flex items-start gap-4 shadow-sm ${!highlight.is_visible ? 'opacity-60 bg-gray-50' : ''}`}
    >
      <div {...attributes} {...listeners} className="mt-1 cursor-grab text-gray-400 hover:text-gray-600">
        <span className="material-symbols-outlined">drag_indicator</span>
      </div>

      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border">
        {highlight.image_url ? (
          <img src={highlight.image_url} alt={highlight.title || highlight.text} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="material-symbols-outlined">image</span>
          </div>
        )}
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-semibold text-gray-900 truncate" title={highlight.title}>{highlight.title || 'Untitled Highlight'}</h4>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleVisibility(highlight)}
              className={`p-1 rounded hover:bg-gray-100 ${highlight.is_visible ? 'text-green-600' : 'text-gray-400'}`}
              title={highlight.is_visible ? 'Visible' : 'Hidden'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {highlight.is_visible ? 'visibility' : 'visibility_off'}
              </span>
            </button>
            <button
              onClick={() => onEdit(highlight)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
              onClick={() => onDelete(highlight.id)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </div>
        <div 
          className="text-sm text-gray-600 line-clamp-2 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: highlight.text }}
        />
      </div>
    </div>
  );
};

const TripHighlightsEditor: React.FC<TripHighlightsEditorProps> = ({ tourId, highlights, onUpdate, itinerary }) => {
  const [items, setItems] = useState<TourHighlight[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Partial<TourHighlight>>({});
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  useEffect(() => {
    // Sort highlights by display_order
    const sorted = [...highlights].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setItems(sorted);
  }, [highlights]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        const updates = newItems.map((item: TourHighlight, index: number) => ({
            id: item.id,
            display_order: index
        }));
        
        // Optimistic update
        Promise.all(updates.map(u => TourService.updateHighlight(u.id, { display_order: u.display_order })))
            .then(() => onUpdate())
            .catch(err => console.error('Failed to reorder highlights:', err));

        return newItems;
      });
    }
  };

  const handleAddNew = () => {
    setEditingHighlight({
      tour_id: tourId,
      title: '',
      text: '',
      image_url: '',
      is_visible: true,
      display_order: items.length
    });
    setIsEditing(true);
  };

  const handleEdit = (highlight: TourHighlight) => {
    setEditingHighlight(highlight);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this highlight?')) {
        try {
            await TourService.deleteHighlight(id);
            onUpdate();
        } catch (error) {
            console.error('Error deleting highlight:', error);
            alert('Failed to delete highlight');
        }
    }
  };

  const handleToggleVisibility = async (highlight: TourHighlight) => {
      try {
          await TourService.updateHighlight(highlight.id, { is_visible: !highlight.is_visible });
          onUpdate();
      } catch (error) {
          console.error('Error toggling visibility:', error);
      }
  };

  const handleSave = async () => {
    if (!editingHighlight.title) {
        alert('Title is required');
        return;
    }

    setLoading(true);
    try {
        if (editingHighlight.id) {
            await TourService.updateHighlight(editingHighlight.id, editingHighlight);
        } else {
            // New highlight
            await TourService.addHighlight({
                tour_id: tourId,
                title: editingHighlight.title,
                text: editingHighlight.text || '',
                image_url: editingHighlight.image_url || '',
                icon: 'star', // Default icon for backward compatibility
                display_order: editingHighlight.display_order || items.length,
                is_visible: editingHighlight.is_visible ?? true
            });
        }
        setIsEditing(false);
        onUpdate();
    } catch (error) {
        console.error('Error saving highlight:', error);
        alert('Failed to save highlight');
    } finally {
        setLoading(false);
    }
  };

  const handleSuggestHighlights = async () => {
      if (!itinerary || itinerary.length === 0) {
          alert('No itinerary available to scan for suggestions.');
          return;
      }

      setSuggesting(true);
      try {
          const suggestions: Omit<TourHighlight, 'id' | 'tour_id'>[] = [];
          const keywords = ['Base Camp', 'Summit', 'Lake', 'Temple', 'Monastery', 'Pass', 'Viewpoint', 'Sunrise', 'Sunset', 'Arrival', 'Departure'];
          
          itinerary.forEach(day => {
              const text = (day.title + ' ' + (day.description || '')).toLowerCase();
              const hasKeyword = keywords.some(k => text.includes(k.toLowerCase()));
              
              if (hasKeyword) {
                  // Check if similar highlight already exists
                  const exists = items.some(h => h.title.toLowerCase() === day.title.toLowerCase());
                  if (!exists) {
                      suggestions.push({
                          title: day.title,
                          text: day.description || '',
                          icon: 'auto_awesome',
                          image_url: '',
                          display_order: items.length + suggestions.length,
                          is_visible: true
                      });
                  }
              }
          });

          if (suggestions.length === 0) {
              alert('No new highlights found based on keywords.');
          } else {
              if (window.confirm(`Found ${suggestions.length} potential highlights. Add them?`)) {
                  await Promise.all(suggestions.map(s => TourService.addHighlight({ ...s, tour_id: tourId } as any)));
                  onUpdate();
              }
          }
      } catch (err) {
          console.error('Error suggesting highlights:', err);
      } finally {
          setSuggesting(false);
      }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
                {editingHighlight.id ? 'Edit Highlight' : 'New Highlight'}
            </h3>
            <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    value={editingHighlight.title || ''}
                    onChange={(e) => setEditingHighlight(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Scenic Mountain Flight"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border flex items-center justify-center overflow-hidden">
                        {editingHighlight.image_url ? (
                            <img src={editingHighlight.image_url} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-gray-400 text-3xl">image</span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsMediaModalOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">add_photo_alternate</span>
                        Select Image
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <RichTextEditor
                    content={editingHighlight.text || ''}
                    onChange={(content) => setEditingHighlight(prev => ({ ...prev, text: content }))}
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isVisible"
                    checked={editingHighlight.is_visible ?? true}
                    onChange={(e) => setEditingHighlight(prev => ({ ...prev, is_visible: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isVisible" className="text-sm text-gray-700">Visible on tour page</label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>}
                    Save Highlight
                </button>
            </div>
        </div>

        <MediaLibraryModal
            isOpen={isMediaModalOpen}
            onClose={() => setIsMediaModalOpen(false)}
            onImageSelect={(url) => {
                setEditingHighlight(prev => ({ ...prev, image_url: url }));
                setIsMediaModalOpen(false);
            }}
            currentImage={editingHighlight.image_url}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-lg font-bold text-gray-900">Trip Highlights</h2>
            <p className="text-sm text-gray-500">Manage the key highlights for this tour</p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={handleSuggestHighlights}
                disabled={suggesting || !itinerary?.length}
                className="px-4 py-2 border border-blue-600 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                title="Auto-generate from Itinerary"
            >
                {suggesting ? (
                    <span className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                ) : (
                    <span className="material-symbols-outlined">auto_awesome</span>
                )}
                <span className="hidden sm:inline">Suggest</span>
            </button>
            <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                <span className="material-symbols-outlined">add</span>
                Add Highlight
            </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">star</span>
            <p className="text-gray-500">No highlights added yet.</p>
            <button
                onClick={handleAddNew}
                className="mt-2 text-blue-600 font-medium hover:text-blue-800"
            >
                Add your first highlight
            </button>
        </div>
      ) : (
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext 
                items={items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <div>
                    {items.map((highlight) => (
                        <SortableHighlightItem
                            key={highlight.id}
                            highlight={highlight}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleVisibility={handleToggleVisibility}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default TripHighlightsEditor;
