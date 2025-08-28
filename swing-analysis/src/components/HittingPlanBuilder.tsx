import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Drill {
  id: string;
  name: string;
  reps?: number;
  duration?: string;
  category: 'tee' | 'toss' | 'live' | 'vision' | 'strength';
  description?: string;
}

interface DayPlan {
  day: number;
  dayName: string;
  drills: Drill[];
  notes: string;
}

// Predefined drills library
const DRILL_LIBRARY: Drill[] = [
  // Tee Work
  { id: 'tee-1', name: 'Inside Pitch Tee', reps: 25, category: 'tee', description: 'Focus on hands inside the ball' },
  { id: 'tee-2', name: 'Outside Pitch Tee', reps: 25, category: 'tee', description: 'Drive opposite field' },
  { id: 'tee-3', name: 'High Tee Work', reps: 25, category: 'tee', description: 'Work on high strike zone' },
  { id: 'tee-4', name: 'Low Tee Work', reps: 25, category: 'tee', description: 'Stay through the zone' },
  { id: 'tee-5', name: 'Middle-Middle Tee', reps: 50, category: 'tee', description: 'Perfect mechanics focus' },
  
  // Toss Drills
  { id: 'toss-1', name: 'Front Toss', reps: 50, category: 'toss', description: 'Timing and rhythm work' },
  { id: 'toss-2', name: 'Side Toss', reps: 50, category: 'toss', description: 'Quick hands development' },
  { id: 'toss-3', name: 'Top Hand Toss', reps: 25, category: 'toss', description: 'Top hand strength' },
  { id: 'toss-4', name: 'Bottom Hand Toss', reps: 25, category: 'toss', description: 'Bottom hand control' },
  { id: 'toss-5', name: 'Rapid Fire Toss', reps: 30, category: 'toss', description: 'Quick load and fire' },
  
  // Live Pitching
  { id: 'live-1', name: 'Live BP', duration: '15 min', category: 'live', description: 'Game speed pitching' },
  { id: 'live-2', name: 'Machine Work', duration: '20 min', category: 'live', description: 'Consistent timing work' },
  { id: 'live-3', name: 'Curveball Machine', duration: '10 min', category: 'live', description: 'Breaking ball recognition' },
  
  // Vision Training
  { id: 'vision-1', name: 'Ball Tracking', duration: '5 min', category: 'vision', description: 'Track ball from release' },
  { id: 'vision-2', name: 'Colored Ball Drill', reps: 20, category: 'vision', description: 'Call out ball color' },
  { id: 'vision-3', name: 'Number Ball Drill', reps: 20, category: 'vision', description: 'Call out ball number' },
  
  // Strength & Conditioning
  { id: 'strength-1', name: 'Bat Speed Drills', reps: 50, category: 'strength', description: 'Light bat swings' },
  { id: 'strength-2', name: 'Heavy Bat Swings', reps: 25, category: 'strength', description: 'Build strength' },
  { id: 'strength-3', name: 'Resistance Band Swings', reps: 30, category: 'strength', description: 'Core rotation work' },
];

// Sortable Item Component
function SortableItem({ drill, onRemove }: { drill: Drill; onRemove: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: drill.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-700 p-3 rounded-lg flex items-center justify-between group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move flex-1"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-400">☰</span>
          <div className="flex-1">
            <div className="text-white font-medium">{drill.name}</div>
            <div className="text-xs text-gray-400">
              {drill.reps && `${drill.reps} reps`}
              {drill.duration && drill.duration}
              {drill.description && ` • ${drill.description}`}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 px-2"
      >
        ✕
      </button>
    </div>
  );
}

interface HittingPlanBuilderProps {
  onPlanComplete: (plan: DayPlan[]) => void;
}

