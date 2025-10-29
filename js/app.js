// Clase principal para el control de horas trabajadas
class WorkTimeTracker {
    constructor() {
        this.schedules = JSON.parse(localStorage.getItem('workSchedules')) || [];
        this.hourlyRate = parseInt(localStorage.getItem('hourlyRate')) || 4500;
        this.currentWeekStart = this.getWeekStart(new Date()); // Lunes de la semana actual
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.migrateOldData();
        this.init();
    }

    migrateOldData() {
        // Migrar datos existentes de formato YYYY-MM-DD a DD/MM/YYYY
        let needsMigration = false;
        this.schedules.forEach(schedule => {
            if (schedule.date && schedule.date.includes('-') && !schedule.date.includes('/')) {
                // Es formato YYYY-MM-DD, convertir a DD/MM/YYYY
                schedule.date = this.formatDateFromDDMMYYYY(schedule.date);
                needsMigration = true;
            }
        });
        
        if (needsMigration) {
            localStorage.setItem('workSchedules', JSON.stringify(this.schedules));
        }
    }

    init() {
        this.initializeTimeSelectors();
        this.initializeDatePicker();
        this.setupEventListeners();
        this.initializeTheme();
        this.updateHourlyRateDisplay();
        this.updateWeekDisplay();
        this.renderSchedules();
        this.updateWeeklySummary();
    }

    initializeTheme() {
        // Aplicar tema guardado
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeButton();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeButton();
    }

    updateThemeButton() {
        const themeIcon = document.getElementById('themeIcon');
        const themeText = document.getElementById('themeText');
        
        if (this.currentTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Modo Claro';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Modo Oscuro';
        }
    }

    initializeTimeSelectors() {
        // Crear opciones para horas (00-23)
        const hourSelectors = ['startHour1', 'endHour1', 'startHour2', 'endHour2'];
        hourSelectors.forEach(id => {
            const select = document.getElementById(id);
            for (let i = 0; i < 24; i++) {
                const option = document.createElement('option');
                option.value = i.toString().padStart(2, '0');
                option.textContent = i.toString().padStart(2, '0');
                select.appendChild(option);
            }
        });

        // Crear opciones para minutos (00-59)
        const minuteSelectors = ['startMinute1', 'endMinute1', 'startMinute2', 'endMinute2'];
        minuteSelectors.forEach(id => {
            const select = document.getElementById(id);
            for (let i = 0; i < 60; i += 5) { // Incrementos de 5 minutos
                const option = document.createElement('option');
                option.value = i.toString().padStart(2, '0');
                option.textContent = i.toString().padStart(2, '0');
                select.appendChild(option);
            }
        });
    }

    initializeDatePicker() {
        const dateInput = document.getElementById('date');
        
        flatpickr(dateInput, {
            locale: "es",
            dateFormat: "d/m/Y",
            defaultDate: "today",
            maxDate: "today",
            onChange: (selectedDates, dateStr) => {
                // Actualizar el valor del input
                dateInput.value = dateStr;
            }
        });
    }

