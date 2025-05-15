# Portal de Empleo - React + Ionic + MySQL

Aplicación web desarrollada con **React** e **Ionic** en el frontend, **Node.js** en el backend y **MySQL** como base de datos (gestionada con phpMyAdmin). El sistema permite a usuarios registrarse, ver publicaciones de empleo, inscribirse y comunicarse con empresas.

---

## 📁 Estructura del Proyecto

Integracion/
<br>
├── Proyecto-integracion/ # Aplicación React + Ionic
<br>
├── backend-Integracion/ # rutas API
<br>
└── README.md

---

## 🚀 Funcionalidades

### 👥 Usuarios
- Registro e inicio de sesión
- Visualización de ofertas de empleo
- Inscripción a publicaciones
- Sistema de mensajería con empresas

### 🏢 Empresas
- Registro e inicio de sesión
- Publicación de ofertas de trabajo
- Gestión de inscripciones
- Sistema de mensajería con usuarios

---

## 💻 Tecnologías Utilizadas

### Frontend
- [React](https://reactjs.org/)
- [Ionic Framework](https://ionicframework.com/)
- [TypeScript](https://www.typescriptlang.org/)

### Backend
- [MySQL](https://www.mysql.com/) (vía phpMyAdmin)

---

## ⚙️ Cómo ejecutar el proyecto

### 🔧 Requisitos previos

- Node.js y npm
- XAMPP o WAMPL
- phpMyAdmin
- Git

### 📦 Instalación

#### 1. Clona el repositorio

```bash
git clone https://github.com/IgnacioDAM04/IntegracionDAM.git
cd Integracion
```

#### 2. Creamos la base de datos

- Iniciamos XAMPP o WAMPL e iniciamos Apache y MySQL
- Abre PHPMyAdmin
- Crea una base de datos llamada linkedos
- Ejecuta las siguientes sentencias SQL

```SQL
CREATE TABLE usuarios (
  id_usuario INT(20) NOT NULL AUTO_INCREMENT,
  nombre_usuario VARCHAR(25) NOT NULL,
  tipo_usuario ENUM('usuario','empresa') NOT NULL,
  contrasenia_usuario VARCHAR(100) NOT NULL,
  PRIMARY KEY (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE publicaciones (
  id_publicacion INT(11) NOT NULL AUTO_INCREMENT,
  id_empresa INT(11) NOT NULL,
  empleo VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  PRIMARY KEY (id_publicacion),
  FOREIGN KEY (id_empresa) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE inscripciones (
  id_inscripcion INT(11) NOT NULL AUTO_INCREMENT,
  id_publicacion INT(11) NOT NULL,
  id_usuario INT(11) NOT NULL,
  PRIMARY KEY (id_inscripcion),
  UNIQUE KEY unica_inscripcion (id_publicacion, id_usuario),
  FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE mensajes (
  id_mensaje INT(11) NOT NULL AUTO_INCREMENT,
  id_usuario INT(11) DEFAULT NULL,
  id_empresa INT(11) DEFAULT NULL,
  contenido TEXT NOT NULL,
  emisor ENUM('usuario','empresa') NOT NULL,
  fecha_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mensaje),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_empresa) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 3. Iniciamos el backend

```bash
cd backend-Integracion
npm install
node server.js
```

#### 5. Iniciamos el frontend

```bash
cd ../Proyecto-integracion
npm install
ionic serve
```