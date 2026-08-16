"use client";

import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
};

const columns = [
  { key: "TODO", title: "To Do" },
  { key: "DOING", title: "Doing" },
  { key: "COMPLETED", title: "Completed" },
  { key: "ON_HOLD", title: "On Hold" },
];

function priorityClass(priority: string) {
  switch (priority) {
    case "HIGH":
      return "bg-red-50 text-red-600";
    case "MEDIUM":
      return "bg-orange-50 text-orange-600";
    case "LOW":
      return "bg-blue-50 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [guestName, setGuestName] = useState("Guest User");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("ALL"); 

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem("guestName");

    if (savedName) {
      setGuestName(savedName);
    }

    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const response = await fetch("https://pyramid-task-management.onrender.com/tasks");

      if (!response.ok) {
        throw new Error("Failed to load tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      alert("Failed to load tasks. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function openAddTask(selectedStatus = "TODO") {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setStatus(selectedStatus);
    setDueDate("");
    setShowModal(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setPriority(task.priority);
    setStatus(task.status);

    if (task.dueDate) {
      setDueDate(task.dueDate.substring(0, 10));
    } else {
      setDueDate("");
    }

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setStatus("TODO");
    setDueDate("");
  }

  async function saveTask() {
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    setSaving(true);

    try {
      const url = editingTask
        ? `https://pyramid-task-management.onrender.com/tasks/${editingTask.id}`
        : "https://pyramid-task-management.onrender.com/tasks";

      const method = editingTask ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status,
          dueDate: dueDate ? `${dueDate}T00:00:00.000Z` : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save task");
      }

      const savedTask = await response.json();

      if (editingTask) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === editingTask.id ? savedTask : task
          )
        );
      } else {
        setTasks((currentTasks) => [...currentTasks, savedTask]);
      }

      closeModal();
    } catch (error) {
      console.error(error);
      alert("Failed to save task. Make sure the backend is running.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(task: Task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `https://pyramid-task-management.onrender.com/tasks/${task.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks((currentTasks) =>
        currentTasks.filter((item) => item.id !== task.id)
      );
    } catch (error) {
      console.error(error);
      alert("Failed to delete task. Make sure the backend is running.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8]">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-gray-200 bg-white md:block">

          <div className="flex h-16 items-center border-b border-gray-100 px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
              P
            </div>

            <span className="ml-3 font-semibold text-gray-900">
              Pyramid
            </span>
          </div>

          <div className="p-4">

            <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wide text-gray-600">
              Workspace
            </p>

            <nav className="space-y-1">

              <button className="flex w-full items-center rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-900">
                <span className="mr-3">▦</span>
                Tasks
              </button>

              <button className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                <span className="mr-3">□</span>
                Projects
              </button>

            </nav>
          </div>

          {/* Guest User */}
          <div className="absolute bottom-5 w-60 border-t border-gray-100 p-4">

            <div className="flex items-center gap-3 rounded-lg p-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                {guestName.charAt(0).toUpperCase()}
              </div>

              <div>

                <p className="text-sm font-medium text-gray-900">
                  {guestName}
                </p>

                <p className="text-xs text-gray-600">
                  Guest account
                </p>

              </div>

            </div>

          </div>

        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">

          {/* Top bar */}
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-5 md:px-8">

            <div>

              <h1 className="text-lg font-semibold text-gray-900">
                Tasks
              </h1>

              <p className="text-xs text-gray-600">
                Manage your work
              </p>

            </div>

            <div className="flex items-center gap-2">

              <div className="hidden sm:block">
                <input
                   type="text"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search tasks..."
                   className="w-44 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
                 />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)} 
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Filters
              </button>

              <button
                onClick={() => openAddTask("TODO")}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                + Add Task
              </button>

            </div>

          </header>
          {showFilters && (
            <div className="border-b border-gray-200 bg-white px-5 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Priority:
                </label>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>

                {priorityFilter !== "ALL" && (
                  <button
                    onClick={() => setPriorityFilter("ALL")}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

{/* Board */}
<div className="overflow-x-auto p-5 md:p-8"></div>

          {/* Board */}
          <div className="overflow-x-auto p-5 md:p-8">

            {loading ? (

              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                Loading tasks...
              </div>

            ) : (

              <div className="grid min-w-[1050px] grid-cols-4 gap-4">

                {columns.map((column) => {

                  const columnTasks = tasks.filter((task) => {
                        const matchesStatus = task.status === column.key;

                        const searchText = search.toLowerCase().trim();

                        const matchesSearch =
                            !searchText ||
                            task.title.toLowerCase().includes(searchText) ||
                            (task.description || "").toLowerCase().includes(searchText);
                        const matchesPriority=
                            priorityFilter === "ALL" ||
                            task.priority === priorityFilter;

                        return matchesStatus && matchesSearch && matchesPriority;
                });

                  return (

                    <div
                      key={column.key}
                      className="min-h-[500px] rounded-xl bg-[#f1f1f2] p-3"
                    >

                      {/* Column Header */}
                      <div className="mb-3 flex items-center justify-between px-1">

                        <div className="flex items-center gap-2">

                          <h2 className="text-sm font-semibold text-gray-900">
                            {column.title}
                          </h2>

                          <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-500">
                            {columnTasks.length}
                          </span>

                        </div>

                        <button
                          onClick={() => openAddTask(column.key)}
                          className="text-lg text-gray-400 hover:text-gray-700"
                        >
                          +
                        </button>

                      </div>

                      {/* Tasks */}
                      <div className="space-y-3">

                        {columnTasks.map((task) => (

                          <div
                            key={task.id}
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                          >

                            {/* Title + Buttons */}
                            <div className="mb-3 flex items-start justify-between gap-3">

                              <h3 className="text-sm font-semibold leading-5 text-gray-900">
                                {task.title}
                              </h3>

                              <div className="flex items-center gap-1">

                                <button
                                  onClick={() => openEditTask(task)}
                                  className="rounded-md px-2 py-1 text-sm hover:bg-gray-100"
                                  title="Edit task"
                                >
                                  ✏️
                                </button>

                                <button
                                  onClick={() => deleteTask(task)}
                                  className="rounded-md px-2 py-1 text-sm hover:bg-red-50"
                                  title="Delete task"
                                >
                                  🗑️
                                </button>

                              </div>

                            </div>

                            {/* Description */}
                            {task.description && (

                              <p className="mb-4 text-xs leading-5 text-gray-500">
                                {task.description}
                              </p>

                            )}

                            {/* Due Date */}
                            {task.dueDate && (

                              <p className="mb-3 text-xs text-gray-500">
                                📅 Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </p>

                            )}

                            {/* Priority + ID */}
                            <div className="flex items-center justify-between">

                              <span
                                className={`rounded-md px-2 py-1 text-[11px] font-medium ${priorityClass(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>

                              <span className="text-xs text-gray-400">
                                #{task.id}
                              </span>

                            </div>

                          </div>

                        ))}

                        {columnTasks.length === 0 && (

                          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">

                            <p className="text-xs text-gray-400">
                              No tasks
                            </p>

                          </div>

                        )}

                      </div>

                      {/* Add Task */}
                      <button
                        onClick={() => openAddTask(column.key)}
                        className="mt-3 w-full rounded-lg px-3 py-2 text-left text-xs text-gray-500 hover:bg-white hover:text-gray-800"
                      >
                        + Add Task
                      </button>

                    </div>

                  );
                })}

              </div>

            )}

          </div>

        </section>

      </div>

      {/* Add / Edit Modal */}
      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            {/* Modal Header */}
            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {editingTask ? "Edit Task" : "Add Task"}
                </h2>

                <p className="text-sm text-gray-600">
                  {editingTask
                    ? "Update your task"
                    : "Create a new task"}
                </p>

              </div>

              <button
                onClick={closeModal}
                className="text-xl text-gray-500 hover:text-gray-900"
              >
                ×
              </button>

            </div>

            {/* Title */}
            <div className="mb-4">

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
                autoFocus
                className="relative z-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
              />

            </div>

            {/* Description */}
            <div className="mb-4">

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
              />

            </div>

            {/* Priority */}
            <div className="mb-4">

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              >

                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>

              </select>

            </div>

            {/* Due Date */}
            <div className="mb-4">

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Due Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
              />

            </div>

            {/* Status */}
            <div className="mb-6">

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              >

                <option value="TODO">To Do</option>
                <option value="DOING">Doing</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>

              </select>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={saveTask}
                disabled={saving || !title.trim()}
                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving
                  ? editingTask
                    ? "Saving..."
                    : "Creating..."
                  : editingTask
                    ? "Save Changes"
                    : "Create Task"}

              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}