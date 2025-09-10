import React from 'react';

export type WorkoutPackage = {
  id: string;
  title: string;
  description: string;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
};

// Define 8 different workout packages
export const WORKOUT_PACKAGES: WorkoutPackage[] = [
  {
    id: 'power-hitter',
    title: 'Power Hitter Development',
    description: 'Focus on generating bat speed and power',
    monday: 'Tee work: 50 swings focusing on hip rotation',
    tuesday: 'Weighted bat drills: 3 sets of 20 swings',
    wednesday: 'Rest day - video review',
    thursday: 'Soft toss: 100 swings with power focus',
    friday: 'Live BP: 50 pitches',
    saturday: 'Game simulation: 30 at-bats',
    sunday: 'Recovery: light tee work'
  },
  {
    id: 'contact-specialist',
    title: 'Contact & Consistency',
    description: 'Improve bat control and contact rate',
    monday: 'Two-strike drills: 30 reps',
    tuesday: 'Opposite field hitting: 50 swings',
    wednesday: 'Bunting practice: 20 reps',
    thursday: 'Soft toss variety: 75 swings',
    friday: 'Live BP: focus on contact',
    saturday: 'Situational hitting drills',
    sunday: 'Light tee work: 30 swings'
  },
  {
    id: 'timing-rhythm',
    title: 'Timing & Rhythm',
    description: 'Develop consistent timing and rhythm',
    monday: 'Front toss timing drills: 60 swings',
    tuesday: 'Variable speed BP: 40 pitches',
    wednesday: 'Video analysis day',
    thursday: 'Rhythm tee work: 50 swings',
    friday: 'Live BP with timing focus',
    saturday: 'Mixed speed practice',
    sunday: 'Recovery: visualization'
  },
  {
    id: 'youth-fundamentals',
    title: 'Youth Fundamentals',
    description: 'Build proper mechanics for young players',
    monday: 'Stance and grip work: 20 mins',
    tuesday: 'Tee work basics: 40 swings',
    wednesday: 'Balance drills: 15 mins',
    thursday: 'Soft toss: 30 swings',
    friday: 'Coach pitch: 25 swings',
    saturday: 'Fun hitting games',
    sunday: 'Rest day'
  },
  {
    id: 'advanced-mechanics',
    title: 'Advanced Mechanics',
    description: 'Fine-tune swing mechanics',
    monday: 'Load and stride drills: 30 reps',
    tuesday: 'Bat path work: 50 swings',
    wednesday: 'Film review and adjustments',
    thursday: 'Connection drills: 40 swings',
    friday: 'Live BP with mechanics focus',
    saturday: 'Full swing integration',
    sunday: 'Light mechanical work'
  },
  {
    id: 'speed-agility',
    title: 'Bat Speed & Agility',
    description: 'Increase bat speed and quick hands',
    monday: 'Underload bat training: 50 swings',
    tuesday: 'Quick hands drills: 30 reps',
    wednesday: 'Resistance band work',
    thursday: 'Overload/underload combo',
    friday: 'Velocity training BP',
    saturday: 'Speed measurement day',
    sunday: 'Recovery stretching'
  },
  {
    id: 'game-ready',
    title: 'Game Ready Prep',
    description: 'Prepare for game situations',
    monday: 'Situational hitting: 40 ABs',
    tuesday: 'Count leverage drills',
    wednesday: 'Mental preparation',
    thursday: 'Live BP game scenarios',
    friday: 'Pressure situations practice',
    saturday: 'Simulated game',
    sunday: 'Recovery and review'
  },
  {
    id: 'corrective-program',
    title: 'Corrective Program',
    description: 'Fix specific swing flaws',
    monday: 'Isolation drills for flaw: 40 reps',
    tuesday: 'Progressive correction work',
    wednesday: 'Video comparison day',
    thursday: 'Integration drills: 50 swings',
    friday: 'Live BP with corrections',
    saturday: 'Full swing assessment',
    sunday: 'Light maintenance work'
  }
];

type Props = {
  selectedPackage: WorkoutPackage | null;
  onSelectPackage: (pkg: WorkoutPackage) => void;
  isVisible: boolean;
};

const WorkoutPackageSelector: React.FC<Props> = ({ 
  selectedPackage, 
  onSelectPackage,
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="space-y-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
      <div className="text-sm font-semibold text-cyan-400 mb-2">
        Choose Workout Package (Required)
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {WORKOUT_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => onSelectPackage(pkg)}
            className={`cursor-pointer p-3 rounded-lg border transition-all ${
              selectedPackage?.id === pkg.id
                ? 'border-cyan-500 bg-cyan-950/30'
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-white text-sm">
                  {pkg.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {pkg.description}
                </div>
              </div>
              {selectedPackage?.id === pkg.id && (
                <div className="ml-2">
                  <svg className="w-5 h-5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xs font-semibold text-green-400 mb-2">
            Selected: {selectedPackage.title}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div><span className="text-gray-500">Mon:</span> {selectedPackage.monday}</div>
            <div><span className="text-gray-500">Tue:</span> {selectedPackage.tuesday}</div>
            <div><span className="text-gray-500">Wed:</span> {selectedPackage.wednesday}</div>
            <div><span className="text-gray-500">Thu:</span> {selectedPackage.thursday}</div>
            <div><span className="text-gray-500">Fri:</span> {selectedPackage.friday}</div>
            <div><span className="text-gray-500">Sat:</span> {selectedPackage.saturday}</div>
            <div><span className="text-gray-500">Sun:</span> {selectedPackage.sunday}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutPackageSelector;