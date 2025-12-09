
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getStatusColor, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../constants';
import { Task, TaskStatus, Lead, Customer, Deal, User, CustomFieldDefinition } from '../types';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, MagnifyingGlassIcon, CheckCircleIcon } from '../components/ui/Icon';
import TaskFormModal from '../components/tasks/TaskFormModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import Pagination, { ITEMS_PER_PAGE_OPTIONS } from '../components/ui/Pagination';
import { useSortableData } from '../hooks/useSortableData';
import SortIcon from '../components/ui/SortIcon';
import { canPerformAction } from '../utils/permissions';

const TASK_PRIORITY_OPTIONS_FILTER: { value: Task['priority'] | '', label: string }[] = [
    { value: '', label: 'All Priorities' },
    ...TASK_PRIORITY_OPTIONS.map(p => ({ value: p, label: p })),
];

const RELATED_TYPE_OPTIONS: { value: Task['relatedTo']['type'] | '', label: string}[] = [
    { value: '', label: 'All Related Types'},
    { value: 'General', label: 'General'},
    { value: 'Lead', label: 'Lead'},
    { value: 'Customer', label: 'Customer'},
    { value: 'Deal', label: 'Deal'},
];

// Priority helper for badge colors
const getPriorityColor = (priority?: 'Low' | 'Medium' | 'High'): string => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

// Priority Sort Logic (High > Medium > Low)
const priorityValue = { High: 3, Medium: 2, Low: 1 };
const prioritySorter = (a: any, b: any) => {
    const valA = priorityValue[a as keyof typeof priorityValue] || 0;
    const valB = priorityValue[b as keyof typeof priorityValue] || 0;
    return valA - valB;
};


interface TasksPageProps {
  tasks: Task[];
  leads: Lead[];
  customers: Customer[];
  deals: Deal[];
  onSaveTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'isDeleted' | 'deletedAt' | 'createdBy' | 'customFields'> & { 
    id?: string;
    customFields?: Record<string, any>; 
  }) => void;
  onDeleteTask: (taskId: string) => void;
  currentUser: User | null;
  customFieldDefinitions: CustomFieldDefinition[]; 
}