export default function HittingPlanBuilder({ onPlanComplete }: HittingPlanBuilderProps) {
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([
    { day: 1, dayName: 'Day 1', drills: [], notes: '' },
    { day: 2, dayName: 'Day 2', drills: [], notes: '' },
    { day: 3, dayName: 'Day 3', drills: [], notes: '' },
    { day: 4, dayName: 'Day 4', drills: [], notes: '' },
    { day: 5, dayName: 'Day 5', drills: [], notes: '' },
    { day: 6, dayName: 'Day 6', drills: [], notes: '' },
    { day: 7, dayName: 'Day 7', drills: [], notes: '' },
  ]);
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter drills based on search and category
  const filteredDrills = DRILL_LIBRARY.filter(drill => {
    const matchesSearch = drill.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || drill.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add drill to selected day
  const addDrillToDay = (drill: Drill) => {
    const newDrill = { ...drill, id: `${drill.id}-${Date.now()}` }; // Unique ID for each instance
    const newPlan = [...weekPlan];
    newPlan[selectedDay].drills.push(newDrill);
    setWeekPlan(newPlan);
  };

  // Remove drill from day
  const removeDrillFromDay = (dayIndex: number, drillIndex: number) => {
    const newPlan = [...weekPlan];
    newPlan[dayIndex].drills.splice(drillIndex, 1);
    setWeekPlan(newPlan);
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const newPlan = [...weekPlan];
      const drills = newPlan[selectedDay].drills;
      const oldIndex = drills.findIndex(d => d.id === active.id);
      const newIndex = drills.findIndex(d => d.id === over?.id);
      
      newPlan[selectedDay].drills = arrayMove(drills, oldIndex, newIndex);
      setWeekPlan(newPlan);
    }
  };

  // Update day notes
  const updateDayNotes = (dayIndex: number, notes: string) => {
    const newPlan = [...weekPlan];
    newPlan[dayIndex].notes = notes;
    setWeekPlan(newPlan);
  };

  // Calculate total work for a day
  const getDayStats = (day: DayPlan) => {
    const totalReps = day.drills.reduce((sum, drill) => sum + (drill.reps || 0), 0);
    const totalDrills = day.drills.length;
    return { totalReps, totalDrills };
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">7-Day Hitting Plan Builder</h2>
      
      {/* Day Selector Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {weekPlan.map((day, index) => {
          const stats = getDayStats(day);
          return (
            <button
              key={day.day}
              onClick={() => setSelectedDay(index)}
              className={`px-4 py-2 rounded-lg transition-colors min-w-[100px] ${
                selectedDay === index
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="font-medium">{day.dayName}</div>
              <div className="text-xs opacity-75">
                {stats.totalDrills} drills
                {stats.totalReps > 0 && ` • ${stats.totalReps} reps`}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Drill Library */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Drill Library</h3>
          
          {/* Search and Filter */}
          <div className="space-y-3 mb-4">
            <input
              type="text"
              placeholder="Search drills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="tee">Tee Work</option>
              <option value="toss">Toss Drills</option>
              <option value="live">Live Pitching</option>
              <option value="vision">Vision Training</option>
              <option value="strength">Strength & Conditioning</option>
            </select>
          </div>

          {/* Drill List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredDrills.map(drill => (
              <div
                key={drill.id}
                onClick={() => addDrillToDay(drill)}
                className="bg-gray-800 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white font-medium">{drill.name}</div>
                    <div className="text-xs text-gray-400">
                      {drill.reps && `${drill.reps} reps`}
                      {drill.duration && drill.duration}
                      {drill.description && ` • ${drill.description}`}
                    </div>
                  </div>
                  <span className="text-green-400 text-xl">+</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Day Plan */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            {weekPlan[selectedDay].dayName} Plan
          </h3>

          {/* Drills for Selected Day */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={weekPlan[selectedDay].drills.map(d => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 min-h-[200px] mb-4">
                {weekPlan[selectedDay].drills.length === 0 ? (
                  <div className="text-gray-500 text-center py-8 bg-gray-800 rounded-lg">
                    Drag drills here or click to add
                  </div>
                ) : (
                  weekPlan[selectedDay].drills.map((drill, drillIndex) => (
                    <SortableItem
                      key={drill.id}
                      drill={drill}
                      onRemove={() => removeDrillFromDay(selectedDay, drillIndex)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Day Notes */}
          <div className="mt-4">
            <label className="text-sm text-gray-400 block mb-2">Coach Notes for {weekPlan[selectedDay].dayName}</label>
            <textarea
              value={weekPlan[selectedDay].notes}
              onChange={(e) => updateDayNotes(selectedDay, e.target.value)}
              placeholder="Add specific notes for this day..."
              className="w-full h-24 px-3 py-2 bg-gray-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Plan Summary */}
      <div className="mt-6 bg-gray-900 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Week Overview</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekPlan.map((day) => {
            const stats = getDayStats(day);
            return (
              <div key={day.day} className="bg-gray-800 p-2 rounded text-center">
                <div className="text-xs text-gray-400">{day.dayName}</div>
                <div className="text-white font-medium">{stats.totalDrills}</div>
                <div className="text-xs text-gray-500">drills</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onPlanComplete(weekPlan)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Save Hitting Plan
        </button>
      </div>
    </div>
  );
}