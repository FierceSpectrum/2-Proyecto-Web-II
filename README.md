# 2° Proyecto Web II Server REST

## Descripción

Este proyecto es una continuación del Proyecto 1, con la adición de una REST API que implementa autenticación de segundo factor. La API también incluye funciones para la verificación de correos electrónicos y la generación y manejo de tokens JWT para autenticación.

## Funcionalidades

- **Autenticación de Segundo Factor:** Implementa autenticación de dos factores utilizando SMS.
- **Verificación de Correo Electrónico:** Envía correos electrónicos para verificar las cuentas de usuario.
- **Generación y Manejo de Tokens JWT:** Crea y valida tokens JWT para autenticación.
- **Manejo de Usuarios y Cuentas:** Gestión de usuarios, cuentas y playlists.

## Estructura del Proyecto

### Configuración de Correo

La configuración para el envío de correos se encuentra en el archivo `config.js`, utilizando el servicio SMTP en `smtp.get.com` con el puerto `465`. El archivo contiene las credenciales necesarias para el envío de correos electrónicos.

### Endpoints Principales

- **`POST /api/register`**: Registra un nuevo usuario y envía un correo electrónico de verificación.
- **`POST /api/login`**: Inicia sesión y envía un código de autenticación por SMS.
- **`POST /api/verify`**: Verifica el usuario mediante un código de autenticación enviado por correo o SMS.
- **`POST /api/session`**: Inicia una sesión y genera un token JWT para autenticación.

### Middleware

- **`authenticateToken`**: Middleware que verifica la validez de los tokens JWT.
- **`userVerify`**: Middleware que verifica el estado de la cuenta de usuario y actualiza su estado de verificación.

### Modelos

- **Usuario**
  - `mail`: Correo electrónico del usuario.
  - `password`: Contraseña del usuario.
  - `pin`: PIN de autenticación.
  - `name`: Nombre del usuario.
  - `last_name`: Apellido del usuario.
  - `country`: País del usuario.
  - `font`: Fuente de datos.
  - `number_account`: Número máximo de cuentas.
  - `number_playlist`: Número máximo de playlists.

- **Cuenta**
  - `name`: Nombre de la cuenta.
  - `number_of_playlists`: Número de playlists asociadas.
  - `number_of_accounts`: Número de cuentas asociadas.
  - `playlists`: Lista de IDs de playlists.

- **Playlist**
  - `name`: Nombre de la playlist.
  - `videos`: Lista de videos en la playlist.

- **Video**
  - `name`: Nombre del video.
  - `url`: URL del video.
  - `description`: Descripción del video.

### Ejecución

La aplicación se ejecuta en el puerto `3002`. Para iniciar el servidor, usa los siguientes comandos:

```bash
# Instalar dependencias
npm install

# Iniciar la aplicación
npm start
```

### Notas
La aplicación utiliza Twilio para el envío de SMS. Actualmente, solo se ha configurado un número de teléfono para la autenticación, y está asociado a una cuenta de prueba.
La verificación de correo electrónico cambia el estado del usuario de null a true cuando se completa la verificación.

## Dependencias

- **Node.js**
- **Mongoose**
- **JWT**
- **Twilio**
- **SMTP para Node.js**

## Estado del Proyecto

Este proyecto fue creado durante el primer cuatrimestre del año 2024, como una práctica para aprender los fundamentos del desarrollo web. Actualmente, se están realizando algunas actualizaciones para mejorar la estructura del código y la organización del repositorio en GitHub.

## Licencia

Este proyecto no tiene una licencia formal. Fue creado con fines educativos y no está destinado para uso comercial. Los desarrolladores son estudiantes de ingeniería de software que están aprendiendo y mejorando sus habilidades.