const TasksPage: React.FC<TasksPageProps> = ({ tasks, leads, customers, deals, onSaveTask, onDeleteTask, currentUser, customFieldDefinitions }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const location = useLocation();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [itemToDeleteDetails, setItemToDeleteDetails] = useState<{ id: string; name: string; type: string } | null>(null);
  const [confirmActionHandler, setConfirmActionHandler] = useState<(() => void) | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | ''>('');
  const [selectedPriority, setSelectedPriority] = useState<Task['priority'] | ''>('');
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>('');
  const [selectedRelatedType, setSelectedRelatedType] = useState<Task['relatedTo']['type'] | ''>('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState<string>('');

  // Animation state
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);


  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    setCurrentPage(1); // Reset page on filter change
  }, [location.search, selectedStatus, selectedPriority, selectedAssignedTo, selectedRelatedType, selectedCreatedBy]);


  const assignedToOptions = useMemo(() => {
    const uniqueAssignees = Array.from(new Set(tasks.filter(t => !t.isDeleted).map(task => task.assignedTo).filter(Boolean as any as (value: string | undefined) => value is string))).sort();
    return [{ value: '', label: 'All Assignees' }, ...uniqueAssignees.map(assignee => ({ value: assignee, label: assignee }))];
  }, [tasks]);

  const createdByOptions = useMemo(() => {
    const uniqueCreators = Array.from(new Set(tasks.filter(t => !t.isDeleted && t.createdBy).map(task => task.createdBy!.name))).sort();
    return [{ value: '', label: 'All Creators' }, ...uniqueCreators.map(creator => ({ value: creator, label: creator }))];
  }, [tasks]);


  const statusOptions = useMemo(() => {
      return [{ value: '', label: 'All Statuses'}, ...TASK_STATUS_OPTIONS.map(s => ({value: s, label: s}))];
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.isDeleted) return false; 

      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term));

      const matchesStatus = !selectedStatus || task.status === selectedStatus;
      const matchesPriority = !selectedPriority || task.priority === selectedPriority;
      const matchesAssignedTo = !selectedAssignedTo || task.assignedTo === selectedAssignedTo;
      const matchesRelatedType = !selectedRelatedType || task.relatedTo?.type === selectedRelatedType;
      const matchesCreatedBy = !selectedCreatedBy || task.createdBy?.name === selectedCreatedBy;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignedTo && matchesRelatedType && matchesCreatedBy;
    });
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedAssignedTo, selectedRelatedType, selectedCreatedBy]);

  // Sorting with custom priority sorter
  const { items: sortedTasks, requestSort, sortConfig } = useSortableData<Task>(filteredTasks, null, { priority: prioritySorter });

  // Paginated tasks
  const totalTasks = sortedTasks.length;
  const totalPages = Math.ceil(totalTasks / itemsPerPage);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedTasks, currentPage, itemsPerPage]);


  const handleAddNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleQuickComplete = (task: Task) => {
    if (!canPerformAction(currentUser, 'UPDATE', 'Task', task)) {
        alert("Permission Denied: You cannot update this task.");
        return;
    }
    // Start animation
    setAnimatingTaskId(task.id);
    
    // Delay actual update to let animation play
    setTimeout(() => {
        const { id, createdAt, completedAt, isDeleted, deletedAt, createdBy, customFields, ...editableProps } = task;
        onSaveTask({
            ...editableProps,
            status: TaskStatus.COMPLETED,
            id: task.id,
            customFields: customFields || {}
        });
        setAnimatingTaskId(null);
    }, 500);
  };

  const openConfirmationModal = (
    itemId: string,
    itemName: string,
    itemType: string,
    action: () => void
  ) => {
    setItemToDeleteDetails({ id: itemId, name: itemName, type: itemType });
    setConfirmActionHandler(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteTaskWithConfirmation = (taskToDelete: Task) => {
    if (!taskToDelete || typeof taskToDelete.id === 'undefined') {
        console.error('CRITICAL ERROR: taskToDelete is null, undefined, or ID is missing.');
        alert('Critical error: Task data is missing or malformed for deletion.');
        return;
    }
    const taskTitleForConfirmation = typeof taskToDelete.title === 'string' && taskToDelete.title.trim() !== '' ? taskToDelete.title : `Task (ID: ${taskToDelete.id})`;

    openConfirmationModal(taskToDelete.id, taskTitleForConfirmation, "Task", () => {
        onDeleteTask(taskToDelete.id);
    });
  };

  const handleSaveTaskModal = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'isDeleted' | 'deletedAt'| 'createdBy' | 'customFields'> & { 
    id?: string;
    customFields?: Record<string, any>; 
  }) => {
    onSaveTask(taskData);
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getRelatedToText = (task: Task): string => {
    if (task.relatedTo) {
      const name = task.relatedTo.name || (task.relatedTo.id ? `ID: ${task.relatedTo.id}` : 'N/A');
      return `${task.relatedTo.type}: ${name}`;
    }
    return 'General';
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedAssignedTo('');
    setSelectedRelatedType('');
    setSelectedCreatedBy('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const renderSortableHeader = (label: string, sortKey: keyof Task, hiddenClasses: string = "") => (
    <th 
      scope="col" 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group select-none ${hiddenClasses}`}
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon columnKey={sortKey as string} sortConfig={sortConfig} />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-dark-text">Task Management</h2>
        <button
          onClick={handleAddNewTask}
          className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-150 w-full sm:w-auto"
          aria-label="Add New Task"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add New Task</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="searchTermTasks" className="block text-sm font-medium text-gray-700 mb-1">Search Tasks</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                    type="text"
                    id="searchTermTasks"
                    placeholder="Search by title, description..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
            </div>
            <div>
                <label htmlFor="statusFilterTasks" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                    id="statusFilterTasks"
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value as TaskStatus | ''); setCurrentPage(1); }}
                    className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="priorityFilterTasks" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                    id="priorityFilterTasks"
                    value={selectedPriority}
                    onChange={(e) => { setSelectedPriority(e.target.value as Task['priority'] | ''); setCurrentPage(1); }}
                    className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    {TASK_PRIORITY_OPTIONS_FILTER.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="assignedToFilterTasks" className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                    id="assignedToFilterTasks"
                    value={selectedAssignedTo}
                    onChange={(e) => { setSelectedAssignedTo(e.target.value); setCurrentPage(1); }}
                    className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    {assignedToOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="createdByFilterTasks" className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <select
                    id="createdByFilterTasks"
                    value={selectedCreatedBy}
                    onChange={(e) => { setSelectedCreatedBy(e.target.value); setCurrentPage(1); }}
                    className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    {createdByOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="relatedTypeFilterTasks" className="block text-sm font-medium text-gray-700 mb-1">Related To Type</label>
                <select
                    id="relatedTypeFilterTasks"
                    value={selectedRelatedType}
                    onChange={(e) => { setSelectedRelatedType(e.target.value as Task['relatedTo']['type'] | ''); setCurrentPage(1); }}
                    className="block w-full p-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                >
                    {RELATED_TYPE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <div className="xl:col-span-2 flex justify-end items-end">
                <button
                    onClick={resetFilters}
                    className="w-full xl:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-150 h-10"
                >
                    Reset Filters
                </button>
            </div>
        </div>
      </div>


      <div className="bg-white p-0 sm:p-6 rounded-lg shadow">
        {paginatedTasks.length === 0 ? (
            <p className="text-medium-text text-center py-8 px-4">
                {tasks.filter(t => !t.isDeleted).length === 0 ? "No active tasks found. Add a new task to stay organized!" : "No tasks match your current filters."}
            </p>
        ) : (
            <>
            {/* Mobile View: Cards */}
            <div className="sm:hidden space-y-4 p-4">
                {paginatedTasks.map(task => {
                    const isAnimating = animatingTaskId === task.id;
                    const canEditCurrent = canPerformAction(currentUser, 'UPDATE', 'Task', task);
                    return (
                        <div 
                            key={task.id} 
                            className={`p-4 rounded-lg shadow border border-gray-200 transition-all duration-500 ease-out 
                                ${isAnimating ? 'bg-green-100 border-green-300 scale-[0.98]' : 'bg-white hover:shadow-md'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className={`text-lg font-semibold leading-tight transition-colors ${isAnimating ? 'text-green-800' : 'text-dark-text'}`}>{task.title}</h3>
                                <div className="flex space-x-1 flex-shrink-0">
                                    {!isAnimating && task.status !== TaskStatus.COMPLETED && (
                                        <button 
                                            onClick={() => handleQuickComplete(task)} 
                                            disabled={!canEditCurrent}
                                            className="text-green-600 hover:text-green-800 p-1.5 bg-green-50 rounded-full disabled:opacity-50"
                                            aria-label={`Mark ${task.title} as Complete`}
                                            title="Mark as Complete"
                                        >
                                            <CheckCircleIcon className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleEditTask(task)} 
                                        className="text-primary hover:text-primary-dark p-1.5 bg-blue-50 rounded-full"
                                        aria-label={`Edit ${task.title}`}
                                    >
                                        <PencilSquareIcon className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteTaskWithConfirmation(task)} 
                                        className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded-full"
                                        aria-label={`Delete ${task.title}`}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                    {task.priority || 'Medium'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Due Date:</span>
                                    <span>{task.dueDate}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="font-medium text-gray-500">Assigned To:</span>
                                    <span>{task.assignedTo || 'Unassigned'}</span>
                                </div>
                                {task.relatedTo && (
                                    <div className="pt-1">
                                        <span className="font-medium text-gray-500 block mb-1">Related To:</span>
                                        <span className="text-gray-700 bg-gray-50 px-2 py-1 rounded block truncate">
                                            {getRelatedToText(task)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {renderSortableHeader("Title", "title")}
                        {renderSortableHeader("Status", "status")}
                        {renderSortableHeader("Priority", "priority")}
                        {renderSortableHeader("Due Date", "dueDate", "hidden sm:table-cell")}
                        {renderSortableHeader("Assigned To", "assignedTo", "hidden md:table-cell")}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Created By</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Related To</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTasks.map((task) => {
                        const isAnimating = animatingTaskId === task.id;
                        const canEditCurrent = canPerformAction(currentUser, 'UPDATE', 'Task', task);
                        return (
                            <tr 
                                key={task.id} 
                                className={`transition-all duration-500 ease-out 
                                    ${isAnimating ? 'bg-green-100' : 'hover:bg-gray-50'}`}
                            >
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isAnimating ? 'text-green-800' : 'text-dark-text'}`}>{task.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                {task.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                                {task.priority || 'Medium'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden sm:table-cell">{task.dueDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden md:table-cell">{task.assignedTo || 'Unassigned'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden lg:table-cell">{task.createdBy?.name || 'System'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-text hidden lg:table-cell">{getRelatedToText(task)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                                {!isAnimating && task.status !== TaskStatus.COMPLETED && (
                                    <button 
                                        onClick={() => handleQuickComplete(task)} 
                                        disabled={!canEditCurrent}
                                        className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50 disabled:cursor-not-allowed" 
                                        aria-label={`Mark ${task.title} as Complete`}
                                        title="Mark as Complete"
                                    >
                                        <CheckCircleIcon className="h-5 w-5" />
                                    </button>
                                )}
                                <button onClick={() => handleEditTask(task)} className="text-primary hover:text-primary-dark p-1" aria-label={`Edit ${task.title}`}>
                                <PencilSquareIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDeleteTaskWithConfirmation(task)} className="text-red-600 hover:text-red-800 p-1" aria-label={`Delete ${task.title}`}>
                                <TrashIcon className="h-5 w-5" />
                                </button>
                            </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
            </>
        )}
        
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
            totalItems={totalTasks}
            entityName="tasks"
          />
        )}
      </div>
      {isModalOpen && (
        <TaskFormModal
            isOpen={isModalOpen}
            onClose={() => {
                setIsModalOpen(false);
                setEditingTask(null);
            }}
            onSave={handleSaveTaskModal}
            initialData={editingTask}
            leads={leads.filter(l => !l.isDeleted)} 
            customers={customers.filter(c => !c.isDeleted)}
            deals={deals.filter(d => !d.isDeleted)}
            taskStatuses={TASK_STATUS_OPTIONS}
            taskPriorities={TASK_PRIORITY_OPTIONS}
            currentUser={currentUser}
            customFieldDefinitions={customFieldDefinitions} 
        />
      )}
      {isConfirmModalOpen && itemToDeleteDetails && confirmActionHandler && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => {
            setIsConfirmModalOpen(false);
            setItemToDeleteDetails(null);
            setConfirmActionHandler(null);
          }}
          onConfirm={confirmActionHandler}
          title={`Confirm Delete ${itemToDeleteDetails.type}`}
          message={
             <>
              Are you sure you want to move {itemToDeleteDetails.type.toLowerCase()}{' '}
              <strong>"{itemToDeleteDetails.name}"</strong> to the trash?
              <br />
              This action can be undone from the Archive page.
            </>
          }
          confirmButtonText="Move to Trash"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
        />
      )}
    </div>
  );
};

export default TasksPage;
