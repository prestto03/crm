import { useState, useRef } from "react";
import { formatDate } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import esLocale from "@fullcalendar/core/locales/es";
import {
  List,
  ListItem,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Box,
} from "@mui/material";


/////////////////////////////////// ICONOS //////////////////////////////////////////////////
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

//////////////////////// ALERTAS  ///////////////////////////////////
import { useSnackbar } from "notistack";

export default function Tareas() {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [nuevaTarea, setNuevaTarea] = useState({
    id: null,
    title: "",
    start: formatDateTime(new Date()), // Inicializa con la fecha y hora actual del calendario
    end: formatDateTime(new Date()),
    allDay: false,
    description: "",
    estado: "Pendiente",
    isReadOnly: false, // Estado solo de lectura
  });

  const estadoOptions = ["Pendiente", "Realizada", "No Realizada"];
  const calendarRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  };

  const handleEvents = (events) => {
    setCurrentEvents(events);
  };

  const handleDateSelect = (selectInfo) => {
    if (selectInfo.start && selectInfo.end) {
      setNuevaTarea({
        id: createEventId(),
        title: "",
        start: formatDateTime(selectInfo.start),
        end: formatDateTime(selectInfo.end),
        description: "",
        estado: "Pendiente",
        isReadOnly: false, // La tarea se puede editar desde el principio
      });
      setSelectedEvent(null); // Limpia cualquier evento seleccionado previamente
      openDialog();
    }
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleGuardarTarea = () => {
    const errors = {};

    if (!nuevaTarea.title.trim()) {
      errors.title = "El título es obligatorio";
    }

    if (!nuevaTarea.start.trim()) {
      errors.start = "La fecha de inicio es obligatoria";
    }

    if (!nuevaTarea.end.trim()) {
      errors.end = "La fecha de fin es obligatoria";
    }

    if (new Date(nuevaTarea.end) < new Date(nuevaTarea.start)) {
      errors.end =
        "La fecha de fin no puede ser anterior a la fecha de inicio";
    }

    if (nuevaTarea.isReadOnly && nuevaTarea.estado !== "Realizada") {
      // Verifica si la tarea es solo de lectura (ya ha sido 'Realizada') y si el estado ha cambiado
      enqueueSnackbar("No se puede modificar una tarea que ya ha sido 'Realizada'", { variant: "error" });
      return; // No continúes si no se puede modificar la tarea
    }

    // Aplica la animación Shake a los campos con errores
    document.querySelectorAll(".shakeable").forEach((element) => {
      element.classList.add("shake");
      // Elimina la clase "shake" después de la animación
      setTimeout(() => {
        element.classList.remove("shake");
      }, 300);
    });
    // Verifica si hay errores de validación
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // No continúes si hay errores
    }
    if (selectedEvent) {
      // Esto es en una edición
      // Actualiza el evento seleccionado con los nuevos valores
      selectedEvent.setProp("title", nuevaTarea.title);
      selectedEvent.setStart(nuevaTarea.start);
      selectedEvent.setEnd(nuevaTarea.end);
      selectedEvent.setAllDay(nuevaTarea.allDay);
      selectedEvent.setExtendedProp("description", nuevaTarea.description);
      selectedEvent.setExtendedProp("estado", nuevaTarea.estado);
      // Configura el evento como solo lectura si es 'Realizada'
      selectedEvent.setExtendedProp(
        "isReadOnly",
        nuevaTarea.estado === "Realizada"
      );
    } else {
      // Esto es una nueva tarea
      // Crea un nuevo evento y agrega al calendario
      const newEvent = {
        id: nuevaTarea.id,
        title: nuevaTarea.title,
        start: nuevaTarea.allDay
          ? nuevaTarea.start
          : `${nuevaTarea.start}:00`,
        end: nuevaTarea.allDay ? nuevaTarea.end : `${nuevaTarea.end}:00`,
        allDay: nuevaTarea.allDay,
        description: nuevaTarea.description,
        estado: nuevaTarea.estado,
        // Configuro el evento como solo lectura si es 'Realizada'
        isReadOnly: nuevaTarea.estado === "Realizada",
      };
      // Declaro las propiedades extendidas de estilo
      newEvent.backgroundColor = getBackgroundColor(nuevaTarea.estado);
      newEvent.textColor = getTextColor(nuevaTarea.estado);
      calendarRef.current.getApi().addEvent(newEvent);
    }
    closeDialog();
  };

  const handleBorrarTarea = () => {
    if (selectedEvent) {
      selectedEvent.remove();
      setSelectedEvent(null);
    }
    closeDialog();
  };

  const openDialog = () => {
    setValidationErrors({});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    const estado = clickInfo.event.extendedProps.estado || "Pendiente";
    const isReadOnly = clickInfo.event.extendedProps.isReadOnly || false; // Verifica si el evento está marcado como 'Realizada'
    setNuevaTarea({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: formatDateTime(clickInfo.event.start),
      end: formatDateTime(clickInfo.event.end),
      allDay: clickInfo.event.allDay,
      description: clickInfo.event.extendedProps.description || "",
      estado,
      isReadOnly, // Configura isReadOnly según el estado
    });
    openDialog();
  };

  const loadEventData = (event) => {
    setSelectedEvent(event);
    const estado = event.extendedProps.estado || "Pendiente";
    const isReadOnly = event.extendedProps.isReadOnly || false;
    setNuevaTarea({
      id: event.id,
      title: event.title,
      start: formatDateTime(event.start),
      end: formatDateTime(event.end),
      allDay: event.allDay,
      description: event.extendedProps.description || "",
      estado,
      isReadOnly,
    });
  };
  

  const handleListItemClick = (event) => {
    loadEventData(event); // Carga los detalles del evento
    openDialog(); // Abre el diálogo
  };
  
  return (
    <Box>
      <div className="demo-app">
        <div className="demo-app-sidebar">
          <div className="demo-app-sidebar-section">
            <Button
              sx={{
                marginBottom: 2,
                backgroundColor: "#1976D2",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1565C0",
                },
              }}
              size="large"
              variant="contained"
              color="inherit"
              onClick={() => {
                setNuevaTarea({
                  id: createEventId(),
                  title: "",
                  start: formatDateTime(new Date()), // Inicializa con la fecha y hora actual del calendario
                  end: formatDateTime(new Date()),
                  allDay: false,
                  description: "",
                  estado: "Pendiente",
                  isReadOnly: false, // Estado solo de lectura
                });
                setSelectedEvent(null); // Limpia cualquier evento seleccionado previamente
                openDialog();
              }}
            >
              <AddIcon sx={{ margin: 0.5 }} />
              Nuevo Evento
            </Button>
            <FormControlLabel
              control={
                <Checkbox
                  checked={weekendsVisible}
                  onChange={handleWeekendsToggle}
                  color="primary"
                />
              }
              label="Ver fines de Semana"
              labelPlacement="end"
            />
          </div>
          <div className="demo-app-sidebar-section">
            <h2>Eventos pendientes: ({currentEvents.length})</h2>
            <List>
              {currentEvents.map((event) => (
                <ListItem
                  key={event.id}
                  onClick={() => handleListItemClick(event)}
                  className="list-items"
                  sx={{
                    backgroundColor: getBackgroundColor(
                      event.extendedProps.estado || "Pendiente"
                    ),
                    marginBottom: 1,
                  }}
                >
                  <ListItemText
                    primary={event.title}
                    secondary={formatDate(event.start, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  />
                </ListItem>
              ))}
            </List>
          </div>
        </div>
        <div className="demo-app-main">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            locale={esLocale}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={weekendsVisible}
            initialEvents={eventos}
            select={handleDateSelect}
            eventContent={renderEventContent}
            eventClick={handleEventClick}
            eventsSet={handleEvents}
          />
        </div>
        <Dialog open={isDialogOpen} onClose={closeDialog}>
          <DialogTitle>
            {selectedEvent ? "Editar Evento" : "Nuevo Evento"}{" "}
            <Button
              onClick={handleBorrarTarea}
              variant="text"
              color="inherit"
              startIcon={<DeleteOutline />}
              size="60px"
            />
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Completa los detalles del evento.
            </DialogContentText>
            <TextField
              className={validationErrors.title ? "shakeable" : ""}
              autoFocus
              margin="dense"
              name="title"
              label="Nombre del evento"
              fullWidth
              value={nuevaTarea.title}
              onChange={(e) =>
                setNuevaTarea({ ...nuevaTarea, title: e.target.value })
              }
              error={!!validationErrors.title}
              helperText={validationErrors.title}
              disabled={nuevaTarea.isReadOnly}
            />
            <TextField
              margin="dense"
              name="description"
              label="Descripción"
              fullWidth
              value={nuevaTarea.description}
              onChange={(e) =>
                setNuevaTarea({ ...nuevaTarea, description: e.target.value })
              }
              disabled={nuevaTarea.isReadOnly}
            />
            <TextField
              className={validationErrors.start ? "shakeable" : ""}
              margin="dense"
              name="start"
              label="Fecha de inicio"
              fullWidth
              type="datetime-local"
              value={nuevaTarea.start}
              onChange={(e) =>
                setNuevaTarea({ ...nuevaTarea, start: e.target.value })
              }
              error={!!validationErrors.start}
              helperText={validationErrors.start}
              disabled={nuevaTarea.isReadOnly}
            />
            <TextField
              className={validationErrors.end ? "shakeable" : ""}
              margin="dense"
              name="end"
              label="Fecha de fin"
              fullWidth
              type="datetime-local"
              value={nuevaTarea.end}
              onChange={(e) =>
                setNuevaTarea({ ...nuevaTarea, end: e.target.value })
              }
              error={!!validationErrors.end}
              helperText={validationErrors.end}
              disabled={nuevaTarea.isReadOnly}
            />
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Estado del evento</FormLabel>
              <RadioGroup
                row
                name="estado"
                value={nuevaTarea.estado}
                onChange={(e) =>
                  setNuevaTarea({ ...nuevaTarea, estado: e.target.value })
                }
                disabled={nuevaTarea.isReadOnly}
              >
                {estadoOptions.map((estado) => (
                  <FormControlLabel
                    key={estado}
                    value={estado}
                    control={<Radio color="primary" />}
                    label={estado}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleGuardarTarea}
              variant="contained"
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                "&:hover": {
                  backgroundColor: "#45A049",
                },
              }}
              startIcon={<CheckCircleIcon />}
            >
              Guardar
            </Button>
            <Button
              onClick={closeDialog}
              variant="contained"
              sx={{
                backgroundColor: "#f44336",
                color: "white",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
              }}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Box>
  );
}