    setupEventListeners() {
        // Botón para agregar horario
        document.getElementById('addSchedule').addEventListener('click', () => {
            this.addSchedule();
        });

        // Cambio en el valor por hora
        document.getElementById('hourlyRate').addEventListener('change', (e) => {
            this.hourlyRate = parseInt(e.target.value) || 4500;
            localStorage.setItem('hourlyRate', this.hourlyRate);
            this.updateWeeklySummary();
            this.renderSchedules();
        });

        // Navegación de semanas
        document.getElementById('prevWeek').addEventListener('click', () => {
            this.navigateWeek(-1);
        });

        document.getElementById('nextWeek').addEventListener('click', () => {
            this.navigateWeek(1);
        });

        // Cambio de tema
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Validación en tiempo real de los campos de tiempo
        ['startHour1', 'endHour1', 'startMinute1', 'endMinute1', 'startHour2', 'endHour2', 'startMinute2', 'endMinute2'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.validateTimeInputs();
            });
        });
    }

    getWeekStart(date) {
        // Obtener el lunes de la semana que contiene la fecha dada
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar cuando es domingo
        const monday = new Date(d.setDate(diff));
        return monday;
    }

    getWeekEnd(weekStart) {
        // Obtener el domingo de la semana
        const sunday = new Date(weekStart);
        sunday.setDate(sunday.getDate() + 6);
        return sunday;
    }

    formatDateToDDMMYYYY(dateString) {
        // Convertir de DD/MM/YYYY a formato para cálculos
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    formatDateFromDDMMYYYY(dateString) {
        // Convertir de YYYY-MM-DD a DD/MM/YYYY para mostrar
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    convertDDMMYYYYToDate(dateString) {
        // Convertir DD/MM/YYYY a objeto Date para comparaciones
        const [day, month, year] = dateString.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    formatDateForDisplay(date) {
        // Formatear fecha para mostrar DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    getWeekNumber(date) {
        // Calcular el número de semana del año
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const week1 = new Date(d.getFullYear(), 0, 4);
        return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    navigateWeek(direction) {
        // Navegar a la semana anterior o siguiente
        const newWeekStart = new Date(this.currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + (direction * 7));
        
        // No permitir navegar a semanas futuras
        const today = new Date();
        const todayWeekStart = this.getWeekStart(today);
        
        if (newWeekStart <= todayWeekStart) {
            this.currentWeekStart = newWeekStart;
            this.updateWeekDisplay();
            this.renderSchedules();
            this.updateWeeklySummary();
        }
    }

    updateWeekDisplay() {
        const weekEnd = this.getWeekEnd(this.currentWeekStart);
        const weekNumber = this.getWeekNumber(this.currentWeekStart);
        
        const weekStartFormatted = this.formatDateForDisplay(this.currentWeekStart);
        const weekEndFormatted = this.formatDateForDisplay(weekEnd);
        
        document.getElementById('currentWeekRange').textContent = 
            `Semana del ${weekStartFormatted} al ${weekEndFormatted}`;
        document.getElementById('weekNumber').textContent = `Semana ${weekNumber}`;
        
        document.getElementById('scheduleWeekInfo').textContent = 
            `Mostrando horarios de la semana del ${weekStartFormatted} al ${weekEndFormatted}`;
        
        // Actualizar botones de navegación
        const today = new Date();
        const todayWeekStart = this.getWeekStart(today);
        const isCurrentWeek = this.currentWeekStart.getTime() === todayWeekStart.getTime();
        
        document.getElementById('nextWeek').disabled = isCurrentWeek;
    }

    isDateInCurrentWeek(dateString) {
        // Verificar si una fecha está en la semana actual seleccionada
        const date = this.convertDDMMYYYYToDate(dateString);
        const weekEnd = this.getWeekEnd(this.currentWeekStart);
        
        // Normalizar las fechas para comparación (solo año, mes, día)
        const dateNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const weekStartNormalized = new Date(this.currentWeekStart.getFullYear(), this.currentWeekStart.getMonth(), this.currentWeekStart.getDate());
        const weekEndNormalized = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
        
        return dateNormalized >= weekStartNormalized && dateNormalized <= weekEndNormalized;
    }

    getCurrentWeekSchedules() {
        // Obtener solo los horarios de la semana actual seleccionada
        const filteredSchedules = this.schedules.filter(schedule => this.isDateInCurrentWeek(schedule.date));
        
        // Debug: mostrar información de depuración
        console.log('=== DEBUG SEMANA ===');
        console.log('Semana actual:', this.formatDateForDisplay(this.currentWeekStart), 'al', this.formatDateForDisplay(this.getWeekEnd(this.currentWeekStart)));
        console.log('Total horarios:', this.schedules.length);
        console.log('Horarios filtrados:', filteredSchedules.length);
        this.schedules.forEach(schedule => {
            const isInWeek = this.isDateInCurrentWeek(schedule.date);
            console.log(`${schedule.date} - ${isInWeek ? 'SÍ' : 'NO'} está en la semana`);
        });
        console.log('==================');
        
        return filteredSchedules;
    }

    validateTimeInputs() {
        const startHour1 = document.getElementById('startHour1').value;
        const endHour1 = document.getElementById('endHour1').value;
        const startMinute1 = document.getElementById('startMinute1').value;
        const endMinute1 = document.getElementById('endMinute1').value;
        
        const startHour2 = document.getElementById('startHour2').value;
        const endHour2 = document.getElementById('endHour2').value;
        const startMinute2 = document.getElementById('startMinute2').value;
        const endMinute2 = document.getElementById('endMinute2').value;

        // Validar turno 1
        if (startHour1 && endHour1 && startMinute1 && endMinute1) {
            const startTime1 = `${startHour1}:${startMinute1}`;
            const endTime1 = `${endHour1}:${endMinute1}`;
            
            if (this.timeToMinutes(startTime1) >= this.timeToMinutes(endTime1)) {
                document.getElementById('endHour1').setCustomValidity('La hora de salida debe ser posterior a la hora de entrada');
                document.getElementById('endMinute1').setCustomValidity('La hora de salida debe ser posterior a la hora de entrada');
            } else {
                document.getElementById('endHour1').setCustomValidity('');
                document.getElementById('endMinute1').setCustomValidity('');
            }
        }

        // Validar turno 2
        const turn2Complete = startHour2 && endHour2 && startMinute2 && endMinute2;
        const turn2Partial = startHour2 || endHour2 || startMinute2 || endMinute2;
        
        if (turn2Partial && !turn2Complete) {
            document.getElementById('startHour2').setCustomValidity('Debe completar todos los campos del turno 2');
            document.getElementById('endHour2').setCustomValidity('Debe completar todos los campos del turno 2');
            document.getElementById('startMinute2').setCustomValidity('Debe completar todos los campos del turno 2');
            document.getElementById('endMinute2').setCustomValidity('Debe completar todos los campos del turno 2');
        } else if (turn2Complete) {
            const startTime2 = `${startHour2}:${startMinute2}`;
            const endTime2 = `${endHour2}:${endMinute2}`;
            
            if (this.timeToMinutes(startTime2) >= this.timeToMinutes(endTime2)) {
                document.getElementById('endHour2').setCustomValidity('La hora de salida debe ser posterior a la hora de entrada');
                document.getElementById('endMinute2').setCustomValidity('La hora de salida debe ser posterior a la hora de entrada');
            } else {
                document.getElementById('startHour2').setCustomValidity('');
                document.getElementById('endHour2').setCustomValidity('');
                document.getElementById('startMinute2').setCustomValidity('');
                document.getElementById('endMinute2').setCustomValidity('');
            }
        } else {
            document.getElementById('startHour2').setCustomValidity('');
            document.getElementById('endHour2').setCustomValidity('');
            document.getElementById('startMinute2').setCustomValidity('');
            document.getElementById('endMinute2').setCustomValidity('');
        }
    }

    timeToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    calculateHoursWorked(startTime, endTime) {
        if (!startTime || !endTime) return 0;
        
        const startMinutes = this.timeToMinutes(startTime);
        const endMinutes = this.timeToMinutes(endTime);
        
        // Manejar turnos que cruzan medianoche
        let totalMinutes;
        if (endMinutes < startMinutes) {
            // Turno nocturno (ej: 23:00 a 01:00)
            totalMinutes = (24 * 60) - startMinutes + endMinutes;
        } else {
            totalMinutes = endMinutes - startMinutes;
        }
        
        return totalMinutes / 60; // Convertir a horas
    }

    getDayName(dateString) {
        // Corregir el cálculo de días de la semana
        const [day, month, year] = dateString.split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // month es 0-indexado
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[date.getDay()];
    }

    addSchedule() {
        const date = document.getElementById('date').value;
        const startHour1 = document.getElementById('startHour1').value;
        const endHour1 = document.getElementById('endHour1').value;
        const startMinute1 = document.getElementById('startMinute1').value;
        const endMinute1 = document.getElementById('endMinute1').value;
        
        const startHour2 = document.getElementById('startHour2').value;
        const endHour2 = document.getElementById('endHour2').value;
        const startMinute2 = document.getElementById('startMinute2').value;
        const endMinute2 = document.getElementById('endMinute2').value;

        // Validaciones
        if (!date || !startHour1 || !endHour1 || !startMinute1 || !endMinute1) {
            this.showMessage('Por favor complete al menos la fecha y el turno 1', 'error');
            return;
        }

        this.validateTimeInputs();

        // Verificar si ya existe un horario para esta fecha
        const existingIndex = this.schedules.findIndex(schedule => schedule.date === date);
        
        const startTime1 = `${startHour1}:${startMinute1}`;
        const endTime1 = `${endHour1}:${endMinute1}`;
        const startTime2 = startHour2 && startMinute2 ? `${startHour2}:${startMinute2}` : null;
        const endTime2 = endHour2 && endMinute2 ? `${endHour2}:${endMinute2}` : null;

        const schedule = {
            date: date,
            startTime1: startTime1,
            endTime1: endTime1,
            startTime2: startTime2,
            endTime2: endTime2,
            hoursWorked1: this.calculateHoursWorked(startTime1, endTime1),
            hoursWorked2: this.calculateHoursWorked(startTime2, endTime2),
            totalHoursDay: 0,
            salaryDay: 0
        };

        // Calcular totales del día
        schedule.totalHoursDay = schedule.hoursWorked1 + schedule.hoursWorked2;
        schedule.salaryDay = schedule.totalHoursDay * this.hourlyRate;

        if (existingIndex >= 0) {
            // Actualizar horario existente
            this.schedules[existingIndex] = schedule;
            this.showMessage('Horario actualizado correctamente', 'success');
        } else {
            // Agregar nuevo horario
            this.schedules.push(schedule);
            this.showMessage('Horario agregado correctamente', 'success');
        }

        // Ordenar por fecha (convertir DD/MM/YYYY a formato comparable)
        this.schedules.sort((a, b) => {
            const dateA = this.convertDDMMYYYYToDate(a.date);
            const dateB = this.convertDDMMYYYYToDate(b.date);
            return dateA - dateB;
        });

        // Guardar en localStorage
        localStorage.setItem('workSchedules', JSON.stringify(this.schedules));

        // Limpiar formulario
        this.clearForm();

        // Actualizar vista
        this.renderSchedules();
        this.updateWeeklySummary();
    }

    clearForm() {
        document.getElementById('startHour1').value = '';
        document.getElementById('endHour1').value = '';
        document.getElementById('startMinute1').value = '';
        document.getElementById('endMinute1').value = '';
        document.getElementById('startHour2').value = '';
        document.getElementById('endHour2').value = '';
        document.getElementById('startMinute2').value = '';
        document.getElementById('endMinute2').value = '';
        
        // Resetear el calendario a hoy
        const dateInput = document.getElementById('date');
        const today = new Date();
        const todayFormatted = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        dateInput.value = todayFormatted;
    }

    deleteSchedule(index) {
        if (confirm('¿Está seguro de que desea eliminar este horario?')) {
            this.schedules.splice(index, 1);
            localStorage.setItem('workSchedules', JSON.stringify(this.schedules));
            this.renderSchedules();
            this.updateWeeklySummary();
            this.showMessage('Horario eliminado correctamente', 'success');
        }
    }

    formatTime(timeString) {
        if (!timeString) return '-';
        return timeString;
    }

    formatHours(hours) {
        if (hours === 0) return '-';
        return hours.toFixed(1) + 'h';
    }

    formatSalary(salary) {
        return '$' + salary.toLocaleString('es-AR');
    }

    renderSchedules() {
        const tbody = document.getElementById('scheduleTableBody');
        tbody.innerHTML = '';

        const currentWeekSchedules = this.getCurrentWeekSchedules();

        if (currentWeekSchedules.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 40px; color: #666;">
                        No hay horarios registrados para esta semana. Agregue su primer horario arriba.
                    </td>
                </tr>
            `;
            return;
        }

        currentWeekSchedules.forEach((schedule, index) => {
            // Encontrar el índice real en el array completo para el botón eliminar
            const realIndex = this.schedules.findIndex(s => s.date === schedule.date);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${schedule.date}</td>
                <td>${this.getDayName(schedule.date)}</td>
                <td>${this.formatTime(schedule.startTime1)} - ${this.formatTime(schedule.endTime1)}</td>
                <td>${this.formatHours(schedule.hoursWorked1)}</td>
                <td>${schedule.startTime2 ? `${this.formatTime(schedule.startTime2)} - ${this.formatTime(schedule.endTime2)}` : '-'}</td>
                <td>${this.formatHours(schedule.hoursWorked2)}</td>
                <td><strong>${this.formatHours(schedule.totalHoursDay)}</strong></td>
                <td><strong>${this.formatSalary(schedule.salaryDay)}</strong></td>
                <td>
                    <button class="btn-danger" onclick="workTracker.deleteSchedule(${realIndex})">
                        Eliminar
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateWeeklySummary() {
        const currentWeekSchedules = this.getCurrentWeekSchedules();
        const totalHours = currentWeekSchedules.reduce((sum, schedule) => sum + schedule.totalHoursDay, 0);
        const totalSalary = totalHours * this.hourlyRate;
        const workingDays = currentWeekSchedules.length;
        const dailyAverage = workingDays > 0 ? totalHours / workingDays : 0;

        document.getElementById('totalHours').textContent = totalHours.toFixed(1) + 'h';
        document.getElementById('totalSalary').textContent = this.formatSalary(totalSalary);
        document.getElementById('dailyAverage').textContent = dailyAverage.toFixed(1) + 'h';
    }

    updateHourlyRateDisplay() {
        document.getElementById('hourlyRate').value = this.hourlyRate;
    }

    showMessage(message, type) {
        // Remover mensaje anterior si existe
        const existingMessage = document.querySelector('.status-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message status-${type}`;
        messageDiv.textContent = message;

        // Insertar después del header
        const container = document.querySelector('.container');
        container.insertBefore(messageDiv, container.children[1]);

        // Remover mensaje después de 3 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    // Método para exportar datos (bonus)
    exportData() {
        const currentWeekSchedules = this.getCurrentWeekSchedules();
        const data = {
            schedules: currentWeekSchedules,
            hourlyRate: this.hourlyRate,
            totalHours: currentWeekSchedules.reduce((sum, schedule) => sum + schedule.totalHoursDay, 0),
            totalSalary: currentWeekSchedules.reduce((sum, schedule) => sum + schedule.totalHoursDay, 0) * this.hourlyRate,
            weekRange: document.getElementById('currentWeekRange').textContent,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `horarios-semana-${this.getWeekNumber(this.currentWeekStart)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Método para limpiar todos los datos
    clearAllData() {
        if (confirm('¿Está seguro de que desea eliminar TODOS los horarios registrados? Esta acción no se puede deshacer.')) {
            this.schedules = [];
            localStorage.removeItem('workSchedules');
            this.renderSchedules();
            this.updateWeeklySummary();
            this.showMessage('Todos los datos han sido eliminados', 'success');
        }
    }
}

// Inicializar la aplicación cuando se carga la página
let workTracker;
document.addEventListener('DOMContentLoaded', () => {
    workTracker = new WorkTimeTracker();
});

// Funciones globales para los botones
function exportData() {
    workTracker.exportData();
}

function clearAllData() {
    workTracker.clearAllData();
}