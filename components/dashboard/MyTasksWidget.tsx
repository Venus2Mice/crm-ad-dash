
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Task, User, TaskStatus } from '../../types';
import { ClipboardDocumentListIcon } from '../ui/Icon';
import { getStatusColor } from '../../constants';

interface MyTasksWidgetProps {
  tasks: Task[];
  currentUser: User;
}

const MyTasksWidget: React.FC<MyTasksWidgetProps> = ({ tasks, currentUser }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const getTaskSortValue = (task: Task): number => {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0,0,0,0); // Normalize to start of day for comparison

    if (dueDate < today) return 0; // Overdue
    if (dueDate.getTime() === today.getTime()) return 1; // Due today
    if (dueDate.getTime() === tomorrow.getTime()) return 2; // Due tomorrow
    // For future tasks, sort by how far in the future they are
    return 3 + Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const myTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.assignedTo === currentUser.name &&
        !task.isDeleted &&
        task.status !== TaskStatus.COMPLETED &&
        task.status !== TaskStatus.CANCELLED
      )
      .sort((a, b) => {
        const sortValA = getTaskSortValue(a);
        const sortValB = getTaskSortValue(b);
        if (sortValA !== sortValB) {
          return sortValA - sortValB;
        }
        // If sort value is the same (e.g. both overdue, or both due on same future day), sort by priority then actual due date
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const priorityA = priorityOrder[a.priority || 'Medium'] ?? 1;
        const priorityB = priorityOrder[b.priority || 'Medium'] ?? 1;
        if(priorityA !== priorityB) return priorityA - priorityB;

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      .slice(0, 7); // Display top 7 tasks
  }, [tasks, currentUser.name]);

  const getDueDateDisplay = (dueDateStr: string): { text: string; className: string } => {
    const dueDate = new Date(dueDateStr);
    dueDate.setHours(0,0,0,0);

    if (dueDate < today) return { text: `Overdue: ${dueDate.toLocaleDateString()}`, className: 'text-red-600 font-semibold' };
    if (dueDate.getTime() === today.getTime()) return { text: 'Due Today', className: 'text-orange-500 font-semibold' };
    if (dueDate.getTime() === tomorrow.getTime()) return { text: 'Due Tomorrow', className: 'text-yellow-500' };
    return { text: dueDate.toLocaleDateString(), className: 'text-gray-500' };
  };

  const getPriorityColor = (priority?: 'Low' | 'Medium' | 'High'): string => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center mb-4">
        <ClipboardDocumentListIcon className="h-6 w-6 text-purple-500 mr-2" />
        <h3 className="text-lg font-semibold text-dark-text">My Tasks</h3>
      </div>
      
      {myTasks.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
            <p className="text-medium-text text-center">No pending tasks. Well done!</p>
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto flex-grow pr-1 custom-scrollbar min-h-[200px]">
          {myTasks.map(task => {
            const dueDateInfo = getDueDateDisplay(task.dueDate);
            return (
              <li key={task.id} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <div className="flex items-start space-x-2">
                  <span 
                    className={`mt-1.5 flex-shrink-0 h-2.5 w-2.5 rounded-full ${getPriorityColor(task.priority)}`} 
                    title={`Priority: ${task.priority || 'Medium'}`}
                    aria-label={`Priority: ${task.priority || 'Medium'}`}
                    ></span>
                  <div className="flex-grow">
                    <Link 
                        to={`/tasks?search=${encodeURIComponent(task.title)}`} 
                        className="text-sm font-medium text-primary hover:underline block truncate"
                        title={task.title}
                    >
                      {task.title}
                    </Link>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs mt-0.5">
                        <span className={dueDateInfo.className}>{dueDateInfo.text}</span>
                        <span className={`px-1.5 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                        </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-200 text-center">
        <Link
          to="/tasks"
          className="text-sm font-medium text-primary hover:text-primary-dark hover:underline"
        >
          View All My Tasks
        </Link>
      </div>
    </div>
  );
};

export default MyTasksWidget;
