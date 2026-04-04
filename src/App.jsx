import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { createClient } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Column from './components/Column'
import NewTaskModal from './components/NewTaskModal'

const COLUMNS = ['todo', 'in_progress', 'in_review', 'done']

//Didnt put "export default App" at the bottom to make more concise

export default function App(){

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColumn, setActiveColumn] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const setupApp = async () => {
      //Check for existing session
      const { data: {session } } = await supabase.auth.getSession();

      //If theres no session, wait for the guest to login
      if (!session) {
        await supabase.auth.signInAnonymously();
      }
      //When the session is confirmed, fetch data
      await fetchTasks();
    }
    setupApp()
  }, []);

  const fetchTasks = async () => {
    //add the error part just in case
    const { data, error } = await supabase.from('tasks').select('*');
    
    if (error) console.error("Error fetching:", error);
    setTasks(data || []);
    setLoading(false); // Stop loading only after data is in state
  };

  const handleSaveTask = async (taskData) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        // Tie task to the guest account
        user_id: user.id
      }])
      .select();

    if (error) {
    // was running into error in browser and needed to debug
    console.error("Supabase Insert Error:", error.message, error.details);
    alert(`Error: ${error.message}`); 
  } else {
    setTasks([...data, ...tasks]);
    setIsModalOpen(false);
  }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newTasks = Array.from(tasks);
    const taskIndex = newTasks.findIndex(t => t.id === draggableId);
    
    // Avoid a mutating state by making new variables
    // using the spread operator (...) to update the status safely.
    newTasks[taskIndex] = { 
      ...newTasks[taskIndex], 
      status: destination.droppableId 
    };
    
    setTasks(newTasks);

    // Update Supabase in the background
    await supabase
      .from('tasks')
      .update({ status: destination.droppableId })
      .eq('id', draggableId);
  };

  // Helper to open modal for a specific column
  const openModal = (columnId) => {
    setActiveColumn(columnId);
    setIsModalOpen(true);
  };


  // This logic filters the tasks before they are sent to the columns
const filteredTasks = tasks.filter(task => 
  task.title.toLowerCase().includes(searchQuery.toLowerCase())
);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center font-medium text-slate-500 bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      {/*Header & Search Area*/}
      <header className="mb-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Team Board</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and track your team tasks</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search tasks..."
              className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 text-sm shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal('todo')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap text-sm"
          >
            + New Task
          </button>
        </div>
      </header>

      {/*Dashboard Summary Stats*/}
      <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-800">{tasks.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{tasks.filter(t => t.status === 'done').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-orange-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">High Priority</p>
          <p className="text-2xl font-bold text-orange-500">{tasks.filter(t => t.priority === 'high').length}</p>
        </div>
      </div>

      {/*The Kanban Board*/}
      <main className="max-w-7xl mx-auto overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 min-w-max md:min-w-0 md:grid md:grid-cols-4">
            {COLUMNS.map(col => (
              <Column 
                key={col} 
                id={col} 
                tasks={filteredTasks.filter(t => t.status === col)}
                onAddTask={openModal}
              />
            ))}
          </div>
        </DragDropContext>
      </main>

      {/*Modal Overlay*/}
      <NewTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        defaultStatus={activeColumn}
      />
    </div>
  )
}