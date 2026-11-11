---
layout: page
title: "Perfiles BCN3D Sigma para OrcaSlicer"
description: "Perfiles comunitarios de impresora e impresión para BCN3D Sigma, R17, R18 y R19 en OrcaSlicer."
permalink: /projects/orcaslicer-sigma-bcn3d-es/
github_project: true
lang: es
translation_url: /projects/orcaslicer-sigma-bcn3d/
repository: ogrgijon/ORCASLICER_SIGMA_BCN3D
language: Perfiles de impresión 3D
project_logo: "https://raw.githubusercontent.com/ogrgijon/ORCASLICER_SIGMA_BCN3D/main/project_icon.png"
project_logo_alt: "Icono del proyecto OrcaSlicer Sigma BCN3D"
project_visual: "https://raw.githubusercontent.com/ogrgijon/ORCASLICER_SIGMA_BCN3D/main/BCN3D_SIGMA_ORCA_PROFILE/V.2.05/BCN3D/BCN3D%20Sigma%20R18_cover.png"
project_visual_alt: "Impresora BCN3D Sigma"
project_visual_caption: "Imagen de una impresora BCN3D Sigma incluida en el README del proyecto."
---

# BCN3D, Sigma y OrcaSlicer

BCN3D es un fabricante de impresoras 3D con sede en Barcelona, conocido por sus equipos de fabricación por filamento. La familia Sigma reúne impresoras de sobremesa con tecnología FFF (fabricación por filamento fundido) y un sistema de doble extrusión independiente, conocido como IDEX. Al tener dos cabezales que pueden trabajar de forma independiente, estas máquinas pueden, según el modelo y la configuración, imprimir con dos materiales o colores y realizar trabajos de duplicación o espejo.

Sigma, R17, R18 y R19 son distintas versiones de la familia; no conviene asumir que sus perfiles son intercambiables sin comprobar la revisión y configuración de cada máquina. Este repositorio comunitario ofrece perfiles para esos modelos, con boquilla de 0,4 mm, varios niveles de calidad y materiales genéricos PLA, ABS y PETG.

## ¿Qué hace OrcaSlicer?

OrcaSlicer es un programa de laminado (slicer) para impresoras FFF/FDM. Convierte el modelo 3D en capas y genera un archivo de instrucciones G-code para la impresora. Para hacerlo combina tres tipos de ajustes:

- **Impresora:** modelo, volumen de impresión, extrusores, boquilla y parámetros de máquina.
- **Material:** tipo de filamento y parámetros como temperaturas y refrigeración.
- **Proceso de impresión:** altura de capa, perímetros, relleno, soportes y velocidad, entre otros.

El perfil de este repositorio proporciona una base para la Sigma; no sustituye la comprobación de la máquina concreta, el filamento ni las condiciones de impresión.

## Instalar y seleccionar los perfiles

1. Descarga el ZIP desde **Code → Download ZIP** en GitHub y descomprímelo.
2. En `BCN3D_SIGMA_ORCA_PROFILE`, abre la carpeta de la edición que quieras usar. La edición actual indicada en el repositorio es `V.2.05`.
3. Copia todo el contenido de esa carpeta de edición en la carpeta `resources\profiles` de la instalación de OrcaSlicer. En Windows, la ubicación habitual es `C:\Program Files\OrcaSlicer\resources\profiles`; puede variar si instalaste el programa en otra ubicación.
4. Reinicia OrcaSlicer para que cargue los perfiles. Selecciona la variante exacta de Sigma (incluida su revisión), el perfil de boquilla compatible y el material que vas a utilizar.
5. Escoge un proceso según la calidad y el tiempo que necesites. La edición actual incluye Extra Fine (0,06 mm), Fine (0,10 mm), Normal (0,15 mm) y Draft (0,20 mm).
6. Importa o coloca el modelo, revisa la orientación, los soportes y la vista previa por capas. Antes de imprimir, confirma que las temperaturas y demás parámetros sean adecuados para tu filamento y que el G-code corresponda a tu impresora.

Las versiones se guardan por separado: consulta el historial del repositorio para elegir una edición compatible y no mezcles archivos de distintas versiones. La [wiki oficial de OrcaSlicer](https://www.orcaslicer.com/wiki/) explica con más detalle los ajustes de impresora, materiales y procesos.

## Alcance y precauciones

El repositorio contiene configuraciones para OrcaSlicer; no incluye ni modifica el firmware de la impresora. Es un proyecto comunitario, no afiliado ni respaldado oficialmente por BCN3D. Los perfiles se ofrecen tal cual: comprueba que correspondan a tu modelo, revisión, boquilla y material, y valida los parámetros antes de usarlos. Supervisa las primeras impresiones; los ajustes inadecuados pueden provocar fallos o daños.

## Proyecto experimental

Estos perfiles forman parte de un proyecto experimental y se han probado en una impresora BCN3D Sigma con el último firmware publicado por BCN3D. Esa prueba corresponde a una configuración concreta: no garantiza el mismo resultado en todas las unidades, revisiones de Sigma, materiales o condiciones de impresión. Verifica siempre la compatibilidad y supervisa las primeras pruebas.