// formateo de horarios
function formatDateTime(date) {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Añade ceros a la izquierda si es necesario
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function renderEventContent(eventInfo) {
  const backgroundColor = getBackgroundColor(
    eventInfo.event.extendedProps.estado
  );
  const textColor = getTextColor(eventInfo.event.extendedProps.estado);

  const style = {
    backgroundColor,
    color: textColor,
  };

  return (
    <div style={style}>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </div>
  );
}

function getBackgroundColor(estado) {
  switch (estado) {
    case "Pendiente":
      return "#5DADE2";
    case "Realizada":
      return "#D3D3D3";
    case "No Realizada":
      return "#AA0808";
    default:
      return "#FFFFFF";
  }
}

function getTextColor(estado) {
  switch (estado) {
    case "Realizada":
      return "#000";
    default:
      return "#FFFFFF";
  }
}

let eventGuid = 0;

const eventos = [
  {
    id: createEventId(),
    title: "Reunión de equipo",
    start: "2023-10-14T09:00",
    end: "2023-10-14T11:30",
    allDay: false,
    description: "Reunión de inicio de proyecto.",
    estado: "Pendiente",
    isReadOnly: false, // Esto se establece en false para permitir la edición inicial
  },
  {
    id: createEventId(),
    title: "Evento importante",
    start: "2023-10-24T14:00",
    end: "2023-10-24T16:00",
    allDay: false,
    description: "Completar",
    estado: "Realizada",
    isReadOnly: true, // Esto se establece en true para evitar la edición después de guardado
  },
];

function createEventId() {
  return String(eventGuid++);
}
