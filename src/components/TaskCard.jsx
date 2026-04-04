import { Draggable } from '@hello-pangea/dnd';
import { Calendar, AlertCircle } from 'lucide-react';

export default function TaskCard({ task, index }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white p-4 mb-3 rounded-lg border border-slate-200 shadow-sm hover:border-blue-400 transition-all group"
        >
          <h3 className="font-medium text-slate-700 leading-tight mb-2">{task.title}</h3>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Tag */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
              task.priority === 'high' ? 'bg-red-50 text-red-600' : 
              task.priority === 'low' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'
            }`}>
              {task.priority}
            </span>

            {/* Due Date Indicator */}
            {task.due_date && (
              <div className={`flex items-center gap-1 text-[11px] font-medium ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}