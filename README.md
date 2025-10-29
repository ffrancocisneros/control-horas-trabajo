# Control de Horas Trabajadas

Una aplicación web moderna y completa para el control y cálculo de horas trabajadas y sueldo semanal.

## Características

### ✅ Funcionalidades Principales
- **Carga de horarios**: Registro de horarios de entrada y salida por día
- **Múltiples turnos**: Soporte para hasta 2 turnos por día
- **Cálculo automático**: Cálculo preciso de horas trabajadas incluyendo fracciones de tiempo
- **Cálculo de sueldo**: Cálculo automático basado en valor por hora configurable
- **Resumen semanal**: Visualización de horas totales, sueldo total y promedio diario
- **Persistencia de datos**: Los datos se guardan automáticamente en el navegador
- **Interfaz responsiva**: Diseño adaptativo para dispositivos móviles y escritorio

### 🎯 Características Técnicas
- **Cálculo preciso**: Maneja turnos nocturnos (ej: 23:00 a 01:00)
- **Validación en tiempo real**: Validación de horarios antes de guardar
- **Gestión de datos**: Posibilidad de editar, eliminar y exportar datos
- **Diseño moderno**: Interfaz atractiva con gradientes y animaciones
- **Almacenamiento local**: Los datos persisten entre sesiones

## Estructura del Proyecto

```
control-horas-trabajo/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos y diseño responsivo
├── js/
│   └── app.js          # Lógica de la aplicación
└── README.md           # Documentación del proyecto
```

## Cómo Usar

### 1. Configuración Inicial
- Abre `index.html` en tu navegador web
- Configura el valor por hora en el campo superior (por defecto $4500)
- El valor se guarda automáticamente

### 2. Registrar Horarios
- Selecciona la fecha del día
- Completa al menos el Turno 1 (hora de entrada y salida)
- Opcionalmente completa el Turno 2 para días con múltiples turnos
- Haz clic en "Agregar Horario"

### 3. Visualizar Resumen
- El resumen semanal muestra:
  - Horas totales trabajadas
  - Sueldo total calculado
  - Promedio de horas por día
- La tabla muestra todos los horarios registrados con detalles por día

### 4. Gestión de Datos
- **Eliminar**: Usa el botón "Eliminar" en cada fila
- **Editar**: Agrega un nuevo horario para la misma fecha (reemplaza el anterior)
- **Exportar**: Los datos se pueden exportar como archivo JSON

## Ejemplos de Uso

### Turno Simple
- Entrada: 09:00
- Salida: 17:30
- Resultado: 8.5 horas

### Turno Nocturno
- Entrada: 23:00
- Salida: 01:00
- Resultado: 2 horas

### Múltiples Turnos
- Turno 1: 09:00 - 13:00 (4 horas)
- Turno 2: 15:00 - 19:00 (4 horas)
- Total: 8 horas

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica y formularios
- **CSS3**: Estilos modernos con gradientes, flexbox y grid
- **JavaScript ES6+**: Lógica de la aplicación con clases y métodos modernos
- **LocalStorage**: Persistencia de datos en el navegador

## Características del Diseño

- **Responsive**: Se adapta a móviles, tablets y escritorio
- **Moderno**: Gradientes, sombras y animaciones suaves
- **Accesible**: Contraste adecuado y navegación por teclado
- **Intuitivo**: Interfaz clara y fácil de usar

## Funcionalidades Avanzadas

### Cálculo Automático
- Convierte automáticamente minutos a horas decimales
- Maneja turnos que cruzan medianoche
- Calcula fracciones de tiempo precisas

### Validación Inteligente
- Valida que la hora de salida sea posterior a la entrada
- Requiere completar ambos campos de un turno
- Mensajes de error claros y útiles

### Persistencia de Datos
- Los datos se guardan automáticamente
- Persisten entre sesiones del navegador
- Posibilidad de exportar para respaldo

## Requisitos del Sistema

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Soporte para LocalStorage

## Instalación

1. Descarga o clona el proyecto
2. Abre `index.html` en tu navegador
3. ¡Listo para usar!

No requiere instalación de dependencias ni servidor web.

## Soporte

Esta aplicación está diseñada para ser completamente funcional offline y no requiere conexión a internet una vez cargada en el navegador.

