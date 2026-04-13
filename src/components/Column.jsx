import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

export default function Column({ id, tasks, onAddTask }) {
  // Mapping the database IDs
  const titles = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done'
  };

  return (
    <div className="flex flex-col w-full min-w-[280px] bg-slate-50/50 rounded-xl p-4 border border-slate-200/60">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
            {titles[id]}
          </h2>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(id)}
          className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500"
        >
          <Plus size={18} />
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`flex-1 min-h-[150px] transition-colors rounded-lg ${
              snapshot.isDraggingOver ? 'bg-slate-100/50' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
            
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                <p className="text-sm text-slate-400">No tasks yet</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}