# 🌻 Ramo de Flores Amarillas 3D Interactivo 🌻✨

Una aplicación web 3D interactiva, ultra vistosa y romántica para regalar flores amarillas. Diseñada para dispositivos móviles y PC, lista para subirse a GitHub y desplegarse en **GitHub Pages**.

---

## 🌟 Características

- 🌻 **Ramo de Flores Amarillas 3D**: Girasoles, rosas amarillas y tulipanes en 3D con luz cálida "Golden Hour" y brisa suave.
- 📱 **Gestos Multitáctiles**: Rotación 360° con 1 dedo/ratón, Pinch-to-Zoom con 2 dedos/rueda y detección de giroscopio en móviles.
- ✨ **Lluvia Mágica (Brillitos)**: Botón de ráfaga de estrellas, partículas bokeh y pétalos amarillos en 3D.
- 💌 **Carta Dedicatoria Glassmorphism**: Ventana modal flotante con tu mensaje personalizado.
- 🎵 **Música y Efectos de Sonido (Web Audio API)**: Sintetizador de audio en vivo con tonos armónicos y música de fondo instrumental relajante.
- 🦋 **Acciones Automáticas Cada 10s**: Vuelo de mariposas mágicas, ráfagas de brisa dorada y destellos de luz.
- 💧 **Fondo Interactivo**: Ondas expansivas de luz y destellos al tocar cualquier parte vacía de la pantalla.

---

## ✏️ ¿Cómo Personalizar tu Mensaje de la Carta?

Abre el archivo [`src/config.js`](file:///C:/Users/kelvi/Downloads/Flores%20amarillas%203D/src/config.js) en cualquier editor de texto o en VS Code y edita los campos:

```javascript
export const DEDICATION_CONFIG = {
  title: "Flores Amarillas Para Ti 🌻✨",
  subtitle: "Un detalle especial lleno de luz y cariño",
  message: `Tu mensaje personal va aquí...`,
  signature: "Con todo mi cariño,",
  sender: "Tu Nombre Aquí ✨",
  date: "21 de Septiembre"
};
```

---

## 🚀 ¿Cómo Subir tu Proyecto a GitHub y Publicarlo Gratis en GitHub Pages?

1. **Crear Repositorio en GitHub**:
   - Entra a [GitHub.com](https://github.com) y crea un nuevo repositorio público llamado por ejemplo `flores-amarillas-3d`.

2. **Subir los Archivos desde tu Computadora**:
   Abre una terminal en la carpeta `C:\Users\kelvi\Downloads\Flores amarillas 3D` y ejecuta:

   ```bash
   git init
   git add .
   git commit -m "Inicializar Ramo de Flores Amarillas 3D"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/flores-amarillas-3d.git
   git push -u origin main
   ```

3. **Activar GitHub Pages**:
   - En tu repositorio de GitHub, ve a **Settings** > **Pages**.
   - En **Source**, selecciona **GitHub Actions**.
   - ¡Listo! El proyecto se compilará y desplegará automáticamente. Podrás acceder a tu página desde `https://tu-usuario.github.io/flores-amarillas-3d/`.
