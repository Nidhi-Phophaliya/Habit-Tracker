import React, { useContext } from 'react';
import { HabitContext } from '../../context/HabitContext';
import HabitCard from '../../components/ui/HabitCard';

const ArchivedHabits = () => {
  const { habits, toggleArchiveStatus } = useContext(HabitContext);

  const archived = habits.filter(habit => habit.archived);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Archived Habits</h2>

      {archived.length === 0 ? (
        <p className="text-gray-400">No archived habits found.</p>
      ) : (
        <div className="grid gap-4">
          {archived.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onUnarchive={() => toggleArchiveStatus(habit.id)}
              isArchivedView
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedHabits;
