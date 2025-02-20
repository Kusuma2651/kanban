import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./App.css";

const initialTasks = {
  "To Do": [],
  "In Progress": [],
  "Done": [],
};

const App = () => {
  const [tasks, setTasks] = useState(() => {
    return JSON.parse(localStorage.getItem("tasks")) || initialTasks;
  });

  const [darkMode, setDarkMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (column) => {
    const title = prompt("Enter Task Title:");
    if (title) {
      const newTask = { id: `${Date.now()}`, title };
      setTasks((prev) => ({
        ...prev,
        [column]: [...prev[column], newTask],
      }));
    }
  };

  const deleteTask = (column, id) => {
    setTasks((prev) => ({
      ...prev,
      [column]: prev[column].filter((task) => task.id !== id),
    }));
  };

  const startEditing = (id, title) => {
    setEditTaskId(id);
    setEditText(title);
  };

  const saveEdit = (column, id) => {
    setTasks((prev) => ({
      ...prev,
      [column]: prev[column].map((task) =>
        task.id === id ? { ...task, title: editText } : task
      ),
    }));
    setEditTaskId(null);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const startCol = source.droppableId;
    const endCol = destination.droppableId;

    const startTasks = Array.from(tasks[startCol]);
    const endTasks = Array.from(tasks[endCol]);

    const [movedTask] = startTasks.splice(source.index, 1);

    if (startCol === endCol) {
      startTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [startCol]: startTasks,
      }));
    } else {
      endTasks.splice(destination.index, 0, movedTask);
      setTasks((prev) => ({
        ...prev,
        [startCol]: startTasks,
        [endCol]: endTasks,
      }));
    }
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <button className="toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <h1 className="heading">Kanban Task Board</h1>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban">
          {Object.keys(tasks).map((column) => (
            <Droppable key={column} droppableId={column}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h3>{column}</h3>
                  <button className="add-btn" onClick={() => addTask(column)}>
                    + Add Task
                  </button>
                  {tasks[column].map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="task"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {editTaskId === task.id ? (
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              onBlur={() => saveEdit(column, task.id)}
                              autoFocus
                            />
                          ) : (
                            <span>{task.title}</span>
                          )}
                          <div className="task-actions">
                            <button
                              className="edit-btn"
                              onClick={() => startEditing(task.id, task.title)}
                            >
                              ✏️
                            </button>
                            <button
                              className="delete-btn"
                              onClick={() => deleteTask(column, task.id)}
                            >
                              ❌
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default App;
