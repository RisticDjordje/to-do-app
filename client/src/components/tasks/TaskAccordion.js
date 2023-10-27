import React, { useState, useEffect } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskActions from "./TaskActions";
import { styled } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useApi } from "../../contexts/ApiProvider";

const StyledAccordion = styled(Accordion)({
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
});

const StyledAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "#f4f7fa",
  borderBottom: "1px solid #ccc",
  display: "flex",
  alignItems: "center",
  padding: "6px 12px", // Reduced padding for a more compact look
  height: "2.5rem", // Optional: Adjust height for better spacing
});

const TaskTitleContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  flex: 1,
  cursor: "pointer",
  fontSize: "0.8rem",
  margin: "0 5px", // Optional: Adjust margin for better spacing
});

const StyledAccordionDetails = styled(AccordionDetails)({
  backgroundColor: "#e0e7ec",
  padding: "0.5rem", // Optional: Adjust padding for better spacing
});

const TaskAccordion = ({ task, onUpdateLists }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTaskName, setNewTaskName] = useState(task.name);
  const [expanded, setExpanded] = useState(false);
  const [newSubtaskAdded, setNewSubtaskAdded] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const api = useApi();

  const handleCheckboxChange = async (taskId, newStatus) => {
    try {
      await api.patch("/tasks/" + taskId + "/update", {
        name: task.name,
        is_completed: newStatus,
        list_id: task.list_id,
        parent_id: task.parent_id,
      });
      onUpdateLists();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleEditTask = async () => {
    if (newTaskName.trim().length === 0) {
      console.warn("Task name cannot be empty.");
      setNewTaskName(task.name);
      return;
    }

    try {
      // Update the task name on the server
      await api.patch("/tasks/" + task.id + "/update", {
        ...task,
        name: newTaskName,
      });
      // Update your task lists
      onUpdateLists();
      // Now set editing to false
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task name:", error);
      // Optionally reset the input field to the old task name if there's an error
      setNewTaskName(task.name);
    }
  };

  useEffect(() => {
    if (newSubtaskAdded) {
      setExpanded(true);
      setNewSubtaskAdded(false);
    }
  }, [newSubtaskAdded]);

  const onSubtaskAdded = () => {
    setNewSubtaskAdded(true);
  };

  const toggleAccordion = (e) => {
    e.stopPropagation();
    if (hasSubtasks) {
      setExpanded(!expanded);
    }
  };

  return (
    <StyledAccordion expanded={expanded && hasSubtasks}>
      <StyledAccordionSummary
        expandIcon={hasSubtasks && <ExpandMoreIcon onClick={toggleAccordion} />}
        onClick={(e) => e.stopPropagation()}
        aria-controls="panel-content"
        id="panel-header"
      >
        <Checkbox
          checked={task.is_completed}
          onChange={(e) => handleCheckboxChange(task.id, e.target.checked)}
        />
        <TaskTitleContainer onClick={() => setIsEditing(true)}>
          {isEditing ? (
            <TextField
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onBlur={handleEditTask}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleEditTask();
                }
              }}
              fullWidth
              autoFocus
            />
          ) : (
            <Typography>{task.name}</Typography>
          )}
        </TaskTitleContainer>

        <TaskActions
          task={task}
          onUpdateLists={onUpdateLists}
          onSubtaskAdded={onSubtaskAdded}
        />
      </StyledAccordionSummary>
      {hasSubtasks && (
        <StyledAccordionDetails>
          {task.subtasks.map((subtask) => (
            <TaskAccordion
              key={subtask.id}
              task={subtask}
              onUpdateLists={onUpdateLists}
            />
          ))}
        </StyledAccordionDetails>
      )}
    </StyledAccordion>
  );
};

export default TaskAccordion;
